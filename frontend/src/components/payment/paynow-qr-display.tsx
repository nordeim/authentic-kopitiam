'use client'

import * as React from 'react';
import { ArrowDownTrayIcon, ShareIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { toast } from '@/components/ui/toast-notification';
import { cn } from '@/lib/utils';

interface PayNowQRDisplayProps {
  orderId: string;
  amount: number;
  paymentId: string;
  qrCodeUrl: string;
  expiresAt: string;
}

export function PayNowQRDisplay({
  orderId,
  amount,
  paymentId,
  qrCodeUrl,
  expiresAt,
}: PayNowQRDisplayProps) {
  const [timeRemaining, setTimeRemaining] = React.useState('');
  const [isExpired, setIsExpired] = React.useState(false);

  // Format amount with GST
  const gst = amount * 0.09;
  const totalWithGST = amount + gst;
  const formattedAmount = `S$${totalWithGST.toFixed(2)}`;

  // Calculate time remaining
  React.useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const expiryTime = new Date(expiresAt).getTime();
      const diff = expiryTime - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeRemaining('Expired');
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    const interval = setInterval(updateTimer, 1000);
    updateTimer();

    return () => clearInterval(interval);
  }, [expiresAt]);

  // Handle QR expiration
  React.useEffect(() => {
    if (isExpired) {
      toast({
        title: 'QR Code Expired',
        description: 'Generating a new QR code...',
        variant: 'warning',
      });

      // Trigger QR refresh
      handleRefreshQR();
    }
  }, [isExpired]);

  const handleRefreshQR = async () => {
    try {
      const response = await fetch(`/api/v1/payments/${orderId}/paynow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to refresh QR code');
      }

      const { qr_code_url, expires_at } = await response.json();
      setIsExpired(false);
      
      if (qr_code_url && expires_at) {
        // Re-render with new QR URL
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to refresh QR:', error);
      toast({
        title: 'QR Refresh Failed',
        description: 'Please refresh the page or try again',
        variant: 'warning',
      });
    }
  };

  const handleDownload = async () => {
    try {
      // Convert image to blob and download
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `paynow-mb-${orderId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'QR Code Saved',
        description: 'File saved as paynow-mb-{orderId}.png',
      });
    } catch (error) {
      console.error('Failed to download QR:', error);
      toast({
        title: 'Download Failed',
        description: 'Please try again',
        variant: 'warning',
      });
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Morning Brew - PayNow Payment',
      text: `Pay ${formattedAmount} for order ${orderId} at Morning Brew Collective`,
      url: qrCodeUrl,
    };

    try {
      if (navigator.share && navigator.canShare({ files: [] })) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareData.text}`);
        toast({
          title: 'Payment Details Copied',
          description: 'Paste into your banking app to pay',
        });
      }
    } catch (error) {
      console.error('Failed to share:', error);
      toast({
        title: 'Share Failed',
        description: 'Copy payment details manually',
        variant: 'warning',
      });
    }
  };

  const handleManualComplete = () => {
    toast({
      title: 'Checking Payment Status',
      description: 'This may take a few moments...',
    });

    // Trigger manual status check
    // This will be handled by parent component using usePaymentStatus
  };

  const progressPercentage = Math.max(0, (parseInt(timeRemaining.split(':')[0] || '0') * 60 + parseInt(timeRemaining.split(':')[1] || '0')) / 900 * 100);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold font-['Fraunces'] text-[rgb(61,35,23)]">
          Scan to Pay
        </h2>
        <p className="text-[rgb(107,90,74)]">Use your banking app to complete payment</p>
      </div>

      {/* QR Display Card */}
      <div className="bg-white rounded-2xl p-8 border-4 border-[rgb(61,35,23)] shadow-2xl">
        {/* Timer Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-[rgb(107,90,74)]">
              QR Code Expires In
            </span>
            <span
              className={cn(
                'flex items-center gap-1 font-bold',
                isExpired ? 'text-[rgb(220,38,38)]' : 'text-[rgb(255,107,74)]'
              )}
            >
              <ClockIcon className="w-4 h-4" />
              {timeRemaining}
            </span>
          </div>
          <div className="h-2 bg-[rgb(229,215,195)] rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-1000',
                isExpired ? 'w-0' : 'w-full',
                'bg-[rgb(255,107,74)]'
              )}
              style={{
                width: `${progressPercentage}%`,
                transition: 'width 1s linear',
              }}
            />
          </div>
        </div>

        {/* QR Code */}
        <div className="flex justify-center mb-6">
          <div
            className={cn(
              'relative bg-white p-8 rounded-xl border-2',
              isExpired ? 'border-[rgb(220,38,38)] border-dashed' : 'border-[rgb(61,35,23)]'
            )}
          >
            <img
              src={qrCodeUrl}
              alt={`PayNow QR Code for order ${orderId}`}
              className="w-64 h-64 md:w-72 md:h-72"
              loading="eager"
            />

            {/* Expired Overlay */}
            {isExpired && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 rounded-xl">
                <ClockIcon className="w-12 h-12 text-[rgb(220,38,26)] mb-2" />
                <span className="text-[rgb(220,38,26)] font-bold">QR Expired</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-[rgb(255,245,230)] rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-[rgb(107,90,74)]">Order ID</div>
              <div className="font-semibold text-[rgb(61,35,23)]">{orderId}</div>
            </div>
            <div>
              <div className="text-sm text-[rgb(107,90,74)]">Amount</div>
              <div className="font-semibold text-[rgb(61,35,23)]">{formattedAmount}</div>
              <div className="text-xs text-[rgb(107,90,74)] mt-1">
                (incl. GST S${gst.toFixed(2)})</div>
            </div>
            <div>
              <div className="text-sm text-[rgb(107,90,74)]">Payment ID</div>
              <div className="font-semibold text-[rgb(61,35,23)]">#{paymentId}</div>
            </div>
            <div>
              <div className="text-sm text-[rgb(107,90,74)]">Bank Reference</div>
              <div className="font-semibold text-[rgb(61,35,23)]">
                MB-KOPITAM-{orderId.slice(-6)}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button onClick={handleDownload} variant="secondary" icon={<ArrowDownTrayIcon />}>
            Save QR
          </Button>

          <Button onClick={handleShare} variant="secondary" icon={<ShareIcon />}>
            Share
          </Button>

          <Button
            onClick={handleManualComplete}
            variant="primary"
            icon={<CheckCircleIcon />}
            disabled={isExpired}
          >
            I've Paid
          </Button>
        </div>

        {/* Helper Text */}
        <div className="mt-4 p-3 bg-[rgb(255,245,230)] rounded-lg text-sm text-[rgb(107,90,74)]">
          <p className="font-semibold mb-1">How to pay:</p>
          <ol className="list-decimal list-inside space-y-1 text-xs">
            <li>Open your banking app (DBS, OCBC, UOB, etc.)</li>
            <li>Scan this QR code</li>
            <li>Verify amount and reference</li>
            <li>Confirm payment</li>
          </ol>
        </div>
      </div>

      {/* Security Note */}
      <div className="text-center p-4 bg-[rgb(255,245,230)] rounded-lg">
        <div className="inline-flex items-center gap-3">
          <ShieldCheckIcon className="w-5 h-5 text-[rgb(255,107,74)]" />
          <span className="text-sm text-[rgb(107,90,74)]">
            🔒 Secured by Stripe PayNow integration
          </span>
        </div>
      </div>
    </div>
  );
}

// Helper components

interface ButtonProps {
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  children: React.ReactNode;
}

function Button({ onClick, icon, variant = 'secondary', disabled, children }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
                  "w-full py-3 px-4 rounded-full font-bold font-['Fraunces'] text-sm",        'transition-all cursor-pointer',
        'flex items-center justify-center gap-2',
        variant === 'primary' &&
          'bg-[rgb(255,107,74)] text-white hover:bg-[rgb(230,90,60)]',
        variant === 'secondary' &&
          'border-2 border-[rgb(229,215,195)] text-[rgb(61,35,23)] hover:border-[rgb(255,107,74)] hover:text-[rgb(255,107,74)]',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {icon && <span className="w-5 h-5">{icon}</span>}
      {children}
    </button>
  );
}

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 20 20"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 5.5C4.5 4.119 5.619 3 7 3h6c1.381 0 2.5 1.119 2.5 2.5v2.5c0 .53-.21 1.039-.585 1.415L12 14.5V17c0 .828-.672 1.5-1.5 1.5h-3C6.672 18.5 6 17.828 6 17v-2.5l-2-3.5A1.5 1.5 0 004.5 8v-2.5z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 10l2 2 4-4" />
    </svg>
  );
}
