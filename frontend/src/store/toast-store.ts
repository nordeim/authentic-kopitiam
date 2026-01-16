'use client';

import { create } from 'zustand';

export interface ToastProps {
  id: string;
  message: string;
  variant: 'success' | 'info' | 'warning';
  onDismiss: () => void;
}

interface ToastStore {
  toasts: ToastProps[];
  showToast: (data: Omit<ToastProps, 'id'>) => string;
  dismissToast: (id: string) => void;
  clearAll: () => void;
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  showToast: (data: Omit<ToastProps, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const toastWithId: ToastProps = { ...data, id, onDismiss: () => get().dismissToast(id) };
    set((state: ToastStore) => ({
      toasts: [...state.toasts.slice(-4), toastWithId],
    }));
    setTimeout(() => {
      get().dismissToast(id);
    }, 5000);
    return id;
  },

  dismissToast: (id: string) => set((state: ToastStore) => ({
    toasts: state.toasts.filter((t) => t.id !== id),
  })),

  clearAll: () => set({ toasts: [] }),
}));