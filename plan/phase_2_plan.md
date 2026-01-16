Thinking: The user wants me to proceed with the next phase from the VALIDATED_EXECUTION_PLAN.md, which is Phase 2: Frontend Architecture & Page Structure. They want me to:
1. Create a detailed sub-plan for Phase 2
2. Include a list of files to create or update
3. For each file, include description of features and interfaces
4. Include checklists for each file
5. Follow the meticulous planning approach - plan before executing
Let me first review what Phase 2 entails from the VALIDATED_EXECUTION_PLAN.md:
Phase 2: Frontend Architecture & Page Structure (18 tasks)
Page Structure (9 Tasks)
- P2-1: Create root layout.tsx with ThemeProvider, SkipLink, Header, Footer
- P2-2: Create hero page.tsx as server component with sunburst background, stats, CTAs
- P2-3: Create menu page.tsx with filter buttons and product grid
- P2-4: Create heritage page.tsx as server component with story, quote, values, polaroid gallery
- P2-5: Create locations page.tsx with location cards and map placeholder
- P2-6: Create Header component with sticky nav, cart button, mobile menu toggle
- P2-7: Create Footer component with links, contact info, social media, badges
- P2-8: Create reusable WaveDivider component from SVG (flip orientation support)
- P2-9: Implement mobile menu with proper ARIA attributes, escape key close, click outside close
Decorative Animation Components (9 Tasks)
- P2-10: Create BeanBounce component with animation delays (3 beans with staggered bounce)
- P2-11: Create SteamRise component with staggered particles (3 particles with delays)
- P2-12: Create SunburstBackground component (repeating-conic-gradient with rotation)
- P2-13: Create HeroStats component (stat number + label with fade-in)
- P2-14: Create FloatingCoffeeCup SVG component with gentle float animation
- P2-15: Create MapMarker component with pulse animation for location map
- P2-16: Create PolaroidGallery component with rotation offsets for heritage photos
- P2-17: Create CoffeeRingDecoration component (subtle background pattern element)
- P2-18: Apply fade-in animations to all sections (hero, menu, heritage, locations)
I'll continue developing a comprehensive strategy for implementing these intricate page structure and animation components. The goal is to create a cohesive, visually engaging frontend experience that captures the essence of our project's design language.
The plan involves careful component architecture, ensuring each page and animation element aligns with our aesthetic and technical requirements. I'll focus on modular design, reusable components, and smooth, purposeful animations that enhance user interaction.
Key considerations include responsive layouts, accessibility, and creating a seamless narrative flow across different page sections. Each component will be crafted with attention to detail, from hero sections to location markers, maintaining visual consistency.
The approach prioritizes a clean, structured implementation that can be easily maintained and extended. By breaking down the project into discrete, well-defined components, we ensure flexibility and scalability in our frontend architecture.
Design system integration will be critical, leveraging existing utilities to maintain consistency and reduce development complexity. The goal is to create a seamless, performant user experience that feels intuitive and engaging.
═══════════════════════════════════════════════════════════════════════════════
PHASE 2: FRONTEND ARCHITECTURE & PAGE STRUCTURE — DETAILED SUB-PLAN
═══════════════════════════════════════════════════════════════════════════════
DOCUMENT VERSION: 2.0.0
LAST UPDATED: 2025-01-16
PHASE: Frontend Architecture & Page Structure (18 Tasks)
ESTIMATED EFFORT: 12-16 hours
DEPENDENCIES: Phase 1 (Design System & Token Architecture) ✅ COMPLETED
BLOCKERS FOR: Phase 3 (Interactive Components & State Management)
═══════════════════════════════════════════════════════════════════════════════
TABLE OF CONTENTS
| Task ID | Component/File | Type | Server/Client | Lines Est. |
|----------|---------------|------|---------------|-------------|
| P2-1 | /frontend/src/app/layout.tsx | Root Layout | Server | ~80 |
| P2-2 | /frontend/src/app/page.tsx | Hero Page | Server | ~120 |
| P2-3 | /frontend/src/app/menu/page.tsx | Menu Page | Client | ~140 |
| P2-4 | /frontend/src/app/heritage/page.tsx | Heritage Page | Server | ~150 |
| P2-5 | /frontend/src/app/locations/page.tsx | Locations Page | Client | ~100 |
| P2-6 | /frontend/src/components/layout/header.tsx | Header | Client | ~180 |
| P2-7 | /frontend/src/components/layout/footer.tsx | Footer | Server | ~100 |
| P2-8 | /frontend/src/components/ui/wave-divider.tsx | WaveDivider | Server | ~50 |
| P2-9 | /frontend/src/components/ui/mobile-menu.tsx | MobileMenu | Client | ~80 |
| P2-10 | /frontend/src/components/animations/bean-bounce.tsx | BeanBounce | Server | ~60 |
| P2-11 | /frontend/src/components/animations/steam-rise.tsx | SteamRise | Server | ~55 |
| P2-12 | /frontend/src/components/animations/sunburst-background.tsx | SunburstBackground | Server | ~70 |
| P2-13 | /frontend/src/components/animations/hero-stats.tsx | HeroStats | Client | ~65 |
| P2-14 | /frontend/src/components/animations/floating-coffee-cup.tsx | FloatingCoffeeCup | Server | ~80 |
| P2-15 | /frontend/src/components/animations/map-marker.tsx | MapMarker | Server | ~45 |
| P2-16 | /frontend/src/components/animations/polaroid-gallery.tsx | PolaroidGallery | Server | ~90 |
| P2-17 | /frontend/src/components/animations/coffee-ring-decoration.tsx | CoffeeRingDecoration | Server | ~40 |
| P2-18 | Apply fade-in across all sections | Implementation | N/A | Integration |
---
═══════════════════════════════════════════════════════════════════════════════
PART 1: PAGE STRUCTURE COMPONENTS (Tasks P2-1 through P2-9)
═══════════════════════════════════════════════════════════════════════════════
---
TASK P2-1: ROOT LAYOUT WITH THEME PROVIDER
FILE TO CREATE
/frontend/src/app/layout.tsx
PURPOSE
Root layout component that wraps all pages with ThemeProvider, SkipLink, Header, and Footer. Establishes global layout structure, metadata, and ensures accessibility features are present throughout the application.
FEATURES
- ThemeProvider wrapping for design token injection
- SkipLink implementation for accessibility (focuses main content on tab)
- Header component (sticky navigation)
- Footer component (espresso dark)
- Global metadata (title, description, viewport, theme-color)
- Google Fonts preconnect and preload links
- Font family configuration (Fraunces for display, DM Sans for body)
INTERFACES & PROPS
interface RootLayoutProps {
  children: React.ReactNode;
}
// No external interfaces required
// Uses ThemeProvider from Phase 1
// Uses SkipLink from Phase 1
// Uses Header (P2-6)
// Uses Footer (P2-7)
IMPLEMENTATION CHECKLIST
- [ ] ThemeProvider imported and wraps all children
- [ ] SkipLink component placed at top of body with proper href="#main-content"
- [ ] Header component imported and placed after SkipLink
- [ ] Footer component imported and placed after children
- [ ] Main content wrapped in <main id="main-content"> for accessibility
- [ ] Google Fonts preconnect links included (fonts.googleapis.com, fonts.gstatic.com)
- [ ] Google Fonts link included (Fraunces and DM Sans)
- [ ] Metadata configured:
  - [ ] Title: "Morning Brew Collective - Where Singapore's Morning Ritual Begins"
  - [ ] Description: "Singapore's authentic kopitiam experience since 1973. Traditional coffee, breakfast, and pastries with a modern touch."
  - [ ] Viewport: "width=device-width, initial-scale=1.0"
  - [ ] Theme-color: "#3D2B1F" (espresso-dark)
- [ ] Body background color set to rgb(var(--color-latte-cream))
- [ ] Font family set to DM Sans with Fraunces fallback for headings
- [ ] Antialiasing enabled for fonts
- [ ] Component is Server Component (no 'use client' directive)
- [ ] All imports use absolute paths (@/components, @/styles, etc.)
SUCCESS CRITERIA
- [ ] Skip link appears on first tab press and jumps to main content
- [ ] Header renders at top of all pages with correct styling
- [ ] Footer renders at bottom of all pages with correct styling
- [ ] ThemeProvider successfully injects all design tokens into CSS custom properties
- [ ] Google Fonts load correctly (Fraunces for headings, DM Sans for body)
- [ ] Metadata visible in browser title and social media previews
- [ ] No hydration errors in development console
- [ ] Page structure validates in WAVE/axe accessibility audits
- [ ] Mobile-first responsive layout works across all breakpoints
---
TASK P2-2: HERO PAGE COMPONENT
FILE TO CREATE
/frontend/src/app/page.tsx
PURPOSE
Hero section server component featuring sunburst background, vintage badge, hero headline, subtitle, CTA buttons, stats row, and floating coffee cup illustration. This is the landing page that establishes the 1970s kopitiam atmosphere.
FEATURES
- SunburstBackground component as animated background
- Vintage badge with star icon and "Est. 1973 • Singapore Heritage" text
- Hero headline with inline span for highlight text
- Subtitle paragraph with maximum width constraint
- Dual CTA buttons (Explore Menu, Order Online)
- Hero stats row with three animated statistics (Years, Daily Brews, Locations)
- FloatingCoffeeCup SVG illustration with SteamRise component
- WaveDivider at bottom of section
- AnimatedSection wrapper for scroll-triggered fade-in
INTERFACES & PROPS
interface HeroPageProps {
  // No props - data is static
}
// Uses SunburstBackground (P2-12)
// Uses FloatingCoffeeCup (P2-14)
// Uses SteamRise (P2-11)
// Uses HeroStats (P2-13)
// Uses WaveDivider (P2-8)
// Uses AnimatedSection from Phase 1
// Uses RetroButton from Phase 1
IMPLEMENTATION CHECKLIST
- [ ] Component is Server Component (no 'use client' directive)
- [ ] SunburstBackground component wraps hero content
- [ ] Hero section has id="hero" for navigation
- [ ] Vintage badge implemented:
  - [ ] Inline SVG star icon (24px)
  - [ ] Background: rgb(var(--color-espresso-dark))
  - [ ] Text: "Est. 1973 • Singapore Heritage"
  - [ ] Border: 2px dashed rgb(var(--color-sunrise-amber))
  - [ ] Border radius: var(--radius-full)
  - [ ] Padding: var(--space-3) var(--space-5)
- [ ] Hero headline:
  - [ ] Font: Fraunces (display), size var(--text-5xl), weight 700
  - [ ] Line 1: "Where Singapore's"
  - [ ] Line 2: "Morning Ritual" (wrapped in span with terracotta-warm color, italic)
  - [ ] Line 3: "Begins"
  - [ ] Color: rgb(var(--color-espresso-dark))
  - [ ] Line height: 1.2
- [ ] Subtitle:
  - [ ] Font: DM Sans (body), size var(--text-xl)
  - [ ] Color: rgb(var(--color-coffee-light))
  - [ ] Max width: 550px
  - [ ] Line height: 1.7
- [ ] CTA buttons:
  - [ ] Button 1: "Explore Menu" (primary variant with coral-pop background)
  - [ ] Button 2: "Order Online" (secondary variant with espresso-dark border)
  - [ ] Flex layout with gap var(--space-4)
  - [ ] Flex wrap on mobile
- [ ] Hero stats row:
  - [ ] Grid layout with 3 columns (1 column on mobile)
  - [ ] Border top: 2px dashed rgb(var(--color-cinnamon-glow))
  - [ ] Padding top: var(--space-8)
  - [ ] Each stat:
    - [ ] Number display (font: Fraunces, size clamp(2rem, 4vw, 3rem), weight 800, color terracotta-warm)
    - [ ] Label (font: DM Sans, uppercase, letter-spacing 0.05em, color mocha-medium)
    - [ ] Text centered
- [ ] FloatingCoffeeCup:
  - [ ] Positioned absolute, right: 5%, bottom: 10%
  - [ ] Width: clamp(200px, 30vw, 400px)
  - [ ] Gentle float animation applied
  - [ ] SteamRise component positioned above cup
- [ ] WaveDivider component at bottom
- [ ] AnimatedSection wrapper applies fade-in animation on scroll
- [ ] Container class applied for max-width (1200px) and padding
- [ ] Section min-height: 100vh
- [ ] Padding top: 100px (to account for fixed header)
- [ ] All text content uses design tokens from Phase 1
SUCCESS CRITERIA
- [ ] Sunburst background rotates smoothly (120s cycle) without affecting text readability
- [ ] Hero headline typography matches mockup (Fraunces, size, weight, line height)
- [ ] "Morning Ritual" span has correct color (terracotta-warm) and italic style
- [ ] CTA buttons have correct styling (primary with coral-pop, secondary with outline)
- [ ] Hero stats display with proper typography hierarchy (number: large Fraunces, label: small uppercase)
- [ ] Stats animate in on scroll (fade-in effect from Phase 1)
- [ ] FloatingCoffeeCup floats gently with 6s ease-in-out cycle
- [ ] Steam particles rise with staggered timing (0s, 0.3s, 0.6s delays)
- [ ] Wave divider creates smooth transition to next section
- [ ] Layout is responsive (stats stack on mobile, coffee cup hidden on mobile)
- [ ] Section ID "hero" allows navigation from header links
- [ ] No client-side JavaScript required for initial render
- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] Accessibility: focus states visible, ARIA labels present where needed
- [ ] Reduced motion preference disables all animations
---
TASK P2-3: MENU PAGE COMPONENT
FILE TO CREATE
/frontend/src/app/menu/page.tsx
PURPOSE
Menu page component with filter buttons, product grid, and view full menu link. Displays available coffee and food items with category filtering functionality. This is a client component due to interactive filtering requirements.
FEATURES
- Section header with title, subtitle, and decorative underline
- Filter buttons with active state (All, Coffee, Breakfast, Pastries, Sides)
- Product grid displaying menu cards
- Menu card includes: image placeholder, title, price tag, description, category tag, add-to-cart button
- View full menu link at bottom
- AnimatedSection wrapper for scroll-triggered fade-in
- Empty state handling for filtered results
INTERFACES & PROPS
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number; // in dollars
  category: 'coffee' | 'breakfast' | 'pastries' | 'sides';
  tags: string[];
  imageUrl?: string;
}
interface MenuPageProps {
  // No props - will fetch data from API in Phase 3
}
// Temporary mock data until Phase 3 API integration
const MOCK_MENU_ITEMS: MenuItem[] = [
  {
    id: '1',
    name: 'Kopi O Kosong',
    description: 'Strong black coffee without sugar. The classic Singaporean brew.',
    price: 2.50,
    category: 'coffee',
    tags: ['Hot', 'Classic'],
  },
  // ... more mock items
];
// Uses RetroButton from Phase 1
// Uses AnimatedSection from Phase 1
// Will integrate useFilterStore in Phase 3
// Will integrate AddToCartButton in Phase 3
IMPLEMENTATION CHECKLIST
- [ ] Component is Client Component ('use client' directive)
- [ ] Section has id="menu" for navigation
- [ ] Section background: rgb(var(--color-terracotta-warm))
- [ ] Section header:
  - [ ] Title: "Our Signature Brews" (Fraunces, size var(--text-4xl), color cream-white)
  - [ ] Subtitle: "Crafted with beans roasted in-house since 1973"
  - [ ] Decorative underline: line + icon + line (sunrise-amber color)
- [ ] Filter buttons:
  - [ ] Categories: 'All', 'Coffee', 'Breakfast', 'Pastries', 'Sides'
  - [ ] Default active: 'All'
  - [ ] Flex layout, centered, flex-wrap
  - [ ] Active state: background rgb(var(--color-sunrise-amber)), color espresso-dark, border sunrise-amber
  - [ ] Inactive state: background rgba(255, 255, 255, 0.1), color cream-white
  - [ ] Padding: var(--space-3) var(--space-6)
  - [ ] Border radius: var(--radius-full)
  - [ ] Hover state: background rgba(255, 255, 255, 0.2)
- [ ] Product grid:
  - [ ] CSS Grid: grid-template-columns: repeat(auto-fill, minmax(320px, 1fr))
  - [ ] Gap: var(--space-6)
- [ ] Menu card styling:
  - [ ] Background: rgb(var(--color-cream-white))
  - [ ] Border radius: var(--radius-lg)
  - [ ] Shadow: var(--shadow-lg)
  - [ ] Hover effect: translateY(-8px) rotate(-1deg), shadow + glow
  - [ ] Top border: repeating-linear-gradient with sunrise-amber stripes
- [ ] Menu card content:
  - [ ] Image area: 200px height, gradient background (honey-light to butter-toast)
  - [ ] Title: Fraunces, size 1.375rem, color espresso-dark
  - [ ] Price tag: Fraunces, size 1.25rem, weight 700, color terracotta-warm, background honey-light, rounded-full
  - [ ] Description: DM Sans, size 0.9375rem, color mocha-medium, line-height 1.6
  - [ ] Category tag: uppercase, weight 700, letter-spacing 0.05em, background coral-pop, color cream-white, rounded-full
  - [ ] Add-to-cart button: full width, background espresso-dark, color cream-white, rounded-md, hover coral-pop
- [ ] Empty state:
  - [ ] Displayed when no items match filter
  - [ ] Centered, spans full grid width
  - [ ] Icon + "No items found in this category" message
- [ ] View full menu link:
  - [ ] Styled like button: border 2px solid cream-white, rounded-full, padding
  - [ ] Hover: background cream-white, color terracotta-warm
  - [ ] Font: Fraunces, weight 700
- [ ] AnimatedSection wrapper applies fade-in on scroll
- [ ] Responsive: single column on mobile, 2-3 columns on tablet/desktop
- [ ] Temporarily use mock data (until Phase 3 API integration)
- [ ] Placeholder for filter state management (useState 'All' until Phase 3 Zustand integration)
SUCCESS CRITERIA
- [ ] Filter buttons display all 5 categories
- [ ] Clicking filter button updates active state
- [ ] Product grid re-renders based on selected filter
- [ ] Menu cards display all required information (name, price, description, tag)
- [ ] Menu cards have correct retro styling (top stripe, rounded corners, warm shadows)
- [ ] Hover effects on cards work smoothly (translateY, rotate, shadow)
- [ ] Empty state appears when no items match filter
- [ ] View full menu link at bottom is visible and functional
- [ ] Section fades in when scrolled into viewport
- [ ] All typography uses design tokens (Fraunces for headings, DM Sans for body)
- [ ] Colors match mockup exactly (terracotta-warm background, cream-white cards)
- [ ] Responsive layout works on mobile (single column), tablet (2 columns), desktop (3+ columns)
- [ ] Section ID "menu" allows navigation from header links
- [ ] Accessibility: filter buttons have proper ARIA roles, keyboard navigation works
- [ ] Performance: menu cards render efficiently (no unnecessary re-renders)
- [ ] Reduced motion preference disables hover animations
---
TASK P2-4: HERITAGE PAGE COMPONENT
FILE TO CREATE
/frontend/src/app/heritage/page.tsx
PURPOSE
Heritage storytelling server component with dropcap introduction, vintage quote block, values grid, polaroid photo gallery, and heritage CTA. Preserves the kopitiam's 50-year legacy through narrative and visual storytelling.
FEATURES
- Two-column grid layout (content + gallery) on desktop, single column on mobile
- Dropcap introduction (large initial letter "S")
- Vintage quote block with decorative frame and large quotation mark
- Three-column values grid with icons
- Polaroid-style photo gallery with rotation offsets
- Heritage CTA section (espresso-dark background)
- AnimatedSection wrappers for scroll-triggered animations
INTERFACES & PROPS
interface HeritagePageProps {
  // No props - static content
}
// Uses PolaroidGallery (P2-16)
// Uses AnimatedSection from Phase 1
// Uses RetroButton from Phase 1
interface HeritageValue {
  icon: string; // Emoji or icon name
  title: string;
  description: string;
}
interface PolaroidPhoto {
  id: string;
  caption: string;
  imageUrl?: string;
  rotationOffset: number; // in degrees
}
IMPLEMENTATION CHECKLIST
- [ ] Component is Server Component (no 'use client' directive)
- [ ] Section has id="heritage" for navigation
- [ ] Section background: rgb(var(--color-sunrise-amber))
- [ ] Grid layout:
  - [ ] Desktop: 2 columns (1fr 1fr), gap var(--space-12)
  - [ ] Mobile: 1 column
- [ ] Heritage introduction:
  - [ ] Font: DM Sans, size var(--text-xl), line-height 1.8
  - [ ] Color: rgb(var(--color-espresso-dark))
  - [ ] Dropcap: Fraunces, size 5rem, weight 800, color terracotta-warm, line-height 0.8, float left
  - [ ] Dropcap margin-right: var(--space-4)
- [ ] Quote block:
  - [ ] Background: rgba(255, 255, 255, 0.3)
  - [ ] Border radius: var(--radius-lg)
  - [
