'use client';

import * as React from 'react';
import { QrCodeIcon } from '@heroicons/react/24/outline';
import { CreditCardIcon } from '@heroicons/react/24/solid';
import { StripeIcon } from '@/components/icons/stripe-icon';
import { PaymentMethodCard } from './payment-method-card';
import { usePaymentState } from '@/store/payment-store';
import { toast } from '@/components/ui/toast-notification';

interface PaymentMethodSelectorProps {
  orderId: string;
  amount: number;
  onContinue: (method: 'paynow' | 'stripe') => void;
  onCancel: () => void;
}

export function PaymentMethodSelector({
  orderId,
  amount,
  onContinue,
  onCancel,
}: PaymentMethodSelectorProps) {
  const { selectedMethod, selectPaymentMethod, setError } = usePaymentState();
  const [isCheckingAvailability, setIsCheckingAvailability] = React.useState(true);
  const [availableMethods, setAvailableMethods] = React.useState<{
    paynow: boolean;
    stripe: boolean;
  }>({ paynow: true, stripe: true });

  // Check payment method availability on mount
  React.useEffect(() => {
    const checkAvailability = async () => {
      try {
        const [paynowRes, stripeRes] = await Promise.all([
          fetch('/api/v1/payments/methods/paynow/available').then(r => r.ok),
          fetch('/api/v1/payments/methods/stripe/available').then(r => r.ok),
        ]);

        setAvailableMethods({
          paynow: paynowRes,
          stripe: stripeRes,
        });

        // Auto-select first available method
        if (paynowRes) {
          selectPaymentMethod('paynow');
        } else if (stripeRes) {
          selectPaymentMethod('stripe_card');
        } else {
          setError('No payment methods are currently available');
          toast({
            title: 'Payment Error',
            description: 'Please try again later or contact support',
            variant: 'warning',
          });
        }
      } catch (error) {
        console.error('Failed to check payment availability:', error);
        setAvailableMethods({ paynow: true, stripe: true }); // Assume both available
      } finally {
        setIsCheckingAvailability(false);
      }
    };

    checkAvailability();
  }, [orderId, selectPaymentMethod, setError]);

  const handleSelectPayNow = () => {
    selectPaymentMethod('paynow');
    toast({
      title: 'PayNow Selected',
      description: 'You will see a QR code to scan',
    });
  };

  const handleSelectCard = () => {
    selectPaymentMethod('stripe_card');
    toast({
      title: 'Credit Card Selected',
      description: 'Secure payment via Stripe',
    });
  };

  const handleContinue = () => {
    if (!selectedMethod) {
      toast({
        title: 'Select Payment Method',
        description: 'Please choose PayNow or Credit Card',
        variant: 'warning',
      });
      return;
    }

    // Map store type to component prop type
    const method = selectedMethod === 'stripe_card' ? 'stripe' : 'paynow';
    onContinue(method);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <header className="text-center space-y-2">
        <h2 className="text-2xl font-bold font-['Fraunces'] text-[rgb(61,35,23)]">
          Choose Payment Method
        </h2>
        <p className="text-[rgb(107,90,74)] text-sm">Select how you'd like to pay</p>
      </header>

      {isCheckingAvailability && (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 rounded-full border-4 border-[rgb(229,215,195)] border-t-[rgb(255,107,74)] animate-spin" />
          <span className="ml-3 text-[rgb(107,90,74)]">Checking payment methods...</span>
        </div>
      )}

      <div className="space-y-4">
        <PaymentMethodCard
          id="paynow"
          title="PayNow QR Code"
          description="Scan with your banking app (DBS/PayLah!/OCBC/UOB)"
          icon={<QrCodeIcon className="w-6 h-6" />}
          secondaryIcon={
            <StripeIcon className="w-8 h-8" />
          }
          selected={selectedMethod === 'paynow'}
          onSelect={handleSelectPayNow}
          recommended={true}
          disabled={!availableMethods.paynow}
        />

        <PaymentMethodCard
          id="stripe"
          title="Credit / Debit Card"
          description="Visa, Mastercard, Amex via Stripe"
          icon={<CreditCardIcon className="w-6 h-6" />}
          secondaryIcon={
            <StripeIcon className="w-8 h-8" />
          }
          selected={selectedMethod === 'stripe_card'}
          onSelect={handleSelectCard}
          disabled={!availableMethods.stripe}
        />
      </div>

      {/* Amount Display */}
      <div className="bg-white rounded-lg border-2 border-[rgb(229,215,195)] p-4">
        <div className="text-sm text-[rgb(107,90,74)] mb-1">Amount to pay</div>
        <div className="text-2xl font-bold font-['Fraunces'] text-[rgb(61,35,23)]">
          S${amount.toFixed(2)}
        </div>
        <div className="text-xs text-[rgb(107,90,74)]">
          Inclusive of 9% GST (S${(amount * 0.09).toFixed(2)})
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          onClick={handleContinue}
          disabled={!selectedMethod || isCheckingAvailability}
          className={cn(
            "flex-1 py-3 px-6 rounded-full font-bold font-['Fraunces']",
            "bg-[rgb(229,215,195)] text-[rgb(163,137,109)] hover:bg-[rgb(255,107,74)] hover:text-white transition-all",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          Continue to Payment
        </button>

        <button
          onClick={onCancel}
          className="py-3 px-6 rounded-full font-bold font-['Fraunces'] border-2 border-[rgb(229,215,195)] text-[rgb(107,90,74)] hover:border-[rgb(255,107,74)] hover:text-[rgb(255,107,74)] transition-colors"
        >
          Back to Cart
        </button>
      </div>

      {/* Security Badge */}
      <div className="text-center py-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgb(255,245,230)] text-[rgb(107,90,74)] text-sm">
          <ShieldCheckIcon className="w-4 h-4" />
          🔒 Secured by Stripe & Singapore Banking
        </div>
      </div>
    </div>
  );
}

// Helper icon
function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 1.875c-.98 0-1.934.27-2.78.756A5.992 5.992 0 004.375 4.5c-.218.875-.395 1.775-.395 2.7V10c0 1.53.32 2.955.91 4.27a6.57 6.57 0 002.33 2.33A6.57 6.57 0 0010 18.09a6.57 6.57 0 003.185-.88 6.57 6.57 0 002.33-2.33 6.57 6.57 0 00.91-4.27V7.2c0-.925-.177-1.825-.395-2.7a5.992 5.992 0 00-2.845-1.869A3.597 3.597 0 0010 1.875zm3.45 5.695a.75.75 0 10-1.06 1.06L8.47 11.06 7.44 10.03a.75.75 0 10-1.06 1.06l1.595 1.595a.75.75 0 001.06 0l4.875-4.875z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// CSS utility
import { cn } from '@/lib/utils';
