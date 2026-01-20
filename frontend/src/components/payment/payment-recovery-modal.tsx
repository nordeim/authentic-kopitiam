'use client'

import * as React from 'react';
import { RetroDialog, RetroDialogContent, RetroDialogHeader, RetroDialogTitle, RetroDialogDescription } from '@/components/ui/retro-dialog';
import { RetroButton } from '@/components/ui/retro-button';
import { usePaymentStore } from '@/store/payment-store';
import { toast } from '@/components/ui/toast-notification';
import { cn } from '@/lib/utils';

// Icons
import { ArrowUturnLeftIcon, DocumentDuplicateIcon, CreditCardIcon, QrCodeIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

interface PaymentRecoveryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  hasStoredPayment?: boolean;
}

export function PaymentRecoveryModal({
  open,
  onOpenChange,
  orderId,
  hasStoredPayment = false,
}: PaymentRecoveryModalProps) {
  const { payment } = usePaymentStore();
  
  const handleResumePayment = async () => {
    if (!payment) {
      toast({
        title: 'No Payment Found',
        description: 'Unable to resume previous payment',
        variant: 'destructive',
      });
      onOpenChange(false);
      return;
    }

    toast({
      title: 'Resuming Payment',
      description: `Continuing payment #${payment.id.slice(0, 8)}...`,
    });

    // Redirect to payment page
    window.location.href = `/checkout/payment?orderId=${orderId}&resume=true`;
    onOpenChange(false);
  };

  const handleStartNewPayment = async () => {
    toast({
      title: 'Starting New Payment',
      description: 'Creating fresh payment session...',
    });

    // Clear old payment state
    usePaymentStore.getState().reset();
    
    // Redirect to cart
    window.location.href = '/cart';
    onOpenChange(false);
  };

  const handleContactSupport = () => {
    window.location.href = '/support';
    onOpenChange(false);
  };

  return (
    <RetroDialog open={open} onOpenChange={onOpenChange}>
      <RetroDialogContent className="max-w-2xl bg-white border-4 border-[rgb(61,35,23)] rounded-2xl p-8">
        <RetroDialogHeader>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-[rgb(255,190,79)] flex items-center justify-center">
              <DocumentDuplicateIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <RetroDialogTitle className="text-3xl font-bold font-['Fraunces'] text-[rgb(61,35,23)]">
                Continue Previous Payment?
              </RetroDialogTitle>
              <RetroDialogDescription className="text-[rgb(107,90,74)] mt-2">
                We found an incomplete payment for this order. You can resume it or start fresh.
              </RetroDialogDescription>
            </div>
          </div>
        </RetroDialogHeader>

        <div className="space-y-6">
          {/* Previous Payment Details */}
          {payment && (
            <div className="bg-[rgb(255,245,230)] rounded-lg p-4 border border-[rgb(229,215,195)]">
              <h4 className="font-semibold text-[rgb(61,35,23)] mb-3">Previous Payment Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-[rgb(107,90,74)]">Payment ID</div>
                  <div className="font-medium text-[rgb(61,35,23)]">
                    #{payment.id}
                  </div>
                </div>
                <div>
                  <div className="text-[rgb(107,90,74)]">Method</div>
                  <div className="font-medium text-[rgb(61,35,23)]">
                    {payment.payment_method === 'paynow' ? 'PayNow' : 'Credit Card'}
                  </div>
                </div>
                <div>
                  <div className="text-[rgb(107,90,74)]">Amount</div>
                  <div className="font-medium text-[rgb(61,35,23)]">
                    S${payment.amount.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-[rgb(107,90,74)]">Created</div>
                  <div className="font-medium text-[rgb(61,35,23)]">
                    {new Date(payment.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Options */}
          <div className="space-y-3">
            <RetroButton
              onClick={handleResumePayment}
              variant="primary"
              size="lg"
              className="w-full justify-start"
            >
              <ArrowUturnLeftIcon className="w-5 h-5 mr-2" />
              Resume Previous Payment
              <span className="ml-auto text-xs opacity-75">
                (Recommended)
              </span>
            </RetroButton>

            <RetroButton
              onClick={handleStartNewPayment}
              variant="secondary"
              size="lg"
              className="w-full justify-start"
            >
              <CreditCardIcon className="w-5 h-5 mr-2" />
              Start New Payment Session
            </RetroButton>

            {payment?.payment_method === 'paynow' && (
              <RetroButton
                onClick={() => {
                  // Regenerate QR
                  window.location.href = `/checkout/payment?orderId=${orderId}&method=paynow&regenerate=true`;
                }}
                variant="secondary"
                size="lg"
                className="w-full justify-start"
              >
                <QrCodeIcon className="w-5 h-5 mr-2" />
                Generate New PayNow QR
              </RetroButton>
            )}
          </div>

          {/* Warning */}
          <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Important:</strong> If you start a new payment, your previous payment session will be cancelled. You may need to re-add items to your cart.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between mt-8 pt-4 border-t border-[rgb(229,215,195)]">
          <RetroButton
            variant="secondary"
            className="flex items-center gap-2"
            onClick={handleContactSupport}
          >
            <EnvelopeIcon className="w-4 h-4" />
            Contact Support
          </RetroButton>

          <div className="flex gap-2">
            <RetroButton
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </RetroButton>
          </div>
        </div>
      </RetroDialogContent>
    </RetroDialog>
  );
}

// Helper: Check if recovery modal should be shown
export function shouldShowRecoveryModal(orderId: string): boolean {
  if (!orderId) return false;
  
  const paymentStorage = localStorage.getItem('payment-storage');
  if (!paymentStorage) return false;
  
  try {
    const parsed = JSON.parse(paymentStorage);
    const payment = parsed.state?.payment;
    
    return payment && 
           payment.order_id === orderId && 
           ['pending', 'processing'].includes(payment.status);
  } catch {
    return false;
  }
}