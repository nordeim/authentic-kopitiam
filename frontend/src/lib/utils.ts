import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx and tailwind-merge
 * Resolves conflicts and deduplicates classes
 *
 * @param inputs - Class values to merge
 * @returns Merged class string
 *
 * @example
 * cn('px-4 py-2', isActive && 'bg-blue-500', 'text-white')
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format price in Singapore Dollars
 * Uses en-SG locale for proper formatting
 *
 * @param amount - Numeric amount in dollars
 * @returns Formatted price string (e.g., "S$12.50")
 *
 * @example
 * formatPrice(12.5) // "S$12.50"
 * formatPrice(1500) // "S$1,500.00"
 */
export function formatPrice(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'S$0.00';
  }

  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Singapore GST rate constant (9%)
 */
const GST_RATE = 0.09;

/**
 * Calculate GST (9%) on amount with 4 decimal precision
 * Aligned with backend DECIMAL(10,4) for precise financial calculations
 *
 * @param amount - Base amount in dollars
 * @returns GST amount rounded to 4 decimal places
 *
 * @example
 * calculateGST(100) // 9.0000
 * calculateGST(12.50) // 1.1250
 * calculateGST(0.99) // 0.0891
 */
export function calculateGST(amount: number): number {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 0;
  }

  const gst = amount * GST_RATE;
  return Math.round(gst * 10000) / 10000;
}

/**
 * Calculate total including GST (9%)
 * Rounds final result to 2 decimal places for display
 *
 * @param amount - Base amount in dollars
 * @returns Total amount with GST, rounded to 2 decimals
 *
 * @example
 * calculateTotalWithGST(100) // 109.00
 * calculateTotalWithGST(12.50) // 13.63
 */
export function calculateTotalWithGST(amount: number): number {
  const gst = calculateGST(amount);
  const total = amount + gst;
  return Math.round(total * 100) / 100;
}

/**
 * Format percentage with specified precision
 *
 * @param value - Numeric value (0-1 for decimal, 0-100 for percent)
 * @param precision - Number of decimal places (default: 2)
 * @returns Formatted percentage string
 *
 * @example
 * formatPercentage(0.75) // "75.00%"
 * formatPercentage(25.5) // "25.50%"
 * formatPercentage(0.857, 1) // "85.7%"
 */
export function formatPercentage(value: number, precision: number = 2): string {
  if (isNaN(value) || value === null || value === undefined) {
    return '0.00%';
  }

  const percentage = value * 100;
  return `${percentage.toFixed(precision)}%`;
}

/**
 * Format date for Singapore locale
 *
 * @param date - Date object or ISO string
 * @returns Formatted date string (e.g., "15 January 2025")
 *
 * @example
 * formatDate(new Date('2025-01-15')) // "15 January 2025"
 * formatDate('2025-01-15T10:30:00') // "15 January 2025"
 */
export function formatDate(date: Date | string): string {
  let dateObj: Date;

  if (typeof date === 'string') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  return new Intl.DateTimeFormat('en-SG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
}

/**
 * Format relative time (e.g., "2 hours ago", "yesterday")
 *
 * @param date - Date object or ISO string
 * @returns Human-readable relative time string
 *
 * @example
 * formatRelativeTime(new Date(Date.now() - 3600000)) // "1 hour ago"
 * formatRelativeTime(new Date(Date.now() - 86400000)) // "1 day ago"
 */
export function formatRelativeTime(date: Date | string): string {
  let dateObj: Date;

  if (typeof date === 'string') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const now = new Date();
  const diff = now.getTime() - dateObj.getTime();
  const diffMs = Math.abs(diff);

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  const rtf = new Intl.RelativeTimeFormat('en-SG', { numeric: 'auto' });

  if (seconds < 60) {
    return rtf.format(-seconds, 'second');
  } else if (minutes < 60) {
    return rtf.format(-minutes, 'minute');
  } else if (hours < 24) {
    return rtf.format(-hours, 'hour');
  } else if (days < 7) {
    return rtf.format(-days, 'day');
  } else if (days < 30) {
    const weeks = Math.floor(days / 7);
    return rtf.format(-weeks, 'week');
  } else if (days < 365) {
    const months = Math.floor(days / 30);
    return rtf.format(-months, 'month');
  } else {
    const years = Math.floor(days / 365);
    return rtf.format(-years, 'year');
  }
}

/**
 * Truncate text with ellipsis at specified length
 *
 * @param text - String to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 *
 * @example
 * truncateText("Hello World", 5) // "Hello..."
 * truncateText("Hi", 10) // "Hi"
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) {
    return text;
  }

  return `${text.substring(0, maxLength)}...`;
}

/**
 * Debounce function execution
 * Delays function execution until wait time has elapsed since last call
 *
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 *
 * @example
 * const debouncedSearch = debounce((query) => search(query), 300);
 * debouncedSearch('coffee');
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function execution
 * Limits function execution to once every limit milliseconds
 *
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 *
 * @example
 * const throttledScroll = throttle(() => updateScrollPosition(), 100);
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  let lastFunc: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;

      lastFunc = setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Format number with locale and optional precision
 *
 * @param value - Numeric value
 * @param locale - Locale string (default: 'en-SG')
 * @param precision - Decimal places (default: 0)
 * @returns Formatted number string
 *
 * @example
 * formatNumber(1234567) // "1,234,567"
 * formatNumber(1234.567, 'en-US', 2) // "1,234.57"
 */
export function formatNumber(
  value: number,
  locale: string = 'en-SG',
  precision: number = 0
): string {
  if (isNaN(value) || value === null || value === undefined) {
    return '0';
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(value);
}

/**
 * Parse string to number safely
 *
 * @param value - String or value to parse
 * @param defaultValue - Default value if parsing fails (default: 0)
 * @returns Parsed number or default
 *
 * @example
 * safeParseNumber("123.45") // 123.45
 * safeParseNumber("invalid", 0) // 0
 */
export function safeParseNumber(
  value: string | number | null | undefined,
  defaultValue: number = 0
): number {
  if (typeof value === 'number') {
    return isNaN(value) ? defaultValue : value;
  }

  if (!value) {
    return defaultValue;
  }

  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Clamp number between min and max values
 *
 * @param value - Number to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped number
 *
 * @example
 * clamp(5, 0, 10) // 5
 * clamp(-5, 0, 10) // 0
 * clamp(15, 0, 10) // 10
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Check if value is between min and max (inclusive)
 *
 * @param value - Number to check
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns True if value is in range
 *
 * @example
 * inRange(5, 0, 10) // true
 * inRange(15, 0, 10) // false
 */
export function inRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}
