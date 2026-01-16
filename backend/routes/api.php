<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

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
