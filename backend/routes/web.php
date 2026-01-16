<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'app' => 'Morning Brew Collective Backend',
        'version' => '1.0.0',
        'docs' => url('/docs'), // Placeholder for API docs
    ]);
});
