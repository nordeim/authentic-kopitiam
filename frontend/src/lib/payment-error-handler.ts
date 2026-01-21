/**
 * Payment Error Handler
 * Centralized error handling for payment flows with user-friendly messages
 * Implements retry logic and recovery strategies
 */

import { toast } from '@/components/ui/toast-notification';

export interface PaymentError {
  code: string;
  message: string;
  rawError?: any;
  recoverable: boolean;
  retryAction?: () => void;
}

export class PaymentErrorHandler {
  private static instance: PaymentErrorHandler;
  private retryAttempts = 0;
  private maxRetryAttempts = 3;

  static getInstance(): PaymentErrorHandler {
    if (!PaymentErrorHandler.instance) {
      PaymentErrorHandler.instance = new PaymentErrorHandler();
    }
    return PaymentErrorHandler.instance;
  }

  // Handle Stripe errors
  handleStripeError(error: any): PaymentError {
    let paymentError: PaymentError;

    if (error.type === 'card_error' || error.type === 'card_declined') {
      paymentError = {
        code: 'card_declined',
        message: this.getCardDeclinedMessage(error.code),
        rawError: error,
        recoverable: true,
        retryAction: this.createRetryAction('stripe'),
      };
    } else if (error.type === 'rate_limit_error') {
      paymentError = {
        code: 'rate_limit',
        message: 'Too many requests. Please wait a moment and try again.',
        rawError: error,
        recoverable: true,
        retryAction: () => setTimeout(this.createRetryAction('stripe'), 2000),
      };
    } else if (error.type === 'invalid_request_error') {
      paymentError = {
        code: 'invalid_request',
        message: 'Invalid payment details. Please check and try again.',
        rawError: error,
        recoverable: true,
        retryAction: this.createRetryAction('payment'),
      };
    } else {
      paymentError = {
        code: 'stripe_error',
        message: 'An error occurred with our payment processor. Please try again.',
        rawError: error,
        recoverable: true,
        retryAction: this.createRetryAction('payment'),
      };
    }

    this.notifyUser(paymentError);
    return paymentError;
  }

  // Handle PayNow errors
  handlePayNowError(error: any): PaymentError {
    let paymentError: PaymentError;

    if (error.code === 'QR_GENERATION_FAILED') {
      paymentError = {
        code: 'qr_generation_failed',
        message: 'Failed to generate PayNow QR code. Please refresh the page.',
        rawError: error,
        recoverable: true,
        retryAction: () => window.location.reload(),
      };
    } else if (error.code === 'QR_EXPIRED') {
      paymentError = {
        code: 'qr_expired',
        message: 'Your QR code has expired. A new one has been generated.',
        rawError: error,
        recoverable: true,
        retryAction: this.createRetryAction('paynow'),
      };
    } else {
      paymentError = {
        code: 'paynow_error',
        message: 'An error occurred with PayNow. Please try again or use card payment.',
        rawError: error,
        recoverable: true,
        retryAction: this.createRetryAction('paynow'),
      };
    }

    this.notifyUser(paymentError);
    return paymentError;
  }

  // Handle network errors
  handleNetworkError(error: any, context: string): PaymentError {
    const paymentError: PaymentError = {
      code: 'network_error',
      message: 'Network connection lost. Please check your internet and try again.',
      rawError: error,
      recoverable: true,
      retryAction: () => {
        toast({
          title: 'Retrying...',
          description: `Reconnecting to ${context}...`,
        });
        setTimeout(this.createRetryAction(context), 1000);
      },
    };

    this.notifyUser(paymentError);
    return paymentError;
  }

  // Handle session expiration
  handleSessionExpired(): PaymentError {
    const paymentError: PaymentError = {
      code: 'session_expired',
      message: 'Your payment session has expired. Please create a new order.',
      rawError: null,
      recoverable: false,
      retryAction: () => {
        window.location.href = '/menu';
      },
    };

    this.notifyUser(paymentError);
    return paymentError;
  }

  // Handle duplicate payment attempts
  handleDuplicatePayment(): PaymentError {
    const paymentError: PaymentError = {
      code: 'duplicate_payment',
      message: 'This payment was already processed or is being processed.',
      rawError: null,
      recoverable: false,
      retryAction: () => {
        window.location.href = '/orders';
      },
    };

    this.notifyUser(paymentError);
    return paymentError;
  }

  // Handle payment timeout
  handleTimeout(context: string): PaymentError {
    const paymentError: PaymentError = {
      code: 'payment_timeout',
      message: 'Payment confirmation is taking longer than expected. Please check your email for confirmation.',
      rawError: null,
      recoverable: true,
      retryAction: () => {
        toast({
          title: 'Checking Status...',
          description: `Verifying ${context} payment status...`,
        });
      },
    };

    this.notifyUser(paymentError);
    return paymentError;
  }

  // User-friendly card declined messages
  private getCardDeclinedMessage(declineCode?: string): string {
    const messages: Record<string, string> = {
      'card_declined': 'Your card was declined. Please try another card or contact your bank.',
      'expired_card': 'Your card has expired. Please use a different card.',
      'insufficient_funds': 'Insufficient funds. Please use a different card or add funds.',
      'lost_card': 'This card was reported lost. Please use a different card.',
      'stolen_card': 'This card was reported stolen. Please use a different card.',
      'processing_error': 'An error occurred while processing your card. Please try again.',
      'incorrect_cvc': 'The CVC code is incorrect.',
      'pickup_card': 'Your card cannot be used for this transaction.',
    };

    return (declineCode && messages[declineCode]) || messages['card_declined'] || 'Your card was declined.';
  }

  // Create retry action based on context
  private createRetryAction(context: string): () => void {
    return () => {
      this.retryAttempts++;
      if (this.retryAttempts >= this.maxRetryAttempts) {
        toast({
          title: 'Max Retries Reached',
          description: 'Please contact support for assistance.',
          variant: 'warning',
        });
        return;
      }

      toast({
        title: 'Retrying...',
        description: `Retrying ${context} (Attempt ${this.retryAttempts}/${this.maxRetryAttempts})`,
      });
    };
  }

  // Notify user via toast
  private notifyUser(error: PaymentError) {
    toast({
      title: 'Payment Error',
      description: error.message,
      variant: 'warning',
    });
  }

  // Reset retry counter
  resetRetries(): void {
    this.retryAttempts = 0;
  }

  // Get retry count
  getRetryCount(): number {
    return this.retryAttempts;
  }

  // Check if should allow retry
  canRetry(): boolean {
    return this.retryAttempts < this.maxRetryAttempts;
  }
}

// Singleton export
export const paymentErrorHandler = PaymentErrorHandler.getInstance();
