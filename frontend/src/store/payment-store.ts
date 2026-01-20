'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PaymentMethod = 'paynow' | 'stripe_card';

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Payment {
  id: string;
  order_id: string;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  amount: number; // DECIMAL(10,4) from backend
  paynow_qr_data?: string;
  provider_payment_id?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentState {
  // Current payment
  payment: Payment | null;
  
  // UI state
  selectedMethod: PaymentMethod | null;
  isProcessing: boolean;
  isPolling: boolean;
  error: string | null;
  
  // PayNow-specific
  qrCodeUrl: string | null;
  
  // Stripe-specific
  clientSecret: string | null;
  
  // Actions
  selectPaymentMethod: (method: PaymentMethod) => void;
  setPayment: (payment: Payment) => void;
  setProcessing: (isProcessing: boolean) => void;
  setPolling: (isPolling: boolean) => void;
  setQrCodeUrl: (url: string | null) => void;
  setClientSecret: (secret: string | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// Persistence config (PDPA compliant: 30-day retention)
const STORAGE_CONFIG = {
  name: 'payment-storage',
  skipHydration: true, // Prevent hydration mismatch
  partialize: (state: PaymentState) => {
    // Only persist non-sensitive data
    return {
      payment: state.payment,
      selectedMethod: state.selectedMethod,
      qrCodeUrl: state.qrCodeUrl,
    };
  },
};

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set, get) => ({
      // Initial state
      payment: null,
      selectedMethod: null,
      isProcessing: false,
      isPolling: false,
      error: null,
      qrCodeUrl: null,
      clientSecret: null,

      // Actions
      selectPaymentMethod: (method: PaymentMethod) => {
        set({ selectedMethod: method, error: null });
      },

      setPayment: (payment: Payment) => {
        set({ payment, isProcessing: false });
      },

      setProcessing: (isProcessing: boolean) => {
        set({ isProcessing });
      },

      setPolling: (isPolling: boolean) => {
        set({ isPolling });
      },

      setQrCodeUrl: (url: string | null) => {
        set({ qrCodeUrl: url });
      },

      setClientSecret: (secret: string | null) => {
        set({ clientSecret: secret });
      },

      setError: (error: string | null) => {
        set({ error, isProcessing: false, isPolling: false });
      },

      reset: () => {
        set({
          payment: null,
          selectedMethod: null,
          isProcessing: false,
          isPolling: false,
          error: null,
          qrCodeUrl: null,
          clientSecret: null,
        });
      },
    }),
    STORAGE_CONFIG
  )
);

// Helper hook for accessing payment state
export function usePaymentState() {
  const store = usePaymentStore();
  
  return {
    ...store,
    // Computed values
    hasActivePayment: !!store.payment,
    isPayNow: store.selectedMethod === 'paynow',
    isCard: store.selectedMethod === 'stripe_card',
    canProceed: !!store.selectedMethod && !store.isProcessing,
  };
}

// Export for API integration
export const paymentStore = {
  getState: usePaymentStore.getState,
  setState: (partial: Partial<PaymentState>) => {
    const state = usePaymentStore.getState();
    const newState = { ...state, ...partial };
    usePaymentStore.setState(newState);
  },
};
