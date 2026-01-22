/**
 * Unauthorized Page (403)
 * Morning Brew Collective
 * 
 * Displayed when user attempts to access admin routes without permission.
 */

import Link from 'next/link';

export default function UnauthorizedPage() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-cream-white to-honey-light flex items-center justify-center p-6">
            <div className="text-center max-w-md">
                {/* Icon */}
                <div className="text-6xl mb-6">🔒</div>

                {/* Title */}
                <h1 className="font-display text-4xl font-bold text-espresso-dark mb-4">
                    Access Denied
                </h1>

                {/* Message */}
                <p className="text-mocha-medium mb-8">
                    You don&apos;t have permission to access this page.
                    This area is restricted to administrators only.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/"
                        className="px-6 py-3 bg-terracotta-warm text-cream-white font-bold rounded-full hover:bg-terracotta-warm/90 transition-colors"
                    >
                        Return Home
                    </Link>
                    <Link
                        href="/login"
                        className="px-6 py-3 border-2 border-espresso-dark text-espresso-dark font-bold rounded-full hover:bg-espresso-dark hover:text-cream-white transition-colors"
                    >
                        Sign In
                    </Link>
                </div>

                {/* Help Text */}
                <p className="mt-8 text-sm text-mocha-medium">
                    If you believe you should have access, please contact the administrator.
                </p>
            </div>
        </main>
    );
}
