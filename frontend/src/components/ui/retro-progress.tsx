'use client';

import * as Progress from '@radix-ui/react-progress';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const RetroProgress = forwardRef<
  React.ElementRef<typeof Progress.Root>,
  React.ComponentPropsWithoutRef<typeof Progress.Root>
>(({ className, value = 0, max = 100, ...props }, ref) => (
  <Progress.Root
    ref={ref}
    className={cn('relative h-2 w-full overflow-hidden rounded-full bg-honey-light', className)}
    value={value}
    max={max}
    {...props}
  >
    <Progress.Indicator
      className={cn(
        'h-full w-full flex-1 rounded-full bg-terracotta-warm transition-all duration-normal ease-smooth',
        'data-[state=complete]:animate-pulse'
      )}
      style={{
        transform: `translateX(-${100 - ((value || 0) / max) * 100}%)`,
      }}
    />
  </Progress.Root>
));

RetroProgress.displayName = Progress.Root.displayName;

export { RetroProgress };
