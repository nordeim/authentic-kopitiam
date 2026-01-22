<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\PdpaConsentController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\WebhookController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\AuthController;

// API Version Group
Route::prefix('v1')->group(function () {

  // ══════════════════════════════════════════════════════════════════
  // AUTHENTICATION ROUTES (Public with rate limiting)
  // ══════════════════════════════════════════════════════════════════
  Route::post('register', [AuthController::class, 'register'])
    ->middleware('throttle:auth-register');
  Route::post('login', [AuthController::class, 'login'])
    ->middleware('throttle:auth-login');

  // ══════════════════════════════════════════════════════════════════
  // PUBLIC ROUTES (No auth required)
  // ══════════════════════════════════════════════════════════════════

  // Products - Read only
  Route::get('products', [ProductController::class, 'index']);
  Route::get('products/{product}', [ProductController::class, 'show']);

  // Locations - Read only
  Route::get('locations', [LocationController::class, 'index']);
  Route::get('locations/{location}', [LocationController::class, 'show']);

  // Health Check
  Route::get('health', function () {
    return response()->json([
      'status' => 'ok',
      'timestamp' => now()->toIso8601String(),
      'version' => 'v1',
    ]);
  });

  // Webhooks (validated by signature, not auth)
  Route::post('webhooks/stripe', [WebhookController::class, 'stripe']);
  Route::post('webhooks/paynow', [WebhookController::class, 'paynow']);

  // ══════════════════════════════════════════════════════════════════
  // AUTHENTICATED ROUTES (Customer + Admin)
  // ══════════════════════════════════════════════════════════════════
  Route::middleware('auth:sanctum')->group(function () {

    // Auth management
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('me', [AuthController::class, 'me']);
    Route::post('refresh', [AuthController::class, 'refresh']);

    // Orders - Full access for authenticated users
    Route::apiResource('orders', OrderController::class)
      ->only(['index', 'show', 'store', 'destroy']);

    Route::put('orders/{id}/status', [OrderController::class, 'updateStatus'])
      ->middleware(['order.ownership']);

    // Invoice Routes
    Route::get('orders/{id}/invoice/xml', [InvoiceController::class, 'downloadXml']);

    // Payments - Authenticated only
    Route::post('payments/{order}/paynow', [PaymentController::class, 'createPayNowPayment']);
    Route::post('payments/{order}/stripe', [PaymentController::class, 'createStripePayment']);
    Route::get('payments/{payment}', [PaymentController::class, 'show']);
    Route::post('payments/{payment}/refund', [PaymentController::class, 'refund']);

    // PDPA Consent Routes
    Route::post('consents', [PdpaConsentController::class, 'store']);
    Route::post('consents/{id}/withdraw', [PdpaConsentController::class, 'withdraw']);
    Route::get('consents/export/{id}', [PdpaConsentController::class, 'export']);
  });

  // ══════════════════════════════════════════════════════════════════
  // ADMIN ROUTES (Admin role only)
  // ══════════════════════════════════════════════════════════════════
  Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {

    // Admin can manage products
    Route::post('products', [ProductController::class, 'store']);
    Route::put('products/{product}', [ProductController::class, 'update']);
    Route::delete('products/{product}', [ProductController::class, 'destroy']);

    // Admin can manage locations
    Route::post('locations', [LocationController::class, 'store']);
    Route::put('locations/{location}', [LocationController::class, 'update']);
    Route::delete('locations/{location}', [LocationController::class, 'destroy']);

    // Admin can view all orders (without ownership check)
    Route::get('orders', [OrderController::class, 'index']);
    Route::get('orders/{order}', [OrderController::class, 'show']);
    Route::put('orders/{order}/status', [OrderController::class, 'updateStatus']);
  });

})->middleware(['throttle:api', 'cors']);

// ══════════════════════════════════════════════════════════════════
// LEGACY ROUTES (for backward compatibility)
// ══════════════════════════════════════════════════════════════════
Route::get('/user', function (Request $request) {
  return $request->user();
})->middleware('auth:sanctum');

Route::get('/ping', function () {
  return response()->json([
    'message' => 'Morning Brew Collective API is alive',
    'timestamp' => now()->toIso8601String(),
    'env' => app()->environment(),
  ]);
});

