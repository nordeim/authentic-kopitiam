# CACHE TABLE ERROR - ROOT CAUSE ANALYSIS

## ERROR SYMPTOM
```
SQLSTATE[42P01]: Undefined table: 7 ERROR:  relation "cache" does not exist
SQL: delete from "cache"
```

## SYSTEMATIC ROOT CAUSE TRACE

### Phase 1: Symptom Analysis ✓
- Laravel attempting to DELETE from `cache` table in PostgreSQL
- Table doesn't exist in database
- Error occurs during `php artisan cache:clear`

### Phase 2: Configuration Verification ✓
- `env('CACHE_DRIVER')` returns: "**redis**" ✓
- `config('cache.default')` returns: "**database**" ❌
- **This is the contradiction!**

### Phase 3: Evidence Chain ✓
1. ENV variable is correctly set: `CACHE_DRIVER=redis`
2. Redis connection works: `Redis::connection()->ping() === true`
3. Cache store in use: `Illuminate\Cache\DatabaseStore` (NOT RedisStore)
4. Cache configuration is cached: `bootstrap/cache/config.php` exists
5. Cached config contains: `'cache' => ['default' => 'database']`

### Phase 4: Why This Happens
**Root Cause:** Laravel's cached configuration priority

```
Configuration Resolution Order:
1. bootstrap/cache/config.php (CACHED - highest priority)
2. config/*.php files
3. .env variables (lowest priority when cache exists)

The cached config was created when CACHE_DRIVER=database.
Even though .env now says CACHE_DRIVER=redis, Laravel uses
bootstrap/cache/config.php which specifies 'database'.
```

### Phase 5: Trigger Identification
**Why cache:clear fails:**
1. Artisan command starts
2. Loads config from bootstrap/cache/config.php
3. Sees cache.default = 'database'
4. Creates DatabaseStore instance
5. Tries to DELETE FROM cache table
6. Table doesn't exist (because we use Redis, not DB cache)
7. QueryException thrown

### Phase 6: Missing Piece
**Why no config/cache.php?**
- Laravel ships with default config in vendor/laravel/framework
- Project doesn't override it with custom config/cache.php
- When cache:config runs, it uses vendor defaults (database)
- Without custom config/cache.php, we can't set Redis as default

## ROOT CAUSE CONFIRMED
**Problem:** Laravel's cached config (bootstrap/cache/config.php) prioritizes stale configuration from when CACHE_DRIVER=database, overriding the current .env setting of CACHE_DRIVER=redis.

**Impact:** All cache operations use DatabaseStore instead of RedisStore, requiring a 'cache' table that doesn't exist.

**Solution Required:**
1. Create config/cache.php to properly set 'default' => 'redis'
2. Run `php artisan config:clear` to remove stale cache
3. Verify cache operations now use Redis
4. Document this as PIT-007 in CLAUDE.md
