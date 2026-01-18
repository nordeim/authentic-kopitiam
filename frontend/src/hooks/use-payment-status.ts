import { useEffect, useRef } from 'react';
import { toast } from '@/components/ui/toast-notification';
import { usePaymentStore } from '@/store/payment-store';

interface UsePaymentStatusOptions {
  paymentId: string;
  onComplete?: () => void;
  onFailed?: (error: string) => void;
  pollingInterval?: number; // milliseconds (default: 3000ms)
  maxRetries?: number; // default: 30 retries (~1.5 minutes)
}

export function usePaymentStatus({
  paymentId,
  onComplete,
  onFailed,
  pollingInterval = 3000,
  maxRetries = 30,
}: UsePaymentStatusOptions) {
  const { setStatus, setPolling, setError } = usePaymentStore();
  
  // Use refs to avoid stale closures
  const retriesRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    retriesRef.current = 0;
    setPolling(false);
  };
  
  const startPolling = async () => {
    if (intervalRef.current) return; // Already polling
    
    setPolling(true);
    setStatus('processing');
    retriesRef.current = 0;
    
    intervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/v1/payments/${paymentId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch payment status: ${response.status}`);
        }
        
        const payment = await response.json();
        
        // Update status in store
        setStatus(payment.status);
        
        // Handle terminal states
        if (payment.status === 'completed') {
          stopPolling();
          setError(null);
          onComplete?.();
          return;
        }
        
        if (payment.status === 'failed') {
          stopPolling();
          const errorMessage = payment.failure_reason || 'Payment failed';
          setError(errorMessage);
          onFailed?.(errorMessage);
          toast({
            title: 'Payment Failed',
            description: errorMessage,
            variant: 'destructive',
          });
          return;
        }
        
        // Increment retry counter
        retriesRef.current += 1;
        
        // Max retries reached
        if (retriesRef.current >= maxRetries) {
          stopPolling();
          setStatus('pending'); // Reset to allow manual retry
          setError('Payment confirmation timeout. Please check your email for confirmation.');
          toast({
            title: 'Processing Timeout',
            description: 'Payment is still being processed. You will receive an email confirmation.'
          });
          return;
        }
        
      } catch (error) {
        // Network errors are common during polling, log but don't stop
        if (error instanceof Error && error.message.includes('Failed to fetch')) {
          setError('Network error. Retrying...');
        } else {
          stopPolling();
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          setError(errorMessage);
          toast({
            title: 'Payment Error',
            description: errorMessage,
            variant: 'destructive',
          });
        }
      }
    }, pollingInterval);
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);
  
  return {
    startPolling,
    stopPolling,
    isPolling: intervalRef.current !== null,
    retryCount: retriesRef.current,
  };
}

// Helper: Resume payment after page reload
export async function resumePayment(orderId: string, customerEmail: string) {
  try {
    // Look for pending payment by order
    const response = await fetch(`/api/v1/orders/${orderId}/payments`, {
      headers: {
        'X-Customer-Email': customerEmail,
      },
    });
    
    if (!response.ok) return null;
    
    const payments = await response.json();
    const pendingPayment = payments.find((p: Payment) => 
      p.status === 'pending' || p.status === 'processing'
    );
    
    return pendingPayment;
  } catch (error) {
    console.error('Failed to resume payment:', error);
    return null;
  }
}

// Helper: Check if payment exists in localStorage
export function hasStoredPayment(): boolean {
  try {
    const stored = localStorage.getItem('payment-storage');
    if (!stored) return false;
    
    const parsed = JSON.parse(stored);
    return !!parsed.state?.payment?.id;
  } catch {
    return false;
  }
}
