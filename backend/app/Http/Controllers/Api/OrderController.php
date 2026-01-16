<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Location;
use App\Models\Product;
use App\Services\InventoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    protected InventoryService $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
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
            ]);

            // Create order items with price snapshotting
            foreach ($items as $itemData) {
                $product = Product::findOrFail($itemData['product_id']);
                $unitPriceCents = (int) round($product->price * 100);

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $itemData['product_id'],
                    'unit_price_cents' => $unitPriceCents,
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

            $order->load(['items.product', 'location']);

            return response()->json([
                'data' => $order,
                'message' => 'Order created successfully',
            ], 201);

        } catch (\Exception $e) {
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

        try {
            $order->transitionTo($request->status);

            return response()->json([
                'data' => $order,
                'message' => 'Order status updated successfully',
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'message' => 'Invalid status transition',
                'errors' => [
                    'status' => [$e->getMessage()],
                ],
            ], 422);
        }
    }

    public function destroy(string $id): JsonResponse
    {
        $order = Order::findOrFail($id);

        if ($order->status === 'completed') {
            return response()->json([
                'message' => 'Cannot cancel completed order',
                'errors' => [
                    'order' => ['Cannot cancel completed orders'],
                ],
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Release inventory reservation
            $items = $order->items;
            foreach ($items as $item) {
                $product = Product::findOrFail($item->product_id);
                $product->increment('stock_quantity', $item->quantity);
            }

            // Soft delete order
            $order->delete();

            DB::commit();

            return response()->json(null, 204);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Failed to cancel order',
                'errors' => [
                    'order' => [$e->getMessage()],
                ],
            ], 500);
        }
    }
}
