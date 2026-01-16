'use client';

import { useInView } from '@/hooks/use-in-view';

interface HeroStatsProps {
  number: string | number;
  label: string;
  delay?: number;
}

export function HeroStats({
  number,
  label,
  delay = 0,
}: HeroStatsProps) {
  const [isVisible, setIsVisible] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <div
      className="stat"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: `opacity 0.5s var(--ease-smooth), transform 0.5s var(--ease-smooth)`,
        transitionDelay: `${delay}ms`,
      }}
    >
      <span className="stat__number">{number}</span>
      <span className="stat__label">{label}</span>
    </div>
  );
}
