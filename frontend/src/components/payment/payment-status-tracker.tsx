'use client'

import * as React from 'react';
import { useEffect, useRef } from 'react';
import { usePaymentStatus } from '@/hooks/use-payment-status';
import { usePaymentStore } from '@/store/payment-store';
import { toast } from '@/components/ui/toast-notification';
import { PaymentSuccess } from './payment-success';
import { PaymentFailed } from './payment-failed';
import { cn } from '@/lib/utils';

// Icons
import {
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

export interface PaymentStatusTrackerProps {
  paymentId: string;
  orderId: string;
  amount: number;
  onSuccess?: () => void;
  onFailure?: (error: string) => void;
}

export function PaymentStatusTracker({
  paymentId,
  orderId,
  amount,
  onSuccess,
  onFailure,
}: PaymentStatusTrackerProps) {
  const { isPolling, startPolling, stopPolling } = usePaymentStatus({
    paymentId,
    onComplete: () => {
      toast({
        title: 'Payment Completed!',
        description: 'Redirecting to confirmation...',
      });
      onSuccess?.();
    },
    onFailed: (error) => {
      toast({
        title: 'Payment Failed',
        description: error,
        variant: 'destructive',
      });
      onFailure?.(error);
    },
  });

  const { status } = usePaymentStore();

  // Start polling on mount
  useEffect(() => {
    if (paymentId) {
      startPolling();
    }

    return () => {
      stopPolling();
    };
  }, [paymentId, startPolling, stopPolling]);

  const getStepState = (step: 'pending' | 'processing' | 'completed' | 'failed') => {
    const currentStepIndex = ['pending', 'processing', 'completed', 'failed'].indexOf(status);
    const stepIndex = ['pending', 'processing', 'completed', 'failed'].indexOf(step);
    
    if (status === 'failed') {
      return 'failed';
    }
    
    if (stepIndex < currentStepIndex) {
      return 'completed';
    }
    
    if (stepIndex === currentStepIndex) {
      return 'active';
    }
    
    return 'pending';
  };

  const Step = ({ 
    state, 
    icon, 
    title, 
    description 
  }: { 
    state: 'pending' | 'active' | 'completed' | 'failed';
    icon: React.ReactNode;
    title: string;
    description: string;
  }) => (
    <div className={cn(
      'relative flex items-center gap-4 py-6',
      'transition-all duration-300'
    )}>
      {/* Status indicator */}
      <div className={cn(
        'w-12 h-12 rounded-full flex items-center justify-center',
        'transition-all duration-300',
        state === 'pending' && 'bg-[rgb(229,215,195)] text-[rgb(107,90,74)]',
        state === 'active' && 'bg-[rgb(255,107,74)] text-white ring-4 ring-[rgba(255,107,74,0.2)]',
        state === 'completed' && 'bg-[rgb(16,163,74)] text-white',
        state === 'failed' && 'bg-[rgb(220,38,38)] text-white'
      )}>
        {state === 'active' && isPolling && (
          <ArrowPathIcon className="w-6 h-6 animate-spin" />
        )}
        {state === 'active' && !isPolling && icon}
        {state === 'completed' && (
          <CheckCircleIcon className="w-6 h-6" />
        )}
        {state === 'failed' && (
          <ExclamationCircleIcon className="w-6 h-6" />
        )}
        {state === 'pending' && icon}
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className={cn(
          "font-bold text-lg font-['Fraunces']",
          state === 'active' && 'text-[rgb(255,107,74)]',
          state === 'completed' && 'text-[rgb(16,163,74)]',
          state === 'failed' && 'text-[rgb(220,38,38)]',
          state === 'pending' && 'text-[rgb(107,90,74)]'
        )}>
          {title}
        </h3>
        <p className={cn(
          'text-sm mt-1',
          state === 'completed' || state === 'failed' ? 'text-[rgb(61,35,23)]' : 'text-[rgb(107,90,74)]'
        )}>
          {description}
        </p>
      </div>

      {/* Divider (except last) */}
      <div className="absolute top-14 left-6 w-0.5 h-8 bg-[rgb(229,215,195)] last:hidden" />
    </div>
  );

  // Terminal states
  if (status === 'completed') {
    return (
      <PaymentSuccess
        orderId={orderId}
        paymentId={paymentId}
        amount={amount}
        onTrackOrder={() => {
          window.location.href = `/orders/${orderId}`;
        }}
      />
    );
  }

  if (status === 'failed') {
    return (
      <PaymentFailed
        orderId={orderId}
        paymentId={paymentId}
        onRetry={() => {
          // Reset payment and return to method selection
          usePaymentStore.getState().reset();
          window.location.href = `/checkout/payment?orderId=${orderId}`;
        }}
        onContactSupport={() => {
          window.location.href = '/support';
        }}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <header className="text-center space-y-2">
        <h2 className="text-2xl font-bold font-['Fraunces'] text-[rgb(61,35,23)]">
          Processing Payment
        </h2>
        <p className="text-sm text-[rgb(107,90,74)]">
          Your payment is being processed. Please don't close this page.
        </p>
      </header>

      {/* Stepper */}
      <div className="bg-white rounded-2xl p-8 border-4 border-[rgb(61,35,23)] shadow-2xl">
        <Step
          state={getStepState('pending')}
          icon={<ClockIcon className="w-6 h-6" />}
          title="Payment Started"
          description={`Payment #${paymentId.slice(0, 8)}... initiated`}
        />

        <Step
          state={getStepState('processing')}
          icon={<ClockIcon className="w-6 h-6" />}
          title="Processing Payment"
          description="We're verifying your payment with the bank. This usually takes 10-30 seconds."
        />

        <Step
          state={getStepState('completed')}
          icon={<CheckCircleIcon className="w-6 h-6" />}
          title="Payment Confirmed"
          description="Your payment has been verified and your order is being prepared."
        />
      </div>

      {/* Progress indicator */}
      <div className="text-center py-4">
        {isPolling && (
          <div className="flex items-center justify-center gap-3 text-[rgb(107,90,74)]">
            <ArrowPathIcon className="w-5 h-5 animate-spin text-[rgb(255,107,74)]" />
            <span className="text-sm">Waiting for payment confirmation...</span>
          </div>
        )}
        
        {!isPolling && status === 'pending' && (
          <button
            onClick={() => window.location.reload()}
            className="py-2 px-4 rounded-full font-semibold text-sm bg-[rgb(229,215,195)] text-[rgb(61,35,23)] hover:bg-[rgb(255,107,74)] hover:text-white transition-colors"
          >
            Reload Status
          </button>
        )}
      </div>

      {/* Payment ID displayed for debugging */}
      <div className="text-center text-xs text-[rgb(107,90,74)] mt-6">
        <p>Payment ID: {paymentId}</p>
        <p>Order ID: {orderId}</p>
      </div>
    </div>
  );
}
