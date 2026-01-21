'use client'

import * as React from 'react';
import { ExclamationCircleIcon, ArrowUturnLeftIcon, ArrowPathIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export interface PaymentFailedProps {
  orderId: string;
  paymentId: string;
  error?: string;
  onRetry?: () => void;
  onContactSupport?: () => void;
}

export function PaymentFailed({
  orderId,
  paymentId,
  error = 'Payment was declined by your bank',
  onRetry,
  onContactSupport,
}: PaymentFailedProps) {
  const commonErrors: Record<string, string> = {
    'card_declined': 'Your card was declined. Please try another payment method or contact your bank.',
    'insufficient_funds': 'Insufficient funds in your account.',
    'expired_card': 'Your card has expired. Please use a different card.',
    'incorrect_cvc': 'The CVC code is incorrect.',
    'processing_error': 'An error occurred while processing your payment. Please try again.',
    'payment_timeout': 'Payment confirmation timed out. Please retry.',
    'authentication_required': 'Your bank requires additional authentication. Please try again or use a different card.',
  };

  const displayError = commonErrors[error] || error;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Error Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[rgb(220,38,38)] shadow-2xl">
          <ExclamationCircleIcon className="w-16 h-16 text-white animate-pulse" />
        </div>
        <h2 className="text-4xl font-bold font-['Fraunces'] text-[rgb(61,35,23)]">
          Payment Failed
        </h2>
        <p className="text-lg text-[rgb(107,90,74)]">
          We're sorry, but we couldn't process your payment.
        </p>
      </div>

      {/* Error Details Card */}
      <div className="bg-white rounded-2xl p-8 border-4 border-[rgb(61,35,23)] shadow-2xl">
        <div className="flex items-start gap-6 mb-6">
          <div className="w-16 h-16 rounded-full bg-[rgb(220,38,38,0.1)] flex items-center justify-center">
            <ExclamationCircleIcon className="w-8 h-8 text-[rgb(220,38,38)]" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-xl text-[rgb(61,35,23)] mb-2">
              Unable to Process Payment
            </h3>
            <div className="bg-[rgb(220,38,38,0.1)] rounded-lg p-4 mb-4">
              <p className="text-[rgb(61,35,23)]">
                <strong>Error:</strong> {displayError}
              </p>
            </div>
            <p className="text-sm text-[rgb(107,90,74)]">
              Your payment method was not charged. You can try again with a different payment method.
            </p>
          </div>
        </div>

        {/* Common Solutions */}
        <div className="bg-[rgb(255,245,230)] rounded-lg p-6 mb-6">
          <h4 className="font-bold text-[rgb(61,35,23)] mb-4">What you can do:</h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-[rgb(255,107,74)] mt-1" />
              <p className="text-[rgb(61,35,23)]">Use a different credit/debit card</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-[rgb(255,107,74)] mt-1" />
              <p className="text-[rgb(61,35,23)]">Try PayNow (QR code payment)</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-[rgb(255,107,74)] mt-1" />
              <p className="text-[rgb(61,35,23)]">Contact your bank to check your card status</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-[rgb(255,107,74)] mt-1" />
              <p className="text-[rgb(61,35,23)]">Ensure you have sufficient funds</p>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-[rgb(229,215,195,0.5)] rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-[rgb(107,90,74)]">Order ID</div>
              <div className="font-semibold text-[rgb(61,35,23)]">{orderId}</div>
            </div>
            <div>
              <div className="text-[rgb(107,90,74)]">Payment Reference</div>
              <div className="font-semibold text-[rgb(61,35,23)]">#{paymentId}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={onRetry}
          className="w-full py-3 px-4 rounded-full font-bold font-['Fraunces'] text-sm bg-[rgb(255,107,74)] text-white hover:bg-[rgb(230,90,60)] transition-colors flex items-center justify-center gap-2"
        >
          <ArrowPathIcon className="w-5 h-5" />
          Try Again
        </button>

        <button
          onClick={() => window.history.back()}
          className="w-full py-3 px-4 rounded-full font-bold font-['Fraunces'] text-sm border-2 border-[rgb(229,215,195)] text-[rgb(61,35,23)] hover:border-[rgb(255,107,74)] hover:text-[rgb(255,107,74)] transition-colors flex items-center justify-center gap-2"
        >
          <ArrowUturnLeftIcon className="w-5 h-5" />
          Back
        </button>

        <button
          onClick={onContactSupport}
          className="w-full py-3 px-4 rounded-full font-bold font-['Fraunces'] text-sm bg-[rgb(107,90,74)] text-white hover:bg-[rgb(61,35,23)] transition-colors flex items-center justify-center gap-2"
        >
          <EnvelopeIcon className="w-5 h-5" />
          Contact Support
        </button>
      </div>

      {/* Support note */}
      <div className="text-center p-6 bg-[rgb(255,245,230)] rounded-lg">
        <div className="flex items-center justify-center gap-3">
          <EnvelopeIcon className="w-6 h-6 text-[rgb(107,90,74)]" />
          <div>
            <p className="font-semibold text-[rgb(61,35,23)]">
              Need Help?
            </p>
            <p className="text-sm text-[rgb(107,90,74)]">
              Our support team is available at support@morningbrew.com or call +65 6876 5831
            </p>
          </div>
        </div>
      </div>

      {/* Test mode indicator (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-center p-4 bg-yellow-100 border-2 border-yellow-400 rounded-lg">
          <p className="text-sm text-yellow-800 font-semibold">
            🧪 Test Mode - This is a simulated failure page
          </p>
        </div>
      )}
    </div>
  );
}
