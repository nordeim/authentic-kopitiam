<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Location;
use App\Models\Product;
use App\Services\InventoryService;
use App\Services\PdpaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    protected InventoryService $inventoryService;
    protected PdpaService $pdpaService;

    public function __construct(InventoryService $inventoryService, PdpaService $pdpaService)
    {
        $this->inventoryService = $inventoryService;
        $this->pdpaService = $pdpaService;
    }

    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'page' => 'integer|min:1',
            'per_page' => 'integer|min:1|max:100',
            'status' => 'in:pending,confirmed,preparing,ready,completed,cancelled',
            'location_id' => 'string|exists:locations,id',
            'customer_email' => 'email|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $query = Order::query()->with(['items.product', 'location', 'payment']);

        // Apply filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('location_id')) {
            $query->where('location_id', $request->location_id);
        }

        if ($request->has('customer_email')) {
            $query->where('customer_email', $request->customer_email);
        }

        // Pagination
        $perPage = min($request->input('per_page', 20), 100);
        $orders = $query->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'data' => $orders->items(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
            'links' => [
                'first' => $orders->url(1),
                'last' => $orders->url($orders->lastPage()),
                'prev' => $orders->previousPageUrl(),
                'next' => $orders->nextPageUrl(),
            ],
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $order = Order::with(['items.product', 'location', 'payment', 'user'])->findOrFail($id);

        return response()->json([
            'data' => $order,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:20',
            'customer_email' => 'required|email|max:255',
            'location_id' => 'required|string|exists:locations,id',
            'pickup_at' => 'required|date|after:now',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|string|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1|max:99',
            'items.*.unit_name' => 'nullable|string|max:50',
            'items.*.notes' => 'nullable|string',
            'notes' => 'nullable|string|max:1000',
            'consent' => 'nullable|array',
            'consent.*.type' => 'required|string|in:marketing,analytics,third_party',
            'consent.*.wording' => 'required|string|max:500',
            'consent.*.version' => 'required|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Validate pickup datetime against operating hours
        $location = Location::findOrFail($request->location_id);
        $pickupAt = \Carbon\Carbon::parse($request->pickup_at);

        if (!$location->isOpenAt($pickupAt->toIso8601String())) {
            return response()->json([
                'message' => 'Location is closed at requested pickup time',
                'errors' => [
                    'pickup_at' => ['Location is not open at this time'],
                ],
            ], 422);
        }

        // Get items array
        $items = $request->items;

        try {
            DB::beginTransaction();

            // Reserve inventory (two-phase)
            $reservationToken = $this->inventoryService->reserve($items);

            // Create order
            $order = Order::create([
                'customer_name' => $request->customer_name,
                'customer_phone' => $request->customer_phone,
                'customer_email' => $request->customer_email,
                'location_id' => $request->location_id,
                'pickup_at' => $pickupAt,
                'status' => 'pending',
                'payment_method' => $request->input('payment_method', 'paynow'),
                'payment_status' => 'pending',
                'notes' => $request->notes,
                'subtotal' => 0,
                'gst_amount' => 0,
                'total_amount' => 0,
            ]);

            // Create order items with price snapshotting
            foreach ($items as $itemData) {
                $product = Product::findOrFail($itemData['product_id']);
                $unitPrice = $product->price;

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $itemData['product_id'],
                    'unit_price' => $unitPrice,
                    'quantity' => $itemData['quantity'],
                    'unit_name' => $itemData['unit_name'] ?? 'piece',
                    'notes' => $itemData['notes'] ?? null,
                ]);
            }

            // Calculate totals and GST (9%)
            $order->load('items');
            $order->calculateTotal();
            $order->save();

            // Commit inventory reservation
            $this->inventoryService->commit($reservationToken, $order->id);

            DB::commit();

            // Load order relationships after successful commit
            $order->load(['items.product', 'location']);

            // Process PDPA consent if provided (outside DB transaction to prevent abort)
            if ($request->has('consent') && !empty($request->consent)) {
                try {
                    \Log::debug('Recording consent after transaction', [
                        'order_id' => $order->id,
                        'customer_id' => $order->user_id ?? 'guest',
                        'consent_count' => count($request->consent)
                    ]);
                    $this->recordOrderConsent($order, $request->consent, $request);
                } catch (\Exception $e) {
                    \Log::warning('PDPA consent recording failed for order ' . $order->id . ': ' . $e->getMessage());
                    // Non-critical - continue without consent recording
                }
            }

            return response()->json([
                'data' => $order,
                'message' => 'Order created successfully',
            ], 201);

        } catch (\InvalidArgumentException $e) {
            // Business rule violation (e.g., insufficient stock, validation errors)
            DB::rollBack();

            // Rollback inventory reservation if failed
            if (isset($reservationToken)) {
                try {
                    $this->inventoryService->rollback($reservationToken);
                } catch (\Exception $rollbackException) {
                    \Log::error('Inventory rollback failed: ' . $rollbackException->getMessage());
                }
            }

            return response()->json([
                'message' => 'Validation failed',
                'errors' => [
                    'items' => [$e->getMessage()],
                ],
            ], 422);

        } catch (\Exception $e) {
            // System/unexpected errors
            DB::rollBack();

            // Rollback inventory reservation if failed
            if (isset($reservationToken)) {
                try {
                    $this->inventoryService->rollback($reservationToken);
                } catch (\Exception $rollbackException) {
                    // Log rollback failure
                    \Log::error('Inventory rollback failed: ' . $rollbackException->getMessage());
                }
            }

            return response()->json([
                'message' => 'Failed to create order',
                'errors' => [
                    'order' => [$e->getMessage()],
                ],
            ], 500);
        }
    }

    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $order = Order::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,confirmed,preparing,ready,completed,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $oldStatus = $order->status;
        $newStatus = $request->status;

        $order->status = $newStatus;
        $order->save();

        // If order is cancelled, release inventory
        if ($newStatus == 'cancelled') {
            // Find the order items and increase product stock
            $orderItems = $order->items()->with('product')->get();

            foreach ($orderItems as $orderItem) {
                $product = $orderItem->product;
                $product->increment('stock_quantity', $orderItem->quantity);
            }

            \Log::info('Inventory released for cancelled order', ['order_id' => $id, 'items_count' => $orderItems->count()]);
        }

        \Log::info('Order status updated', [
            'order_id' => $id,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
        ]);

        return response()->json([
            'data' => $order,
            'message' => 'Order status updated',
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $order = Order::with(['items', 'payment'])->findOrFail($id);

        // Check if order can be deleted (only pending orders can be deleted)
        if ($order->status !== 'pending') {
            return response()->json([
                'message' => 'Only pending orders can be deleted',
                'errors' => [
                    'order' => ['Order status must be pending'],
                ],
            ], 422);
        }

        try {
            // Release inventory for each order item
            foreach ($order->items as $orderItem) {
                $product = $orderItem->product;
                $product->increment('stock_quantity', $orderItem->quantity);
            }

            // Delete payment if exists
            if ($order->payment) {
                $order->payment->delete();
            }

            // Delete order items
            $order->items()->delete();

            // Delete order
            $order->delete();

            \Log::info('Order deleted and inventory released', ['order_id' => $id]);

            return response()->json([
                'message' => 'Order deleted successfully',
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to delete order', ['order_id' => $id, 'error' => $e->getMessage()]);

            return response()->json([
                'message' => 'Failed to delete order',
                'errors' => [
                    'order' => [$e->getMessage()],
                ],
            ], 500);
        }
    }

    protected function recordOrderConsent(Order $order, array $consents, Request $request): void
    {
        try {
            // Determine customer identifier (user_id for authenticated, email for guests)
            $customerId = $order->user_id;
            $identifier = $order->user_id ?? $order->customer_email;

            \Log::debug('Processing consents', [
                'order_id' => $order->id,
                'customer_id' => $customerId,
                'identifier' => $identifier,
                'consent_count' => count($consents)
            ]);

            // Record all consents using new array structure
            foreach ($consents as $consentData) {
                if (!isset($consentData['type']) || !isset($consentData['wording']) || !isset($consentData['version'])) {
                    \Log::warning('Invalid consent structure', ['data' => $consentData]);
                    continue;
                }

                $this->pdpaService->recordConsent(
                    $customerId,
                    $consentData['type'],
                    $consentData['wording'],
                    $consentData['version'],
                    $request,
                    $identifier
                );
            }

            \Log::info('PDPA consent recorded successfully', ['order_id' => $order->id]);

        } catch (\Exception $e) {
            \Log::warning('PDPA consent recording failed for order ' . $order->id . ': ' . $e->getMessage());
            // Non-critical - continue without consent recording
        }
    }

    protected function getConsentWording(array $consentData): string
    {
        // Default consent wording if not provided
        $defaultWording = 'I consent to the collection, use, and disclosure of my personal data by Morning Brew Collective for order fulfillment and marketing purposes in accordance with the PDPA.';

        // If hash is provided, we can't retrieve original wording, so use default
        return $defaultWording;
    }

    protected function getConsentVersion(array $consentData): string
    {
        return isset($consentData['consent_version']) ? $consentData['consent_version'] : '1.0';
    }
}
