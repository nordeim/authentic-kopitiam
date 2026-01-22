'use client';

/**
 * Register Page
 * Morning Brew Collective
 * 
 * User registration form with retro kopitiam styling.
 */

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

export default function RegisterPage() {
    const router = useRouter();
    const { register, isLoading, error, clearError } = useAuthStore();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [validationError, setValidationError] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        clearError();
        setValidationError('');

        // Client-side validation
        if (password !== passwordConfirmation) {
            setValidationError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setValidationError('Password must be at least 8 characters');
            return;
        }

        try {
            await register({
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });
            router.push('/');
        } catch {
            // Error is handled by store
        }
    };

    const displayError = validationError || error;

    return (
        <main className="min-h-screen bg-gradient-to-b from-cream-white to-honey-light flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block">
                        <h1 className="font-display text-3xl font-bold text-espresso-dark">
                            Morning Brew
                        </h1>
                        <p className="font-display text-sm text-terracotta-warm font-bold tracking-widest uppercase">
                            Collective
                        </p>
                    </Link>
                </div>

                {/* Register Card */}
                <div className="bg-cream-white rounded-2xl shadow-lg p-8 border-2 border-dashed border-butter-toast">
                    <h2 className="font-display text-2xl font-bold text-espresso-dark mb-6 text-center">
                        Join the Family
                    </h2>

                    {displayError && (
                        <div className="mb-6 p-4 bg-coral-pop/10 border border-coral-pop rounded-lg text-coral-pop text-sm">
                            {displayError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name */}
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-bold text-mocha-medium mb-2"
                            >
                                Full Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                autoComplete="name"
                                className="w-full px-4 py-3 rounded-lg border-2 border-butter-toast bg-vintage-paper text-espresso-dark placeholder:text-mocha-medium/50 focus:border-terracotta-warm focus:outline-none transition-colors"
                                placeholder="Uncle Lim"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-bold text-mocha-medium mb-2"
                            >
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                                className="w-full px-4 py-3 rounded-lg border-2 border-butter-toast bg-vintage-paper text-espresso-dark placeholder:text-mocha-medium/50 focus:border-terracotta-warm focus:outline-none transition-colors"
                                placeholder="uncle.lim@kopitiam.sg"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-bold text-mocha-medium mb-2"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                                minLength={8}
                                className="w-full px-4 py-3 rounded-lg border-2 border-butter-toast bg-vintage-paper text-espresso-dark placeholder:text-mocha-medium/50 focus:border-terracotta-warm focus:outline-none transition-colors"
                                placeholder="••••••••"
                            />
                            <p className="mt-1 text-xs text-mocha-medium">
                                Min 8 characters with uppercase, number, and symbol
                            </p>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label
                                htmlFor="password_confirmation"
                                className="block text-sm font-bold text-mocha-medium mb-2"
                            >
                                Confirm Password
                            </label>
                            <input
                                id="password_confirmation"
                                type="password"
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                required
                                autoComplete="new-password"
                                className="w-full px-4 py-3 rounded-lg border-2 border-butter-toast bg-vintage-paper text-espresso-dark placeholder:text-mocha-medium/50 focus:border-terracotta-warm focus:outline-none transition-colors"
                                placeholder="••••••••"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-6 bg-terracotta-warm text-cream-white font-bold rounded-full hover:bg-terracotta-warm/90 focus:outline-none focus:ring-2 focus:ring-terracotta-warm focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-cream-white border-r-transparent" />
                                    Creating account...
                                </span>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-mocha-medium">
                            Already have an account?{' '}
                            <Link
                                href="/login"
                                className="font-bold text-terracotta-warm hover:underline"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="mt-6 text-center">
                    <Link
                        href="/"
                        className="text-sm text-mocha-medium hover:text-espresso-dark transition-colors"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </main>
    );
}
