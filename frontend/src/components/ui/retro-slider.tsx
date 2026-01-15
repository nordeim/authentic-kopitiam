'use client';

import * as Slider from '@radix-ui/react-slider';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const RetroSlider = forwardRef<
  React.ElementRef<typeof Slider.Root>,
  React.ComponentPropsWithoutRef<typeof Slider.Root>
>(({ className, defaultValue = [50], ...props }, ref) => (
  <Slider.Root
    ref={ref}
    className={cn('relative flex w-full touch-none select-none items-center', className)}
    defaultValue={defaultValue}
    {...props}
  >
    <Slider.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-honey-light">
      <Slider.Range className="absolute h-full bg-terracotta-warm rounded-full" />
    </Slider.Track>
    <Slider.Thumb
      className={cn(
        'block h-5 w-5 rounded-full bg-terracotta-warm shadow-button transition-all duration-fast ease-smooth focus-visible:outline-none hover:scale-110 cursor-grab',
        'focus-visible:ring-3 ring-coral-pop ring-offset-3'
      )}
    />
  </Slider.Root>
));

RetroSlider.displayName = Slider.Root.displayName;

export { RetroSlider };
