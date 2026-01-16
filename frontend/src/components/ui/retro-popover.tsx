'use client';

import * as Popover from '@radix-ui/react-popover';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const RetroPopover = Popover.Root;

const RetroPopoverTrigger = forwardRef<
  React.ElementRef<typeof Popover.Trigger>,
  React.ComponentPropsWithoutRef<typeof Popover.Trigger>
>(({ className, ...props }, ref) => (
  <Popover.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-md text-base font-medium transition-all duration-fast ease-smooth focus-visible outline-none disabled:pointer-events-none disabled:opacity-50'
    )}
    {...props}
  />
));

RetroPopoverTrigger.displayName = Popover.Trigger.displayName;

interface RetroPopoverContentProps
  extends React.ComponentPropsWithoutRef<typeof Popover.Content> {
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
}

const RetroPopoverContent = forwardRef<
  React.ElementRef<typeof Popover.Content>,
  RetroPopoverContentProps
>(({ className, align = 'center', side = 'bottom', ...props }, ref) => (
  <Popover.Portal>
  <Popover.Content
       ref={ref}
       align={align}
       side={side}
       className={cn(
         'min-w-[16rem] overflow-hidden rounded-xl border-2 border-terracotta-warm bg-cream-white p-6 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out z-50'
       )}
       {...props}
     >
      <Popover.Arrow className="fill-terracotta-warm" />
      {props.children}
    </Popover.Content>
  </Popover.Portal>
));

RetroPopoverContent.displayName = Popover.Content.displayName;

const RetroPopoverClose = forwardRef<
  React.ElementRef<typeof Popover.Close>,
  React.ComponentPropsWithoutRef<typeof Popover.Close>
>(({ className, ...props }, ref) => (
  <Popover.Close
    ref={ref}
    className={cn(
      'absolute right-4 top-4 rounded-full p-2 text-mocha-medium/50 hover:text-mocha-medium transition-colors duration-fast'
    )}
    {...props}
  />
));

RetroPopoverClose.displayName = Popover.Close.displayName;

const RetroPopoverPortal = Popover.Portal;

export {
  RetroPopover,
  RetroPopoverTrigger,
  RetroPopoverContent,
  RetroPopoverClose,
  RetroPopoverPortal,
};
