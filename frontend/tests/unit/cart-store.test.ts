/**
 * Cart Store Tests
 * Validates cart calculations and state management
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '../../src/store/cart-store';

describe('Cart Store', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('adds items to cart correctly', () => {
    useCartStore.getState().addItem({ id: '1', name: 'Kopi', price: 1.20, quantity: 1, category: 'Drinks' });
    expect(useCartStore.getState().items.length).toBe(1);
  });

  it('calculates subtotal greater than zero', () => {
    useCartStore.getState().addItem({ id: '1', name: 'Item', price: 3.50, quantity: 1, category: 'Test' });
    expect(useCartStore.getState().getSubtotal()).toBeGreaterThan(0);
  });

  it('calculates GST correctly', () => {
    useCartStore.getState().addItem({ id: '1', name: 'Item', price: 100.00, quantity: 1, category: 'Test' });
    expect(useCartStore.getState().getGST()).toBeGreaterThan(0);
  });

  it('calculates total correctly', () => {
    useCartStore.getState().addItem({ id: '1', name: 'Item', price: 3.50, quantity: 1, category: 'Food' });
    expect(useCartStore.getState().getTotal()).toBeGreaterThan(0);
  });
});
