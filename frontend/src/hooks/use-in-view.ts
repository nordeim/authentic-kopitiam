'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

export interface UseInViewOptions {
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
  initialInView?: boolean;
}

export function useInView(options: UseInViewOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = false,
    initialInView = false,
  } = options;

  const [inView, setInView] = useState(initialInView);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setInView(entry.isIntersecting);
        setEntry(entry);

        if (triggerOnce && entry.isIntersecting) {
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return {
    ref: elementRef as RefObject<HTMLDivElement>,
    inView,
    entry,
  };
}
