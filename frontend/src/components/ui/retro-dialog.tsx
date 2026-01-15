'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const RetroDialog = Dialog.Root;

const RetroDialogTrigger = Dialog.Trigger;

const RetroDialogPortal = Dialog.Portal;

const RetroDialogClose = Dialog.Close;

const RetroDialogTitle = forwardRef<
  React.ElementRef<typeof Dialog.Title>,
  React.ComponentPropsWithoutRef<typeof Dialog.Title> & { className?: string }
>(({ className, ...props }, ref) => (
  <Dialog.Title
    ref={ref}
    className={cn(
      'font-display text-2xl font-bold text-espresso-dark',
      className
    )}
    {...props}
  />
));

RetroDialogTitle.displayName = Dialog.Title.displayName;

const RetroDialogDescription = forwardRef<
  React.ElementRef<typeof Dialog.Description>,
  React.ComponentPropsWithoutRef<typeof Dialog.Description> & { className?: string }
>(({ className, ...props }, ref) => (
  <Dialog.Description
    ref={ref}
    className={cn(
      'font-body text-base text-mocha-medium',
      className
    )}
    {...props}
  />
));

RetroDialogDescription.displayName = Dialog.Description.displayName;

interface RetroDialogContentProps extends React.ComponentPropsWithoutRef<typeof Dialog.Content> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const RetroDialogContent = forwardRef<
  React.ElementRef<typeof Dialog.Content>,
  RetroDialogContentProps
>(({ className, children, size = 'md', ...props }, ref) => {
  const sizeClasses = {
    sm: 'max-w-[400px]',
    md: 'max-w-[560px]',
    lg: 'max-w-[720px]',
    xl: 'max-w-[960px]',
  };

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-espresso-dark/50 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out">
        <Dialog.Content
          ref={ref}
          className={cn(
            'fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border-3 border-terracotta-warm bg-cream-white p-6 shadow-lg duration-slow ease-smooth data-[state=open]:animate-in data-[state=closed]:animate-out sm:rounded-lg',
            sizeClasses[size],
            className
          )}
          {...props}
        >
          {children}
          <Dialog.Close className="absolute right-4 top-4 rounded-full p-2 text-mocha-medium/50 hover:text-mocha-medium transition-colors duration-fast">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Overlay>
    </Dialog.Portal>
  );
});

RetroDialogContent.displayName = Dialog.Content.displayName;

const RetroDialogHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { className?: string }
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-col space-y-1.5 text-center sm:text-left',
      className
    )}
    {...props}
  />
));

const RetroDialogFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { className?: string }
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className
    )}
    {...props}
  />
));

export {
  RetroDialog,
  RetroDialogTrigger,
  RetroDialogPortal,
  RetroDialogClose,
  RetroDialogContent,
  RetroDialogHeader,
  RetroDialogTitle,
  RetroDialogDescription,
  RetroDialogFooter,
};
