# Authentication Implementation Plan

## Executive Summary

**Current State:** No authentication implemented  
**Risk Level:** CRITICAL - Admin dashboard and order/payment flows unprotected  
**Recommended Solution:** Laravel Sanctum SPA Authentication + Role-Based Access Control

---

## Phase 1: Backend Authentication Foundation (Priority: CRITICAL)

### 1.1 Publish Sanctum Configuration
```bash
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

**Creates:**
- `config/sanctum.php` - Sanctum configuration
- Migration for personal_access_tokens table

### 1.2 Publish Auth Configuration
```bash
php artisan vendor:publish --tag=laravel-config --provider="Illuminate\Auth\AuthServiceProvider"
```

**Modifies:** Creates `config/auth.php`

### 1.3 Add Role Column to Users Table
**[NEW] Migration:** `add_role_to_users_table.php`

```php
Schema::table('users', function (Blueprint $table) {
    $table->enum('role', ['customer', 'admin'])->default('customer');
});
```

### 1.4 Create AuthController
**[NEW] File:** `app/Http/Controllers/Api/AuthController.php`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/register` | POST | User registration |
| `/api/v1/login` | POST | User login (returns token) |
| `/api/v1/logout` | POST | Revoke token |
| `/api/v1/me` | GET | Get current user |
| `/api/v1/refresh` | POST | Refresh auth session |

### 1.5 Create Admin Middleware
**[NEW] File:** `app/Http/Middleware/EnsureUserIsAdmin.php`

```php
public function handle(Request $request, Closure $next): Response
{
    if ($request->user()?->role !== 'admin') {
        abort(403, 'Admin access required');
    }
    return $next($request);
}
```

### 1.6 Update API Routes
**[MODIFY] File:** `routes/api.php`

```php
// Auth routes
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('me', [AuthController::class, 'me']);
    
    // Protected order routes
    Route::apiResource('orders', OrderController::class);
    Route::post('payments/{order}/paynow', ...);
    Route::post('payments/{order}/stripe', ...);
});

// Admin-only routes
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('orders', [AdminOrderController::class, 'index']);
    Route::get('inventory', [AdminInventoryController::class, 'index']);
    // ...
});
```

### 1.7 Checklist
- [ ] Publish Sanctum config
- [ ] Publish auth config
- [ ] Create role migration
- [ ] Run migrations
- [ ] Create AuthController
- [ ] Create EnsureUserIsAdmin middleware
- [ ] Register middleware in bootstrap/app.php
- [ ] Update API routes

---

## Phase 2: Frontend Authentication (Priority: HIGH)

### 2.1 Create Auth Store (Zustand)
**[NEW] File:** `frontend/src/store/auth-store.ts`

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}
```

### 2.2 Create Auth API Client
**[NEW] File:** `frontend/src/lib/auth-api.ts`

```typescript
export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse>;
  async register(data: RegisterData): Promise<AuthResponse>;
  async logout(): Promise<void>;
  async me(): Promise<User>;
};
```

### 2.3 Create Auth Provider
**[NEW] File:** `frontend/src/components/providers/auth-provider.tsx`

- Wraps app with auth context
- Checks auth on mount
- Handles token persistence (PDPA-compliant)

### 2.4 Create Protected Route HOC
**[NEW] File:** `frontend/src/components/auth/protected-route.tsx`

```tsx
export function ProtectedRoute({ 
  children, 
  requireAdmin = false 
}: Props) {
  // Redirect to login if not authenticated
  // Redirect to 403 if not admin when required
}
```

### 2.5 Create Login/Register Pages
**[NEW] Files:**
- `frontend/src/app/(auth)/login/page.tsx`
- `frontend/src/app/(auth)/register/page.tsx`

### 2.6 Checklist
- [ ] Create auth-store.ts
- [ ] Create auth-api.ts
- [ ] Create AuthProvider component
- [ ] Create ProtectedRoute component
- [ ] Create login page with retro styling
- [ ] Create register page with retro styling
- [ ] Add auth provider to root layout
- [ ] Add PDPA-compliant token storage

---

## Phase 3: Protect Critical Routes (Priority: HIGH)

### 3.1 Backend Route Protection
| Route Group | Middleware | Status |
|-------------|------------|--------|
| `POST /orders` | `auth:sanctum` | To Add |
| `POST /payments/*` | `auth:sanctum` | To Add |
| `GET /admin/*` | `auth:sanctum`, `admin` | To Add |
| `PUT /admin/*` | `auth:sanctum`, `admin` | To Add |

### 3.2 Frontend Route Protection
| Route | Protection | Status |
|-------|------------|--------|
| `/checkout/*` | ProtectedRoute | To Add |
| `/admin/*` | ProtectedRoute(requireAdmin) | To Add |
| `/account/*` | ProtectedRoute | To Add |

### 3.3 Admin Layout Protection
**[MODIFY] File:** `frontend/src/app/(dashboard)/admin/layout.tsx`

```tsx
export default function AdminLayout({ children }) {
  return (
    <ProtectedRoute requireAdmin>
      <AdminSidebar />
      {children}
    </ProtectedRoute>
  );
}
```

### 3.4 Checklist
- [ ] Add auth:sanctum to order routes
- [ ] Add auth:sanctum to payment routes
- [ ] Create admin middleware group
- [ ] Wrap checkout with ProtectedRoute
- [ ] Wrap admin layout with ProtectedRoute(requireAdmin)
- [ ] Create unauthorized page (403)

---

## Phase 4: Security Hardening (Priority: MEDIUM)

### 4.1 Rate Limiting
```php
// bootstrap/app.php
RateLimiter::for('auth', function (Request $request) {
    return Limit::perMinute(5)->by($request->ip());
});
```

### 4.2 CSRF Protection (SPA)
```php
// config/sanctum.php
'stateful' => [
    'localhost:3000',
    env('FRONTEND_URL', 'http://localhost:3000'),
],
```

### 4.3 Token Expiration
```php
// config/sanctum.php
'expiration' => 60 * 24, // 24 hours
```

### 4.4 Password Validation
```php
Password::min(8)
    ->mixedCase()
    ->numbers()
    ->symbols()
    ->uncompromised();
```

### 4.5 Audit Logging
- Log all login attempts (success/failure)
- Log admin access
- Integrate with existing PDPA audit trail

### 4.6 Checklist
- [ ] Configure rate limiting for auth routes
- [ ] Set up CSRF for SPA
- [ ] Configure token expiration
- [ ] Implement password strength validation
- [ ] Add audit logging for auth events
- [ ] Test against OWASP Top 10

---

## File Inventory

### New Files (Backend)
| File | Lines Est. |
|------|------------|
| `app/Http/Controllers/Api/AuthController.php` | 150 |
| `app/Http/Middleware/EnsureUserIsAdmin.php` | 25 |
| `database/migrations/add_role_to_users.php` | 20 |
| `config/auth.php` (published) | 110 |
| `config/sanctum.php` (published) | 65 |

### New Files (Frontend)
| File | Lines Est. |
|------|------------|
| `src/store/auth-store.ts` | 120 |
| `src/lib/auth-api.ts` | 80 |
| `src/components/providers/auth-provider.tsx` | 60 |
| `src/components/auth/protected-route.tsx` | 45 |
| `src/app/(auth)/login/page.tsx` | 150 |
| `src/app/(auth)/register/page.tsx` | 180 |
| `src/types/auth.ts` | 30 |

### Modified Files
| File | Changes |
|------|---------|
| `backend/routes/api.php` | Add auth routes, protect orders |
| `backend/app/Models/User.php` | Add role accessor |
| `frontend/src/app/layout.tsx` | Add AuthProvider |
| `frontend/src/app/(dashboard)/admin/layout.tsx` | Add protection |

---

## Verification Plan

### Backend Tests
```bash
php artisan test --filter=AuthTest
```

Test cases:
- [ ] Register with valid data
- [ ] Register with weak password (fail)
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (fail)
- [ ] Access protected route without token (401)
- [ ] Access admin route as customer (403)
- [ ] Access admin route as admin (200)

### Frontend E2E Tests
```bash
npx playwright test auth
```

Test cases:
- [ ] Login flow
- [ ] Register flow
- [ ] Admin dashboard access
- [ ] Checkout requires auth
- [ ] Logout clears state

---

## Timeline Estimate

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1 | 4-6 hours | None |
| Phase 2 | 4-6 hours | Phase 1 |
| Phase 3 | 2-3 hours | Phase 2 |
| Phase 4 | 2-4 hours | Phase 3 |

**Total:** 12-19 hours
