<?php

namespace App\Services;

use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Log;
use App\Models\Product;

class InventoryService
{
    protected const RESERVATION_TTL = 300; // 5 minutes in seconds

    /**
     * Soft reserve inventory in Redis
     * @param array $items Array of ['product_id' => string, 'quantity' => int]
     * @return string Reservation token
     */
    public function reserve(array $items): string
    {
        $token = $this->generateToken();
        $expiresAt = now()->addSeconds(self::RESERVATION_TTL);

        foreach ($items as $item) {
            $productId = $item['product_id'];
            $quantity = $item['quantity'];

            // Check availability in PostgreSQL
            $product = Product::findOrFail($productId);
            $availableStock = $this->getAvailableStock($productId);

            if ($availableStock < $quantity) {
                throw new \InvalidArgumentException("Insufficient stock for product {$productId}. Available: {$availableStock}, Requested: {$quantity}");
            }

            // Soft reserve in Redis
            $reservationKey = $this->getReservationKey($token, $productId);
            $reservationData = [
                'product_id' => $productId,
                'quantity' => $quantity,
                'reserved_at' => now()->toIso8601String(),
                'expires_at' => $expiresAt->toIso8601String(),
                'order_id' => null,
            ];

            Redis::setex($reservationKey, self::RESERVATION_TTL, json_encode($reservationData));

            // Increment total reserved count for this product
            $reservedCountKey = $this->getReservedCountKey($productId);
            Redis::incrby($reservedCountKey, $quantity);
            Redis::expire($reservedCountKey, self::RESERVATION_TTL);
        }

        return $token;
    }

    /**
     * Commit reservation (convert soft to hard)
     * @param string $token Reservation token
     * @param string $orderId Order ID to associate
     */
    public function commit(string $token, string $orderId): void
    {
        $pattern = $this->getReservationKeyPattern($token);
        $keys = Redis::keys($pattern);

        \Log::debug('Inventory commit debug', [
            'token' => $token,
            'pattern' => $pattern,
            'keys_found' => $keys,
        ]);

        if (empty($keys)) {
            throw new \InvalidArgumentException("Reservation token {$token} not found or expired");
        }

        $reservations = Redis::mget($keys);

        \Log::debug('Inventory commit mget results', [
            'keys' => $keys,
            'reservations' => $reservations,
        ]);

        foreach ($keys as $index => $key) {
            $reservationData = json_decode($reservations[$index], true);

            \Log::debug('Inventory commit json decode', [
                'key' => $key,
                'raw_value' => $reservations[$index],
                'decoded' => $reservationData,
            ]);

            if (!$reservationData) {
                throw new \RuntimeException("Invalid reservation data");
            }

            // Decrement stock in PostgreSQL
            $productId = $reservationData['product_id'];
            $quantity = $reservationData['quantity'];

            $product = Product::lockForUpdate()->findOrFail($productId);
            $product->decrement('stock_quantity', $quantity);
            $product->save();

            // Remove reservation from Redis
            Redis::del($key);

            // Decrement reserved count
            $reservedCountKey = $this->getReservedCountKey($productId);
            Redis::decrby($reservedCountKey, $quantity);
        }
    }

    /**
     * Rollback reservation
     * @param string $token Reservation token
     */
    public function rollback(string $token): void
    {
        $pattern = $this->getReservationKeyPattern($token);
        $keys = Redis::keys($pattern);

        if (empty($keys)) {
            return; // Token doesn't exist or already expired
        }

        $reservations = Redis::mget($keys);

        foreach ($keys as $index => $key) {
            $reservationData = json_decode($reservations[$index], true);

            if (!$reservationData) {
                continue;
            }

            // Remove reservation from Redis
            Redis::del($key);

            // Decrement reserved count
            $productId = $reservationData['product_id'];
            $quantity = $reservationData['quantity'];
            $reservedCountKey = $this->getReservedCountKey($productId);
            Redis::decrby($reservedCountKey, $quantity);
        }
    }

    /**
     * Get available stock
     * @param string $productId Product ID
     * @return int Available quantity
     */
    public function getAvailableStock(string $productId): int
    {
        $product = Product::findOrFail($productId);
        $totalStock = $product->stock_quantity ?? 0;

        // Subtract reserved from Redis
        $reservedCountKey = $this->getReservedCountKey($productId);
        $reservedCount = (int) Redis::get($reservedCountKey) ?? 0;

        $availableStock = $totalStock - $reservedCount;

        return max(0, $availableStock);
    }

    /**
     * Cleanup expired reservations
     */
    public function cleanupExpired(): void
    {
        $pattern = $this->getAllReservationsKeyPattern();
        $keys = Redis::keys($pattern);

        foreach ($keys as $key) {
            $ttl = Redis::ttl($key);

            // If TTL is -1 (no expiration) or -2 (key doesn't exist), clean up
            if ($ttl === -1) {
                $reservationData = Redis::get($key);
                if ($reservationData) {
                    $data = json_decode($reservationData, true);
                    if ($data) {
                        $productId = $data['product_id'] ?? null;
                        if ($productId) {
                            $reservedCountKey = $this->getReservedCountKey($productId);
                            Redis::decrby($reservedCountKey, $data['quantity'] ?? 0);
                        }
                    }
                }
                Redis::del($key);
            }
        }
    }

    /**
     * Generate unique reservation token
     */
    protected function generateToken(): string
    {
        return uniqid('res_', true) . '_' . bin2hex(random_bytes(8));
    }

    /**
     * Get reservation key for a specific token and product
     */
    protected function getReservationKey(string $token, string $productId): string
    {
        return "inventory:reserve:{$token}:{$productId}";
    }

    /**
     * Get reservation key pattern for a token (all products)
     */
    protected function getReservationKeyPattern(string $token): string
    {
        return "inventory:reserve:{$token}:*";
    }

    /**
     * Get all reservations key pattern
     */
    protected function getAllReservationsKeyPattern(): string
    {
        return "inventory:reserve:*";
    }

    /**
     * Get reserved count key for a product
     */
    protected function getReservedCountKey(string $productId): string
    {
        return "inventory:reserved:{$productId}";
    }
}
