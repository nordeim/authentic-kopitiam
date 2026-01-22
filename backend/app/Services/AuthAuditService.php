<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use App\Models\User;

/**
 * Auth Audit Service
 * 
 * Handles audit logging for authentication events.
 * PDPA-compliant logging with pseudonymization.
 */
class AuthAuditService
{
    /**
     * Log a successful login event
     */
    public function logLogin(User $user, Request $request): void
    {
        $this->log('auth.login.success', $user, $request, [
            'method' => 'token',
        ]);
    }

    /**
     * Log a failed login attempt
     */
    public function logFailedLogin(string $email, Request $request): void
    {
        Log::channel('security')->warning('auth.login.failed', [
            'email_hash' => $this->pseudonymize($email),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Log a logout event
     */
    public function logLogout(User $user, Request $request): void
    {
        $this->log('auth.logout', $user, $request);
    }

    /**
     * Log a registration event
     */
    public function logRegistration(User $user, Request $request): void
    {
        $this->log('auth.register', $user, $request, [
            'role' => $user->role,
        ]);
    }

    /**
     * Log an admin access event
     */
    public function logAdminAccess(User $user, Request $request, string $action): void
    {
        $this->log('auth.admin.access', $user, $request, [
            'action' => $action,
            'route' => $request->path(),
        ]);
    }

    /**
     * Log a token refresh event
     */
    public function logTokenRefresh(User $user, Request $request): void
    {
        $this->log('auth.token.refresh', $user, $request);
    }

    /**
     * Log an unauthorized access attempt
     */
    public function logUnauthorizedAccess(Request $request, ?User $user = null): void
    {
        Log::channel('security')->warning('auth.unauthorized', [
            'user_id_hash' => $user ? $this->pseudonymize((string) $user->id) : null,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'route' => $request->path(),
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Core logging method with PDPA-compliant pseudonymization
     */
    protected function log(string $event, User $user, Request $request, array $extra = []): void
    {
        Log::channel('security')->info($event, array_merge([
            'user_id_hash' => $this->pseudonymize((string) $user->id),
            'email_hash' => $this->pseudonymize($user->email),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now()->toIso8601String(),
        ], $extra));
    }

    /**
     * Pseudonymize data for PDPA compliance
     */
    protected function pseudonymize(string $data): string
    {
        $salt = config('app.key');
        return hash('sha256', $data . $salt);
    }
}
