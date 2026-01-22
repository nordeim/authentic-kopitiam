'use client';

/**
 * Authentication Provider
 * Morning Brew Collective
 * 
 * Wraps the app to check authentication state on mount.
 */

import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '@/store/auth-store';

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const checkAuth = useAuthStore((state) => state.checkAuth);

    useEffect(() => {
        // Check authentication status on mount
        checkAuth();
    }, [checkAuth]);

    return <>{children}</>;
}
