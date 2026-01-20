'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { decimal } from '@/lib/decimal-utils';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

export interface CartAction {
  type: 'add' | 'remove' | 'update' | 'clear';
  timestamp: number;
  item?: CartItem;
  itemId?: string;
  quantity?: number;
  previousState: {
    items: CartItem[];
  };
}

export interface CartHistory {
  past: CartAction[];
  future: CartAction[];
}

interface CartState {
  items: CartItem[];
  history: CartHistory;
  canUndo: boolean;
  canRedo: boolean;
  getSubtotal: () => number;
  getGST: () => number;
  getTotal: () => number;
  getItemCount: () => number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  undo: () => void;
  redo: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      history: {
        past: [],
        future: [],
      },
      canUndo: false,
      canRedo: false,

      addItem: (item: CartItem) =>
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id);
          let newItems: CartItem[];

          if (existingItem) {
            newItems = state.items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + (item.quantity || 1) } : i
            );
          } else {
            newItems = [...state.items, { ...item, quantity: item.quantity || 1 }];
          }

          return {
            items: newItems,
            history: {
              ...state.history,
              past: [
                ...state.history.past.slice(-9),
                {
                  type: 'add',
                  timestamp: Date.now(),
                  item,
                  previousState: { items: state.items },
                },
              ],
              future: [],
            },
            canUndo: true,
            canRedo: false,
          };
        }),

      removeItem: (id: string) =>
        set((state) => {
          const itemToRemove = state.items.find((i) => i.id === id);
          const newItems = state.items.filter((i) => i.id !== id);

          return {
            items: newItems,
            history: {
              ...state.history,
              past: [
                ...state.history.past.slice(-9),
                {
                  type: 'remove',
                  timestamp: Date.now(),
                  item: itemToRemove,
                  itemId: id,
                  previousState: { items: state.items },
                },
              ],
              future: [],
            },
            canUndo: true,
            canRedo: false,
          };
        }),

      updateQuantity: (id: string, quantity: number) =>
        set((state) => {
          const newItems = state.items
            .map((i) => (i.id === id ? { ...i, quantity: Math.max(0, quantity) } : i))
            .filter((i) => i.quantity > 0);

          return {
            items: newItems,
            history: {
              ...state.history,
              past: [
                ...state.history.past.slice(-9),
                {
                  type: 'update',
                  timestamp: Date.now(),
                  itemId: id,
                  quantity,
                  previousState: { items: state.items },
                },
              ],
              future: [],
            },
            canUndo: true,
            canRedo: false,
          };
        }),

      clearCart: () =>
        set((state) => ({
          items: [],
          history: {
            ...state.history,
            past: [
              ...state.history.past.slice(-9),
              {
                type: 'clear',
                timestamp: Date.now(),
                previousState: { items: state.items },
              },
            ],
            future: [],
          },
          canUndo: true,
          canRedo: false,
        })),

      undo: () =>
        set((state) => {
          const previousAction = state.history.past[state.history.past.length - 1];
          if (!previousAction) return state;

          return {
            items: previousAction.previousState.items,
            history: {
              past: state.history.past.slice(0, -1),
              future: [previousAction, ...state.history.future],
            },
            canUndo: state.history.past.length > 1,
            canRedo: true,
          };
        }),

      redo: () =>
        set((state) => {
          const nextAction = state.history.future[0];
          if (!nextAction) return state;

          return {
            items: nextAction.previousState.items,
            history: {
              past: [...state.history.past, nextAction],
              future: state.history.future.slice(1),
            },
            canUndo: true,
            canRedo: state.history.future.length > 1,
          };
        }),

      getSubtotal: () => {
        return get().items.reduce((sum, item) => {
          return decimal.add(sum, decimal.multiply(item.price, item.quantity));
        }, 0);
      },

      getGST: () => {
        const subtotal = get().getSubtotal();
        return decimal.calculateGST(subtotal);
      },

      getTotal: () => {
        return decimal.add(get().getSubtotal(), get().getGST());
      },

      getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: 'authentic-kopitiam-cart',
    }
  )
);
