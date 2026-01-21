/**
 * Payment API Client
 * Handles all payment-related API calls to the backend
 */

import type { Payment } from '@/store/payment-store';

export interface CreatePaymentResponse {
  payment_id: string;
  client_secret?: string;
  qr_code_url?: string;
  expires_at?: string;
}

export class PaymentApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || '') {
    this.baseUrl = baseUrl;
  }

  // Create PayNow payment
  async createPayNowPayment(orderId: string): Promise<CreatePaymentResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/payments/${orderId}/paynow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Idempotency-Key': this.generateIdempotencyKey(orderId, 'paynow'),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create PayNow payment');
    }

    return response.json();
  }

  // Create Stripe payment intent
  async createStripePayment(orderId: string, amount: number): Promise<CreatePaymentResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/payments/${orderId}/stripe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Idempotency-Key': this.generateIdempotencyKey(orderId, 'stripe'),
      },
      body: JSON.stringify({ amount }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create Stripe payment');
    }

    return response.json();
  }

  // Get payment status
  async getPaymentStatus(paymentId: string): Promise<Payment> {
    const response = await fetch(`${this.baseUrl}/api/v1/payments/${paymentId}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch payment status');
    }

    return response.json();
  }

  // Get payment by order ID
  async getPaymentsByOrder(orderId: string): Promise<Payment[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/payments?order_id=${orderId}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch payments');
    }

    return response.json();
  }

  // Process refund
  async processRefund(paymentId: string, amount: number, reason: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v1/payments/${paymentId}/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, reason }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to process refund');
    }
  }

  // Check payment method availability
  async checkPaymentMethodAvailability(): Promise<{
    paynow: boolean;
    stripe: boolean;
  }> {
    try {
      const [paynowRes, stripeRes] = await Promise.all([
        fetch(`${this.baseUrl}/api/v1/payments/methods/paynow/available`),
        fetch(`${this.baseUrl}/api/v1/payments/methods/stripe/available`),
      ]);

      return {
        paynow: paynowRes.ok,
        stripe: stripeRes.ok,
      };
    } catch (error) {
      return {
        paynow: true, // Assume available on error
        stripe: true,
      };
    }
  }

  private generateIdempotencyKey(orderId: string, method: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `payment_${orderId}_${method}_${timestamp}_${random}`;
  }
}

// Singleton instance
export const paymentApi = new PaymentApiClient();
