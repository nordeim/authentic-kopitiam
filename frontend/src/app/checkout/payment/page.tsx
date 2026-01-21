'use client'

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { PaymentMethodSelector } from '@/components/payment/payment-method-selector';
import { PayNowQRDisplay } from '@/components/payment/paynow-qr-display';
import { StripePaymentForm } from '@/components/payment/stripe-payment-form';
import { PaymentStatusTracker } from '@/components/payment/payment-status-tracker';
import { PaymentSuccess } from '@/components/payment/payment-success';
import { PaymentFailed } from '@/components/payment/payment-failed';
import { PaymentRecoveryModal } from '@/components/payment/payment-recovery-modal';
import { OfflineModeFallback, PaymentMethodUnavailableFallback } from '@/lib/graceful-payment-fallback';
import { usePaymentStore } from '@/store/payment-store';
import { useCartStore } from '@/store/cart-store';
import { paymentApi } from '@/lib/api/payment-api';
import { toast } from '@/components/ui/toast-notification';
import { LoaderIcon } from '@/components/ui/loader-icon';
import { paymentErrorHandler } from '@/lib/payment-error-handler';
import { shouldShowRecoveryModal } from '@/components/payment/payment-recovery-modal';
import { cn } from '@/lib/utils';
import { ArrowLeftIcon, CreditCardIcon, QrCodeIcon } from '@heroicons/react/24/outline';

// Payment flow states
export type PaymentFlowState = 
  | 'method-selection'    // Step 1: Choose PayNow or Card
  | 'payment-init'        // Step 2: Initialize payment (create on backend)
  | 'processing'          // Step 3: Show QR or Stripe form
  | 'status-tracking'     // Step 4: Poll for status updates
  | 'confirmation'        // Step 5: Show success/failure
  | 'error'              // Error state with retry options
  | 'offline-mode';       // When payment services are down

function PaymentContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '';
  const resumeParam = searchParams.get('resume') === 'true';
  
  // State management
  const { getTotal, clearCart } = useCartStore();
  const { payment, setPayment, setError, error, reset, setQrCodeUrl, setClientSecret, qrCodeUrl, clientSecret } = usePaymentStore();
  
  // Local state
  const [state, setState] = React.useState<PaymentFlowState>('method-selection');
  const [selectedMethod, setSelectedMethod] = React.useState<'paynow' | 'stripe' | null>(null);
  const [showRecoveryModal, setShowRecoveryModal] = React.useState(false);
  const [fallbackMode, setFallbackMode] = React.useState<{
    type: 'offline' | 'method-unavailable';
    method?: 'paynow' | 'stripe';
  } | null>(null);

  const totalAmount = getTotal();

  // Resume existing payment
  const handleResumePayment = React.useCallback(async (method: 'paynow' | 'stripe') => {
    if (!payment) return;

    setSelectedMethod(method);
    
    if (method === 'paynow' && payment.paynow_qr_data) {
      setQrCodeUrl(payment.paynow_qr_data);
    } else if (method === 'stripe' && payment.provider_payment_id) {
      // Recreate client_secret from existing payment_intent
      try {
        const response = await paymentApi.createStripePayment(orderId, totalAmount);
        setClientSecret(response.client_secret ?? null);
      } catch (error) {
        setClientSecret(null); // Will show retry option
      }
    }
    
    setState('processing');
  }, [payment, orderId, totalAmount, setQrCodeUrl, setClientSecret]);

  // Initialize payment flow
  const initializePaymentFlow = React.useCallback(async () => {
    try {
      // Check if we should show recovery modal
      if (resumeParam && orderId && shouldShowRecoveryModal(orderId)) {
        setShowRecoveryModal(true);
        return;
      }

      // Check payment services health
      const health = await paymentApi.checkPaymentMethodAvailability();
      const allAvailable = health.paynow && health.stripe;
      
      if (!allAvailable) {
        if (!health.paynow && !health.stripe) {
          setFallbackMode({ type: 'offline' });
          setState('offline-mode');
        } else if (selectedMethod && !health[selectedMethod]) {
          setFallbackMode({ 
            type: 'method-unavailable', 
            method: selectedMethod 
          });
          setState('error');
        }
      }

      // If we have a stored payment, resume it
      if (payment && ['pending', 'processing'].includes(payment.status)) {
        await handleResumePayment(payment.payment_method as 'paynow' | 'stripe');
      }
    } catch (error) {
      console.error('Failed to initialize payment flow:', error);
      const paymentError = paymentErrorHandler.handleNetworkError(error, 'initialization');
      setError(paymentError.message);
      setState('error');
    }
  }, [orderId, resumeParam, payment, selectedMethod, setError, handleResumePayment]);

  // Initial load effect
  React.useEffect(() => {
    // Only initialize if we have an order
    if (orderId) {
      initializePaymentFlow();
    } else {
      toast({
        title: 'Missing Order',
        description: 'No order ID provided. Please return to cart.',
        variant: 'warning',
      });
      window.location.href = '/cart';
    }
  }, [orderId, initializePaymentFlow]);

  // Auto-advance based on payment state
  React.useEffect(() => {
    if (!payment) return;

    switch (payment.status) {
      case 'pending':
        setState('method-selection');
        break;
      case 'processing':
        setState('status-tracking');
        break;
      case 'completed':
        setState('confirmation');
        clearCart(); // Clear cart on success
        break;
      case 'failed':
        setState('confirmation');
        break;
    }
  }, [payment?.status]);

  // Initialize payment (create backend record)
  const handleInitializePayment = async (method: 'paynow' | 'stripe') => {
    setState('payment-init');

    try {
      const existingPayment = payment?.payment_method === method ? payment : null;
      
      const newPayment = existingPayment || (method === 'paynow'
        ? await paymentApi.createPayNowPayment(orderId)
        : await paymentApi.createStripePayment(orderId, totalAmount));

      const paymentId = 'id' in newPayment ? newPayment.id : newPayment.payment_id;

      setPayment({
        id: paymentId,
        order_id: orderId,
        payment_method: method === 'stripe' ? 'stripe_card' : method,
        status: 'pending',
        amount: totalAmount,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Store QR code or client secret
      if ('qr_code_url' in newPayment && newPayment.qr_code_url) {
        setQrCodeUrl(newPayment.qr_code_url);
      } else if ('client_secret' in newPayment && newPayment.client_secret) {
        setClientSecret(newPayment.client_secret);
      }

      // Advance to processing state
      setSelectedMethod(method);
      setState('processing');
    } catch (error) {
      const paymentError = paymentErrorHandler.handleStripeError(error);
      setError(paymentError.message);
      setState('error');
    }
  };

  // Handle payment completion
  const handlePaymentSuccess = () => {
    setState('confirmation');
    window.location.href = `/checkout/confirmation?orderId=${orderId}&paymentId=${payment?.id}`;
  };

  // Handle payment failure
  const handlePaymentFailure = (error: string) => {
    setError(error);
    setState('confirmation');
  };

  // Render different states
  const renderFlow = () => {
    switch (state) {
      case 'method-selection':
        return (
          <PaymentMethodSelector
            orderId={orderId}
            amount={totalAmount}
            onContinue={(method: 'paynow' | 'stripe') => handleInitializePayment(method)}
            onCancel={() => window.location.href = '/cart'}
          />
        );

      case 'payment-init':
        return (
          <div className="max-w-2xl mx-auto py-16 text-center">
            <LoaderIcon className="w-12 h-12 text-[rgb(255,107,74)] animate-spin" />
            <p className="mt-4 text-[rgb(107,90,74)]">
              Initializing payment...
            </p>
          </div>
        );

      case 'processing':
        if (selectedMethod === 'paynow') {
          return (
            <PayNowQRDisplay
              orderId={orderId}
              amount={totalAmount}
              paymentId={payment?.id || ''}
              qrCodeUrl={qrCodeUrl || ''}
              expiresAt={new Date(Date.now() + 15 * 60 * 1000).toISOString()} // 15 minutes
            />
          );
        } else if (selectedMethod === 'stripe' && clientSecret) {
          return (
            <StripePaymentForm
              clientSecret={clientSecret}
              orderId={orderId}
              amount={totalAmount}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentFailure}
            />
          );
        } else {
          return (
            <div className="max-w-2xl mx-auto py-16 text-center">
              <div className="text-[rgb(220,38,26)]">
                <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
                <h2 className="text-2xl font-bold font-['Fraunces']">
                  Payment Configuration Error
                </h2>
                <p className="text-[rgb(107,90,74)] mt-2">
                  Unable to initialize {selectedMethod} payment. Please try again or select a different payment method.
                </p>
                <button
                  onClick={() => {
                    reset();
                    setState('method-selection');
                  }}
                  className="mt-4 py-2 px-4 rounded-full font-bold font-['Fraunces'] bg-[rgb(255,107,74)] text-white"
                >
                  Try Again
                </button>
              </div>
            </div>
          );
        }

      case 'status-tracking':
        return (
          <PaymentStatusTracker
            paymentId={payment?.id || ''}
            orderId={orderId}
            amount={totalAmount}
            onSuccess={handlePaymentSuccess}
            onFailure={handlePaymentFailure}
          />
        );

      case 'confirmation':
        if (payment?.status === 'completed') {
          return (
            <div className="max-w-4xl mx-auto py-8">
              <PaymentSuccess
                orderId={orderId}
                paymentId={payment.id}
                amount={payment.amount}
                onTrackOrder={() => window.location.href = `/orders/${orderId}`}
                onShareOrder={() => {
                  // Share logic handled by PaymentSuccess component
                }}
                onOrderAgain={() => window.location.href = '/menu'}
              />
            </div>
          );
        } else if (payment?.status === 'failed') {
          return (
            <div className="max-w-2xl mx-auto py-8">
              <PaymentFailed
                orderId={orderId}
                paymentId={payment.id}
                error={payment.failure_reason || 'Payment failed'}
                onRetry={() => {
                  reset();
                  setState('method-selection');
                }}
                onContactSupport={() => window.location.href = '/support'}
              />
            </div>
          );
        }
        return null;

      case 'error':
        if (fallbackMode?.type === 'method-unavailable' && fallbackMode.method) {
          return (
            <PaymentMethodUnavailableFallback
              method={fallbackMode.method}
              onTryOtherMethod={() => {
                setFallbackMode(null);
                setState('method-selection');
              }}
              onBackToCart={() => window.location.href = '/cart'}
            />
          );
        }
        return (
          <div className="max-w-2xl mx-auto py-16 text-center">
            <div className="text-[rgb(220,38,26)]">
              <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
              <h2 className="text-2xl font-bold font-['Fraunces']">
                Payment Error
              </h2>
              <p className="text-[rgb(107,90,74)] mt-2">
                {error || 'An unexpected error occurred while processing your payment.'}
              </p>
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => {
                    reset();
                    setState('method-selection');
                  }}
                  className="w-full py-3 px-4 rounded-full font-bold font-['Fraunces'] bg-[rgb(255,107,74)] text-white"
                >
                  Try Different Payment Method
                </button>
                <button
                  onClick={() => window.location.href = '/cart'}
                  className="w-full py-3 px-4 rounded-full font-bold font-['Fraunces'] border-2 border-[rgb(229,215,195)] text-[rgb(61,35,23)]"
                >
                  Back to Cart
                </button>
              </div>
            </div>
          </div>
        );

      case 'offline-mode':
        return (
          <OfflineModeFallback
            orderId={orderId}
            onRetry={() => {
              setFallbackMode(null);
              initializePaymentFlow();
            }}
            onBackToCart={() => window.location.href = '/cart'}
            onContactSupport={() => window.location.href = '/support'}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn(
      'min-h-screen py-12 px-4',
      state === 'status-tracking' || state === 'confirmation' 
        ? 'bg-gradient-to-br from-[rgb(255,245,230)] to-[rgb(255,245,230)]' 
        : 'bg-gradient-to-br from-[rgb(255,245,230)] to-[#FFFDF6]'
    )}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => {
                if (state === 'method-selection') {
                  window.location.href = '/cart';
                } else {
                  window.history.back();
                }
              }}
              className={cn(
                'flex items-center gap-2 py-2 px-4 rounded-full',
                'bg-[rgb(229,215,195)] text-[rgb(61,35,23)]',
                'hover:bg-[rgb(255,107,74)] hover:text-white transition-colors',
                (state === 'status-tracking' || state === 'confirmation') && 'opacity-0 pointer-events-none'
              )}
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back
            </button>

            <div className="flex-1">
              <h1 className="text-3xl font-bold font-['Fraunces'] text-[rgb(61,35,23)]">
                Secure Checkout
              </h1>
              <p className="text-[rgb(107,90,74)]">
                Order #{orderId}
              </p>
            </div>

            <div className="text-right">
              <div className="text-sm text-[rgb(107,90,74)]">Total</div>
              <div className="text-xl font-bold font-['Fraunces'] text-[rgb(61,35,23)]">
                S${totalAmount.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          {state !== 'status-tracking' && state !== 'confirmation' && state !== 'offline-mode' && (
            <div className="flex items-center gap-2">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center',
                'bg-[rgb(255,107,74)] text-white font-bold',
                state === 'method-selection' ? 'animate-pulse' : 'opacity-50'
              )}>
                1
              </div>
              <div
                className={cn(
                  'h-1 w-12 rounded-full',
                  state === 'payment-init' || state === 'processing' ? 'bg-[rgb(255,107,74)]' : 'bg-[rgb(229,215,195)]'
                )}
              />
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center',
                'bg-[rgb(229,215,195)] text-[rgb(61,35,23)] font-bold',
                state === 'payment-init' && 'animate-pulse',
                (state === 'processing' || state === 'payment-init') && 'bg-[rgb(255,107,74)] text-white'
              )}>
                2
              </div>
              <div
                className={cn(
                  'h-1 w-12 rounded-full',
                  state === 'processing' ? 'bg-[rgb(255,107,74)]' : 'bg-[rgb(229,215,195)]'
                )}
              />
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center',
                'bg-[rgb(229,215,195)] text-[rgb(61,35,23)] font-bold',
                state === 'processing' && 'bg-[rgb(255,107,74)] text-white'
              )}>
                {selectedMethod === 'paynow' ? <QrCodeIcon className="w-4 h-4" /> : <CreditCardIcon className="w-4 h-4" />}
              </div>
            </div>
          )}
        </header>

        {/* Payment Flow */}
        <div className="bg-white rounded-3xl p-8 border-4 border-[rgb(61,35,23)] shadow-2xl">
          {renderFlow()}
        </div>
      </div>

      {/* Recovery Modal */}
      <PaymentRecoveryModal
        open={showRecoveryModal}
        onOpenChange={setShowRecoveryModal}
        orderId={orderId}
        hasStoredPayment={!!payment}
      />
    </div>
  );
}

export default function PaymentPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[rgb(255,245,230)] to-[#FFFDF6] py-12 flex items-center justify-center">
        <LoaderIcon className="w-12 h-12 text-[rgb(255,107,74)] animate-spin" />
      </div>
    }>
      <PaymentContent />
    </React.Suspense>
  );
}
