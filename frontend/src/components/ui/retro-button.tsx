'use client';

import * as SlotPrimitive from '@radix-ui/react-slot';
import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-full text-base font-bold transition-all duration-fast ease-smooth focus-visible outline-none disabled:pointer-events-none disabled:opacity-50 disabled:grayscale',
  {
    variants: {
      variant: {
        primary: 'bg-terracotta-warm text-cream-white hover:bg-terracotta-warm-hover hover:-translate-y-px active:translate-y-0 shadow-button',
        secondary: 'bg-espresso-dark text-cream-white hover:bg-espresso-dark-hover hover:-translate-y-px active:translate-y-0 shadow-button',
        outline: 'bg-cream-white text-terracotta-warm border-2 border-terracotta-warm hover:bg-honey-light hover:text-terracotta-warm hover:-translate-y-px active:translate-y-0',
        ghost: 'bg-transparent text-espresso-dark hover:bg-honey-light hover:-translate-y-px active:translate-y-0',
        destructive: 'bg-coral-pop text-cream-white hover:bg-coral-pop-hover hover:-translate-y-px active:translate-y-0 shadow-button',
      },
      size: {
        sm: 'py-1 px-4 text-sm min-h-[36px]',
        md: 'py-2 px-6 text-base min-h-[44px]',
        lg: 'py-3 px-8 text-lg min-h-[52px]',
        xl: 'py-4 px-10 text-xl min-h-[60px]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface RetroButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const RetroButton = forwardRef<HTMLButtonElement, RetroButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? SlotPrimitive.Slot : 'button';

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8 8 0 01-8 8c0 2.21.43 4.21-4 8z"
            />
          </svg>
        ) : (
          children
        )}
      </Comp>
    );
  }
);

RetroButton.displayName = 'RetroButton';

export { RetroButton, buttonVariants };
