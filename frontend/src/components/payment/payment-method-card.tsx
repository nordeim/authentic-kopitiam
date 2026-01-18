import * as React from 'react';
import { cn } from '@/lib/utils';

interface PaymentMethodCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  secondaryIcon?: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
  recommended?: boolean;
  disabled?: boolean;
}

export function PaymentMethodCard({
  id,
  title,
  description,
  icon,
  secondaryIcon,
  selected,
  onSelect,
  recommended = false,
  disabled = false,
}: PaymentMethodCardProps) {
  return (
    <div
      className={cn(
        'relative group cursor-pointer transition-all duration-300',
        'rounded-xl p-6 border-2',
        'bg-gradient-to-br from-[rgb(255,245,230)] to-[#FFFDF6]', // latte-cream gradient
        'border-[rgb(229,215,195)] hover:border-[rgb(255,190,79)]', // golden-hour on hover
        selected && 'border-[rgb(255,107,74)] shadow-lg', // sunrise-coral when selected
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && 'hover:shadow-[0_8px_0_rgba(0,0,0,0.1)] hover:-translate-y-1',
        'focus-within:ring-2 focus-within:ring-[rgb(255,107,74)]'
      )}
      onClick={onSelect}
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      {/* Recommended badge */}
      {recommended && (
        <div className="absolute -top-3 -right-3 z-10">
          <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-[rgb(255,107,74)] shadow-lg">
            RECOMMENDED
          </span>
        </div>
      )}

      {/* Selection indicator */}
      <div className="absolute top-4 right-4">
        <div
          className={cn(
            'w-6 h-6 rounded-full border-4',
            'border-[rgb(229,215,195)]',
            selected && 'border-[rgb(255,107,74)] bg-[rgb(255,107,74)]'
          )}
          aria-hidden="true"
        >
          {selected && (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div
          className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center',
            'bg-[rgb(255,190,79)] text-[rgb(61,35,23)]',
            'transition-all duration-300',
            selected && 'bg-[rgb(255,107,74)] text-white'
          )}
        >
          {icon}
        </div>
        <div className="flex-1">
          <h3
            className={cn(
              'text-lg font-bold font-['Fraunces'] text-[rgb(61,35,23)]',
              selected && 'text-[rgb(255,107,74)]'
            )}
          >
            {title}
          </h3>
          <p className="text-sm text-[rgb(107,90,74)] mt-1">{description}</p>
        </div>
        {secondaryIcon && (
          <div className="w-10 h-10">
            {secondaryIcon}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-3">
        {/* Hidden radio input for accessibility */}
        <input
          type="radio"
          id={id}
          name="payment-method"
          checked={selected}
          onChange={onSelect}
          className="sr-only"
          aria-label={title}
        />

        {disabled && (
          <p className="text-sm text-[rgb(220,38,38)] font-medium">
            This payment method is temporarily unavailable
          </p>
        )}
      </div>

      {/* Selection animation */}
      {selected && (
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute inset-0 rounded-xl ring-2 ring-[rgb(255,107,74)] ring-offset-2 animate-pulse" />
        </div>
      )}
    </div>
  );
}
