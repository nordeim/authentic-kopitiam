'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useToastStore } from '@/store/toast-store';

export interface ToastProps {
  message: string;
  variant: 'success' | 'info' | 'warning';
  onDismiss: () => void;
}

export const toast = (props: { title: string; description?: string; variant?: 'success' | 'info' | 'warning' }) => {
  useToastStore.getState().showToast({
    message: props.description ? `${props.title}: ${props.description}` : props.title,
    variant: props.variant || 'success',
    onDismiss: () => {},
  });
};

export function Toast({
  message,
  variant = 'success',
  onDismiss,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const variantStyles = {
    success: 'bg-mocha-dark text-cream-white border-2 border-mocha-dark',
    info: 'bg-honey-light text-espresso-dark border-2 border-honey-light',
    warning: 'bg-coral-pop text-cream-white border-2 border-coral-pop',
  };

  return (
      <div className={`toast toast--${variant} ${variantStyles[variant]}`}
      role="alert"
      aria-live="polite"
    >
       <div className="toast__content">
        <p>{message}</p>
      </div>

      <div className="toast__actions">
        <button onClick={onDismiss} className="toast__dismiss" aria-label="Dismiss" type="button">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

interface ToasterProps {
  position?: 'top-right' | 'top-center' | 'bottom-right';
}

export function Toaster({ position = 'top-right' }: ToasterProps) {
  const { toasts } = useToastStore();

  const positionStyles = {
    'top-right': 'fixed top-6 right-6',
    'top-center': 'fixed top-6 left-1/2 -translate-x-1/2',
    'bottom-right': 'fixed bottom-6 right-6',
  };

  return (
    <>
      <style jsx>{`
        .toaster {
          ${positionStyles[position]};
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: var(--space-3, 0.75rem);
          pointer-events: none;
        }

        .toaster--has-toasts {
          pointer-events: auto;
        }
      `}</style>
      <div className={`toaster ${toasts.length > 0 ? 'toaster--has-toasts' : ''}`}>
        {toasts.map((toast: ToastProps & { id: string }) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </>
  );
}
