'use client';

import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useToastStore } from '@/store/toast-store';

export interface ToastProps {
  id: string;
  message: string;
  variant: 'success' | 'info' | 'warning';
  onDismiss: () => void;
  undoAction?: () => void;
  undoText?: string;
}

export function Toast({
  id,
  message,
  variant = 'success',
  onDismiss,
  undoAction,
  undoText,
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

  const handleUndoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (undoAction) {
      undoAction();
      onDismiss();
    }
  };

  return (
    <div
      className={`toast toast--${variant} ${variantStyles[variant]}`}
      role="alert"
      aria-live="polite"
    >
      <style jsx>{`
        .toast {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-3, 0.75rem);
          padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
          border-radius: var(--radius-lg, 0.5rem);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15);
          animation: toastSlideIn 0.3s ease-out;
          max-width: 24rem;
        }

        .toast--success {
          background: rgb(var(--color-mocha-dark));
          border-color: rgb(var(--color-mocha-dark));
          color: rgb(var(--color-cream-white));
        }

        .toast--info {
          background: rgb(var(--color-honey-light));
          border-color: rgb(var(--color-honey-light));
          color: rgb(var(--color-espresso-dark));
        }

        .toast--warning {
          background: rgb(var(--color-coral-pop));
          border-color: rgb(var(--color-coral-pop));
          color: rgb(var(--color-cream-white));
        }

        .toast__content {
          flex: 1;
          font-family: var(--font-body);
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .toast__actions {
          display: flex;
          align-items: center;
          gap: var(--space-2, 0.5rem);
        }

        .toast__dismiss {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: var(--radius-full, 50%);
          padding: var(--space-1, 0.25rem);
          cursor: pointer;
          color: inherit;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .toast__dismiss:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .toast__dismiss:focus-visible {
          outline: 2px solid rgba(255, 255, 255, 0.5);
          outline-offset: 2px;
        }

        .toast__undo {
          background: inherit;
          border: none;
          border-radius: var(--radius-md, 0.375rem);
          padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
          cursor: pointer;
          font-family: var(--font-body);
          font-size: 0.85rem;
          font-weight: 600;
          transition: all 0.2s;
          color: inherit;
        }

        .toast__undo:hover {
          transform: translate(-1px, -1px);
        }

        .toast__undo:focus-visible {
          outline: 2px solid rgba(255, 255, 255, 0.5);
          outline-offset: 2px;
        }

        @keyframes toastSlideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes toastSlideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .toast {
            animation: none !important;
          }
        }
      `}</style>

      <div className="toast__content">
        <p>{message}</p>
      </div>

      <div className="toast__actions">
        {undoAction && undoText && (
          <button onClick={handleUndoClick} className="toast__undo" type="button">
            {undoText}
          </button>
        )}
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
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </>
  );
}
