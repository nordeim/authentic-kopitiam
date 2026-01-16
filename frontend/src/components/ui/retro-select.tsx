'use client';

import * as Select from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const RetroSelect = Select.Root;

const RetroSelectTrigger = forwardRef<
  React.ElementRef<typeof Select.Trigger>,
  React.ComponentPropsWithoutRef<typeof Select.Trigger>
>(({ className, children, ...props }, ref) => (
  <Select.Trigger
    ref={ref}
    className={cn(
      'flex h-12 w-full items-center justify-between whitespace-nowrap rounded-md border-2 border-terracotta-warm bg-cream-white px-4 py-2 text-base font-body text-left shadow-sm focus-visible outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-fast ease-smooth'
    )}
    {...props}
  >
    {children}
    <Select.Icon className="h-4 w-4 opacity-50">
      <ChevronDownIcon />
    </Select.Icon>
  </Select.Trigger>
));

RetroSelectTrigger.displayName = Select.Trigger.displayName;

const RetroSelectContent = forwardRef<
  React.ElementRef<typeof Select.Content>,
  React.ComponentPropsWithoutRef<typeof Select.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <Select.Portal>
  <Select.Content
       ref={ref}
       position={position}
       className={cn(
         'relative z-50 min-w-[8rem] overflow-hidden rounded-md border-2 border-terracotta-warm bg-cream-white shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out'
       )}
       {...props}
     >
      <Select.ScrollUpButton className="flex h-6 w-full cursor-default items-center justify-center bg-honey-light/20 hover:bg-honey-light/40 text-espresso-dark">
        <ChevronUpIcon className="h-4 w-4" />
      </Select.ScrollUpButton>
      <Select.Viewport className="p-1">
        {children}
      </Select.Viewport>
      <Select.ScrollDownButton className="flex h-6 w-full cursor-default items-center justify-center bg-honey-light/20 hover:bg-honey-light/40 text-espresso-dark">
        <ChevronDownIcon className="h-4 w-4" />
      </Select.ScrollDownButton>
    </Select.Content>
  </Select.Portal>
));

RetroSelectContent.displayName = Select.Content.displayName;

const RetroSelectLabel = forwardRef<
  React.ElementRef<typeof Select.Label>,
  React.ComponentPropsWithoutRef<typeof Select.Label>
>(({ className, ...props }, ref) => (
  <Select.Label
    ref={ref}
    className={cn(
      'px-4 py-2 text-sm font-display font-bold text-espresso-dark'
    )}
    {...props}
  />
));

RetroSelectLabel.displayName = Select.Label.displayName;

const RetroSelectItem = forwardRef<
  React.ElementRef<typeof Select.Item>,
  React.ComponentPropsWithoutRef<typeof Select.Item>
>(({ className, children, ...props }, ref) => (
  <Select.Item
    ref={ref}
    className={cn(
      'relative flex w-full select-none items-center rounded-sm px-4 py-2 text-sm font-body outline-none transition-colors duration-fast ease-smooth focus:bg-honey-light focus:text-terracotta-warm data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer'
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
      <Select.ItemIndicator>
        <CheckIcon className="h-3.5 w-3.5" />
      </Select.ItemIndicator>
    </span>
    <span className="pl-6">{children}</span>
  </Select.Item>
));

RetroSelectItem.displayName = Select.Item.displayName;

const RetroSelectSeparator = forwardRef<
  React.ElementRef<typeof Select.Separator>,
  React.ComponentPropsWithoutRef<typeof Select.Separator>
>(({ className, ...props }, ref) => (
  <Select.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-honey-light', className)}
    {...props}
  />
));

RetroSelectSeparator.displayName = Select.Separator.displayName;

export {
  RetroSelect,
  RetroSelectTrigger,
  RetroSelectContent,
  RetroSelectLabel,
  RetroSelectItem,
  RetroSelectSeparator,
  RetroSelectValue: Select.Value,
  RetroSelectGroup: Select.Group,
};
