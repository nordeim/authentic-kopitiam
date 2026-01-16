'use client';

import { useEffect } from 'react';
import { X, ShoppingCart, Trash2 } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';

interface CartOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartOverlay({ isOpen, onClose }: CartOverlayProps) {
  const { items, getSubtotal, getGST, getTotal, clearCart } = useCartStore();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleEscapeKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleEscapeKey);
    }
    return () => {
      window.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  const formatPrice = (price: number): string => {
    return `SGD ${(price / 100).toFixed(2)}`;
  };

  if (!isOpen) return null;

  return (
    <div
      className="cart-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-title"
    >
      <style jsx>{`
        .cart-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          animation: cartFadeIn 0.2s ease-out;
        }

        .cart-overlay__panel {
          background: rgb(var(--color-cream-white));
          border-radius: var(--radius-xl, 1rem);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          max-width: 90vw;
          width: 100%;
          max-height: 85vh;
          overflow: hidden;
          animation: slideIn 0.3s ease-out;
          position: relative;
        }

        .cart-overlay__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-5, 1.25rem);
          border-bottom: 1px solid rgb(var(--color-mocha-light));
        }

        .cart-overlay__title {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 700;
          color: rgb(var(--color-espresso-dark));
        }

        .cart-overlay__close {
          background: rgb(var(--color-mocha-light));
          border: none;
          border-radius: var(--radius-full, 50%);
          padding: var(--space-2, 0.5rem);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
          color: rgb(var(--color-espresso-dark));
        }

        .cart-overlay__close:hover {
          background: rgb(var(--color-terracotta-warm));
          color: rgb(var(--color-cream-white));
        }

        .cart-overlay__close:focus-visible {
          outline: 2px solid rgb(var(--color-terracotta-warm));
          outline-offset: 2px;
        }

        .cart-overlay__body {
          overflow-y: auto;
          padding: var(--space-5, 1.25rem);
          max-height: calc(85vh - 80px);
        }

        .cart-overlay__empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-12, 3rem);
          gap: var(--space-4, 1rem);
        }

        .cart-overlay__empty-icon {
          width: 4rem;
          height: 4rem;
          color: rgb(var(--color-mocha-medium));
        }

        .cart-overlay__empty-text {
          font-family: var(--font-body);
          font-size: 1rem;
          color: rgb(var(--color-espresso-dark));
          text-align: center;
        }

        .cart-overlay__items {
          display: flex;
          flex-direction: column;
          gap: var(--space-3, 0.75rem);
        }

        .cart-overlay__item {
          display: grid;
          grid-template-columns: 1fr auto auto;
          align-items: center;
          padding: var(--space-3, 0.75rem);
          border-bottom: 1px solid rgb(var(--color-honey-light));
        }

        .cart-overlay__item:last-child {
          border-bottom: none;
        }

        .cart-overlay__item-name {
          font-family: var(--font-body);
          font-weight: 500;
          color: rgb(var(--color-espresso-dark));
          font-size: 0.95rem;
        }

        .cart-overlay__item-price {
          font-family: var(--font-body);
          font-weight: 600;
          color: rgb(var(--color-espresso-dark));
          font-size: 0.9rem;
        }

        .cart-overlay__item-quantity {
          font-family: var(--font-body);
          color: rgb(var(--color-mocha-medium));
          font-size: 0.9rem;
        }

        .cart-overlay__footer {
          padding: var(--space-5, 1.25rem);
          border-top: 1px solid rgb(var(--color-mocha-light));
          background: rgb(var(--color-honey-light));
        }

        .cart-overlay__summary {
          display: flex;
          flex-direction: column;
          gap: var(--space-2, 0.5rem);
        }

        .cart-overlay__summary-row {
          display: flex;
          justify-content: space-between;
          font-family: var(--font-body);
          font-size: 0.9rem;
        }

        .cart-overlay__summary-label {
          color: rgb(var(--color-mocha-medium));
        }

        .cart-overlay__summary-value {
          font-weight: 600;
          color: rgb(var(--color-espresso-dark));
        }

        .cart-overlay__total {
          font-size: 1.1rem;
          font-weight: 700;
          color: rgb(var(--color-terracotta-warm));
        }

        .cart-overlay__actions {
          display: flex;
          gap: var(--space-3, 0.75rem);
          padding-top: var(--space-4, 1rem);
        }

        .cart-overlay__clear {
          background: rgb(var(--color-espresso-dark));
          color: rgb(var(--color-cream-white));
          border: none;
          border-radius: var(--radius-full, 50%);
          padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: var(--space-2, 0.5rem);
          transition: all 0.2s;
        }

        .cart-overlay__clear:hover {
          background: rgb(var(--color-espresso-dark-hover));
          transform: translate(-1px, -1px);
        }

        .cart-overlay__clear:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .cart-overlay__checkout {
          flex: 1;
          background: rgb(var(--color-terracotta-warm));
          color: rgb(var(--color-cream-white));
          border: none;
          border-radius: var(--radius-full, 50%);
          padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2, 0.5rem);
          transition: all 0.2s;
        }

        .cart-overlay__checkout:hover {
          background: rgb(var(--color-terracotta-warm-hover));
          transform: translate(1px, -1px);
        }

        .cart-overlay__checkout:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        @keyframes cartFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .cart-overlay,
          .cart-overlay__panel {
            animation: none !important;
          }
        }

        @media (min-width: 768px) {
          .cart-overlay {
            align-items: center;
            justify-content: center;
          }

          .cart-overlay__panel {
            max-width: 32rem;
          }
        }
      `}</style>

      <div className="cart-overlay__panel">
        <div className="cart-overlay__header">
          <h2 id="cart-title" className="cart-overlay__title">
            Your Cart
          </h2>
          <button
            onClick={onClose}
            className="cart-overlay__close"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        <div className="cart-overlay__body">
          {items.length === 0 ? (
            <div className="cart-overlay__empty">
              <ShoppingCart className="cart-overlay__empty-icon" />
              <p className="cart-overlay__empty-text">
                Your cart is empty. Add some delicious kopi and treats!
              </p>
            </div>
          ) : (
            <div className="cart-overlay__items">
              {items.map((item) => (
                <div key={item.id} className="cart-overlay__item">
                  <span className="cart-overlay__item-name">{item.name}</span>
                  <span className="cart-overlay__item-price">
                    {formatPrice(item.price)}
                  </span>
                  <span className="cart-overlay__item-quantity">
                    x{item.quantity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-overlay__footer">
            <div className="cart-overlay__summary">
              <div className="cart-overlay__summary-row">
                <span className="cart-overlay__summary-label">Subtotal</span>
                <span className="cart-overlay__summary-value">
                  {formatPrice(getSubtotal())}
                </span>
              </div>
              <div className="cart-overlay__summary-row">
                <span className="cart-overlay__summary-label">GST (9%)</span>
                <span className="cart-overlay__summary-value">
                  {formatPrice(getGST())}
                </span>
              </div>
              <div className="cart-overlay__summary-row cart-overlay__total">
                <span className="cart-overlay__summary-label">Total</span>
                <span className="cart-overlay__summary-value">
                  {formatPrice(getTotal())}
                </span>
              </div>
            </div>

            <div className="cart-overlay__actions">
              <button
                onClick={clearCart}
                disabled={items.length === 0}
                className="cart-overlay__clear"
                aria-label="Clear cart"
              >
                <Trash2 size={16} />
                <span>Clear Cart</span>
              </button>
              <button
                disabled={items.length === 0}
                className="cart-overlay__checkout"
              >
                <span>Checkout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
