'use client';

import { CartItem } from '@/store/cart-store';

interface StoredData<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export const CART_KEY = 'authentic-kopitiam-cart';
export const UNDO_HISTORY_KEY = 'authentic-kopitiam-undo-history';

export const CART_RETENTION_DAYS = 30;
export const UNDO_RETENTION_DAYS = 7;

export function get<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const parsed: StoredData<T> = JSON.parse(item);
    const now = Date.now();

    if (parsed.expiresAt < now) {
      localStorage.removeItem(key);
      return null;
    }

    return parsed.data;
  } catch (error) {
    console.error('Failed to get from localStorage:', error);
    return null;
  }
}

export function set<T>(key: string, data: T, retentionDays: number): void {
  if (typeof window === 'undefined') return;

  try {
    const timestamp = Date.now();
    const expiresAt = timestamp + retentionDays * 24 * 60 * 60 * 1000;

    const stored: StoredData<T> = {
      data,
      timestamp,
      expiresAt,
    };

    localStorage.setItem(key, JSON.stringify(stored));
  } catch (error) {
    console.error('Failed to set to localStorage:', error);
  }
}

export function remove(key: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
  }
}

export function clearExpired(): void {
  if (typeof window === 'undefined') return;

  try {
    const now = Date.now();
    const keys = Object.keys(localStorage);

    keys.forEach((key) => {
      try {
        const item = localStorage.getItem(key);
        if (!item) return;

        const parsed: StoredData<unknown> = JSON.parse(item);

        if (parsed.expiresAt && parsed.expiresAt < now) {
          localStorage.removeItem(key);
        }
      } catch (error) {
        console.error('Failed to check expiration for key:', key, error);
      }
    });
  } catch (error) {
    console.error('Failed to clear expired items:', error);
  }
}

export function clearAll(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.clear();
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
}

export function getCartData(): CartItem[] | null {
  return get<CartItem[]>(CART_KEY);
}

export function setCartData(items: CartItem[]): void {
  set(CART_KEY, items, CART_RETENTION_DAYS);
}

export function getUndoHistory<T>(): T[] | null {
  return get<T[]>(UNDO_HISTORY_KEY);
}

export function setUndoHistory<T>(history: T[]): void {
  set(UNDO_HISTORY_KEY, history, UNDO_RETENTION_DAYS);
}

export function initializePersistence(): void {
  clearExpired();
}
