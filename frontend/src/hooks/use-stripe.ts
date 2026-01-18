'use client'

import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';

interface UseStripeOptions {
  publishableKey?: string;
}

export function useStripe({ publishableKey }: UseStripeOptions = {}) {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializeStripe = async () => {
      try {
        // Use provided key or environment variable
        const key = publishableKey || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

        if (!key) {
          throw new Error('Stripe publishable key not configured');
        }

        // Load Stripe.js
        const stripeInstance = await loadStripe(key);

        if (!mounted) return;

        if (!stripeInstance) {
          throw new Error('Failed to load Stripe.js');
        }

        setStripe(stripeInstance);
        setIsLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Stripe';
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    initializeStripe();

    return () => {
      mounted = false;
    };
  }, [publishableKey]);

  return {
    stripe,
    isLoading,
    error,
    isReady: !!stripe && !isLoading && !error,
  };
}

// Helper: Check if Stripe is properly configured
export function isStripeConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
}

// Helper: Validate Stripe configuration
export function validateStripeConfig(): { isValid: boolean; error: string | null } {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (!key) {
    return {
      isValid: false,
      error: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set',
    };
  }

  if (!key.startsWith('pk_')) {
    return {
      isValid: false,
      error: 'Invalid Stripe publishable key format',
    };
  }

  return {
    isValid: true,
    error: null,
  };
}
