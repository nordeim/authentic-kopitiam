'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const RetroDropdownMenu = DropdownMenu.Root;

const RetroDropdownMenuTrigger = forwardRef<
  React.ElementRef<typeof DropdownMenu.Trigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenu.Trigger>
>(({ className, ...props }, ref) => (
  <DropdownMenu.Trigger
    ref={ref}
    className={cn(
      'flex items-center justify-center whitespace-nowrap rounded-md text-base font-display font-medium transition-all duration-fast ease-smooth focus-visible outline-none disabled:pointer-events-none disabled:opacity-50',
      className
    )}
    {...props}
  />
));

RetroDropdownMenuTrigger.displayName = DropdownMenu.Trigger.displayName;

interface RetroDropdownMenuContentProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenu.Content> {
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
}

const RetroDropdownMenuContent = forwardRef<
  React.ElementRef<typeof DropdownMenu.Content>,
  RetroDropdownMenuContentProps
>(({ className, align = 'start', side = 'bottom', ...props }, ref) => (
  <DropdownMenu.Content
    ref={ref}
    align={align}
    side={side}
    className={cn(
      'min-w-[12rem] overflow-hidden rounded-lg border-2 border-terracotta-warm bg-cream-white p-1 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out z-50',
      className
    )}
    {...props}
  />
));

RetroDropdownMenuContent.displayName = DropdownMenu.Content.displayName;

const RetroDropdownMenuItem = forwardRef<
  React.ElementRef<typeof DropdownMenu.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenu.Item>
>(({ className, children, ...props }, ref) => (
  <DropdownMenu.Item
    ref={ref}
    className={cn(
      'relative flex select-none items-center rounded-md px-4 py-2 text-sm font-body outline-none transition-colors duration-fast ease-smooth focus:bg-honey-light focus:text-terracotta-warm data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer',
      className
    )}
    {...props}
  >
    {children}
  </DropdownMenu.Item>
));

RetroDropdownMenuItem.displayName = DropdownMenu.Item.displayName;

const RetroDropdownMenuSeparator = forwardRef<
  React.ElementRef<typeof DropdownMenu.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenu.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenu.Separator
    ref={ref}
    className={cn(
      '-mx-1 my-1 h-px bg-honey-light',
      className
    )}
    {...props}
  />
));

RetroDropdownMenuSeparator.displayName = DropdownMenu.Separator.displayName;

const RetroDropdownMenuLabel = forwardRef<
  React.ElementRef<typeof DropdownMenu.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenu.Label>
>(({ className, children, ...props }, ref) => (
  <DropdownMenu.Label
    ref={ref}
    className={cn(
      'px-4 py-2 text-xs font-display font-bold text-mocha-medium/60 uppercase tracking-wider',
      className
    )}
    {...props}
  >
    {children}
  </DropdownMenu.Label>
));

RetroDropdownMenuLabel.displayName = DropdownMenu.Label.displayName;

const RetroDropdownMenuCheckboxItem = forwardRef<
  React.ElementRef<typeof DropdownMenu.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenu.CheckboxItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenu.CheckboxItem
    ref={ref}
    className={cn(
      'relative flex select-none items-center rounded-md px-4 py-2 text-sm font-body outline-none transition-colors duration-fast ease-smooth focus:bg-honey-light focus:text-terracotta-warm data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer',
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
      <DropdownMenu.ItemIndicator>
        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 3L3 9l-1 1" />
          <path d="M9 3l3 3" />
          <path d="M3 9l3 3" />
        </svg>
      </DropdownMenu.ItemIndicator>
    </span>
    <span className="pl-6">{children}</span>
  </DropdownMenu.CheckboxItem>
));

RetroDropdownMenuCheckboxItem.displayName = DropdownMenu.CheckboxItem.displayName;

export {
  RetroDropdownMenu,
  RetroDropdownMenuTrigger,
  RetroDropdownMenuContent,
  RetroDropdownMenuItem,
  RetroDropdownMenuSeparator,
  RetroDropdownMenuLabel,
  RetroDropdownMenuCheckboxItem,
};
