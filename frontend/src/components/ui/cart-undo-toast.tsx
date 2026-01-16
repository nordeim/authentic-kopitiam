'use client';

import { useEffect } from 'react';
import { X, Undo2 } from 'lucide-react';

interface CartUndoToastProps {
  itemName: string;
  onUndo: () => void;
  onDismiss: () => void;
}

export function CartUndoToast({ itemName, onUndo, onDismiss }: CartUndoToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 10000);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        onUndo();
        onDismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onUndo, onDismiss]);

  const handleUndoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUndo();
    onDismiss();
  };

  return (
    <div className="cart-undo-toast">
      <style jsx>{`
        .cart-undo-toast {
          display: flex;
          align-items: center;
          gap: var(--space-3, 0.75rem);
          padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
          background: rgb(var(--color-mocha-dark));
          border: 1px solid rgb(var(--color-mocha-dark));
          border-radius: var(--radius-lg, 0.5rem);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15);
          max-width: 28rem;
          animation: undoToastSlideIn 0.3s ease-out;
        }

        .cart-undo-toast__content {
          flex: 1;
          font-family: var(--font-body);
          font-size: 0.9rem;
          line-height: 1.4;
          color: rgb(var(--color-cream-white));
        }

        .cart-undo-toast__actions {
          display: flex;
          align-items: center;
          gap: var(--space-3, 0.75rem);
        }

        .cart-undo-toast__undo {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: var(--radius-md, 0.375rem);
          padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
          cursor: pointer;
          font-family: var(--font-body);
          font-size: 0.85rem;
          font-weight: 600;
          transition: all 0.2s;
          color: rgb(var(--color-cream-white));
          display: flex;
          align-items: center;
          gap: var(--space-1, 0.25rem);
        }

        .cart-undo-toast__undo:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translate(-1px, -1px);
        }

        .cart-undo-toast__undo:focus-visible {
          outline: 2px solid rgba(255, 255, 255, 0.5);
          outline-offset: 2px;
        }

        .cart-undo-toast__shortcut {
          font-size: 0.75rem;
          opacity: 0.7;
        }

        .cart-undo-toast__dismiss {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: var(--radius-full, 50%);
          padding: var(--space-1, 0.25rem);
          cursor: pointer;
          color: rgb(var(--color-cream-white));
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .cart-undo-toast__dismiss:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .cart-undo-toast__dismiss:focus-visible {
          outline: 2px solid rgba(255, 255, 255, 0.5);
          outline-offset: 2px;
        }

        @keyframes undoToastSlideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .cart-undo-toast {
            animation: none !important;
          }
        }
      `}</style>

      <div className="cart-undo-toast__content">
        <p>Removed <strong>{itemName}</strong> from cart</p>
        <span className="cart-undo-toast__shortcut">(Ctrl+Z / Cmd+Z)</span>
      </div>

      <div className="cart-undo-toast__actions">
        <button onClick={handleUndoClick} className="cart-undo-toast__undo" type="button">
          <Undo2 size={14} />
          <span>Undo</span>
        </button>
        <button onClick={onDismiss} className="cart-undo-toast__dismiss" aria-label="Dismiss" type="button">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
