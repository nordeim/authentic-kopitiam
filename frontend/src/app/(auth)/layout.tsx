/**
 * Auth Layout
 * Morning Brew Collective
 * 
 * Layout for authentication pages (login, register).
 */

import type { ReactNode } from 'react';

interface AuthLayoutProps {
    children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="min-h-screen">
            {children}
        </div>
    );
}
