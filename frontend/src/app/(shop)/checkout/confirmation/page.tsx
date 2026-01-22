'use client'

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { PaymentSuccess } from '@/components/payment/payment-success';
import { PaymentFailed } from '@/components/payment/payment-failed';
import { OrderSummary } from '@/components/confirmation/order-summary';
import { usePaymentStore } from '@/store/payment-store';
import { useCartStore } from '@/store/cart-store';
import { toast } from '@/components/ui/toast-notification';
import { LoaderIcon } from '@/components/ui/loader-icon';

// Icons
import { ReceiptPercentIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '';
  const paymentId = searchParams.get('paymentId') || '';
  
  const { payment } = usePaymentStore();
  const { items, getTotal } = useCartStore();
  
  const [isLoading, setIsLoading] = React.useState(true);
  const [orderDetails, setOrderDetails] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch order details when component mounts
  React.useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('No order ID provided');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/v1/orders/${orderId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch order: ${response.status}`);
        }

        const order = await response.json();
        setOrderDetails(order);
      } catch (err) {
        console.error('Failed to load order:', err);
        setError('Unable to load order details. Please try refreshing.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // Cleanup cart on success
  React.useEffect(() => {
    if (payment?.status === 'completed') {
      // Clear cart after successful payment
      useCartStore.getState().clearCart();
    }
  }, [payment?.status]);

  // Calculate GST
  const totalAmount = orderDetails?.total ?? (payment?.amount ? payment.amount : getTotal());
  const gst = orderDetails?.gst ?? (totalAmount * 0.09);
  const subtotal = orderDetails?.subtotal ?? (totalAmount - gst);

  const handleTrackOrder = () => {
    window.location.href = `/orders/${orderId}`;
  };

  const handleShareOrder = async () => {
    const shareData = {
      title: 'Morning Brew Order',
      text: `Order ${orderId} from Morning Brew Collective - S${totalAmount.toFixed(2)} paid! 🎉`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast({
          title: 'Order Shared',
          description: 'Your order details have been shared',
        });
      } else {
        await navigator.clipboard.writeText(`${shareData.text}`);
        toast({
          title: 'Order Details Copied',
          description: 'Paste to share your order',
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: 'Share Failed',
        description: 'Unable to share order details',
        variant: 'warning',
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[rgb(255,245,230)] to-[#FFFDF6] py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <LoaderIcon className="w-12 h-12 text-[rgb(255,107,74)]" />
              <p className="text-[rgb(107,90,74)] font-medium">
                Loading order confirmation...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !orderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[rgb(255,245,230)] to-[#FFFDF6] py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[rgb(220,38,38,0.1)] border-4 border-[rgb(220,38,38)] mb-6">
              <svg className="w-12 h-12 text-[rgb(220,38,38)]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold font-['Fraunces'] text-[rgb(61,35,23)] mb-3">
              Unable to Load Order
            </h2>
            <p className="text-lg text-[rgb(107,90,74)] mb-6">
              {error || 'Order details could not be loaded.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="py-3 px-6 rounded-full font-bold font-['Fraunces'] bg-[rgb(255,107,74)] text-white hover:bg-[rgb(230,90,60)] transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/menu'}
                className="py-3 px-6 rounded-full font-bold font-['Fraunces'] border-2 border-[rgb(229,215,195)] text-[rgb(61,35,23)] hover:border-[rgb(255,107,74)] hover:text-[rgb(255,107,74)] transition-colors"
              >
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Determine payment status
  const paymentStatus = payment?.status || orderDetails.payment_status || 'pending';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[rgb(255,245,230)] to-[#FFFDF6] py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Title */}
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold font-['Fraunces'] text-[rgb(61,35,23)] mb-3">
            Order Confirmation
          </h1>
          <p className="text-lg text-[rgb(107,90,74)]">
            Your payment details and order summary
          </p>
        </header>

        {/* Main */}
        <div className="space-y-10">
          {/* Status Section */}
          {paymentStatus === 'completed' && (
            <PaymentSuccess
              orderId={orderId}
              paymentId={paymentId}
              amount={totalAmount}
              gst={gst}
              subtotal={subtotal}
              onTrackOrder={handleTrackOrder}
              onShareOrder={handleShareOrder}
              onOrderAgain={() => window.location.href = '/menu'}
            />
          )}

          {paymentStatus === 'failed' && (
            <PaymentFailed
              orderId={orderId}
              paymentId={paymentId}
              onRetry={() => window.location.href = `/checkout/payment?orderId=${orderId}`}
              onContactSupport={() => window.location.href = '/support'}
            />
          )}

          {paymentStatus === 'pending' && (
            <div className="text-center py-16">
              <h3 className="text-2xl font-bold font-['Fraunces'] text-[rgb(61,35,23)] mb-4">
                Order Pending
              </h3>
              <p className="text-[rgb(107,90,74)]">
                Your order is still being processed. Please check back later or contact support.
              </p>
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-white rounded-2xl p-8 border-4 border-[rgb(61,35,23)] shadow-2xl">
            <OrderSummary
              items={items}
              pickupLocation="Tiong Bahru Plaza Outlet"
              pickupTime="Today, 2:30 PM"
              invoiceNumber={orderId}
              paymentId={paymentId}
              gstAmount={gst}
              totalAmount={totalAmount}
            />
          </div>

          {/* Pickup Information */}
          <div className="bg-[rgb(255,190,79,0.1)] rounded-2xl p-8 border-2 border-[rgb(255,190,79)]">
            <div className="flex items-start gap-6">
              <MapPinIcon className="w-10 h-10 text-[rgb(255,190,79)]" />
              <div>
                <h3 className="font-bold text-xl font-['Fraunces'] text-[rgb(61,35,23)] mb-2">
                  Pickup Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-[rgb(61,35,23)] mb-1">Location</h4>
                    <p className="text-[rgb(107,90,74)] mb-3">
                      Tiong Bahru Plaza Outlet
                      <br />
                      302 Tiong Bahru Plaza, #02-01
                      <br />
                      Singapore 168732
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[rgb(61,35,23)] mb-1">Pickup Time</h4>
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-5 h-5 text-[rgb(255,107,74)]" />
                      <div>
                        <p className="font-semibold text-[rgb(61,35,23)]">
                          Today, 2:30 PM
                        </p>
                        <p className="text-xs text-[rgb(107,90,74)]">
                          Ready in approximately 15 minutes
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={handleTrackOrder}
              className="py-3 px-6 rounded-full font-bold font-['Fraunces'] bg-[rgb(255,107,74)] text-white hover:bg-[rgb(230,90,60)] transition-colors flex items-center gap-2"
            >
              <ReceiptPercentIcon className="w-5 h-5" />
              View Receipt
            </button>

            {paymentStatus === 'completed' && (
              <button
                onClick={() => window.location.href = '/menu'}
                className="py-3 px-6 rounded-full font-bold font-['Fraunces'] bg-[rgb(255,190,79)] text-white hover:bg-[rgb(230,170,60)] transition-colors flex items-center gap-2"
              >
                <ReceiptPercentIcon className="w-5 h-5" />
                Order Again
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[rgb(255,245,230)] to-[#FFFDF6] py-12 flex items-center justify-center">
        <LoaderIcon className="w-12 h-12 text-[rgb(255,107,74)] animate-spin" />
      </div>
    }>
      <OrderConfirmationContent />
    </React.Suspense>
  );
}
