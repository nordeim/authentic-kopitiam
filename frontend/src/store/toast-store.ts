'use client';

import { create } from 'zustand';

interface ToastProps {
  id: string;
  message: string;
  variant: 'success' | 'info' | 'warning';
  onDismiss: () => void;
  undoAction?: () => void;
  undoText?: string;
}

type ToastVariant = 'success' | 'info' | 'warning';

interface ToastData extends Omit<ToastProps, 'id'> {
}

interface ToastStore {
  toasts: ToastProps[];
  showToast: (data: ToastData) => string;
  dismissToast: (id: string) => void;
  clearAll: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  showToast: (data) => {
    const id = data.id || `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    set((state) => ({
      toasts: [...state.toasts.slice(-4), { ...data, id }],
    }));
    setTimeout(() => {
      useToastStore.getState().dismissToast(id);
    }, 5000);
    return id;
  },

  dismissToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id),
  })),

  clearAll: () => set({ toasts: [] }),
}));
