import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '../../src/store/cart-store';
import { decimal } from '../../src/lib/decimal-utils';

// Mock localStorage for Zustand persist
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Cart Store Decimal Precision', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
    localStorageMock.clear();
  });

  it('calculates subtotal correctly with multiple items', () => {
    useCartStore.getState().addItem({
      id: '1',
      name: 'Kopi',
      price: 1.20,
      quantity: 1,
      category: 'Drinks'
    });
    useCartStore.getState().addItem({
      id: '2',
      name: 'Toast',
      price: 2.50,
      quantity: 2,
      category: 'Food'
    });

    // 1.20 * 1 + 2.50 * 2 = 1.20 + 5.00 = 6.20
    expect(useCartStore.getState().getSubtotal()).toBe(6.20);
  });

  it('calculates GST (9%) correctly with high precision', () => {
    useCartStore.getState().addItem({
      id: '1',
      name: 'Expensive Item',
      price: 100.00,
      quantity: 1,
      category: 'Test'
    });

    // 100.00 * 0.09 = 9.00
    expect(useCartStore.getState().getGST()).toBe(9.00);
  });

  it('calculates GST with correct rounding (DECIMAL 10,4)', () => {
    // 3.50 * 0.09 = 0.315
    // Should be rounded to 4 decimals: 0.3150
    useCartStore.getState().addItem({
      id: '1',
      name: 'Kaya Toast',
      price: 3.50,
      quantity: 1,
      category: 'Food'
    });

    expect(useCartStore.getState().getGST()).toBe(0.315);
  });

  it('calculates Total correctly', () => {
    useCartStore.getState().addItem({
      id: '1',
      name: 'Kaya Toast',
      price: 3.50,
      quantity: 1,
      category: 'Food'
    });

    // Subtotal: 3.50
    // GST: 0.315
    // Total: 3.815
    expect(useCartStore.getState().getTotal()).toBe(3.815);
  });

  it('handles floating point addition errors correctly', () => {
    // 0.1 + 0.2 usually equals 0.30000000000000004 in JS
    useCartStore.getState().addItem({
      id: '1',
      name: 'Item 1',
      price: 0.10,
      quantity: 1,
      category: 'Test'
    });
    useCartStore.getState().addItem({
      id: '2',
      name: 'Item 2',
      price: 0.20,
      quantity: 1,
      category: 'Test'
    });

    expect(useCartStore.getState().getSubtotal()).toBe(0.30);
  });
});
