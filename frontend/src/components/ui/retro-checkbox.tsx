'use client';

import * as Checkbox from '@radix-ui/react-checkbox';
import { CheckIcon } from '@radix-ui/react-icons';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const RetroCheckbox = forwardRef<
  React.ElementRef<typeof Checkbox.Root>,
  React.ComponentPropsWithoutRef<typeof Checkbox.Root> & {
    label?: string;
  }
>(({ className, label, ...props }, ref) => {
  return (
    <label className="flex items-center space-x-2 cursor-pointer">
      <Checkbox.Root
        ref={ref}
        className={cn(
          'peer h-5 w-5 shrink-0 cursor-pointer appearance-none rounded-sm border-2 border-terracotta-warm bg-cream-white focus-visible outline-none transition-all duration-fast ease-smooth disabled:cursor-not-allowed disabled:opacity-50',
          'data-[state=checked]:bg-terracotta-warm data-[state=checked]:border-terracotta-warm',
          'data-[state=checked]:after:bg-cream-white',
          className
        )}
        {...props}
      >
        <Checkbox.Indicator className="flex items-center justify-center text-current">
          <CheckIcon className="h-3.5 w-3.5" />
        </Checkbox.Indicator>
      </Checkbox.Root>
      {label && (
        <span className="text-base font-body text-espresso-dark cursor-pointer select-none">
          {label}
        </span>
      )}
    </label>
  );
});

RetroCheckbox.displayName = Checkbox.Root.displayName;

export { RetroCheckbox };
