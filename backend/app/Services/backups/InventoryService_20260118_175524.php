<?php

namespace App\Services;

use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Log;
use App\Models\Product;
use Carbon\Carbon;

class InventoryService
{
    protected const RESERVATION_TTL = 300; // 5 minutes in seconds

    /**
     * Soft reserve inventory in Redis
     * @param array $items Array of items with product_id and quantity
     * @return string Reservation token
     */
    public function reserve(array $items): string
    {
        $token = $this->generateToken();
        $expiresAt = Carbon::now()->addSeconds(self::RESERVATION_TTL);

        foreach ($items as $item) {
            $productId = $item['product_id'];
            $quantity = $item['quantity'];

            $product = Product::findOrFail($productId);
            $availableStock = $this->getAvailableStock($productId);

            if ($availableStock < $quantity) {
                throw new \InvalidArgumentException(
                    "Insufficient stock for product {$productId}. Available: {$availableStock}, Requested: {$quantity}"
                );
            }

            $reservationKey = $this->getReservationKey($token, $productId);
            $reservationData = [
                'product_id' => $productId,
                'quantity' => $quantity,
                'reserved_at' => Carbon::now()->toIso8601String(),
                'expires_at' => $expiresAt->toIso8601String(),
                'order_id' => null,
            ];

            Redis::setex($reservationKey, self::RESERVATION_TTL, json_encode($reservationData));

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
        $fullKeys = $this->scanKeys($pattern);

        Log::debug('Inventory commit debug', [
            'token' => $token,
            'pattern' => $pattern,
            'full_keys_found' => $fullKeys,
        ]);

        if (empty($fullKeys)) {
            throw new \InvalidArgumentException("Reservation token {$token} not found or expired");
        }

        // Fix: Extract original keys (without prefix) for MGET
        // Laravel Redis facade re-adds prefix, so we need unprefixed keys
        $keysForMget = [];
        $prefix = config('database.redis.options.prefix', '');
        
        foreach ($fullKeys as $fullKey) {
            $originalKey = $prefix ? str_replace($prefix, '', $fullKey) : $fullKey;
            $keysForMget[] = $originalKey;
            Log::debug('Key prefix handling', [
                'full_key' => $fullKey,
                'prefix' => $prefix,
                'original_key' => $originalKey,
            ]);
        }

        $reservations = Redis::mget($keysForMget);

        Log::debug('Inventory commit mget results', [
            'keys_for_mget' => $keysForMget,
            'prefix_used' => $prefix,
            'reservations' => $reservations,
        ]);

        // Filter out null/expired values
        $validReservations = [];
        foreach ($fullKeys as $index => $fullKey) {
            if (!isset($reservations[$index]) || $reservations[$index] === null) {
                Log::warning("Skipped null reservation value at index {$index} for key: {$fullKey}");
                continue;
            }

            $reservationData = json_decode($reservations[$index], true);

            if (!$reservationData) {
                Log::warning("Invalid JSON for key {$fullKey}: {$reservations[$index]}", [
                    'json_error' => json_last_error_msg(),
                ]);
                continue;
            }

            $validReservations[] = [
                'key' => $fullKey,
                'data' => $reservationData,
            ];
        }

        if (empty($validReservations)) {
            throw new \RuntimeException("No valid reservations found for token {$token}");
        }

        foreach ($validReservations as $reservation) {
            $fullKey = $reservation['key'];
            $reservationData = $reservation['data'];

            Log::debug('Processing reservation', [
                'key' => $fullKey,
                'data' => $reservationData,
            ]);

            // Decrement stock in PostgreSQL
            $productId = $reservationData['product_id'];
            $quantity = $reservationData['quantity'];

            $product = Product::lockForUpdate()->findOrFail($productId);
            $product->decrement('stock_quantity', $quantity);
            $product->save();

            // Remove reservation from Redis using the FULL key (which includes prefix)
            Redis::del($fullKey);

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
        $keys = $this->scanKeys($pattern);

        Log::debug('Inventory rollback', [
            'token' => $token,
            'pattern' => $pattern,
            'keys_found' => $keys,
        ]);

        if (empty($keys)) {
            Log::warning("No keys found for rollback token: {$token}");
            return;
        }

        $fullKeys = $keys;
        $prefix = config('database.redis.options.prefix', '');
        $keysForMget = [];
        
        foreach ($fullKeys as $fullKey) {
            $originalKey = $prefix ? str_replace($prefix, '', $fullKey) : $fullKey;
            $keysForMget[] = $originalKey;
        }

        $reservations = Redis::mget($keysForMget);

        foreach ($fullKeys as $index => $fullKey) {
            if (!isset($reservations[$index]) || $reservations[$index] === null) {
                Log::warning("Skipped null rollback key: {$fullKey}");
                continue;
            }

            $reservationData = json_decode($reservations[$index], true);

            if (!$reservationData) {
                Log::warning("Invalid JSON in rollback for key {$fullKey}: {$reservations[$index]}");
                continue;
            }

            // Remove reservation from Redis
            Redis::del($fullKey);

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
        $keys = $this->scanKeys($pattern);

        foreach ($keys as $key) {
            $ttl = Redis::ttl($key);

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
     * Scan keys using Redis SCAN (with fallback to KEYS)
     * @param string $pattern Key pattern
     * @return array Array of keys
     */
    protected function scanKeys(string $pattern): array
    {
        $keys = [];
        
        try {
            $cursor = 0;
            do {
                $result = Redis::scan($cursor, ['match' => $pattern, 'count' => 100]);
                
                if ($result === false || !is_array($result)) {
                    break;
                }

                $cursor = $result[0];
                if (isset($result[1]) && is_array($result[1])) {
                    $keys = array_merge($keys, $result[1]);
                }
            } while ($cursor !== 0);
        } catch (\Exception $e) {
            Log::warning("SCAN failed, falling back to KEYS: {$e->getMessage()}");
        }

        if (empty($keys)) {
            $keys = Redis::keys($pattern);
        }

        $uniqueKeys = array_unique($keys);
        
        Log::debug('Key scan results', [
            'pattern' => $pattern,
            'method' => empty($keys) ? 'keys' : 'scan',
            'keys_found' => count($uniqueKeys),
        ]);

        return $uniqueKeys;
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
