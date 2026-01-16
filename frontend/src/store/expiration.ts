'use client';

import { get, remove } from '@/store/persistence';

export const CART_RETENTION_DAYS = 30;
export const UNDO_RETENTION_DAYS = 7;

export interface ExpirationService {
  cleanupCartData(): void;
  cleanupUndoHistory(): void;
  cleanupAll(): void;
  initializeCleanup(): void;
}

export const expirationService: ExpirationService = {
  cleanupCartData() {
    const cartData = get('authentic-kopitiam-cart');

    if (!cartData) return;

    try {
      const items = JSON.parse(cartData as string);
      const now = Date.now();
      const thirtyDaysMs = CART_RETENTION_DAYS * 24 * 60 * 60 * 1000;

      const hasExpiredItems = items.some((item: any) => {
        if (!item.timestamp) return false;
        return (now - item.timestamp) > thirtyDaysMs;
      });

      if (hasExpiredItems) {
        remove('authentic-kopitiam-cart');
      }
    } catch (error) {
      console.error('Failed to cleanup cart data:', error);
    }
  },

  cleanupUndoHistory() {
    const undoHistory = get('authentic-kopitiam-undo-history');

    if (!undoHistory) return;

    try {
      const history = JSON.parse(undoHistory as string);
      const now = Date.now();
      const sevenDaysMs = UNDO_RETENTION_DAYS * 24 * 60 * 60 * 1000;

      const filteredHistory = history.filter((action: any) => {
        if (!action.timestamp) return false;
        return (now - action.timestamp) <= sevenDaysMs;
      });

      if (filteredHistory.length < history.length) {
        const encoded = JSON.stringify(filteredHistory);
        localStorage.setItem('authentic-kopitiam-undo-history', encoded);
      }
    } catch (error) {
      console.error('Failed to cleanup undo history:', error);
    }
  },

  cleanupAll() {
    this.cleanupCartData();
    this.cleanupUndoHistory();
  },

  initializeCleanup() {
    this.cleanupAll();
  },
};
