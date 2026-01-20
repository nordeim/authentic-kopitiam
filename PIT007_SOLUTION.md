# PIT-007: Laravel Cached Config Override Error - SOLUTION

## BACKGROUND
**Issue:** Laravel attempts to DELETE from `cache` table during `php artisan cache:clear`, but the table doesn't exist.

**Root Cause:** Bootstrap cached config (bootstrap/cache/config.php) contains stale `'cache' => ['default' => 'database']`, overriding the correct `.env` setting of `CACHE_DRIVER=redis`.

**Severity:** Medium (Development workflow blocker)
**Estimated Fix Time:** 5 minutes
**Risk:** Low (corrective configuration)

---

## SOLUTION PLAN

### Option A: Create config/cache.php (RECOMMENDED)
This prevents the issue from recurring and persists the correct Redis configuration.

**Step 1:** Create the cache configuration file
```bash
# File: backend/config/cache.php
cat > /home/project/authentic-kopitiam/backend/config/cache.php << 'EOCACHE'
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
    | When utilizing the APC, database, memcached, Redis, or DynamoDB cache
    | stores there might be other applications using the same cache. For that
    | reason, you may prefix every cache key to avoid collisions.
    |
    */
    'prefix' => env('CACHE_PREFIX', 'morning_brew_cache_'),
];
EOCACHE
