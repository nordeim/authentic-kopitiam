'use client';

import { useState } from 'react';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useToastStore } from '@/store/toast-store';

interface AddToCartButtonProps {
  item: {
    id: string;
    name: string;
    price: number;
  };
  disabled?: boolean;
  showFeedback?: boolean;
}

export function AddToCartButton({
  item,
  disabled = false,
  showFeedback = true,
}: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const addToCart = useCartStore((state) => state.addItem);
  const showToast = useToastStore((state) => state.showToast);

  const handleClick = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    try {
      addToCart({ ...item, quantity: 1, category: 'menu' });

      if (showFeedback) {
        showToast({
          message: `${item.name} added to cart`,
          variant: 'success',
          onDismiss: () => {},
        });
      }
    } catch (error) {
      showToast({
        message: 'Failed to add item to cart',
        variant: 'warning',
        onDismiss: () => {},
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`add-to-cart-button ${isLoading ? 'add-to-cart-button--loading' : ''} ${disabled ? 'add-to-cart-button--disabled' : ''}`}
      type="button"
    >
      <style jsx>{`
        .add-to-cart-button {
          padding: var(--spacing-3, 0.75rem) var(--spacing-4, 1rem);
          background: rgb(var(--color-terracotta-warm));
          border: none;
          border-radius: var(--radius-full, 50%);
          color: rgb(var(--color-cream-white));
          font-family: var(--font-body);
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-2, 0.5rem);
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .add-to-cart-button:hover:not(:disabled) {
          background: rgb(var(--color-terracotta-warm-hover));
          transform: translate(-1px, -1px);
        }

        .add-to-cart-button:focus-visible {
          outline: 2px solid rgb(var(--color-espresso-dark));
          outline-offset: 2px;
        }

        .add-to-cart-button--disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .add-to-cart-button--loading {
          opacity: 0.7;
          cursor: wait;
        }

        .add-to-cart-button--loading:hover {
          transform: none;
        }

        @media (prefers-reduced-motion: reduce) {
          .add-to-cart-button {
            transition: none;
            transform: none;
          }
        }
      `}</style>
      {isLoading ? (
        <Loader2 size={18} className="animate-spin" aria-hidden="true" />
      ) : (
        <ShoppingCart size={18} aria-hidden="true" />
      )}
      <span>Add to Cart</span>
    </button>
  );
}
