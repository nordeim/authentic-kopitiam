'use client';

import { type ReactNode } from 'react';
import { FadeIn, type FadeInProps } from '@/components/ui/fade-in';

export interface AnimatedSectionProps extends FadeInProps {
  staggerChildren?: boolean;
  staggerDelay?: number;
  className?: string;
}

export function AnimatedSection({
  children,
  delay = 0,
  duration = 0.5,
  staggerChildren = false,
  staggerDelay = 100,
  className = '',
  threshold = 0.1,
  once = true,
}: AnimatedSectionProps) {
  const childArray = Array.isArray(children) ? children : [children];

  return (
    <div className={className}>
      {childArray.map((child, index) => (
        <FadeIn
          key={index}
          delay={staggerChildren ? delay + (index * staggerDelay) : delay}
          duration={duration}
          threshold={threshold}
          once={once}
        >
          {child}
        </FadeIn>
      ))}
    </div>
  );
}
