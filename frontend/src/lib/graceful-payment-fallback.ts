/**
 * Graceful Degradation Components
 * Fallback UI when Stripe or PayNow services are unavailable
 * Ensures users can still access core business functionality
 */

import * as React from 'react';
import { toast } from '@/components/ui/toast-notification';

export interface FallbackOptions {
  onRetry: () => void;
  onBackToCart: () => void;
  onContactSupport: () => void;
}

// Offline Mode Component - when payment services are completely unavailable
export function OfflineModeFallback({ 
  onRetry, 
  onBackToCart, 
  onContactSupport 
}: FallbackOptions) {
  return (
    <div className="max-w-2xl mx-auto space-y-6 text-center py-16">
      <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[rgb(220,38,38,0.1)] border-4 border-[rgb(220,38,38)] mb-6">
        <svg className="w-12 h-12 text-[rgb(220,38,26)]" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          <path d="M9 12a1 1 0 11-2 0 1 1 0 012 0zM10 9a1 1 0 100-2 1 1 0 000 2z" />
        </svg>
      </div>
      
      <h2 className="text-3xl font-bold font-['Fraunces'] text-[rgb(61,35,23)] mb-4">
        Payment Services Unavailable
      </h2>
      
      <div className="bg-[rgb(220,38,26,0.1)] border-2 border-[rgb(220,38,26)] rounded-lg p-4 mb-6">
        <p className="text-[rgb(61,35,23)] font-semibold mb-2">
          Our payment system is temporarily offline
        </p>
        <p className="text-sm text-[rgb(107,90,74)]">
          We apologize for the inconvenience. Your order details have been saved and you can complete payment later.
        </p>
      </div>

      <div className="space-y-3 max-w-md mx-auto">
        <button
          onClick={onRetry}
          className="w-full py-3 px-4 rounded-full font-bold font-['Fraunces'] bg-[rgb(229,215,195)] text-[rgb(61,35,23)] hover:bg-[rgb(255,107,74)] hover:text-white transition-colors"
        >
          Retry Connection
        </button>

        <button
          onClick={onBackToCart}
          className="w-full py-3 px-4 rounded-full font-bold font-['Fraunces'] bg-[rgb(255,190,79)] text-white hover:bg-[rgb(230,170,60)] transition-colors"
        >
          Back to Cart
        </button>

        <button
          onClick={onContactSupport}
          className="w-full py-3 px-4 rounded-full font-bold font-['Fraunces'] border-2 border-[rgb(229,215,195)] text-[rgb(61,35,23)] hover:border-[rgb(255,107,74)] hover:text-[rgb(255,107,74)] transition-colors"
        >
          Contact Support
        </button>
      </div>

      <div className="text-center text-sm text-[rgb(107,90,74)] mt-6">
        <p className="mb-2">
          <strong>Saved Order:</strong> #{orderId}
        </p>
        <p>
          Your cart items are preserved for 30 days
        </p>
      </div>
    </div>
  );
}

// Payment Method Unavailable - single method unavailable
export function PaymentMethodUnavailableFallback({ 
  method, 
  onTryOtherMethod, 
  onBackToCart 
}: { 
  method: 'paynow' | 'stripe';
  onTryOtherMethod: () => void;
  onBackToCart: () => void;
}) {
  const methodInfo = {
    paynow: {
      name: 'PayNow',
      icon: '📱',
      message: 'PayNow QR generation is temporarily unavailable',
    },
    stripe: {
      name: 'Credit/Debit Card',
      icon: '💳',
      message: 'Card payment processing is temporarily unavailable',
    },
  };

  const info = methodInfo[method];

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-center py-16">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[rgb(220,38,26,0.1)] border-2 border-[rgb(220,38,26)] mb-6">
        <span className="text-2xl">{info.icon}</span>
      </div>
      
      <h2 className="text-2xl font-bold font-['Fraunces'] text-[rgb(61,35,23)] mb-4">
        {info.name} Currently Unavailable
      </h2>
      
      <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 mb-6">
        <p className="text-[rgb(61,35,23)] font-semibold">
          {info.message}
        </p>
        <p className="text-sm text-[rgb(107,90,74)] mt-2">
          Our {info.name} integration is experiencing issues. You can try one of our other secure payment methods.
        </p>
      </div>

      <div className="space-y-3 max-w-md mx-auto">
        <button
          onClick={onTryOtherMethod}
          className="w-full py-3 px-4 rounded-full font-bold font-['Fraunces'] bg-[rgb(255,107,74)] text-white hover:bg-[rgb(230,90,60)] transition-colors"
        >
          Try Other Payment Method
        </button>

        <button
          onClick={onBackToCart}
          className="w-full py-3 px-4 rounded-full font-bold font-['Fraunces'] border-2 border-[rgb(229,215,195)] text-[rgb(61,35,23)] hover:border-[rgb(255,107,74)] hover:text-[rgb(255,107,74)] transition-colors"
        >
          Back to Cart
        </button>
      </div>

      <div className="text-center text-sm text-[rgb(107,90,74)] mt-6">
        <p>
          <strong>Stripe Services:</strong> Stripe maintains over 99.99% uptime
        </p>
      </div>
    </div>
  );
}

// Payment Retry Modal - shows when retrying payment
export function PaymentRetryModal({ 
  open, 
  onOpenChange, 
  attempt, 
  maxAttempts, 
  onStopRetry,
  onContactSupport 
}: { 
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attempt: number;
  maxAttempts: number;
  onStopRetry: () => void;
  onContactSupport: () => void;
}) {
  const progress = (attempt / maxAttempts) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white border-4 border-[rgb(61,35,23)] rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-['Fraunces'] text-[rgb(61,35,23)] mb-2">
            Retrying Payment
          </DialogTitle>
          <DialogDescription className="text-[rgb(107,90,74)]">
            Attempt {attempt} of {maxAttempts}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="w-full h-2 bg-[rgb(229,215,195)] rounded-full">
            <div 
              className="h-2 bg-[rgb(255,107,74)] rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="text-center text-sm text-[rgb(107,90,74)]">
            <p>
              We're trying to connect to the payment service. This may take a few attempts.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={onStopRetry}
              variant="secondary"
              className="flex-1"
            >
              Stop & Cancel
            </Button>
            
            {attempt >= maxAttempts - 1 && (
              <Button
                onClick={onContactSupport}
                variant="primary"
                className="flex-1"
              >
                Contact Support
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper: Check if payment services are available
export async function checkPaymentServicesHealth(): Promise<{
  stripe: boolean;
  paynow: boolean;
  allAvailable: boolean;
}> {
  try {
    const response = await fetch('/api/v1/payments/health', {
      cache: 'no-cache',
      credentials: 'include',
    });

    if (!response.ok) {
      return {
        stripe: false,
        paynow: false,
        allAvailable: false,
      };
    }

    const health = await response.json();
    return {
      stripe: health.stripe || false,
      paynow: health.paynow || false,
      allAvailable: (health.stripe && health.paynow) || false,
    };
  } catch (error) {
    console.error('Failed to check payment services:', error);
    return {
      stripe: false,
      paynow: false,
      allAvailable: false,
    };
  }
}

// Helper: Create offline order (fallback when payment system is down)
export async function createOfflineOrder(orderData: any): Promise<{ orderId: string }> {
  const offlineOrderData = {
    ...orderData,
    payment_status: 'pending',
    requires_payment: true,
    offline_mode: true,
  };

  try {
    const response = await fetch('/api/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Offline-Mode': 'true',
      },
      body: JSON.stringify(offlineOrderData),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to create offline order');
    }

    const result = await response.json();
    return { orderId: result.invoice_number };
  } catch (error) {
    console.error('Offline order creation failed:', error);
    throw error;
  }
}
