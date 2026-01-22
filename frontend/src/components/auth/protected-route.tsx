'use client';

/**
 * Protected Route Component
 * Morning Brew Collective
 * 
 * HOC to protect routes that require authentication.
 */

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

interface ProtectedRouteProps {
    children: ReactNode;
    requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
    const router = useRouter();
    const { isAuthenticated, isAdmin, isLoading } = useAuthStore();

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated) {
            // Redirect to login if not authenticated
            router.push('/login');
            return;
        }

        if (requireAdmin && !isAdmin) {
            // Redirect to 403 if admin required but user is not admin
            router.push('/unauthorized');
            return;
        }
    }, [isAuthenticated, isAdmin, isLoading, requireAdmin, router]);

    // Show loading while checking auth
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-terracotta-warm border-r-transparent" />
                    <p className="mt-4 font-display text-mocha-medium">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render children if not authenticated
    if (!isAuthenticated) {
        return null;
    }

    // Don't render children if admin required but user is not admin
    if (requireAdmin && !isAdmin) {
        return null;
    }

    return <>{children}</>;
}
