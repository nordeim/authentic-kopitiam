'use client';

import { create } from 'zustand';

export interface ToastProps {
  id: string;
  message: string;
  variant: 'success' | 'info' | 'warning';
  onDismiss: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  showToast: (data: ToastProps) => {
    set((state) => ({
      toasts: [...state.toasts.slice(-4), data],
    }));
    setTimeout(() => {
      useToastStore.getState().dismissToast(data.id);
    }, 5000);
    return data.id;
  },

  dismissToast: (id: string) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id),
  })),

  clearAll: () => set({ toasts: [] }),
}));