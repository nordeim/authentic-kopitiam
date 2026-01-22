'use client';

import { SunburstBackground } from '@/components/animations/sunburst-background';
import { FloatingCoffeeCup } from '@/components/animations/floating-coffee-cup';
import { HeroStats } from '@/components/animations/hero-stats';
import { WaveDivider } from '@/components/ui/wave-divider';
import { AnimatedSection } from '@/components/ui/animated-section';
import { RetroButton } from '@/components/ui/retro-button';
import { MenuPreview } from '@/components/sections/menu-preview';
import { HeritagePreview } from '@/components/sections/heritage-preview';
import { LocationsPreview } from '@/components/sections/locations-preview';

export default function HeroPage() {
  return (
    <>
      <section id="hero" className="hero min-h-screen flex items-center relative overflow-hidden pt-24 bg-gradient-sunrise">
        <SunburstBackground />
        
        {/* Grain Texture */}
        <div className="absolute inset-0 pointer-events-none opacity-5 z-50 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuOSIgbnVtT2N0YXZlcz0iMyIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiIG9wYWNpdHk9IjAuNSIvPjwvc3ZnPg==')]"></div>

        <div className="container mx-auto px-6">
          <AnimatedSection delay={0} className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-3 bg-espresso-dark text-cream-white px-5 py-3 rounded-full font-display font-bold text-sm mb-6 shadow-md border-2 border-dashed border-sunrise-amber">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" />
              </svg>
              <span>Est. 1973 • Singapore Heritage</span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight text-espresso-dark mb-6">
              Where Singapore's
              <span className="block text-terracotta-warm italic">Morning Ritual</span>
              Begins
            </h1>

            <p className="text-xl text-mocha-medium mb-8 leading-relaxed max-w-lg">
              Experience the perfect blend of tradition and modernity in every cup. Crafted with love since 1973, our kopi tells the story of Singapore's kopitiam heritage.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <RetroButton variant="primary" onClick={() => window.location.hash = '#menu'}>
                Explore Menu
              </RetroButton>
              <RetroButton variant="secondary" onClick={() => window.location.hash = '#order'}>
                Order Online
              </RetroButton>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8 border-t-2 border-dashed border-cinnamon-glow">
              <HeroStats number="50+" label="Years of Craft" />
              <HeroStats number="1000+" label="Daily Brews" />
              <HeroStats number="3" label="Locations" />
            </div>
          </AnimatedSection>
        </div>

        <FloatingCoffeeCup />

        <WaveDivider />
      </section>

      <MenuPreview />
      <HeritagePreview />
      <LocationsPreview />
    </>
  );
}