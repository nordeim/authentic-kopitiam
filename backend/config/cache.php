<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Default Cache Store
    |--------------------------------------------------------------------------
    |
    | This option controls the default cache connection that gets used while
    | using this caching library. This connection is used when another is
    | not explicitly specified when executing a given caching function.
    |
    */
    'default' => env('CACHE_DRIVER', 'redis'),

    /*
    |--------------------------------------------------------------------------
    | Cache Stores
    |--------------------------------------------------------------------------
    |
    | Here you may define all of the cache "stores" for your application as
    | well as their drivers. You may even define multiple cache stores for
    | the same cache driver to group types of items stored in your caches.
    |
    */
    'stores' => [
        'redis' => [
            'driver' => 'redis',
            'connection' => env('CACHE_REDIS_CONNECTION', 'default'),
            'lock_connection' => env('CACHE_REDIS_CONNECTION', 'default'),
        ],

        'database' => [
            'driver' => 'database',
            'connection' => env('DB_CONNECTION', 'pgsql'),
            'table' => env('CACHE_DATABASE_TABLE', 'cache'),
            'lock_connection' => env('DB_CONNECTION', 'pgsql'),
            'lock_table' => env('CACHE_DATABASE_LOCK_TABLE', 'cache_locks'),
        ],

        'array' => [
            'driver' => 'array',
            'serialize' => false,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Cache Key Prefix
    |--------------------------------------------------------------------------
    |
    | When utilizing a cache store, you may prefix every cache key to avoid
    | collisions. This is useful when multiple applications share the cache.
    |
    */
    'prefix' => env('CACHE_PREFIX', Illuminate\Support\Str::slug(env('APP_NAME', 'laravel'), '_').'_cache_'),
];
