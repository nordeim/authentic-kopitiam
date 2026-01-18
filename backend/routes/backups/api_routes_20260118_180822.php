<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\PdpaConsentController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\WebhookController;

// API Version Group
Route::prefix('v1')->group(function () {

  // Products Resource - Explicit routes (apiResource only() not working reliably)
  Route::get('products', [ProductController::class, 'index']);
  Route::get('products/{product}', [ProductController::class, 'show']);
  Route::post('products', [ProductController::class, 'store'])->middleware(['auth:sanctum']);
  Route::put('products/{product}', [ProductController::class, 'update'])->middleware(['auth:sanctum']);
  Route::delete('products/{product}', [ProductController::class, 'destroy'])->middleware(['auth:sanctum']);

  // Orders Resource
  Route::apiResource('orders', OrderController::class)
    ->only(['index', 'show', 'store', 'destroy']);

  Route::put('orders/{id}/status', [OrderController::class, 'updateStatus'])
    ->middleware(['order.ownership']);

  // Locations Resource - Explicit GET routes (apiResource only() not working reliably)
  Route::get('locations', [LocationController::class, 'index']);
  Route::get('locations/{location}', [LocationController::class, 'show']);
  Route::post('locations', [LocationController::class, 'store'])->middleware(['auth:sanctum']);
  Route::put('locations/{location}', [LocationController::class, 'update'])->middleware(['auth:sanctum']);
  Route::delete('locations/{location}', [LocationController::class, 'destroy'])->middleware(['auth:sanctum']);

  // PDPA Consent Routes
  Route::post('consents', [PdpaConsentController::class, 'store'])
    ->middleware(['auth:sanctum']);

  Route::post('consents/{id}/withdraw', [PdpaConsentController::class, 'withdraw'])
    ->middleware(['auth:sanctum']);

  Route::get('consents/export/{id}', [PdpaConsentController::class, 'export'])
    ->middleware(['auth:sanctum']);

  // Health Check
  Route::get('health', function () {
    return response()->json([
      'status' => 'ok',
      'timestamp' => now()->toIso8601String(),
      'version' => 'v1',
    ]);
  });

})->middleware(['throttle:api', 'cors']);

// Legacy routes (for backward compatibility)
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