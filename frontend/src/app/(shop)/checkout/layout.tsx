'use client';

/**
 * Checkout Layout
 * Morning Brew Collective
 * 
 * Protected layout for checkout flow - requires authentication.
 */

import type { ReactNode } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';

interface CheckoutLayoutProps {
    children: ReactNode;
}

export default function CheckoutLayout({ children }: CheckoutLayoutProps) {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-b from-cream-white to-honey-light">
                {children}
            </div>
        </ProtectedRoute>
    );
}
