'use client'

import * as React from 'react';
import { CheckCircleIcon, ShareIcon, MapPinIcon, ClockIcon, ReceiptIcon } from '@heroicons/react/24/outline';
import { useCartStore } from '@/store/cart-store';
import { cn } from '@/lib/utils';

export interface PaymentSuccessProps {
  orderId: string;
  paymentId: string;
  amount: number;
  onTrackOrder?: () => void;
  onShareOrder?: () => void;
  onOrderAgain?: () => void;
}

export function PaymentSuccess({
  orderId,
  paymentId,
  amount,
  onTrackOrder,
  onShareOrder,
  onOrderAgain,
}: PaymentSuccessProps) {
  const { clearCart } = useCartStore();

  const gst = amount * 0.09;
  const subtotal = amount - gst;

  const handleTrackOrder = () => {
    if (onTrackOrder) {
      onTrackOrder();
    } else {
      window.location.href = `/orders/${orderId}`;
    }
  };

  const handleShareOrder = async () => {
    const shareData = {
      title: 'Morning Brew Order',
      text: `Order ${orderId} from Morning Brew Collective - ${amount.toFixed(2)} paid! 🎉`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        if (onShareOrder) onShareOrder();
      } else {
        await navigator.clipboard.writeText(`${shareData.text}`);
        if (onShareOrder) onShareOrder();
      }
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const handleOrderAgain = () => {
    clearCart();
    if (onOrderAgain) {
      onOrderAgain();
    } else {
      window.location.href = '/menu';
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Success Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[rgb(16,163,74)] shadow-2xl">
          <CheckCircleIcon className="w-16 h-16 text-white animate-bounce" />
        </div>
        <h2 className="text-4xl font-bold font-['Fraunces'] text-[rgb(61,35,23)]">
          Payment Successful! 🎉
        </h2>
        <p className="text-lg text-[rgb(107,90,74)]">
          Thank you for your order. Your payment has been confirmed.
        </p>
      </div>

      {/* Order Details Card */}
      <div className="bg-white rounded-2xl p-8 border-4 border-[rgb(61,35,23)] shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold font-['Fraunces'] text-[rgb(61,35,23)]">
              Order #{orderId}
            </h3>
            <p className="text-sm text-[rgb(107,90,74)] mt-1">
              Payment confirmed • Invoice #{paymentId}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold font-['Fraunces'] text-[rgb(255,107,74)]">
              S${amount.toFixed(2)}
            </div>
            <p className="text-xs text-[rgb(107,90,74)]">
              incl. GST S${gst.toFixed(2)}
            </p>
          </div>
        </div>

        {/* GST Breakdown */}
        <div className="bg-[rgb(255,245,230)] rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
            <div>
              <div className="text-[rgb(107,90,74)]">Subtotal</div>
              <div className="font-semibold text-[rgb(61,35,23)]">
                S${subtotal.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-[rgb(107,90,74)]">GST (9%)</div>
              <div className="font-semibold text-[rgb(61,35,23)]">
                S${gst.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-[rgb(107,90,74)]">Total Paid</div>
              <div className="font-bold text-[rgb(61,35,23)]">
                S${amount.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Pickup Details */}
        <div className="bg-[rgb(255,190,79,0.1)] rounded-lg p-4 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[rgb(255,190,79)] flex items-center justify-center">
              <MapPinIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-[rgb(61,35,23)] mb-2">Pickup Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-[rgb(107,90,74)]">Location</div>
                  <div className="font-semibold text-[rgb(61,35,23)]">
                    Tiong Bahru Plaza Outlet
                  </div>
                  <div className="text-xs text-[rgb(107,90,74)]">
                    302 Tiong Bahru Plaza, #02-01
                  </div>
                </div>
                <div>
                  <div className="text-[rgb(107,90,74)]">Pickup Time</div>
                  <div className="font-semibold text-[rgb(61,35,23)]">
                    Today, 2:30 PM
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[rgb(107,90,74)]">
                    <ClockIcon className="w-3 h-3" />
                    Ready in ~15 minutes
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleTrackOrder}
            className="w-full py-3 px-4 rounded-full font-bold font-['Fraunces'] text-sm bg-[rgb(255,107,74)] text-white hover:bg-[rgb(230,90,60)] transition-colors flex items-center justify-center gap-2"
          >
            <MapPinIcon className="w-5 h-5" />
            Track Order
          </button>

          <button
            onClick={handleShareOrder}
            className="w-full py-3 px-4 rounded-full font-bold font-['Fraunces'] text-sm border-2 border-[rgb(229,215,195)] text-[rgb(61,35,23)] hover:border-[rgb(255,107,74)] hover:text-[rgb(255,107,74)] transition-colors flex items-center justify-center gap-2"
          >
            <ShareIcon className="w-5 h-5" />
            Share Order
          </button>

          <button
            onClick={handleOrderAgain}
            className="w-full py-3 px-4 rounded-full font-bold font-['Fraunces'] text-sm bg-[rgb(255,190,79)] text-white hover:bg-[rgb(230,170,60)] transition-colors flex items-center justify-center gap-2"
          >
            <ReceiptIcon className="w-5 h-5" />
            Order Again
          </button>
        </div>
      </div>

      {/* Receipt Note */}
      <div className="text-center p-6 bg-[rgb(255,245,230)] rounded-lg">
        <div className="flex items-center justify-center gap-3">
          <ReceiptIcon className="w-6 h-6 text-[rgb(107,90,74)]" />
          <div>
            <p className="font-semibold text-[rgb(61,35,23)]">
              Email Receipt Sent
            </p>
            <p className="text-sm text-[rgb(107,90,74)]">
              Check your email for the detailed receipt and pickup instructions
            </p>
          </div>
        </div>
      </div>

      {/* Test mode indicator (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-center p-4 bg-yellow-100 border-2 border-yellow-400 rounded-lg">
          <p className="text-sm text-yellow-800 font-semibold">
            🧪 Test Mode - This is a simulated success page
          </p>
        </div>
      )}
    </div>
  );
}
