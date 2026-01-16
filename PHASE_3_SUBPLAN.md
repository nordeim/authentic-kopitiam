Thinking: The user is asking me to proceed with Phase 3 of the validated execution plan. They want:
1. A detailed sub-plan for Phase 3
2. List of files to create or update
3. For each file: description of features and interfaces, checklist
4. Following the meticulous approach
Looking at the previous analysis, Phase 3 is about "Interactive Components & State Management" with 11 tasks. The build issues from Phase 2 should be addressed first.
Let me create a comprehensive, detailed Phase 3 sub-plan following the meticulous approach established. I'll focus on:
- Creating a well-structured document
- Clear task breakdowns
- File paths, features, interfaces, checklists, success criteria
- Technical details and implementation guidance
I should avoid excessive preamble and jump directly into the detailed sub-plan.
PHASE 3: INTERACTIVE COMPONENTS & STATE MANAGEMENT — DETAILED SUB-PLAN
Document Version: 3.0.0  
Last Updated: 2025-01-17  
Phase: Interactive Components & State Management (11 Tasks)  
Estimated Effort: 10-14 hours  
Dependencies: Phase 2 (Frontend Architecture) ✅ COMPLETED (with unresolved build errors to address)
---
EXECUTIVE SUMMARY
This phase implements all interactive elements (cart, filters, notifications) using Zustand for lightweight state management. Key features include:
- Undo/redo functionality with 10-action history tracking
- PDPA-compliant localStorage persistence (30-day cart, 7-day undo)
- GST calculations (9% Singapore rate, 4-decimal precision)
- URL state persistence for filters (using nuqs)
- Toast notification system with undo functionality
- Keyboard shortcuts (Ctrl+Z for undo, Escape for modals)
Critical Prerequisite: Resolve Phase 2 build errors before proceeding:
- Duplicate font definitions in fonts.ts
- Styled-JSX compatibility with Next.js 13+
- Import path conflicts
---
TASK BREAKDOWN
Task P3-1: Enhance Cart Store with Undo/Redo & Persistence
File to Update: /frontend/src/store/cart-store.ts
Purpose: Enhance the minimal cart store from Phase 2 with full Zustand implementation including undo/redo history, PDPA-compliant localStorage persistence, and precise GST calculations (9% with 4-decimal precision).
Current State: The Phase 2 placeholder has basic cart operations but lacks:
- Undo/redo functionality
- History tracking
- Proper persistence
- GST calculation integration
- Expiration management
---
Features:
- Undo/redo functionality with history tracking (last 10 actions)
- History stack with action objects (type, item, previousState, timestamp)
- Undo action to revert to previous state
- Redo action to restore undone actions
- Clear history function
- Maximum history size: 10 actions
- Cart item management (add, remove, update quantity, clear)
- GST calculation (9% Singapore rate with 4-decimal precision)
- localStorage persistence for cart (PDPA 30-day compliance)
- Expiration service integration for cleanup
- Type-safe state management with TypeScript interfaces
---
Interfaces & Props:
interface CartItem {
  id: string;
  name: string;
  price: number;  // In SGD cents (e.g., 450 = $4.50)
  quantity: number;
}
interface CartAction {
  type: 'add' | 'remove' | 'update' | 'clear';
  timestamp: number;
  item?: CartItem;
  itemId?: string;
  quantity?: number;
  previousState: {
    items: CartItem[];
  };
}
interface CartHistory {
  past: CartAction[];
  future: CartAction[];
}
interface CartState {
  items: CartItem[];
  history: CartHistory;
  canUndo: boolean;
  canRedo: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  undo: () => void;
  redo: () => void;
  getSubtotal: () => number;
  getGST: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}
---
Implementation Checklist:
- [ ] Import Zustand and persistence middleware
- [ ] Define CartItem, CartAction, CartHistory, CartState interfaces
- [ ] Create history stack management (past/future arrays)
- [ ] Implement canUndo/canRedo getters based on history length
- [ ] Create history push function (max 10 actions)
- [ ] Implement addItem with history tracking
- [ ] Implement removeItem with history tracking
- [ ] Implement updateQuantity with history tracking
- [ ] Implement clearCart with history tracking
- [ ] Implement undo function (pop from past, push to future)
- [ ] Implement redo function (pop from future, push to past)
- [ ] Implement getSubtotal (sum of price * quantity)
- [ ] Implement getGST (9% of subtotal, 4-decimal precision)
- [ ] Implement getTotal (subtotal + GST)
- [ ] Implement getItemCount (sum of quantities)
- [ ] Add localStorage persistence with 30-day expiration
- [ ] Add timestamp metadata to cart items
- [ ] Export store and hook (useCartStore)
- [ ] Add TypeScript type exports
---
Success Criteria:
- [ ] Can add items to cart successfully
- [ ] Can remove items from cart successfully
- [ ] Can update item quantities successfully
- [ ] Can clear all items from cart successfully
- [ ] Undo reverts last cart action correctly
- [ ] Redo restores last undone action correctly
- [ ] History maintains exactly last 10 actions
- [ ] canUndo is false when no past actions
- [ ] canRedo is false when no future actions
- [ ] Subtotal calculates correctly (sum of price * quantity)
- [ ] GST calculates correctly (9% of subtotal, rounded to 4 decimals)
- [ ] Total calculates correctly (subtotal + GST)
- [ ] Cart persists to localStorage
- [ ] Cart loads from localStorage on page refresh
- [ ] Cart items expire after 30 days
- [ ] TypeScript compiles without errors
- [ ] Store works with Zustand DevTools (if available)
---
Task P3-2: Create Filter Store with URL State
File to Create: /frontend/src/store/filter-store.ts
Purpose: Create separate Zustand store for menu category filtering with URL state persistence using nuqs library. Enables category filtering across menu page with shareable URLs.
---
Features:
- Active filter state management
- URL state persistence using nuqs library
- Category selection (All, Coffee, Breakfast, Pastries, Sides)
- Filter change handlers
- Integration with menu page for filtering
- Initial filter based on URL query param
---
Interfaces & Props:
type CategoryFilter = 'All' | 'Coffee' | 'Breakfast' | 'Pastries' | 'Sides';
interface FilterState {
  activeFilter: CategoryFilter;
  setActiveFilter: (filter: CategoryFilter) => void;
}
type FilterStore = FilterState;
---
Implementation Checklist:
- [ ] Import Zustand
- [ ] Install nuqs package for URL state
- [ ] Define CategoryFilter type
- [ ] Define FilterState interface
- [ ] Create filter store with activeFilter state
- [ ] Implement setActiveFilter using nuqs useQueryState
- [ ] Set up URL key for filter (e.g., 'category')
- [ ] Configure default value ('All')
- [ ] Export store and hook (useFilterStore)
- [ ] Export CategoryFilter type
- [ ] Test URL persistence
---
Success Criteria:
- [ ] Active filter defaults to 'All'
- [ ] setActiveFilter updates filter state
- [ ] URL query parameter updates when filter changes
- [ ] Filter loads from URL on page load
- [ ] URL can be shared and filter persists
- [ ] All category values work correctly
- [ ] Store integrates with menu page
- [ ] TypeScript compiles without errors
---
Task P3-3: Create Cart Overlay Modal
File to Create: /frontend/src/components/ui/cart-overlay.tsx
Purpose: Create cart overlay modal component displaying itemized cart contents, GST breakdown, clear cart button, and checkout button. Integrates with enhanced cart store from P3-1.
---
Features:
- Itemized list of cart items with names, prices, quantities
- GST breakdown display:
  - Subtotal
  - GST (9% with 4-decimal precision)
  - Total
- Clear cart button
- Checkout button (disabled when cart empty)
- Close button (escape key, click outside)
- Animated open/close transitions
- Retro styling matching design system
- ARIA attributes (dialog role, labels)
---
Interfaces & Props:
import { ReactNode } from 'react';
interface CartOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}
interface CartItemDisplay {
  id: string;
  name: string;
  price: number;  // In SGD
  quantity: number;
}
interface CartOverlayComponent {
  (props: CartOverlayProps): ReactNode;
}
---
Implementation Checklist:
- [ ] Add 'use client' directive at top
- [ ] Define CartOverlayProps interface
- [ ] Create cart overlay component
- [ ] Use useCartStore to access cart state
- [ ] Render cart items list
- [ ] For each item: display name, formatted price, quantity
- [ ] Display subtotal using getSubtotal()
- [ ] Display GST using getGST()
- [ ] Display total using getTotal()
- [ ] Format all prices as SGD currency
- [ ] Add clear cart button
- [ ] Add checkout button (disabled when items.length === 0)
- [ ] Add close button (X icon)
- [ ] Add modal overlay with blur backdrop
- [ ] Implement CSS transitions for open/close
- [ ] Add ARIA attributes:
  - [ ] role="dialog"
  - [ ] aria-modal="true"
  - [ ] aria-labelledby="cart-title"
  - [ ] aria-describedby="cart-description" (if needed)
- [ ] Implement escape key listener
- [ ] Implement click outside to close
- [ ] Apply retro styling (colors, typography from design tokens)
- [ ] Add animation classes (with prefers-reduced-motion)
- [ ] Ensure component is accessible
- [ ] Test keyboard navigation
---
Success Criteria:
- [ ] Cart overlay opens when cart button clicked
- [ ] Cart overlay closes when close button clicked
- [ ] Cart overlay closes when escape key pressed
- [ ] Cart overlay closes when clicking outside modal
- [ ] All cart items display correctly (name, price, quantity)
- [ ] Subtotal displays correctly (formatted as SGD)
- [ ] GST displays correctly (9% of subtotal, 4 decimals, formatted as SGD)
- [ ] Total displays correctly (subtotal + GST, formatted as SGD)
- [ ] Clear cart button removes all items
- [ ] Checkout button disabled when cart empty
- [ ] Checkout button enabled when cart has items
- [ ] All ARIA attributes present and correct
- [ ] Animations are smooth and respect reduced-motion preference
- [ ] Component renders without hydration errors
- [ ] Component is keyboard navigable
- [ ] Retro styling matches design system
- [ ] TypeScript compiles without errors
---
Task P3-4: Create Toast Notification Component
File to Create: /frontend/src/components/ui/toast-notification.tsx
Purpose: Create toast notification component for user feedback when items are added to cart or removed. Provides visual confirmation and undo functionality for cart actions.
---
Features:
- Toaster manager for toast queue
- Individual toast component
- Position support (top-right, top-center, bottom-right)
- Auto-dismiss functionality (5-second timeout)
- Multiple concurrent toasts support (stacked)
- Animation on entry/exit (slide in from right)
- Close button on each toast
- Support for undo action in cart removal toasts
- Success, info, and warning variants
- Retro styling matching design system
- Reduced motion support
---
Interfaces & Props:
import { ReactNode } from 'react';
type ToastVariant = 'success' | 'info' | 'warning';
type ToastPosition = 'top-right' | 'top-center' | 'bottom-right';
interface ToastProps {
  id: string;
  message: string;
  variant: ToastVariant;
  onDismiss: () => void;
  undoAction?: () => void;
  undoText?: string;
  autoDismiss?: boolean;
}
interface ToastComponent {
  (props: ToastProps): ReactNode;
}
interface ToastData {
  id: string;
  message: string;
  variant: ToastVariant;
  undoAction?: () => void;
  undoText?: string;
}
interface ToasterProps {
  position?: ToastPosition;
}
interface ToasterComponent {
  (props: ToasterProps): ReactNode;
}
interface ToastManager {
  showToast: (data: Omit<ToastData, 'id'>) => string;
  dismissToast: (id: string) => void;
  clearAll: () => void;
}
export const useToastManager = (): ToastManager;
---
Implementation Checklist:
Toast Component:
- [ ] Add 'use client' directive
- [ ] Define ToastProps interface
- [ ] Create toast component
- [ ] Add variant-specific styling (success, info, warning)
- [ ] Add message display
- [ ] Add close button (X icon)
- [ ] Add undo button if undoAction provided
- [ ] Add undo text if provided
- [ ] Implement slide-in animation from right
- [ ] Add slide-out animation on dismiss
- [ ] Respect prefers-reduced-motion
- [ ] Apply retro styling
- [ ] Add auto-dismiss timer (5 seconds)
Toaster Component:
- [ ] Define ToasterProps interface
- [ ] Create toaster manager using Zustand
- [ ] Store toasts in array (FIFO queue)
- [ ] Implement showToast function (generates unique ID)
- [ ] Implement dismissToast function (removes by ID)
- [ ] Implement clearAll function
- [ ] Create toaster component
- [ ] Render toasts in stack
- [ ] Support position prop
- [ ] Limit max concurrent toasts (e.g., 5)
- [ ] Auto-dismiss on timeout
- [ ] Export useToastManager hook
- [ ] Export Toast component
- [ ] Export Toaster component
- [ ] Export ToastVariant, ToastPosition types
---
Success Criteria:
- [ ] Toasts appear at specified position
- [ ] Multiple toasts stack correctly
- [ ] Toasts auto-dismiss after 5 seconds
- [ ] Close button dismisses toast immediately
- [ ] Undo button appears when undoAction provided
- [ ] Undo button triggers undoAction when clicked
- [ ] Undo text displays correctly
- [ ] Variants (success, info, warning) display with correct colors
- [ ] Animations are smooth
- [ ] Animations respect reduced-motion preference
- [ ] Toasts can be dismissed programmatically
- [ ] clearAll removes all toasts
- [ ] Max 5 toasts displayed at once (older toasts dismissed)
- [ ] Retro styling matches design system
- [ ] Component renders without hydration errors
- [ ] TypeScript compiles without errors
- [ ] Component is accessible (keyboard, ARIA)
---
Task P3-5: Create Filter Buttons Component
File to Create: /frontend/src/components/ui/filter-buttons.tsx
Purpose: Create filter button component for menu page category selection. Displays category buttons (All, Coffee, Breakfast, Pastries, Sides) with active state styling and URL state persistence.
---
Features:
- Category selection buttons (All, Coffee, Breakfast, Pastries, Sides)
- Active state styling for selected filter
- Inactive state styling for unselected filters
- URL state persistence via nuqs (using filter store)
- Integration with filter store
- Retro styling matching design system
- Responsive layout (stack on mobile, row on desktop)
---
Interfaces & Props:
import { ReactNode } from 'react';
interface FilterButtonProps {
  category: string;
  isActive: boolean;
  onClick: () => void;
}
interface FilterButtonComponent {
  (props: FilterButtonProps): ReactNode;
}
interface FilterButtonsProps {
  categories: string[];
}
interface FilterButtonsComponent {
  (props: FilterButtonsProps): ReactNode;
}
---
Implementation Checklist:
- [ ] Add 'use client' directive
- [ ] Define FilterButtonProps interface
- [ ] Define FilterButtonsProps interface
- [ ] Import useFilterStore hook
- [ ] Create FilterButton component:
  - [ ] Display category label
  - [ ] Apply active styling when isActive is true
  - [ ] Apply inactive styling when isActive is false
  - [ ] Add hover state
  - [ ] Add focus state for accessibility
  - [ ] Add ARIA pressed attribute
  - [ ] Apply retro styling
- [ ] Create FilterButtons component:
  - [ ] Get activeFilter from useFilterStore
  - [ ] Define categories array 'All', 'Coffee', 'Breakfast', 'Pastries', 'Sides'
  - [ ] Render FilterButton for each category
  - [ ] Pass isActive (category === activeFilter)
  - [ ] Pass onClick (setActiveFilter(category))
  - [ ] Add responsive layout (flex row desktop, stack mobile)
  - [ ] Add gap between buttons
  - [ ] Ensure component is accessible (keyboard nav, ARIA)
- [ ] Export FilterButton component
- [ ] Export FilterButtons component
---
Success Criteria:
- [ ] All 5 category buttons display (All, Coffee, Breakfast, Pastries, Sides)
- [ ] Active filter button has distinct styling
- [ ] Inactive filter buttons have different styling
- [ ] Clicking button updates filter in store
- [ ] URL query parameter updates to reflect filter
- [ ] Active state persists on page refresh
- [ ] Buttons are keyboard navigable (Tab, Enter, Space)
- [ ] ARIA pressed attribute updates correctly
- [ ] Hover states display correctly
- [ ] Focus states display correctly
- [ ] Layout is responsive (mobile vs desktop)
- [ ] Retro styling matches design system
- [ ] Component renders without hydration errors
- [ ] TypeScript compiles without errors
---
Task P3-6: Create Add-to-Cart Button
File to Create: /frontend/src/components/ui/add-to-cart-button.tsx
Purpose: Create add-to-cart button component with loading state and disabled state during async operations. Integrates with cart store's addItem action.
---
Features:
- Loading state indicator (spinner or text)
- Disabled state during async operations
- Integration with cart store's addItem
- Success feedback (optional toast)
- Retro styling matching design system
- ARIA attributes for accessibility
---
Interfaces & Props:
import { ReactNode } from 'react';
interface AddToCartButtonProps {
  item: {
    id: string;
    name: string;
    price: number;
  };
  disabled?: boolean;
  showFeedback?: boolean;
}
interface AddToCartButtonComponent {
  (props: AddToCartButtonProps): ReactNode;
}
---
Implementation Checklist:
- [ ] Add 'use client' directive
- [ ] Define AddToCartButtonProps interface
- [ ] Import useCartStore and useToastManager hooks
- [ ] Import lucide-react icons (ShoppingCart, Loader2)
- [ ] Create AddToCartButton component
- [ ] Add isLoading state
- [ ] Add handleClick async function:
  - [ ] Set isLoading to true
  - [ ] Call cartStore.addItem(item)
  - [ ] If showFeedback: call toastManager.showToast({
      message: ${item.name} added to cart,
      variant: 'success'
    })
  - [ ] Set isLoading to false
  - [ ] Handle errors with toast feedback
- [ ] Render button:
  - [ ] Disable when isLoading or disabled prop
  - [ ] Show spinner icon when isLoading
  - [ ] Show cart icon and "Add to Cart" text when not loading
  - [ ] Add hover state
  - [ ] Add focus state
  - [ ] Apply retro styling
  - [ ] Add ARIA attributes (aria-label, aria-busy)
- [ ] Export component
---
Success Criteria:
- [ ] Button displays correctly with "Add to Cart" text
- [ ] Button shows shopping cart icon
- [ ] Button shows spinner when loading
- [ ] Button is disabled when isLoading is true
- [ ] Button respects disabled prop
- [ ] Clicking button adds item to cart
- [ ] Toast appears when showFeedback is true
- [ ] Toast message includes item name
- [ ] Toast variant is 'success'
- [ ] Error toast appears on failure
- [ ] Button maintains retro styling
- [ ] Hover and focus states work correctly
- [ ] ARIA attributes present (aria-label, aria-busy)
- [ ] Component is keyboard accessible
- [ ] Component renders without hydration errors
- [ ] TypeScript compiles without errors
---
Task P3-7: Create PDPA-Compliant Persistence Layer
File to Create: /frontend/src/store/persistence.ts
Purpose: Create localStorage management service for PDPA compliance. Manages 30-day cart data retention and 7-day undo history expiration with timestamp-based cleanup on app initialization.
---
Features:
- localStorage wrapper with type safety
- 30-day expiration for cart data (PDPA requirement)
- 7-day expiration for undo history
- Cleanup on app initialization
- Timestamp-based filtering
- Data minimization principles (store only necessary data)
- Type-safe key management
---
Interfaces & Props:
interface StoredData<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}
interface PersistenceConfig {
  cartRetentionDays: number;  // 30
  undoRetentionDays: number;   // 7
}
interface PersistenceService {
  get<T>(key: string): T | null;
  set<T>(key: string, data: T, retentionDays: number): void;
  remove(key: string): void;
  clearExpired(): void;
  clearAll(): void;
}
export const persistenceService: PersistenceService;
export const CART_KEY = 'authentic-kopitiam-cart';
export const UNDO_HISTORY_KEY = 'authentic-kopitiam-undo-history';
---
Implementation Checklist:
- [ ] Define StoredData interface with timestamp and expiresAt
- [ ] Define PersistenceConfig (cartRetentionDays: 30, undoRetentionDays: 7)
- [ ] Define PersistenceService interface
- [ ] Create persistenceService object:
  - [ ] Implement get function:
    - [ ] Parse localStorage value
    - [ ] Check if expiresAt > current time
    - [ ] Return data or null
  - [ ] Implement set function:
    - [ ] Create timestamp (Date.now())
    - [ ] Calculate expiresAt (timestamp + retentionDays * 24 * 60 * 60 * 1000)
    - [ ] Wrap data in StoredData object
    - [ ] Store in localStorage
  - [ ] Implement remove function:
    - [ ] Delete key from localStorage
  - [ ] Implement clearExpired function:
    - [ ] Iterate all localStorage keys
    - [ ] Parse each as StoredData
    - [ ] Remove if expiresAt < current time
  - [ ] Implement clearAll function:
    - [ ] Clear all localStorage
- [ ] Define CART_KEY constant
- [ ] Define UNDO_HISTORY_KEY constant
- [ ] Create initialization function:
  - [ ] Call clearExpired on app init
  - [ ] Export as initializePersistence
- [ ] Add error handling (try/catch for localStorage)
- [ ] Handle localStorage not available (SSR)
- [ ] Add TypeScript type exports
- [ ] Export persistenceService
- [ ] Export constants
---
Success Criteria:
- [ ] get returns stored data if not expired
- [ ] get returns null if expired
- [ ] get returns null if key doesn't exist
- [ ] set stores data with timestamp
- [ ] set calculates correct expiresAt (retentionDays * 24h)
- [ ] remove deletes key from localStorage
- [ ] clearExpired removes all expired entries
- [ ] clearExpired keeps non-expired entries
- [ ] clearAll removes all entries
- [ ] Cart data expires after 30 days
- [ ] Undo history expires after 7 days
- [ ] initializePersistence runs on app init
- [ ] Error handling works for localStorage failures
- [ ] Works in SSR (doesn't crash)
- [ ] TypeScript compiles without errors
- [ ] All functions are type-safe
---
Task P3-8: Create Cart Undo Toast
File to Create: /frontend/src/components/ui/cart-undo-toast.tsx
Purpose: Create specialized toast component for cart actions with undo functionality. Displays when item is removed from cart, showing what was removed and providing undo button with keyboard shortcut hint.
---
Features:
- Specialized toast for cart removal actions
- Display removed item name
- Undo button to restore item
- Keyboard shortcut hint (Ctrl+Z / Cmd+Z)
- Integration with toast manager
- Auto-dismiss (longer timeout, 10 seconds)
- Retro styling matching design system
---
Interfaces & Props:
import { ReactNode } from 'react';
interface CartUndoToastProps {
  itemName: string;
  onUndo: () => void;
}
interface CartUndoToastComponent {
  (props: CartUndoToastProps): ReactNode;
}
---
Implementation Checklist:
- [ ] Add 'use client' directive
- [ ] Define CartUndoToastProps interface
- [ ] Create CartUndoToast component
- [ ] Display message: "Removed itemName from cart"
- [ ] Add undo button
- [ ] Add keyboard shortcut hint "(Ctrl+Z / Cmd+Z)"
- [ ] Implement undo button click handler:
  - [ ] Call onUndo callback
  - [ ] Dismiss toast
- [ ] Add keyboard shortcut listener (Ctrl+Z / Cmd+Z)
  - [ ] Trigger onUndo when shortcut pressed
  - [ ] Dismiss toast
  - [ ] Prevent default browser undo
- [ ] Apply retro styling
- [ ] Add hover and focus states
- [ ] Ensure component is accessible
- [ ] Export component
- [ ] Create helper function: showCartUndoToast(itemName, onUndo) that uses toastManager
---
Success Criteria:
- [ ] Toast displays with correct message
- [ ] Item name displays correctly
- [ ] Undo button appears
- [ ] Undo button triggers onUndo when clicked
- [ ] Keyboard shortcut hint displays correctly
- [ ] Ctrl+Z triggers undo
- [ ] Cmd+Z triggers undo
- [ ] Browser default undo is prevented
- [ ] Toast auto-dismisses after 10 seconds
- [ ] Toast dismisses on undo action
- [ ] Retro styling matches design system
- [ ] Button hover and focus states work
- [ ] Component is keyboard accessible
- [ ] Component renders without hydration errors
- [ ] TypeScript compiles without errors
---
Task P3-9: Create Keyboard Shortcuts Hook
File to Create: /frontend/src/components/ui/keyboard-shortcuts.tsx
Purpose: Create custom React hook for keyboard shortcuts. Detects Ctrl+Z/Cmd+Z for undo and Escape key for closing modals.
---
Features:
- Ctrl+Z / Cmd+Z detection for undo
- Escape key detection for closing modals
- Prevent default browser behavior when needed
- Cleanup listeners on unmount
- Type-safe key combination detection
---
Interfaces & Props:
interface KeyboardShortcutsConfig {
  onUndo?: () => void;
  onClose?: () => void;
  preventDefault?: boolean;
}
interface UseKeyboardShortcutsResult {
  undoAvailable: boolean;
}
export const useKeyboardShortcuts = (config: KeyboardShortcutsConfig): UseKeyboardShortcutsResult;
---
Implementation Checklist:
- [ ] Define KeyboardShortcutsConfig interface
- [ ] Define UseKeyboardShortcutsResult interface
- [ ] Import useCartStore to check undoAvailable
- [ ] Create useKeyboardShortcuts hook:
  - [ ] Destructure config (onUndo, onClose, preventDefault)
  - [ ] Add useEffect for keyboard listeners:
    - [ ] Add keydown event listener
    - [ ] Check for Ctrl+Z or Cmd+Z:
      - [ ] If undoAvailable and onUndo: call onUndo()
      - [ ] If preventDefault: event.preventDefault()
    - [ ] Check for Escape:
      - [ ] If onClose: call onClose()
      - [ ] If preventDefault: event.preventDefault()
  - [ ] Cleanup event listener on unmount
  - [ ] Return undoAvailable from cart store
- [ ] Add TypeScript types
- [ ] Export hook
---
Success Criteria:
- [ ] Ctrl+Z triggers onUndo when undoAvailable is true
- [ ] Cmd+Z triggers onUndo when undoAvailable is true
- [ ] Ctrl+Z does nothing when undoAvailable is false
- [ ] Cmd+Z does nothing when undoAvailable is false
- [ ] Escape triggers onClose when onClose is defined
- [ ] preventDefault stops browser default undo
- [ ] Event listeners are cleaned up on unmount
- [ ] undoAvailable returns correct state
- [ ] Hook works without memory leaks
- [ ] TypeScript compiles without errors
---
Task P3-10: Create Expiration Service
File to Create: /frontend/src/store/expiration.ts
Purpose: Create localStorage cleanup service for PDPA compliance. Manages 30-day cart data retention and 7-day undo history expiration with timestamp-based cleanup on app initialization.
---
Features:
- 30-day expiration for cart data (PDPA requirement)
- 7-day expiration for undo history
- Cleanup on app initialization
- Timestamp-based filtering
- Integration with persistence service
- Type-safe key management
---
Interfaces & Props:
interface ExpirationConfig {
  cartRetentionDays: number;  // 30
  undoRetentionDays: number;   // 7
}
interface ExpirationService {
  cleanupCartData(): void;
  cleanupUndoHistory(): void;
  cleanupAll(): void;
  initializeCleanup(): void;
}
export const expirationService: ExpirationService;
---
Implementation Checklist:
- [ ] Define ExpirationConfig (cartRetentionDays: 30, undoRetentionDays: 7)
- [ ] Define ExpirationService interface
- [ ] Import persistenceService
- [ ] Import CART_KEY and UNDO_HISTORY_KEY
- [ ] Create expirationService object:
  - [ ] Implement cleanupCartData:
    - [ ] Get cart data using persistenceService.get
    - [ ] Check if expired
    - [ ] If expired: persistenceService.remove(CART_KEY)
  - [ ] Implement cleanupUndoHistory:
    - [ ] Get undo history using persistenceService.get
    - [ ] Filter actions older than 7 days
    - [ ] Update with filtered data or remove if empty
  - [ ] Implement cleanupAll:
    - [ ] Call cleanupCartData
    - [ ] Call cleanupUndoHistory
  - [ ] Implement initializeCleanup:
    - [ ] Call cleanupAll on init
- [ ] Add error handling (try/catch)
- [ ] Add TypeScript types
- [ ] Export expirationService
- [ ] Export ExpirationConfig
---
Success Criteria:
- [ ] cleanupCartData removes cart data older than 30 days
- [ ] cleanupCartData keeps cart data younger than 30 days
- [ ] cleanupUndoHistory removes actions older than 7 days
- [ ] cleanupUndoHistory keeps actions younger than 7 days
- [ ] cleanupAll calls both cleanup functions
- [ ] initializeCleanup runs on app init
- [ ] Cart data is removed after 30 days of inactivity
- [ ] Undo history is removed after 7 days
- [ ] Error handling works for failures
- [ ] TypeScript compiles without errors
---
Task P3-11: Integration Testing
Files to Update: Multiple files (existing files)
Purpose: Comprehensive testing of all interactive features from Phase 3. Ensures all components integrate correctly, state management works, persistence functions, and user experience is seamless.
---
Features:
- Cart state persistence across page refreshes
- Filter URL state persistence
- Undo/redo functionality
- Toast notifications
- Keyboard shortcuts
- PDPA compliance (30/7 day retention)
- GST calculations (9%, 4-decimal precision)
- Component integration
---
Implementation Checklist:
Cart Store Testing:
- [ ] Test adding items to cart
- [ ] Test removing items from cart
- [ ] Test updating quantities
- [ ] Test clearing cart
- [ ] Test undo functionality (reverts last action)
- [ ] Test redo functionality (restores undone action)
- [ ] Test history limit (max 10 actions)
- [ ] Test canUndo and canRedo state
- [ ] Test GST calculation (9%, 4 decimals)
- [ ] Test subtotal calculation
- [ ] Test total calculation
- [ ] Test cart persists to localStorage
- [ ] Test cart loads from localStorage
- [ ] Test cart expiration after 30 days
Filter Store Testing:
- [ ] Test filter defaults to 'All'
- [ ] Test changing filter updates state
- [ ] Test URL updates when filter changes
- [ ] Test filter loads from URL on page load
- [ ] Test all category values work
Cart Overlay Testing:
- [ ] Test cart opens when button clicked
- [ ] Test cart closes when close button clicked
- [ ] Test cart closes on escape key
- [ ] Test cart closes when clicking outside
- [ ] Test cart items display correctly
- [ ] Test GST breakdown displays correctly
- [ ] Test clear cart button works
- [ ] Test checkout button disabled when empty
- [ ] Test checkout button enabled when items exist
- [ ] Test ARIA attributes present
- [ ] Test keyboard navigation
Toast Notifications Testing:
- [ ] Test toast appears
- [ ] Test multiple toasts stack
- [ ] Test toast auto-dismisses after 5s
- [ ] Test close button dismisses toast
- [ ] Test undo button works
- [ ] Test undo text displays
- [ ] Test variants display correctly
- [ ] Test clearAll removes all toasts
- [ ] Test max 5 concurrent toasts
Filter Buttons Testing:
- [ ] Test all buttons display
- [ ] Test active styling
- [ ] Test clicking updates filter
- [ ] Test URL updates
- [ ] Test filter persists on refresh
- [ ] Test keyboard navigation
- [ ] Test ARIA pressed attribute
Add-to-Cart Button Testing:
- [ ] Test button displays correctly
- [ ] Test loading state shows
- [ ] Test disabled state works
- [ ] Test adding item works
- [ ] Test toast appears with feedback
- [ ] Test error handling
- [ ] Test ARIA attributes
Persistence Layer Testing:
- [ ] Test get returns data if not expired
- [ ] Test get returns null if expired
- [ ] Test set stores with timestamp
- [ ] Test remove deletes key
- [ ] Test clearExpired removes expired
- [ ] Test clearExpired keeps valid
- [ ] Test clearAll removes all
- [ ] Test 30-day expiration works
- [ ] Test 7-day expiration works
- [ ] Test init cleanup runs
Cart Undo Toast Testing:
- [ ] Test toast displays with message
- [ ] Test undo button works
- [ ] Test keyboard hint displays
- [ ] Test Ctrl+Z triggers undo
- [ ] Test Cmd+Z triggers undo
- [ ] Test toast dismisses on undo
- [ ] Test auto-dismiss after 10s
Keyboard Shortcuts Testing:
- [ ] Test Ctrl+Z triggers undo when available
- [ ] Test Cmd+Z triggers undo when available
- [ ] Test Ctrl+Z does nothing when unavailable
- [ ] Test Escape triggers onClose
- [ ] Test preventDefault works
- [ ] Test cleanup on unmount
Expiration Service Testing:
- [ ] Test cleanupCartData works
- [ ] Test cleanupUndoHistory works
- [ ] Test cleanupAll works
- [ ] Test init cleanup runs
- [ ] Test 30-day cart expiration
- [ ] Test 7-day undo expiration
Integration Testing:
- [ ] Test cart persists across page refreshes
- [ ] Test filters maintain URL state across refreshes
- [ ] Test undo/redo works across all cart operations
- [ ] Test toasts integrate with cart store
- [ ] Test keyboard shortcuts integrate with cart store
- [ ] Test PDPA compliance (30/7 day retention)
- [ ] Test GST calculations are accurate
- [ ] Test all components work together
- [ ] Test user flows end-to-end
---
Success Criteria:
- [ ] All cart store tests pass
- [ ] All filter store tests pass
- [ ] All cart overlay tests pass
- [ ] All toast notification tests pass
- [ ] All filter button tests pass
- [ ] All add-to-cart button tests pass
- [ ] All persistence layer tests pass
- [ ] All cart undo toast tests pass
- [ ] All keyboard shortcuts tests pass
- [ ] All expiration service tests pass
- [ ] All integration tests pass
- [ ] Cart persists across page refreshes
- [ ] Filters maintain URL state
- [ ] Undo/redo works correctly
- [ ] Toasts work with cart operations
- [ ] Keyboard shortcuts work
- [ ] PDPA compliance verified (30/7 day retention)
- [ ] GST calculations accurate (9%, 4 decimals)
- [ ] All components integrate correctly
- [ ] User flows work end-to-end
- [ ] All components WCAG AAA compliant
- [ ] All animations respect reduced motion
- [ ] TypeScript compiles without errors
- [ ] Build completes successfully
- [ ] No console errors
---
PHASE 2 BUILD ISSUES TO RESOLVE
Issue 1: Duplicate Font Definitions in /frontend/src/lib/fonts.ts
Current Problem: Both Fraunces and DM_Sans are defined multiple times as local font definitions.
Root Cause: File has duplicate exports of the same fonts with different variable names.
Fix:
1. Open /frontend/src/lib/fonts.ts
2. Remove duplicate Fraunces definitions
3. Remove duplicate DM_Sans definitions
4. Keep only one export of each font
5. Ensure each font is exported exactly once
---
Issue 2: Styled-JSX Compatibility with Next.js 13+
Current Problem: Server components using styled jsx global without 'use client' directive. Next.js 13+ requires 'use client' for any styled-jsx usage.
Affected Components:
- sunburst-background.tsx
- bean-bounce.tsx
- Other animation components using styled-jsx
Fix Options:
1. Option A (Recommended): Convert to client components
   - Add 'use client'; at the top of each file
   - Ensure no server-side data fetching in these components
2. Option B: Use inline styles instead of styled-jsx
   - Replace <style jsx> with inline style objects
   - Replace <style jsx global> with Tailwind classes or CSS modules
3. Option C: Use CSS-in-JS library (styled-components, emotion)
   - Add library dependency
   - Refactor components to use new library
Recommended: Option A for simplicity, or Option B for better performance.
---
Issue 3: Import Path Conflicts
Current Problem: Components importing from @/components/animations/animated-section which doesn't exist or has incorrect exports.
Affected Components:
- hero-stats.tsx (already fixed)
- Other components with similar imports
Fix:
1. Replace imports of @/components/animations/animated-section with @/hooks/use-in-view
2. Update component implementations to use use-in-view hook
3. Verify all imports resolve correctly
---
Issue 4: Missing react-dom Dependency
Current Problem: react-dom package missing or version mismatch.
Fix: Run npm install react-dom --legacy-peer-deps --force
---
VALIDATION CHECKPOINT
Phase 3 is complete when:
Code Implementation:
- [ ] All 11 tasks implemented (P3-1 through P3-11)
- [ ] Cart store has undo/redo with 10-action history
- [ ] Filter store maintains URL state
- [ ] Cart overlay displays GST breakdown
- [ ] Toast notification system works
- [ ] Filter buttons persist state to URL
- [ ] Add-to-cart button has loading state
- [ ] Persistence layer manages 30/7-day retention
- [ ] Cart undo toast integrates keyboard shortcuts
- [ ] Expiration service cleans up localStorage
- [ ] All integration tests pass
Accessibility & Compliance:
- [ ] All components WCAG AAA compliant (7:1 contrast)
- [ ] All animations respect prefers-reduced-motion
- [ ] All components have proper ARIA attributes
- [ ] All components are keyboard navigable
- [ ] GST calculations are accurate (9%, 4-decimal precision)
- [ ] PDPA compliance verified (30-day cart, 7-day undo)
Code Quality:
- [ ] All TypeScript files compile without errors
- [ ] All ESLint rules pass
- [ ] No console errors in browser
- [ ] No hydration errors
- [ ] Component library discipline maintained (using shadcn/radix primitives where applicable)
- [ ] No duplicate code
- [ ] Proper error handling
Build & Deployment:
- [ ] npm run build completes successfully
- [ ] npm run lint passes
- [ ] npm run typecheck passes
- [ ] All Phase 2 build errors resolved
- [ ] Application runs in development mode
- [ ] Application runs in production mode
User Experience:
- [ ] Cart operations feel smooth and responsive
- [ ] Undo/redo works intuitively
- [ ] Toasts provide clear feedback
- [ ] Keyboard shortcuts work naturally
- [ ] Filters update URL and maintain state
- [ ] Cart overlay is easy to use
- [ ] All animations are smooth
- [ ] Retro styling is consistent
Phase 2 Prerequisites:
- [ ] Duplicate font definitions in fonts.ts resolved
- [ ] Styled-JSX compatibility issues resolved
- [ ] Import path conflicts resolved
- [ ] Missing react-dom package installed
- [ ] Phase 2 build passes successfully
---
NEXT STEPS
Immediate Actions:
1. Resolve Phase 2 Build Errors (Required before Phase 3 implementation):
   - Fix duplicate font definitions in /frontend/src/lib/fonts.ts
   - Fix styled-jsx compatibility issues (add 'use client' or use inline styles)
   - Fix import path conflicts
   - Install missing react-dom package
   - Run npm run build and verify success
2. Begin Phase 3 Implementation (after build fixes):
   - Implement Task P3-1: Enhance Cart Store
   - Implement Task P3-2: Create Filter Store
   - Implement Task P3-3: Create Cart Overlay
   - Implement Task P3-4: Create Toast Notifications
   - Implement Task P3-5: Create Filter Buttons
   - Implement Task P3-6: Create Add-to-Cart Button
   - Implement Task P3-7: Create Persistence Layer
   - Implement Task P3-8: Create Cart Undo Toast
   - Implement Task P3-9: Create Keyboard Shortcuts Hook
   - Implement Task P3-10: Create Expiration Service
   - Implement Task P3-11: Integration Testing
3. Validation & Testing:
   - Run all tests
   - Verify all success criteria
   - Check accessibility compliance
   - Verify PDPA compliance
   - Test end-to-end user flows
---
RISK ASSESSMENT
High Risks:
1. Phase 2 Build Errors: Unresolved build issues could block Phase 3 implementation
   - Mitigation: Resolve all Phase 2 build errors before starting Phase 3
2. Zustand Integration: Potential issues with Zustand middleware (persistence, devtools)
   - Mitigation: Test each store feature incrementally
3. localStorage Limitations: Browser localStorage has size limits (5-10MB)
   - Mitigation: Implement data minimization and cleanup
4. Server-Side Rendering (SSR): localStorage not available during SSR
   - Mitigation: Add guards to prevent SSR crashes
Medium Risks:
1. nuqs URL State: Potential issues with URL state persistence
   - Mitigation: Test URL state thoroughly with browser back/forward
2. Keyboard Shortcut Conflicts: Browser default shortcuts may interfere
   - Mitigation: Prevent default behavior carefully
3. Animation Performance: Multiple animations may impact performance
   - Mitigation: Test on low-end devices, use GPU acceleration
Low Risks:
1. TypeScript Type Safety: Potential type mismatches
   - Mitigation: Enable strict TypeScript, use unknown over any
2. Third-Party Library Updates: Breaking changes in dependencies
   - Mitigation: Pin dependency versions, review changelogs
---
DEPENDENCIES
Phase 2 Dependencies (Must be resolved):
- Phase 2 (Frontend Architecture) ✅ COMPLETED
- Phase 2 build errors ❌ UNRESOLVED
Phase 3 Internal Dependencies:
- P3-1 (Cart Store) must be completed before P3-3, P3-6, P3-8, P3-9, P3-11
- P3-2 (Filter Store) must be completed before P3-5, P3-11
- P3-4 (Toast Notifications) must be completed before P3-8, P3-11
- P3-7 (Persistence Layer) must be completed before P3-1, P3-10, P3-11
- P3-9 (Keyboard Shortcuts) must be completed before P3-8, P3-11
- P3-10 (Expiration Service) must be completed before P3-11
External Dependencies:
- Zustand (state management)
- nuqs (URL state)
- lucide-react (icons)
- next/navigation (Next.js hooks)
- Next.js 13+ (app router)
Next Phase Dependencies:
Phase 3 blocks Phase 4 (Backend Domain Model & API Contracts)
---
ESTIMATION BREAKDOWN
| Task ID | Task Name | Estimated Effort |
|----------|----------|-----------------|
| P3-1 | Enhance Cart Store | 2 hours |
| P3-2 | Create Filter Store | 1 hour |
| P3-3 | Create Cart Overlay | 2 hours |
| P3-4 | Create Toast Notifications | 2 hours |
| P3-5 | Create Filter Buttons | 1 hour |
| P3-6 | Create Add-to-Cart Button | 1 hour |
| P3-7 | Create Persistence Layer | 1.5 hours |
| P3-8 | Create Cart Undo Toast | 1 hour |
| P3-9 | Create Keyboard Shortcuts | 1 hour |
| P3-10 | Create Expiration Service | 1.5 hours |
| P3-11 | Integration Testing | 3 hours |
| Total | | 17 hours |
---
ACCEPTANCE CRITERIA
Phase 3 is accepted when:
1. All Tasks Complete: All 11 tasks (P3-1 through P3-11) are implemented
2. All Success Criteria Met: All success criteria for each task are verified
3. All Tests Pass: All integration tests pass
4. No Build Errors: Application builds successfully without errors
5. No Runtime Errors: Application runs without console errors
6. Accessibility Verified: All components meet WCAG AAA standards
7. PDPA Compliant: Data retention policies are implemented correctly
8. User Experience Smooth: All interactions feel responsive and intuitive
9. Code Quality: Code follows best practices and is maintainable
10. Documentation Updated: All code is documented and easy to understand
---
END OF PHASE 3 DETAILED SUB-PLAN
This sub-plan provides comprehensive guidance for implementing all interactive components and state management features in Phase 3. Follow each task's checklist and verify all success criteria before proceeding to the next task.
Recommended Next Action: Resolve Phase 2 build errors, then proceed with Task P3-1 implementation.
