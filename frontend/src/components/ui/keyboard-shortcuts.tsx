'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/store/cart-store';

interface KeyboardShortcutsConfig {
  onUndo?: () => void;
  onClose?: () => void;
  preventDefault?: boolean;
}

export function useKeyboardShortcuts({
  onUndo,
  onClose,
  preventDefault = true,
}: KeyboardShortcutsConfig) {
  const canUndo = useCartStore((state) => state.canUndo);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && onUndo && canUndo) {
        if (preventDefault) {
          e.preventDefault();
        }
        onUndo();
      }

      if (e.key === 'Escape' && onClose) {
        if (preventDefault) {
          e.preventDefault();
        }
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onUndo, onClose, canUndo, preventDefault]);

  return {
    undoAvailable: canUndo,
  };
}
