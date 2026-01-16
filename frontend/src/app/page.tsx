'use client';

import { SunburstBackground } from '@/components/animations/sunburst-background';
import { FloatingCoffeeCup } from '@/components/animations/floating-coffee-cup';
import { HeroStats } from '@/components/animations/hero-stats';
import { WaveDivider } from '@/components/ui/wave-divider';
import { AnimatedSection } from '@/components/ui/animated-section';
import { RetroButton } from '@/components/ui/retro-button';

export default function HeroPage() {
  return (
    <section id="hero" className="hero">
      <SunburstBackground />
      <div className="container">
        <AnimatedSection delay={0} className="hero__content">
          <div className="hero__badge">
            <svg className="hero__badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" />
            </svg>
            <span>Est. 1973 • Singapore Heritage</span>
          </div>

          <h1 className="hero__title">
            Where Singapore's
            <span className="hero__title-highlight">Morning Ritual</span>
            Begins
          </h1>

          <p className="hero__subtitle">
            Experience the perfect blend of tradition and modernity in every cup. Crafted with love since 1973, our kopi tells the story of Singapore's kopitiam heritage.
          </p>

          <div className="hero__ctas">
            <RetroButton variant="primary" onClick={() => window.location.hash = '#menu'}>
              Explore Menu
            </RetroButton>
            <RetroButton variant="secondary" onClick={() => window.location.hash = '#order'}>
              Order Online
            </RetroButton>
          </div>

          <div className="hero__stats">
            <HeroStats number="50+" label="Years of Craft" />
            <HeroStats number="1000+" label="Daily Brews" />
            <HeroStats number="3" label="Locations" />
          </div>
        </AnimatedSection>
      </div>

      <FloatingCoffeeCup />

      <WaveDivider />
    </section>
  );
}
