'use client'

import * as React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js';
import { usePaymentStore } from '@/store/payment-store';
import { toast } from '@/components/ui/toast-notification';
import { retroAppearance } from '@/lib/stripe-appearance';
import { cn } from '@/lib/utils';

// Icons
import { CreditCardIcon, ShieldCheckIcon, LockClosedIcon } from '@heroicons/react/24/solid';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface StripePaymentFormProps {
  clientSecret: string;
  orderId: string;
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

// Stripe Elements wrapper
export function StripePaymentForm({
  clientSecret,
  orderId,
  amount,
  onSuccess,
  onError,
}: StripePaymentFormProps) {
  const options = {
    clientSecret,
    appearance: retroAppearance,
  };

  return (
    <Elements stripe={getStripe()} options={options}>
      <StripeFormContent
        orderId={orderId}
        amount={amount}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
}

function getStripe() {
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
}

interface StripeFormContentProps {
  orderId: string;
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

function StripeFormContent({ orderId, amount, onSuccess, onError }: StripeFormContentProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { setProcessing, setPayment } = usePaymentStore();

  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Elements loaded callback
    if (elements) {
      setIsLoading(false);
    }
  }, [elements]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setErrorMessage('Payment form not ready. Please wait...');
      return;
    }

    // Validate form
    const { error: formError } = await elements.submit();
    if (formError) {
      setErrorMessage(formError.message);
      onError(formError.message || 'Invalid payment details');
      return;
    }

    setIsProcessing(true);
    setProcessing(true);

    try {
      // Confirm payment
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/confirmation?orderId=${orderId}`,
        },
        redirect: 'if_required', // Handle both redirect and payment element flows
      });

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      // Handle payment result
      if (paymentIntent) {
        if (paymentIntent.status === 'succeeded') {
          toast({
            title: 'Payment Successful!',
            description: 'Redirecting to confirmation...',
          });
          onSuccess();
        } else if (paymentIntent.status === 'processing') {
          toast({
            title: 'Payment Processing',
            description: 'This may take a few moments...',
          });
          // Will be handled by webhook
          onSuccess();
        } else if (paymentIntent.status === 'requires_action') {
          // 3D Secure or other authentication
          toast({
            title: 'Authentication Required',
            description: 'Please complete 3D Secure verification',
          });
          // Stripe will handle the redirect automatically
        } else {
          throw new Error(`Unexpected payment status: ${paymentIntent.status}`);
        }
      }
    } catch (error) {
      let errorMsg = 'Payment failed';
      if (error instanceof Error) {
        errorMsg = error.message;
      }

      setErrorMessage(errorMsg);
      onError(errorMsg);
      toast({
        title: 'Payment Failed',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      setProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 rounded-full border-4 border-[rgb(229,215,195)] border-t-[rgb(255,107,74)] animate-spin" />
        <span className="ml-3 text-[rgb(107,90,74)]">Loading payment form...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <header className="text-center space-y-2">
        <h2 className="text-3xl font-bold font-['Fraunces'] text-[rgb(61,35,23)]">
          Pay with Card
        </h2>
        <p className="text-[rgb(107,90,74)]">Secure payment via Stripe</p>

        {/* Security badges */}
        <div className="inline-flex items-center gap-6 mt-4">
          <div className="flex items-center gap-2 text-sm text-[rgb(107,90,74)]">
            <ShieldCheckIcon className="w-5 h-5 text-[rgb(255,107,74)]" />
            Bank-level security
          </div>
          <div className="flex items-center gap-2 text-sm text-[rgb(107,90,74)]">
            <LockClosedIcon className="w-5 h-5 text-[rgb(255,107,74)]" />
            Encrypted
          </div>
        </div>
      </header>

      {/* Payment form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error message display */}
        {errorMessage && (
          <div className="bg-[rgb(220,38,38,0.1)] border-2 border-[rgb(220,38,38)] rounded-lg p-4">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-[rgb(220,38,38)] mt-0.5" />
              <div className="text-[rgb(61,35,23)]">
                <p className="font-semibold">Payment Error</p>
                <p className="text-sm">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Element */}
        <div className="bg-white rounded-xl p-6 border-2 border-[rgb(229,215,195)]">
          <label className="block text-sm font-semibold text-[rgb(61,35,23)] mb-3">
            Card Details
          </label>
          <PaymentElement
            options={{
              layout: 'tabs', // Show saved cards + new card tabs
              defaultValues: {
                billingDetails: {
                  name: '', // Pre-filled if available
                  email: '',
                },
              },
            }}
          />
        </div>

        {/* Amount Display */}
        <div className="bg-[rgb(255,245,230)] rounded-lg p-4 border-2 border-[rgb(229,215,195)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-[rgb(107,90,74)]">Subtotal</div>
              <div className="font-semibold text-[rgb(61,35,23)]">
                S${(amount / 1.09).toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-[rgb(107,90,74)]">GST (9%)</div>
              <div className="font-semibold text-[rgb(61,35,23)]">
                S${(amount * 0.09).toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-[rgb(107,90,74)]">Total</div>
              <div className="font-bold text-[rgb(61,35,23)]">
                S${amount.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className={cn(
            'w-full py-4 px-6 rounded-full font-bold font-['Fraunces'] text-lg',
            'bg-[rgb(255,107,74)] text-white',
            'hover:bg-[rgb(230,90,60)] transition-all',
            'disabled:bg-[rgb(229,215,195)] disabled:text-[rgb(163,137,109)] disabled:cursor-not-allowed',
            'flex items-center justify-center gap-3'
          )}
        >
          {isProcessing ? (
            <>
              <div className="w-6 h-6 rounded-full border-3 border-white border-t-transparent animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <CreditCardIcon className="w-6 h-6" />
              Pay S${amount.toFixed(2)}
            </>
          )}
        </button>

        {/* Secure note */}
        <div className="text-center p-4 bg-[rgb(255,245,230)] rounded-lg">
          <p className="text-sm text-[rgb(107,90,74)]">
            🔒 Your payment information is encrypted and secure. We never store card details.
          </p>
        </div>

        {/* Test mode indicator (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-center p-3 bg-yellow-100 border-2 border-yellow-400 rounded-lg">
            <p className="text-sm text-yellow-800 font-semibold">
              🧪 Test Mode: Use card 4242 4242 4242 4242
            </p>
          </div>
        )}
      </form>

      {/* 3D Secure fallback message */}
      <div className="text-sm text-[rgb(107,90,74)] text-center p-4">
        <p>
          If your bank requires 3D Secure authentication, you will be redirected to complete verification.
        </p>
      </div>
    </div>
  );
}

// Helper: Test Stripe Elements without real payment
export function TestStripeForm({ amount }: { amount: number }) {
  return (
    <div className="bg-white rounded-xl p-6 border-2 border-[rgb(229,215,195)]">
      <div className="text-center py-8">
        <div className="w-12 h-12 rounded-full bg-[rgb(255,107,74)] flex items-center justify-center mx-auto mb-4">
          <CreditCardIcon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-bold text-[rgb(61,35,23)] mb-2">Stripe Integration Ready</h3>
        <p className="text-[rgb(107,90,74)] mb-4">
          This would show the Stripe payment form when clientSecret is available.
        </p>
        <div className="bg-[rgb(255,245,230)] rounded-lg p-4">
          <p className="text-sm font-semibold text-[rgb(61,35,23)]">Amount: S${amount.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
