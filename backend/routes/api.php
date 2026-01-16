<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\PdpaConsentController;

// API Version Group
Route::prefix('v1')->group(function () {

  // Products Resource
  Route::apiResource('products', ProductController::class)
    ->only(['index', 'show', 'store', 'update', 'destroy'])
    ->middleware(['auth:sanctum'])->except(['index', 'show']);

  // Orders Resource
  Route::apiResource('orders', OrderController::class)
    ->only(['index', 'show', 'store', 'destroy']);

  Route::put('orders/{id}/status', [OrderController::class, 'updateStatus'])
    ->middleware(['auth:sanctum']);

  // Locations Resource
  Route::apiResource('locations', LocationController::class)
    ->only(['index', 'show', 'store', 'update', 'destroy'])
    ->middleware(['auth:sanctum'])->except(['index', 'show']);

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
