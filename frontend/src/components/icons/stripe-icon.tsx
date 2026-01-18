import * as React from 'react';

interface StripeIconProps {
  className?: string;
}

/**
 * Stripe Icon Component
 * Custom SVG icon representing Stripe payment method
 * Styled to match 1970s retro-kopitiam aesthetic
 */
export function StripeIcon({ className }: StripeIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Stripe payment processing"
    >
      {/* Simplified Stripe "S" logo in retro style */}
      <path
        fill="currentColor"
        d="M3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10Z"
        fillOpacity="0.1"
      />
      <path
        fill="currentColor"
        d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2ZM10 16C6.68629 16 4 13.3137 4 10C4 6.68629 6.68629 4 10 4C13.3137 4 16 6.68629 16 10C16 13.3137 13.3137 16 10 16Z"
        fillOpacity="0.2"
      />
      <path
        fill="currentColor"
        d="M7 8C7 6.89543 7.89543 6 9 6H11C12.1046 6 13 6.89543 13 8V12C13 13.1046 12.1046 14 11 14H9C7.89543 14 7 13.1046 7 12V8Z"
        fillOpacity="0.8"
      />
      <path
        fill="currentColor"
        d="M8.5 9.5C8.5 8.94772 8.94772 8.5 9.5 8.5H10.5C11.0523 8.5 11.5 8.94772 11.5 9.5V10.5C11.5 11.0523 11.0523 11.5 10.5 11.5H9.5C8.94772 11.5 8.5 11.0523 8.5 10.5V9.5Z"
        fillOpacity="0.6"
      />
      
      {/* Decorative retro elements */}
      <circle cx="5" cy="5" r="0.5" fill="currentColor" fillOpacity="0.3" />
      <circle cx="15" cy="5" r="0.5" fill="currentColor" fillOpacity="0.3" />
      <circle cx="5" cy="15" r="0.5" fill="currentColor" fillOpacity="0.3" />
      <circle cx="15" cy="15" r="0.5" fill="currentColor" fillOpacity="0.3" />
    </svg>
  );
}

// Alternative: Stripe text logo for badges
export function StripeBadge({ className }: StripeIconProps) {
  return (
    <div className={cn(
      'inline-flex items-center gap-1 px-2 py-1 rounded-full',
      'bg-[rgb(255,245,230)] text-[rgb(107,90,74)] text-xs font-semibold',
      className
    )}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
        <path d="M2 6C2 3.79086 3.79086 2 6 2C8.20914 2 10 3.79086 10 6C10 8.20914 8.20914 10 6 10C3.79086 10 2 8.20914 2 6Z"/>
      </svg>
      Stripe
    </div>
  );
}

// Helper: CSS utility
import { cn } from '@/lib/utils';
