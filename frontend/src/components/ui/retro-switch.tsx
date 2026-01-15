'use client';

import * as Switch from '@radix-ui/react-switch';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const RetroSwitch = forwardRef<
  React.ElementRef<typeof Switch.Root>,
  React.ComponentPropsWithoutRef<typeof Switch.Root>
>(({ className, ...props }, ref) => (
  <Switch.Root
    ref={ref}
    className={cn(
      'peer inline-flex h-6 w-12 shrink-0 cursor-pointer items-center rounded-full border-0 bg-honey-light focus-visible outline-none transition-all duration-fast ease-smooth disabled:cursor-not-allowed disabled:opacity-50',
      'data-[state=checked]:bg-terracotta-warm',
      className
    )}
    {...props}
  >
    <Switch.Thumb className="block h-5 w-5 rounded-full bg-cream-white shadow-sm transition-transform duration-fast ease-smooth data-[state=checked]:translate-x-6 focus-visible:outline-none" />
  </Switch.Root>
));

RetroSwitch.displayName = Switch.Root.displayName;

export { RetroSwitch };
