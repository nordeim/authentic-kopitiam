# ═══════════════════════════════════════════════════════════════
# MORNING BREW COLLECTIVE — PHASE 1 DETAILED SUB-PLAN
# ═══════════════════════════════════════════════════════════════
#
# DOCUMENT VERSION: 1.0.0
# LAST UPDATED: 2025-01-15
#
# PURPOSE: This document provides meticulous task-level planning for Phase 1: Design System & Token Architecture. Each task includes file paths, features, interfaces, checklists, and success criteria to guide implementation with precision.
#
# PHASE 1 OVERVIEW
# ─────────────────────────────────────────────────────────────────────────────────────────────
# OBJECTIVE: Extract all design tokens from static HTML mockup and establish a comprehensive design system using Tailwind CSS v4's CSS-first configuration. Create retro-styled Shadcn UI wrappers preserving accessibility.
#
# ESTIMATED EFFORT: 10-14 hours
# DEPENDENCIES: Phase 0 completed
# BLOCKERS FOR: Phase 2 (Frontend Foundation)
# VALIDATION CHECKPOINT: All design tokens extracted, retro components styled, animations configured
# ─────────────────────────────────────────────────────────────────────────────────────────────

## TABLE OF CONTENTS

| Task ID | Task Name | File Path | Priority | Dependencies |
|----------|-----------|-----------|----------|--------------|
| P1-1 | Extract Design Tokens | Analysis document | High | None |
| P1-2 | Create tokens.css | `/frontend/src/styles/tokens.css` | High | P1-1 |
| P1-3 | Create globals.css | `/frontend/src/styles/globals.css` | High | P1-2 |
| P1-4 | Create Tailwind Config | `/frontend/tailwind.config.ts` | High | P1-2 |
| P1-5 | Create Utility Functions | `/frontend/src/lib/utils.ts` | High | P1-2 |
| P1-6 | WCAG AAA Validation | Validation document | High | P1-2 |
| P1-7 | Decorative Patterns | `/frontend/src/styles/patterns.css` | Medium | P1-2 |
| P1-8 | Accessibility Styles | `/frontend/src/styles/accessibility.css` | Medium | P1-2 |
| P1-9 | Retro Dialog Wrapper | `/frontend/src/components/ui/retro-dialog.tsx` | High | P1-2 |
| P1-10 | Retro Button Wrapper | `/frontend/src/components/ui/retro-button.tsx` | High | P1-2 |
| P1-11 | Retro Dropdown Wrapper | `/frontend/src/components/ui/retro-dropdown.tsx` | High | P1-2 |
| P1-12 | Retro Popover Wrapper | `/frontend/src/components/ui/retro-popover.tsx` | High | P1-2 |
| P1-13 | Retro Select Wrapper | `/frontend/src/components/ui/retro-select.tsx` | High | P1-2 |
| P1-14 | Retro Checkbox Wrapper | `/frontend/src/components/ui/retro-checkbox.tsx` | High | P1-2 |
| P1-15 | Retro Switch Wrapper | `/frontend/src/components/ui/retro-switch.tsx` | High | P1-2 |
| P1-16 | Retro Progress Wrapper | `/frontend/src/components/ui/retro-progress.tsx` | High | P1-2 |
| P1-17 | Retro Slider Wrapper | `/frontend/src/components/ui/retro-slider.tsx` | High | P1-2 |
| P1-18 | Slow Rotate Animation | `/frontend/tailwind.config.ts` | High | P1-4 |
| P1-19 | Bean Bounce Animation | `/frontend/tailwind.config.ts` | High | P1-4 |
| P1-20 | Steam Rise Animation | `/frontend/tailwind.config.ts` | High | P1-4 |
| P1-21 | Gentle Float Animation | `/frontend/tailwind.config.ts` | High | P1-4 |
| P1-22 | Marker Pulse Animation | `/frontend/tailwind.config.ts` | High | P1-4 |
| P1-23 | Fade In Animation | `/frontend/tailwind.config.ts` | High | P1-4 |
| P1-24 | FadeIn Component | `/frontend/src/components/ui/fade-in.tsx` | Medium | P1-23 |
| P1-25 | useInView Hook | `/frontend/src/hooks/use-in-view.ts` | Medium | None |
| P1-26 | AnimatedSection Component | `/frontend/src/components/ui/animated-section.tsx` | Medium | P1-24, P1-25 |
| P1-27 | FadeIn Utility Class | `/frontend/src/styles/animations.css` | Medium | P1-23 |

---

# ═══════════════════════════════════════════════════════════════
# SECTION 1: DESIGN TOKEN EXTRACTION (8 Tasks)
# ═══════════════════════════════════════════════════════════════════

# ═══════════════════════════════════════════════════════════════
# TASK P1-1: EXTRACT ALL DESIGN TOKENS FROM STATIC HTML
# ═══════════════════════════════════════════════════════════════════

## FILE TO CREATE/MODIFY
**Path:** `/docs/design-token-inventory.md` (Documentation)
**Action:** Create comprehensive design token inventory document

## DESIGN TOKENS TO EXTRACT

### Color Palette (38 Variables)
**Primary Colors:**
- sunrise-amber: #E8A857 (232, 168, 87)
- terracotta-warm: #D4693B (212, 105, 59)
- cream-white: #FFF8E7 (255, 248, 231)
- espresso-dark: #3D2B1F (61, 43, 31)
- coral-pop: #FF7B54 (255, 123, 84)
- sage-fresh: #8FA68A (143, 166, 138)
- cinnamon-glow: #C68642 (198, 134, 66)
- honey-light: #F5DEB3 (245, 222, 179)
- mocha-medium: #6B4423 (107, 68, 35)

**Extended Colors:**
- caramel-swirl: #D4A574
- butter-toast: #E6C9A8
- vintage-paper: #FAF3E3
- kopi-black: #2A1F16

### Gradients (3 Definitions)
- gradient-sunrise: linear-gradient(135deg, #FFF8E7 0%, #F5DEB3 50%, #E8A857 100%)
- gradient-warm-glow: radial-gradient(ellipse at center, rgba(232, 168, 87, 0.3) 0%, transparent 70%)
- gradient-sunset-stripe: repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(212, 105, 59, 0.05) 10px, rgba(212, 105, 59, 0.05) 20px)

### Typography (2 Font Families)
- font-display: 'Fraunces', Georgia, serif
- font-body: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif

### Spacing Scale (13 Values - 8px Grid)
- space-1: 0.25rem (4px)
- space-2: 0.5rem (8px)
- space-3: 0.75rem (12px)
- space-4: 1rem (16px)
- space-5: 1.25rem (20px)
- space-6: 1.5rem (24px)
- space-8: 2rem (32px)
- space-10: 2.5rem (40px)
- space-12: 3rem (48px)
- space-16: 4rem (64px)
- space-20: 5rem (80px)
- space-24: 6rem (96px)

### Border Radii (6 Values)
- radius-sm: 8px
- radius-md: 16px
- radius-lg: 24px
- radius-xl: 32px
- radius-2xl: 48px
- radius-full: 9999px

### Shadows (4 Definitions)
- shadow-sm: 0 2px 8px rgba(61, 43, 31, 0.08)
- shadow-md: 0 4px 16px rgba(61, 43, 31, 0.12)
- shadow-lg: 0 8px 32px rgba(61, 43, 31, 0.16)
- shadow-glow: 0 0 40px rgba(232, 168, 87, 0.3)

### Transitions (3 Curves + 3 Durations)
- ease-smooth: cubic-bezier(0.23, 1, 0.32, 1)
- ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55)
- duration-fast: 0.15s
- duration-normal: 0.3s
- duration-slow: 0.5s

### Z-Index Scale (6 Levels)
- z-base: 1
- z-sticky: 100
- z-nav: 1000
- z-overlay: 2000
- z-modal: 3000
- z-toast: 4000

### Animations (6 Keyframes)
- slowRotate: 120s linear infinite (sunburst)
- gentleFloat: 6s ease-in-out infinite (hero illustration)
- steamRise: 2s ease-in-out infinite (steam particles)
- beanBounce: 2s ease-in-out infinite (menu cards)
- markerPulse: 2s ease-in-out infinite (map markers)
- fadeIn: scroll-triggered fade-in

### Retro Textures (4 SVG Data URIs)
- texture-grain: Noise filter overlay
- texture-sunburst: Repeating conic gradient rays
- texture-circles: Concentric circles
- texture-arcs: Decorative arc pattern

## FEATURES TO IMPLEMENT
- Comprehensive design token inventory extracted from static_landing_page_mockup.html
- Color values in both HEX and RGB (space-separated for Tailwind opacity)
- All gradients documented with CSS syntax
- Font families with fallbacks documented
- Spacing scale based on 8px grid system
- Border radii following 1970s rounded aesthetic
- Shadows with warm-tinted rgba colors
- Transition curves for retro feel
- Animation keyframes with timing functions
- Z-index scale for layered components
- SVG texture data URIs extracted

## INTERFACES/TYPES
```typescript
interface DesignToken {
  name: string;
  hex: string;
  rgb: [number, number, number];
  category: 'primary' | 'extended' | 'gradient' | 'typography' | 'spacing' | 'radius' | 'shadow' | 'transition' | 'z-index' | 'animation' | 'texture';
}

interface ColorToken extends DesignToken {
  category: 'primary' | 'extended';
  wcagAAA: {
    onWhite: boolean;
    onCream: boolean;
    onEspresso: boolean;
  };
}

interface AnimationToken extends DesignToken {
  category: 'animation';
  keyframeName: string;
  duration: string;
  easing: string;
  iterations: string;
}
```

## DETAILED CHECKLIST

### Color Extraction
- [ ] Extract all 9 primary colors with HEX and RGB values
- [ ] Extract all 4 extended colors
- [ ] Verify all color values match CSS exactly
- [ ] Document gradient definitions (3 total)
- [ ] Extract RGB values for all colors (space-separated format)
- [ ] Verify gradient syntax matches Tailwind v4 format

### Typography Extraction
- [ ] Extract font-display (Fraunces with fallbacks)
- [ ] Extract font-body (DM Sans with system fallbacks)
- [ ] Document font weights and optical sizes
- [ ] Note Google Fonts URLs for preconnect

### Spacing Extraction
- [ ] Extract all 13 spacing values
- [ ] Verify 8px grid base
- [ ] Document rem conversions
- [ ] Map to Tailwind spacing scale

### Border Radius Extraction
- [ ] Extract all 6 radius values
- [ ] Note radius-full for pill-shaped elements
- [ ] Verify px to rem conversions

### Shadow Extraction
- [ ] Extract all 4 shadow definitions
- [ ] Verify rgba values (red, green, blue, alpha)
- [ ] Note warm-tinted color scheme
- [ ] Document glow shadow separately

### Transition Extraction
- [ ] Extract 3 easing curves
- [ ] Extract 3 duration values
- [ ] Verify bezier curve values
- [ ] Document duration mapping

### Z-Index Extraction
- [ ] Extract all 6 z-index levels
- [ ] Document layering hierarchy
- [ ] Verify no conflicts

### Animation Extraction
- [ ] Extract slowRotate keyframe (120s linear infinite)
- [ ] Extract gentleFloat keyframe (6s ease-in-out infinite)
- [ ] Extract steamRise keyframe (2s ease-in-out infinite)
- [ ] Extract beanBounce keyframe (2s ease-in-out infinite)
- [ ] Extract markerPulse keyframe (2s ease-in-out infinite)
- [ ] Extract fadeIn keyframe logic
- [ ] Document all keyframe properties

### Texture Extraction
- [ ] Extract texture-grain SVG data URI
- [ ] Extract texture-sunburst SVG data URI
- [ ] Extract texture-circles SVG data URI
- [ ] Extract texture-arcs SVG data URI
- [ ] Verify all SVG data URIs are properly encoded
- [ ] Document opacity usage

## SUCCESS CRITERIA
- [ ] Design token inventory document created at /docs/design-token-inventory.md
- [ ] All 38 color variables extracted with RGB values
- [ ] All 3 gradients documented with CSS syntax
- [ ] All 2 font families documented with fallbacks
- [ ] All 13 spacing values documented
- [ ] All 6 border radii documented
- [ ] All 4 shadows documented
- [ ] All 6 animation keyframes documented
- [ ] All 4 texture data URIs extracted
- [ ] WCAG AAA contrast analysis started
- [ ] Token naming convention consistent (kebab-case)
- [ ] Document is searchable and well-organized

---

# ═══════════════════════════════════════════════════════════════
# TASK P1-2: CREATE TOKENS.CSS WITH CSS CUSTOM PROPERTIES
# ═══════════════════════════════════════════════════════════════════

## FILE TO CREATE/MODIFY
**Path:** `/frontend/src/styles/tokens.css`
**Action:** Create CSS custom properties file

## FEATURES TO IMPLEMENT

### CSS Custom Properties Structure
- Root variables using :root selector
- All colors in RGB space-separated format (for Tailwind opacity)
- All gradients as CSS custom properties
- Typography families
- Spacing scale
- Border radii
- Shadows
- Transitions
- Z-index values
- Animation keyframes
- Texture data URIs

### Tailwind v4 CSS-First Configuration
- Use @theme directive for token mapping
- CSS custom properties for theme values
- Support for light/dark mode (future-ready)
- Responsive token variants

## INTERFACES/TYPES
```css
@theme {
  --color-sunrise-amber: 232 168 87;
  --color-sunrise-amber-hover: 212 148 67;
  --spacing-1: 0.25rem;
  --radius-md: 16px;
  --shadow-button: 0 4px 16px rgb(61 43 31 / 0.12);
}
```

## DETAILED CHECKLIST

### Color Variables
- [ ] Create :root selector
- [ ] Define all primary colors in RGB space-separated format
- [ ] Define all extended colors in RGB format
- [ ] Add hover variants for interactive colors
- [ ] Create disabled variants for accessibility
- [ ] Add alpha channel variants (50, 100, 200, 300, 400)

### Gradient Variables
- [ ] Define gradient-sunrise
- [ ] Define gradient-warm-glow
- [ ] Define gradient-sunset-stripe
- [ ] Test gradient rendering

### Typography Variables
- [ ] Define font-display
- [ ] Define font-body
- [ ] Add font weight variants
- [ ] Add font size scale

### Spacing Variables
- [ ] Define all 13 spacing values
- [ ] Map to Tailwind spacing scale
- [ ] Verify 8px grid consistency

### Border Radius Variables
- [ ] Define all 6 radius values
- [ ] Test radius-full for pill shapes
- [ ] Create responsive radius variants

### Shadow Variables
- [ ] Define shadow-sm
- [ ] Define shadow-md
- [ ] Define shadow-lg
- [ ] Define shadow-glow
- [ ] Create shadow-button variant
- [ ] Test shadow layering

### Transition Variables
- [ ] Define ease-smooth
- [ ] Define ease-bounce
- [ ] Define duration-fast
- [ ] Define duration-normal
- [ ] Define duration-slow

### Z-Index Variables
- [ ] Define z-base
- [ ] Define z-sticky
- [ ] Define z-nav
- [ ] Define z-overlay
- [ ] Define z-modal
- [ ] Define z-toast

### Animation Keyframes
- [ ] Define @keyframes slowRotate
- [ ] Define @keyframes gentleFloat
- [ ] Define @keyframes steamRise
- [ ] Define @keyframes beanBounce
- [ ] Define @keyframes markerPulse
- [ ] Define @keyframes fadeIn
- [ ] Test all animations in browser

### Texture Variables
- [ ] Define texture-grain as data URI
- [ ] Define texture-sunburst as data URI
- [ ] Define texture-circles as data URI
- [ ] Define texture-arcs as data URI
- [ ] Verify all textures render correctly

### Tailwind Integration
- [ ] Use @theme directive for token mapping
- [ ] Map colors to Tailwind color palette
- [ ] Map spacing to Tailwind spacing
- [ ] Map radii to Tailwind borderRadius
- [ ] Map shadows to Tailwind boxShadow
- [ ] Test Tailwind utility classes

## SUCCESS CRITERIA
- [ ] tokens.css file created at /frontend/src/styles/tokens.css
- [ ] All colors defined in RGB space-separated format
- [ ] All gradients defined as CSS custom properties
- [ ] All typography variables defined
- [ ] All spacing values defined and mapped
- [ ] All border radii defined
- [ ] All shadows defined with proper rgba values
- [ ] All transitions defined
- [ ] All z-index values defined
- [ ] All animation keyframes defined
- [ ] All texture data URIs defined
- [ ] @theme directive properly configured
- [ ] No syntax errors in CSS
- [ ] Variables usable in Tailwind utilities
- [ ] Light/dark mode ready (if implemented)

---

# ═══════════════════════════════════════════════════════════════
# TASK P1-3: CREATE GLOBALS.CSS WITH RESET & BASE STYLES
# ═══════════════════════════════════════════════════════════════════

## FILE TO CREATE/MODIFY
**Path:** `/frontend/src/styles/globals.css`
**Action:** Create global styles with reset and CSS layers

## FEATURES TO IMPLEMENT

### CSS Layers Architecture
- @layer base for reset and base styles
- @layer components for component styles
- @layer utilities for utility extensions
- @layer animations for animation definitions

### Reset Styles
- Box-sizing border-box for all elements
- Remove default margins and padding
- Modern CSS reset
- Smooth scrolling
- Reduced motion support

### Base Styles
- Body typography
- Link styles
- Button styles
- Image styles
- Focus visible styles
- Skip link implementation

### Accessibility Enhancements
- Reduced motion media query
- Focus ring styles
- Skip to content link
- ARIA attribute hints

## INTERFACES/TYPES
```css
@layer base {
  html {
    scroll-behavior: smooth;
    font-size: 16px;
  }

  @media (prefers-reduced-motion: reduce) {
    html {
      scroll-behavior: auto;
    }
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
}
```

## DETAILED CHECKLIST

### CSS Layers
- [ ] Define @layer base
- [ ] Define @layer components
- [ ] Define @layer utilities
- [ ] Define @layer animations
- [ ] Import tokens.css at top

### Reset Styles
- [ ] Box-sizing border-box for all elements
- [ ] Remove default margins
- [ ] Remove default padding
- [ ] Remove list styles
- [ ] Remove button styles
- [ ] Reset font sizes
- [ ] Reset line heights

### HTML & Body
- [ ] Set html scroll-behavior smooth
- [ ] Set html font-size 16px
- [ ] Set body font-family to font-body
- [ ] Set body font-size 1.125rem
- [ ] Set body line-height 1.7
- [ ] Set body color to espresso-dark
- [ ] Set body background to cream-white
- [ ] Add font-smoothing
- [ ] Add overflow-x hidden

### Grain Texture Overlay
- [ ] Add pseudo-element to body
- [ ] Apply texture-grain
- [ ] Set opacity 0.03
- [ ] Set pointer-events none
- [ ] Set z-index 10000
- [ ] Verify texture is subtle

### Focus Styles
- [ ] Define :focus-visible
- [ ] Set outline 3px solid coral-pop
- [ ] Set outline-offset 3px
- [ ] Test keyboard navigation

### Skip Link
- [ ] Create .skip-link class
- [ ] Set position absolute
- [ ] Set top -100% (hidden by default)
- [ ] Set focus top to show
- [ ] Style for visibility
- [ ] Test with Tab key

### Typography Base
- [ ] Set font-display for headings
- [ ] Set font-body for body text
- [ ] Define heading sizes with clamp()
- [ ] Set heading colors
- [ ] Set heading weights
- [ ] Set heading line-heights

### Media & Images
- [ ] Max-width 100% for images
- [ ] Height auto for images
- [ ] Display block for images and SVGs
- [ ] Add picture element support

### Links & Buttons
- [ ] Color inherit for links
- [ ] Remove text-decoration for links
- [ ] Font inherit for buttons
- [ ] Cursor pointer for buttons
- [ ] Remove borders from buttons

### Reduced Motion
- [ ] Create @media (prefers-reduced-motion: reduce)
- [ ] Disable scroll-behavior
- [ ] Disable animations
- [ ] Disable transitions
- [ ] Test with reduced motion preference

### Print Styles
- [ ] Create @media print
- [ ] Remove background colors
- [ ] Use black text
- [ ] Hide decorative elements
- [ ] Print-friendly layout

## SUCCESS CRITERIA
- [ ] globals.css file created at /frontend/src/styles/globals.css
- [ ] All CSS layers properly defined
- [ ] Reset styles applied correctly
- [ ] Box-sizing border-box active
- [ ] Smooth scrolling enabled
- [ ] Reduced motion support implemented
- [ ] Grain texture overlay visible
- [ ] Focus styles work with keyboard navigation
- [ ] Skip link functional
- [ ] Typography hierarchy established
- [ ] Print styles defined
- [ ] No conflicts with Tailwind utilities
- [ ] Mobile responsive base styles
- [ ] Accessibility features working

---

# ═══════════════════════════════════════════════════════════════
# TASK P1-4: CREATE TAILWIND CONFIG MAPPING ALL TOKENS
# ═══════════════════════════════════════════════════════════════════

## FILE TO CREATE/MODIFY
**Path:** `/frontend/tailwind.config.ts`
**Action:** Create Tailwind v4 configuration with design token mapping

## FEATURES TO IMPLEMENT

### Tailwind v4 CSS-First Configuration
- Import tokens.css
- Use @theme for token mapping
- Map all colors to Tailwind palette
- Map spacing scale
- Map border radii
- Map shadows
- Map fonts
- Configure animations
- Extend utilities
- Add custom plugins

### Content Configuration
- Scan all component directories
- Scan all page directories
- Include all TypeScript/JavaScript files

### Theme Configuration
- Primary colors mapped
- Extended colors mapped
- Gradients available as utilities
- Font families mapped
- Spacing scale integrated
- Border radii integrated
- Shadow utilities available

### Animation Configuration
- slowRotate (120s linear infinite)
- gentleFloat (6s ease-in-out infinite)
- steamRise (2s ease-in-out infinite)
- beanBounce (2s ease-in-out infinite)
- markerPulse (2s ease-in-out infinite)
- fadeIn (scroll-triggered)

## INTERFACES/TYPES
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'sunrise-amber': 'rgb(var(--color-sunrise-amber) / <alpha-value>)',
        'terracotta-warm': 'rgb(var(--color-terracotta-warm) / <alpha-value>)',
        // ... all other colors
      },
      animation: {
        'slow-rotate': 'slowRotate 120s linear infinite',
        'gentle-float': 'gentleFloat 6s ease-in-out infinite',
        'steam-rise': 'steamRise 2s ease-in-out infinite',
        'bean-bounce': 'beanBounce 2s ease-in-out infinite',
        'marker-pulse': 'markerPulse 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        slowRotate: {
          'from': { transform: 'translateX(-50%) rotate(0deg)' },
          'to': { transform: 'translateX(-50%) rotate(360deg)' },
        },
        gentleFloat: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(3deg)' },
        },
        steamRise: {
          '0%': { opacity: '0', transform: 'translateY(0) scale(1)' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0', transform: 'translateY(-30px) scale(0.5)' },
        },
        beanBounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        markerPulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

## DETAILED CHECKLIST

### Content Configuration
- [ ] Import tokens.css
- [ ] Configure content paths for app directory
- [ ] Configure content paths for components directory
- [ ] Configure content paths for lib directory
- [ ] Test class scanning

### Color Mapping
- [ ] Map sunrise-amber with alpha support
- [ ] Map terracotta-warm with alpha support
- [ ] Map cream-white with alpha support
- [ ] Map espresso-dark with alpha support
- [ ] Map coral-pop with alpha support
- [ ] Map sage-fresh with alpha support
- [ ] Map cinnamon-glow with alpha support
- [ ] Map honey-light with alpha support
- [ ] Map mocha-medium with alpha support
- [ ] Map all extended colors
- [ ] Test opacity utilities (bg-sunrise-amber/50, etc.)

### Spacing Mapping
- [ ] Map all 13 spacing values
- [ ] Verify 8px grid consistency
- [ ] Test spacing utilities
- [ ] Create responsive spacing variants

### Border Radius Mapping
- [ ] Map radius-sm
- [ ] Map radius-md
- [ ] Map radius-lg
- [ ] Map radius-xl
- [ ] Map radius-2xl
- [ ] Map radius-full
- [ ] Test rounded utilities

### Shadow Mapping
- [ ] Map shadow-sm
- [ ] Map shadow-md
- [ ] Map shadow-lg
- [ ] Map shadow-glow
- [ ] Create shadow-button variant
- [ ] Test shadow utilities

### Font Mapping
- [ ] Map font-display
- [ ] Map font-body
- [ ] Test font-family utilities
- [ ] Verify fallbacks

### Animation Configuration
- [ ] Add slow-rotate animation
- [ ] Add gentle-float animation
- [ ] Add steam-rise animation
- [ ] Add bean-bounce animation
- [ ] Add marker-pulse animation
- [ ] Add fade-in animation
- [ ] Define all keyframes
- [ ] Test animation utilities

### Gradient Utilities
- [ ] Create bg-gradient-sunrise utility
- [ ] Create bg-gradient-warm-glow utility
- [ ] Create bg-gradient-sunset-stripe utility
- [ ] Test gradient utilities

### Extension Utilities
- [ ] Add retro-shadow utility
- [ ] Add glow-effect utility
- [ ] Add grain-texture utility
- [ ] Test custom utilities

### Dark Mode Support
- [ ] Configure darkMode strategy
- [ ] Add dark color variants
- [ ] Test dark mode toggling

## SUCCESS CRITERIA
- [ ] tailwind.config.ts created at /frontend/tailwind.config.ts
- [ ] All colors mapped with alpha support
- [ ] All spacing values mapped
- [ ] All border radii mapped
- [ ] All shadows mapped
- [ ] All fonts mapped
- [ ] All 6 animations configured
- [ ] All 6 keyframes defined
- [ ] Content paths correct
- [ ] Gradient utilities available
- [ ] Custom utilities working
- [ ] Tailwind compiles without errors
- [ ] Classes generate correctly
- [ ] Autocomplete works in IDE
- [ ] Dark mode ready (if implemented)

---

# ═══════════════════════════════════════════════════════════════
# SECTION 2: DESIGN TOKEN VALIDATION (4 Tasks)
# ═══════════════════════════════════════════════════════════════════

# ═══════════════════════════════════════════════════════════════
# TASK P1-5: CREATE UTILITY FUNCTIONS
# ═════════════════════════════════════════════════════════════════

## FILE TO CREATE/MODIFY
**Path:** `/frontend/src/lib/utils.ts`
**Action:** Create utility functions library

## FEATURES TO IMPLEMENT

### Class Name Merger (cn)
- Merge Tailwind class names
- Handle Tailwind conflicts
- Support conditional classes
- Support array arguments

### Price Formatting
- Format prices in Singapore Dollars (S$)
- 2 decimal places
- Currency symbol
- Thousand separators

### GST Calculation
- Calculate 9% GST on amount
- 4 decimal precision (DECIMAL-10,4 aligned)
- Handle edge cases (rounding, aggregation)
- Singapore tax rate constant

### Number Formatting
- Format numbers with locale
- Compact notation for large numbers
- Percentage formatting

### Date Formatting
- Format dates for display
- Relative time formatting
- Singapore locale (en-SG)

## INTERFACES/TYPES
```typescript
/**
 * Merge Tailwind CSS classes with clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]): string;

/**
 * Format price in Singapore Dollars
 */
export function formatPrice(amount: number): string;

/**
 * Calculate GST (9%) with 4 decimal precision
 */
export function calculateGST(amount: number): number;

/**
 * Calculate total with GST included
 */
export function calculateTotalWithGST(amount: number): number;

/**
 * Format percentage with precision
 */
export function formatPercentage(value: number, precision?: number): string;

/**
 * Format date for Singapore locale
 */
export function formatDate(date: Date | string): string;

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string;

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string;

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void;

/**
 * Throttle function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void;
```

## DETAILED CHECKLIST

### cn Function
- [ ] Import clsx from 'clsx'
- [ ] Import twMerge from 'tailwind-merge'
- [ ] Create cn function
- [ ] Handle class value arguments
- [ ] Merge classes correctly
- [ ] Test Tailwind conflict resolution
- [ ] Add TypeScript types
- [ ] Add JSDoc comments

### formatPrice Function
- [ ] Create formatPrice function
- [ ] Accept number amount
- [ ] Format with Intl.NumberFormat
- [ ] Use 'en-SG' locale
- [ ] Use 'SGD' currency
- [ ] Set minimum/maximum fraction digits to 2
- [ ] Test negative numbers
- [ ] Test zero values
- [ ] Add JSDoc comments

### calculateGST Function
- [ ] Define GST_RATE constant (0.09)
- [ ] Create calculateGST function
- [ ] Multiply amount by 0.09
- [ ] Round to 4 decimal places
- [ ] Handle edge cases (NaN, Infinity)
- [ ] Add TypeScript validation
- [ ] Test rounding behavior
- [ ] Test aggregation scenarios
- [ ] Document precision alignment with backend
- [ ] Add JSDoc comments

### calculateTotalWithGST Function
- [ ] Create calculateTotalWithGST function
- [ ] Add amount + GST
- [ ] Round to 2 decimal places for display
- [ ] Use calculateGST internally
- [ ] Test with various amounts
- [ ] Add JSDoc comments

### formatPercentage Function
- [ ] Create formatPercentage function
- [ ] Accept value and optional precision
- [ ] Format as percentage
- [ ] Default precision to 2
- [ ] Handle negative percentages
- [ ] Add JSDoc comments

### formatDate Function
- [ ] Create formatDate function
- [ ] Accept Date or string
- [ ] Use Intl.DateTimeFormat
- [ ] Use 'en-SG' locale
- [ ] Format as medium date
- [ ] Handle string parsing
- [ ] Add JSDoc comments

### formatRelativeTime Function
- [ ] Create formatRelativeTime function
- [ ] Accept Date or string
- [ ] Use Intl.RelativeTimeFormat
- [ ] Calculate time difference
- [ ] Return human-readable string
- [ ] Handle future dates
- [ ] Handle past dates
- [ ] Add JSDoc comments

### truncateText Function
- [ ] Create truncateText function
- [ ] Accept text and maxLength
- [ ] Truncate at maxLength
- [ ] Add ellipsis (...)
- [ ] Handle short text
- [ ] Add JSDoc comments

### debounce Function
- [ ] Create debounce function
- [ ] Accept function and wait time
- [ ] Set timeout reference
- [ ] Clear previous timeout
- [ ] Call function after wait
- [ ] Preserve this context
- [ ] Preserve function arguments
- [ ] Add TypeScript generics
- [ ] Add JSDoc comments

### throttle Function
- [ ] Create throttle function
- [ ] Accept function and limit time
- [ ] Set last call time
- [ ] Call only once per limit
- [ ] Preserve this context
- [ ] Preserve function arguments
- [ ] Add TypeScript generics
- [ ] Add JSDoc comments

### Testing
- [ ] Unit tests for cn function
- [ ] Unit tests for formatPrice
- [ ] Unit tests for calculateGST
- [ ] Unit tests for calculateTotalWithGST
- [ ] Unit tests for all utility functions
- [ ] Edge case coverage

## SUCCESS CRITERIA
- [ ] utils.ts file created at /frontend/src/lib/utils.ts
- [ ] cn function works correctly
- [ ] formatPrice formats SGD correctly
- [ ] calculateGST with 4 decimal precision
- [ ] calculateTotalWithGST works correctly
- [ ] All utility functions documented
- [ ] TypeScript types defined
- [ ] JSDoc comments complete
- [ ] All functions tested
- [ ] Edge cases handled
- [ ] No TypeScript errors
- [ ] Functions exported correctly

---

# ═══════════════════════════════════════════════════════════════
# TASK P1-6: WCAG AAA CONTRAST VALIDATION
# ═══════════════════════════════════════════════════════════════════

## FILE TO CREATE/MODIFY
**Path:** `/docs/wcag-aaa-validation.md`
**Action:** Create WCAG AAA contrast ratio validation document

## FEATURES TO IMPLEMENT

### Contrast Ratio Analysis
- Calculate contrast ratios for all color combinations
- Verify minimum 7:1 for WCAG AAA
- Document all text/background pairs
- Identify failing combinations
- Provide alternatives

### Large Text Exemption
- Identify large text elements (18pt/24px or 14pt/19px bold)
- Verify 4.5:1 minimum for large text
- Document exempted combinations

### Interactive Elements
- Button contrast validation
- Link contrast validation
- Form element contrast
- Focus indicator visibility

### Color Blindness Testing
- Simulate protanopia
- Simulate deuteranopia
- Simulate tritanopia
- Verify all elements distinguishable

## INTERFACES/TYPES
```typescript
interface ContrastRatio {
  ratio: number;
  wcagAA: boolean; // 4.5:1 minimum
  wcagAAA: boolean; // 7:1 minimum
  wcagAALarge: boolean; // 3:1 minimum for large text
  wcagAAALarge: boolean; // 4.5:1 minimum for large text
}

interface ColorPair {
  foreground: string;
  background: string;
  contrast: ContrastRatio;
}

interface WCAGValidationReport {
  date: string;
  passCount: number;
  failCount: number;
  warningCount: number;
  colorPairs: ColorPair[];
  recommendations: string[];
}
```

## DETAILED CHECKLIST

### Color Pair Analysis
- [ ] Create all text/background color combinations
- [ ] Calculate contrast ratio for each pair
- [ ] Compare to WCAG AAA threshold (7:1)
- [ ] Compare to WCAG AA threshold (4.5:1)
- [ ] Compare to WCAG AA Large threshold (3:1)
- [ ] Compare to WCAG AAA Large threshold (4.5:1)
- [ ] Document results for all pairs

### Primary Palette Validation
- [ ] sunrise-amber on cream-white
- [ ] terracotta-warm on cream-white
- [ ] espresso-dark on cream-white
- [ ] coral-pop on cream-white
- [ ] sage-fresh on cream-white
- [ ] All primary colors on white background
- [ ] All primary colors on vintage-paper

### Extended Palette Validation
- [ ] caramel-swirl combinations
- [ ] butter-toast combinations
- [ ] kopi-black combinations
- [ ] All extended colors on light backgrounds
- [ ] All extended colors on dark backgrounds

### Typography Combinations
- [ ] Headings (font-display) on backgrounds
- [ ] Body text (font-body) on backgrounds
- [ ] Caption text on backgrounds
- [ ] Link text in various contexts
- [ ] Button text

### Interactive Elements
- [ ] Primary button contrast
- [ ] Secondary button contrast
- [ ] Disabled button states
- [ ] Hover states
- [ ] Active states
- [ ] Focus states
- [ ] Link hover states

### Large Text Exemptions
- [ ] Identify all large text instances
- [ ] Verify 4.5:1 for WCAG AAA Large
- [ ] Document exemptions
- [ ] Verify font sizes meet criteria

### Color Blindness Simulation
- [ ] Test with protanopia (red-blind)
- [ ] Test with deuteranopia (green-blind)
- [ ] Test with tritanopia (blue-blind)
- [ ] Verify all information accessible
- [ ] Verify all states distinguishable
- [ ] Document any issues

### Focus Indicators
- [ ] Verify focus outline visibility (3px coral-pop)
- [ ] Test on all backgrounds
- [ ] Test keyboard navigation
- [ ] Verify high contrast focus

### Recommendations
- [ ] Document all failing combinations
- [ ] Provide alternative color suggestions
- [ ] Provide recommendations for fixes
- [ ] Prioritize critical accessibility issues
- [ ] Create remediation plan

### Documentation
- [ ] Create validation report
- [ ] Include all color pairs tested
- [ ] Include contrast ratios
- [ ] Include pass/fail status
- [ ] Include recommendations
- [ ] Include screenshots of simulations
- [ ] Store in /docs/wcag-aaa-validation.md

## SUCCESS CRITERIA
- [ ] WCAG AAA validation document created
- [ ] All color combinations tested
- [ ] All contrast ratios calculated
- [ ] Minimum 7:1 ratio verified for AAA
- [ ] Large text exemptions documented
- [ ] Interactive elements validated
- [ ] Color blindness simulations tested
- [ ] Focus indicators verified
- [ ] All failures documented
- [ ] Recommendations provided
- [ ] Remediation plan created
- [ ] No critical accessibility issues unresolved

---

# ═══════════════════════════════════════════════════════════════
# TASK P1-7: CREATE DECORATIVE PATTERN CSS
# ═══════════════════════════════════════════════════════════════════

## FILE TO CREATE/MODIFY
**Path:** `/frontend/src/styles/patterns.css`
**Action:** Create decorative SVG pattern CSS

## FEATURES TO IMPLEMENT

### Pattern Classes
- Sunburst pattern (repeating conic gradient)
- Wave pattern (SVG path)
- Tile pattern (geometric)
- Scallop pattern (decorative)
- Circle pattern (concentric)
- Arc pattern (decorative)

### Pattern Utilities
- Background pattern utilities
- Pattern opacity variants
- Pattern size variants
- Pattern positioning utilities

### Responsive Patterns
- Pattern density adjustments
- Pattern scale variants
- Mobile-optimized patterns

## INTERFACES/TYPES
```css
/* Pattern base classes */
.pattern-sunburst { }
.pattern-wave { }
.pattern-tile { }
.pattern-scallop { }
.pattern-circles { }
.pattern-arcs { }

/* Pattern variants */
.pattern-opacity-10 { }
.pattern-opacity-20 { }
.pattern-opacity-30 { }
.pattern-opacity-50 { }

/* Pattern sizes */
.pattern-size-sm { }
.pattern-size-md { }
.pattern-size-lg { }
.pattern-size-xl { }
```

## DETAILED CHECKLIST

### Sunburst Pattern
- [ ] Create .pattern-sunburst class
- [ ] Use repeating-conic-gradient
- [ ] Map to texture-sunburst data URI
- [ ] Create opacity variants
- [ ] Create size variants
- [ ] Test on hero section

### Wave Pattern
- [ ] Create .pattern-wave class
- [ ] Extract SVG from HTML
- [ ] Convert to CSS background
- [ ] Create flip variant
- [ ] Create color variants
- [ ] Test on section dividers

### Tile Pattern
- [ ] Create .pattern-tile class
- [ ] Create geometric tile SVG
- [ ] Convert to CSS background
- [ ] Create repeat variants
- [ ] Test as background pattern

### Scallop Pattern
- [ ] Create .pattern-scallop class
- [ ] Create scallop SVG
- [ ] Convert to CSS background
- [ ] Create repeat variants
- [ ] Test as decorative border

### Circle Pattern
- [ ] Create .pattern-circles class
- [ ] Map to texture-circles data URI
- [ ] Create spacing variants
- [ ] Create opacity variants
- [ ] Test as background pattern

### Arc Pattern
- [ ] Create .pattern-arcs class
- [ ] Map to texture-arcs data URI
- [ ] Create spacing variants
- [ ] Create opacity variants
- [ ] Test as decorative element

### Pattern Utilities
- [ ] Create pattern-opacity variants (10, 20, 30, 50)
- [ ] Create pattern-size variants (sm, md, lg, xl)
- [ ] Create pattern-position utilities
- [ ] Create pattern-blur utilities

### Responsive Patterns
- [ ] Adjust pattern density for mobile
- [ ] Adjust pattern scale for desktop
- [ ] Test on various screen sizes
- [ ] Ensure patterns don't affect performance

### Accessibility
- [ ] Add decorative role where needed
- [ ] Add aria-hidden for decorative patterns
- [ ] Test with screen readers
- [ ] Test with high contrast mode

### Performance
- [ ] Optimize SVG data URIs
- [ ] Minify CSS
- [ ] Test render performance
- [ ] Check bundle size impact

## SUCCESS CRITERIA
- [ ] patterns.css file created at /frontend/src/styles/patterns.css
- [ ] All 6 pattern classes defined
- [ ] Sunburst pattern works
- [ ] Wave pattern works with flip variant
- [ ] Tile pattern works
- [ ] Scallop pattern works
- [ ] Circle pattern works
- [ ] Arc pattern works
- [ ] Opacity variants available
- [ ] Size variants available
- [ ] Responsive behavior working
- [ ] Accessibility attributes added
- [ ] Performance optimized
- [ ] No render issues

---

# ═══════════════════════════════════════════════════════════════
# TASK P1-8: IMPLEMENT REDUCED MOTION AND PRINT STYLES
# ═══════════════════════════════════════════════════════════════════

## FILE TO CREATE/MODIFY
**Path:** `/frontend/src/styles/accessibility.css`
**Action:** Create accessibility enhancements

## FEATURES TO IMPLEMENT

### Reduced Motion Support
- Disable all animations
- Disable all transitions
- Disable parallax effects
- Respect prefers-reduced-motion
- Maintain functionality without motion

### Print Styles
- Remove background colors
- Use black text
- Hide decorative elements
- Optimize for printing
- Ensure content readability

### High Contrast Mode
- Support high contrast mode
- Maintain brand identity
- Ensure readability
- Test with Windows high contrast

### Skip Link Enhancement
- Enhanced skip link styles
- Multiple skip targets
- Focus trap handling

## INTERFACES/TYPES
```css
/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Print styles */
@media print {
  body {
    background: white;
    color: black;
  }
}
```

## DETAILED CHECKLIST

### Reduced Motion
- [ ] Create @media (prefers-reduced-motion: reduce)
- [ ] Disable all animations (0.01ms duration)
- [ ] Limit animation iteration to 1
- [ ] Disable all transitions
- [ ] Disable scroll-behavior smooth
- [ ] Disable parallax effects
- [ ] Test with system reduced motion setting
- [ ] Verify all functionality remains accessible

### Animation Disable List
- [ ] Disable slow-rotate animation
- [ ] Disable gentle-float animation
- [ ] Disable steam-rise animation
- [ ] Disable bean-bounce animation
- [ ] Disable marker-pulse animation
- [ ] Disable fade-in animation
- [ ] Disable custom animations
- [ ] Disable hover effects that use motion

### Transition Disable List
- [ ] Disable button transitions
- [ ] Disable link transitions
- [ ] Disable card hover transitions
- [ ] Disable modal transitions
- [ ] Disable tooltip transitions

### Parallax Disable
- [ ] Disable scroll-triggered parallax
- [ ] Disable mouse parallax
- [ ] Disable background movement
- [ ] Keep content static

### Print Styles
- [ ] Create @media print
- [ ] Remove background colors
- [ ] Set text color to black
- [ ] Remove shadows
- [ ] Remove gradients
- [ ] Hide decorative elements
- [ ] Hide non-essential elements
- [ ] Ensure content readability
- [ ] Optimize page breaks
- [ ] Remove animations
- [ ] Remove transitions

### Print-Specific Elements
- [ ] Hide navigation
- [ ] Hide header/footer
- [ ] Hide skip links
- [ ] Hide decorative patterns
- [ ] Show print-only content
- [ ] Format links for print (show URLs)
- [ ] Optimize images for print

### High Contrast Mode
- [ ] Create @media (prefers-contrast: high)
- [ ] Override colors for high contrast
- [ ] Ensure minimum contrast
- [ ] Maintain text hierarchy
- [ ] Test with Windows high contrast
- [ ] Test with macOS high contrast

### Focus Enhancement
- [ ] Ensure focus indicators are visible
- [ ] Increase focus indicator size
- [ ] Ensure focus color contrasts
- [ ] Test keyboard navigation
- [ ] Test with reduced motion

### Skip Link Enhancement
- [ ] Add skip to content
- [ ] Add skip to navigation
- [ ] Add skip to footer
- [ ] Ensure visible on focus
- [ ] Test with Tab key

### Skip to Content
- [ ] Link to main content
- [ ] Visible only on focus
- [ ] High contrast styling
- [ ] Clear text label

### Skip to Navigation
- [ ] Link to navigation
- [ ] Visible only on focus
- [ ] High contrast styling
- [ ] Clear text label

### Skip to Footer
- [ ] Link to footer
- [ ] Visible only on focus
- [ ] High contrast styling
- [ ] Clear text label

### Testing
- [ ] Test with reduced motion enabled
- [ ] Test with reduced motion disabled
- [ ] Test printing in Chrome
- [ ] Test printing in Firefox
- [ ] Test printing in Safari
- [ ] Test with high contrast mode
- [ ] Test with screen readers
- [ ] Test keyboard navigation

## SUCCESS CRITERIA
- [ ] accessibility.css file created at /frontend/src/styles/accessibility.css
- [ ] Reduced motion support working
- [ ] All animations disabled with reduced motion
- [ ] All transitions disabled with reduced motion
- [ ] Parallax effects disabled with reduced motion
- [ ] Print styles defined
- [ ] Print output optimized
- [ ] High contrast mode supported
- [ ] Skip links enhanced
- [ ] Focus indicators enhanced
- [ ] All accessibility features tested
- [ ] Screen reader compatible
- [ ] Keyboard navigation working
- [ ] No accessibility violations

---

# ═══════════════════════════════════════════════════════════════
# SECTION 3: RETRO-FIT ABSTRACTION LAYER (9 Tasks)
# ═══════════════════════════════════════════════════════════════════

# ═══════════════════════════════════════════════════════════════
# TASK P1-9: CREATE RETRO DIALOG WRAPPER
# ═══════════════════════════════════════════════════════════════════

## FILE TO CREATE/MODIFY
**Path:** `/frontend/src/components/ui/retro-dialog.tsx`
**Action:** Create Radix Dialog wrapper with retro styling

## FEATURES TO IMPLEMENT

### Dialog Wrapper
- Radix Dialog primitive
- Retro border styling
- Warm color palette
- Rounded corners (radius-xl)
- Soft shadows (shadow-lg)
- Blur overlay backdrop

### Accessibility
- Proper ARIA attributes
- Focus trap
- Keyboard navigation
- Escape key close
- Click outside close
- Screen reader support

### Variants
- Size variants (sm, md, lg, xl)
- Open/close animations
- Retro styling consistent

## INTERFACES/TYPES
```typescript
import * as Dialog from '@radix-ui/react-dialog';

export interface RetroDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface RetroDialogContentProps {
  children?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
```

## DETAILED CHECKLIST

### Component Structure
- [ ] Import Dialog from '@radix-ui/react-dialog'
- [ ] Create RetroDialog component
- [ ] Create RetroDialogContent component
- [ ] Create RetroDialogHeader component
- [ ] Create RetroDialogTitle component
- [ ] Create RetroDialogDescription component
- [ ] Create RetroDialogFooter component
- [ ] Create RetroDialogClose component

### Styling
- [ ] Apply radius-xl border radius
- [ ] Apply cream-white background
- [ ] Apply terracotta-warm border (3px)
- [ ] Apply shadow-lg
- [ ] Apply font-display for title
- [ ] Apply font-body for content
- [ ] Add padding (space-6)
- [ ] Add max-width based on size variant

### Size Variants
- [ ] Create sm variant (max-width: 400px)
- [ ] Create md variant (max-width: 560px)
- [ ] Create lg variant (max-width: 720px)
- [ ] Create xl variant (max-width: 960px)

### Overlay
- [ ] Apply blur backdrop (backdrop-blur-md)
- [ ] Apply espresso-dark with opacity
- [ ] Apply z-overlay z-index

### Animations
- [ ] Add open animation (fade in + scale)
- [ ] Add close animation (fade out + scale)
- [ ] Use retro timing curves (ease-smooth)
- [ ] Respect reduced motion

### Accessibility
- [ ] Proper ARIA attributes (Dialog.Root)
- [ ] Focus trap implementation
- [ ] Escape key close
- [ ] Click outside close
- [ ] Return focus on close
- [ ] Screen reader announcements
- [ ] Test with keyboard navigation
- [ ] Test with screen reader

### TypeScript
- [ ] Define RetroDialogProps interface
- [ ] Define RetroDialogContentProps interface
- [ ] Add proper types for all props
- [ ] No any types

### Exports
- [ ] Export RetroDialog
- [ ] Export RetroDialogContent
- [ ] Export RetroDialogHeader
- [ ] Export RetroDialogTitle
- [ ] Export RetroDialogDescription
- [ ] Export RetroDialogFooter
- [ ] Export RetroDialogClose

## SUCCESS CRITERIA
- [ ] retro-dialog.tsx created at /frontend/src/components/ui/retro-dialog.tsx
- [ ] Radix Dialog primitive wrapped
- [ ] Retro styling applied
- [ ] Size variants working
- [ ] Animations working
- [ ] Blur overlay functional
- [ ] Accessibility features working
- [ ] Keyboard navigation working
- [ ] Screen reader compatible
- [ ] TypeScript types defined
- [ ] No console errors

---

# ═══════════════════════════════════════════════════════════════
# TASK P1-10: CREATE RETRO BUTTON WRAPPER
# ═══════════════════════════════════════════════════════════════════

## FILE TO CREATE/MODIFY
**Path:** `/frontend/src/components/ui/retro-button.tsx`
**Action:** Create Radix Button wrapper with retro styling

## FEATURES TO IMPLEMENT

### Button Wrapper
- Radix Button/Slot primitive
- Force radius-full (pill shape)
- Retro shadow (shadow-button)
- Retro interaction states
- Size variants
- Color variants

### Button Variants
- Primary (terracotta-warm background)
- Secondary (espresso-dark background)
- Outline (cream-white with border)
- Ghost (transparent with hover)
- Destructive (coral-pop)

### Interaction States
- Hover state (darker color + lift)
- Active state (pressed down)
- Disabled state (grayscale + disabled)
- Focus state (3px coral-pop outline)
- Loading state (spinner)

## INTERFACES/TYPES
```typescript
import * as SlotPrimitive from '@radix-ui/react-slot';

export interface RetroButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  children?: React.ReactNode;
}
```

## DETAILED CHECKLIST

### Component Structure
- [ ] Import Slot from '@radix-ui/react-slot'
- [ ] Create RetroButton component
- [ ] Support asChild prop for composition

### Base Styling
- [ ] Apply radius-full (pill shape)
- [ ] Apply font-display
- [ ] Apply font-weight-700
- [ ] Apply py-2 px-6 padding
- [ ] Apply transition-all
- [ ] Apply duration-fast
- [ ] Apply ease-smooth

### Primary Variant
- [ ] terracotta-warm background
- [ ] cream-white text
- [ ] shadow-button
- [ ] Hover: darker terracotta
- [ ] Hover: translate-y-px
- [ ] Active: translate-y-0
- [ ] Disabled: grayscale opacity-50

### Secondary Variant
- [ ] espresso-dark background
- [ ] cream-white text
- [ ] shadow-button
- [ ] Hover: darker espresso
- [ ] Hover: translate-y-px

### Outline Variant
- [ ] cream-white background
- [ ] terracotta-warm border
- [ ] terracotta-warm text
- [ ] Hover: terracotta-warm background
- [ ] Hover: cream-white text

### Ghost Variant
- [ ] transparent background
- [ ] espresso-dark text
- [ ] Hover: honey-light background
- [ ] Focus: outline visible

### Destructive Variant
- [ ] coral-pop background
- [ ] cream-white text
- [ ] Hover: darker coral
- [ ] Active: pressed state

### Size Variants
- [ ] sm variant: py-1 px-4 text-sm
- [ ] md variant: py-2 px-6 text-base
- [ ] lg variant: py-3 px-8 text-lg
- [ ] xl variant: py-4 px-10 text-xl

### Loading State
- [ ] Show spinner when loading
- [ ] Disable button when loading
- [ ] Hide children when loading
- [ ] Add loading prop

### Focus State
- [ ] 3px coral-pop outline
- [ ] 3px outline-offset
- [ ] Works with keyboard

### Disabled State
- [ ] cursor-not-allowed
- [ ] grayscale filter
- [ ] opacity-50
- [ ] No hover effects
- [ ] No active effects

### TypeScript
- [ ] Extend ButtonHTMLAttributes
- [ ] Add variant prop type
- [ ] Add size prop type
- [ ] Add loading prop type
- [ ] Add asChild prop type

### Accessibility
- [ ] Proper button element or asChild
- [ ] Disabled attribute
- [ ] type attribute support (submit, button, reset)
- [ ] ARIA attributes preserved

## SUCCESS CRITERIA
- [ ] retro-button.tsx created at /frontend/src/components/ui/retro-button.tsx
- [ ] All 5 variants implemented
- [ ] All 4 sizes implemented
- [ ] Radius-full styling applied
- [ ] Shadow-button styling applied
- [ ] Hover states working
- [ ] Active states working
- [ ] Disabled state working
- [ ] Loading state working
- [ ] Focus state working
- [ ] TypeScript types defined
- [ ] No console errors

---

# ═══════════════════════════════════════════════════════════════
# TASK P1-11: CREATE RETRO DROPDOWN WRAPPER
# ═══════════════════════════════════════════════════════════════════

## FILE TO CREATE/MODIFY
**Path:** `/frontend/src/components/ui/retro-dropdown.tsx`
**Action:** Create Radix Dropdown Menu wrapper with retro styling

## FEATURES TO IMPLEMENT

### Dropdown Wrapper
- Radix Dropdown Menu primitive
- Retro menu styling
- Warm color palette
- Rounded corners (radius-lg)
- Soft shadows
- Retro hover states

### Menu Items
- Retro item styling
- Icon support
- Keyboard navigation
- Divider support
- Checkbox/radio support

### Accessibility
- Proper ARIA attributes
- Focus management
- Keyboard navigation
- Screen reader support

## INTERFACES/TYPES
```typescript
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export interface RetroDropdownMenuProps {
  children?: React.ReactNode;
}

export interface RetroDropdownMenuContentProps {
  children?: React.ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
}
```

## DETAILED CHECKLIST

### Component Structure
- [ ] Import DropdownMenu from '@radix-ui/react-dropdown-menu'
- [ ] Create RetroDropdownMenu component
- [ ] Create RetroDropdownMenuTrigger component
- [ ] Create RetroDropdownMenuContent component
- [ ] Create RetroDropdownMenuItem component
- [ ] Create RetroDropdownMenuSeparator component
- [ ] Create RetroDropdownMenuLabel component
- [ ] Create RetroDropdownMenuCheckboxItem component

### Menu Content Styling
- [ ] Apply radius-lg border radius
- [ ] Apply cream-white background
- [ ] Apply terracotta-warm border
- [ ] Apply shadow-lg
- [ ] Apply py-2 padding
- [ ] Apply min-width-48

### Menu Item Styling
- [ ] Apply px-4 py-2 padding
- [ ] Apply font-body
- [ ] Apply text-sm
- [ ] Apply transition-all
- [ ] Hover: honey-light background
- [ ] Hover: cursor-pointer
- [ ] Focus: outline visible

### Menu Separator Styling
- [ ] Apply honey-light background
- [ ] Apply h-px
- [ ] Apply my-1 margin

### Menu Label Styling
- [ ] Apply px-4 py-2 padding
- [ ] Apply font-display
- [ ] Apply font-size-xs
- [ ] Apply text-espresso-dark
- [ ] Apply opacity-60

### Menu Checkbox Styling
- [ ] Apply retro checkbox indicator
- [ ] Apply checkmark styling
- [ ] Support checked state

### Accessibility
- [ ] Proper ARIA attributes
- [ ] Focus trap within menu
- [ ] Arrow key navigation
- [ ] Escape key close
- [ ] Click outside close
- [ ] Screen reader announcements

### TypeScript
- [ ] Define RetroDropdownMenuProps
- [ ] Define RetroDropdownMenuContentProps
- [ ] Add proper types for all props

### Exports
- [ ] Export RetroDropdownMenu
- [ ] Export RetroDropdownMenuTrigger
- [ ] Export RetroDropdownMenuContent
- [ ] Export RetroDropdownMenuItem
- [ ] Export RetroDropdownMenuSeparator
- [ ] Export RetroDropdownMenuLabel
- [ ] Export RetroDropdownMenuCheckboxItem

## SUCCESS CRITERIA
- [ ] retro-dropdown.tsx created
- [ ] Radix Dropdown Menu primitive wrapped
- [ ] Retro styling applied
- [ ] Menu items styled correctly
- [ ] Hover states working
- [ ] Keyboard navigation working
- [ ] Screen reader compatible
- [ ] TypeScript types defined

---

# ═══════════════════════════════════════════════════════════════
# TASK P1-12: CREATE RETRO POPOVER WRAPPER
# ═══════════════════════════════════════════════════════════════════

## FILE TO CREATE/MODIFY
**Path:** `/frontend/src/components/ui/retro-popover.tsx`
**Action:** Create Radix Popover wrapper with retro styling

## FEATURES TO IMPLEMENT

### Popover Wrapper
- Radix Popover primitive
- Retro card styling
- Warm color palette
- Rounded corners
- Soft shadows
- Retro hover states

### Popover Content
- Card styling
- Arrow support
- Positioning options
- Close on escape
- Close on click outside

## INTERFACES/TYPES
```typescript
import * as Popover from '@radix-ui/react-popover';

export interface RetroPopoverProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export interface RetroPopoverContentProps {
  children?: React.ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
}
```

## DETAILED CHECKLIST

### Component Structure
- [ ] Import Popover from '@radix-ui/react-popover'
- [ ] Create RetroPopover component
- [ ] Create RetroPopoverTrigger component
- [ ] Create RetroPopoverContent component
- [ ] Create RetroPopoverAnchor component
- [ ] Create RetroPopoverClose component
- [ ] Create RetroPopoverArrow component

### Content Styling
- [ ] Apply radius-xl border radius
- [ ] Apply cream-white background
- [ ] Apply terracotta-warm border
- [ ] Apply shadow-lg
- [ ] Apply p-6 padding

### Arrow Styling
- [ ] Apply terracotta-warm fill
- [ ] Apply proper offset

### Trigger Styling
- [ ] Preserve trigger styles
- [ ] Support asChild prop

### Accessibility
- [ ] Proper ARIA attributes
- [ ] Focus management
- [ ] Escape key close
- [ ] Click outside close
- [ ] Return focus on close

### TypeScript
- [ ] Define RetroPopoverProps
- [ ] Define RetroPopoverContentProps

### Exports
- [ ] Export all popover components

## SUCCESS CRITERIA
- [ ] retro-popover.tsx created
- [ ] Radix Popover primitive wrapped
- [ ] Retro styling applied
- [ ] Positioning working
- [ ] Accessibility features working
- [ ] TypeScript types defined

---

# ═══════════════════════════════════════════════════════════════
# TASK P1-13: CREATE RETRO SELECT WRAPPER
# ═══════════════════════════════════════════════════════════════════

## FILE TO CREATE/MODIFY
**Path:** `/frontend/src/components/ui/retro-select.tsx`
**Action:** Create Radix Select wrapper with retro styling

## FEATURES TO IMPLEMENT

### Select Wrapper
- Radix Select primitive
- Retro trigger styling
- Retro content styling
- Retro option styling
- Retro item styling

## INTERFACES/TYPES
```typescript
import * as Select from '@radix-ui/react-select';

export interface RetroSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
}
```

## DETAILED CHECKLIST

### Component Structure
- [ ] Import Select from '@radix-ui/react-select'
- [ ] Create RetroSelect component
- [ ] Create RetroSelectTrigger component
- [ ] Create RetroSelectValue component
- [ ] Create RetroSelectContent component
- [ ] Create RetroSelectItem component
- [ ] Create RetroSelectScrollUpButton component
- [ ] Create RetroSelectScrollDownButton component

### Trigger Styling
- [ ] Apply radius-md border radius
- [ ] Apply cream-white background
- [ ] Apply terracotta-warm border
- [ ] Apply px-4 py-2 padding
- [ ] Apply font-body
- [ ] Apply cursor-pointer

### Content Styling
- [ ] Apply radius-md border radius
- [ ] Apply cream-white background
- [ ] Apply terracotta-warm border
- [ ] Apply shadow-lg
- [ ] Apply p-1 padding

### Item Styling
- [ ] Apply px-4 py-2 padding
- [ ] Apply font-body
- [ ] Hover: honey-light background
- [ ] Focus: outline visible
- [ ] Selected: terracotta-warm background

### Accessibility
- [ ] Proper ARIA attributes
- [ ] Keyboard navigation
- [ ] Screen reader support

## SUCCESS CRITERIA
- [ ] retro-select.tsx created
- [ ] Radix Select primitive wrapped
- [ ] Retro styling applied
- [ ] Options working
- [ ] Keyboard navigation working

---

# ═══════════════════════════════════════════════════════════════
# TASK P1-14: CREATE RETRO CHECKBOX WRAPPER
# ═══════════════════════════════════════════════════════════════════

## FILE TO CREATE/MODIFY
**Path:** `/frontend/src/components/ui/retro-checkbox.tsx`
**Action:** Create Radix Checkbox wrapper with retro styling

## FEATURES TO IMPLEMENT

### Checkbox Wrapper
- Radix Checkbox primitive
- Retro custom indicator
- Retro checked state
- Retro hover states

## INTERFACES/TYPES
```typescript
import * as Checkbox from '@radix-ui/react-checkbox';

export interface RetroCheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}
```

## DETAILED CHECKLIST

### Component Structure
- [ ] Import Checkbox from '@radix-ui/react-checkbox'
- [ ] Create RetroCheckbox component
- [ ] Create custom indicator

### Indicator Styling
- [ ] Apply radius-sm border radius
- [ ] Apply cream-white background
- [ ] Apply terracotta-warm border
- [ ] Apply w-5 h-5
- [ ] Checked: terracotta-warm background
- [ ] Checked: white checkmark
- [ ] Hover: border-2

### Label Styling
- [ ] Apply font-body
- [ ] Apply ml-2
- [ ] Apply cursor-pointer

### Accessibility
- [ ] Proper ARIA attributes
- [ ] Keyboard navigation
- [ ] Focus state visible

## SUCCESS CRITERIA
- [ ] retro-checkbox.tsx created
- [ ] Radix Checkbox primitive wrapped
- [ ] Retro styling applied
- [ ] Checkmark working
- [ ] Accessibility features working

---

# ═══════════════════════════════════════════════════════════════
# TASK P1-15: CREATE RETRO SWITCH WRAPPER
# ═══════════════════════════════════════════════════════════════════

## FILE TO CREATE/MODIFY
**Path:** `/frontend/src/components/ui/retro-switch.tsx`
**Action:** Create Radix Switch wrapper with retro styling

## FEATURES TO IMPLEMENT

### Switch Wrapper
- Radix Switch primitive
- Retro thumb styling
- Retro track styling
- Retro toggle animation

## INTERFACES/TYPES
```typescript
import * as Switch from '@radix-ui/react-switch';

export interface RetroSwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}
```

## DETAILED CHECKLIST

### Component Structure
- [ ] Import Switch from '@radix-ui/react-switch'
- [ ] Create RetroSwitch component

### Track Styling
- [ ] Apply radius-full
- [ ] Apply honey-light background
- [ ] Apply w-12 h-6
- [ ] Checked: terracotta-warm background
- [ ] Transition background color

### Thumb Styling
- [ ] Apply radius-full
- [ ] Apply cream-white background
- [ ] Apply w-5 h-5
- [ ] Apply shadow-sm
- [ ] Checked: translate-x-6
- [ ] Transition transform

### Accessibility
- [ ] Proper ARIA attributes
- [ ] Keyboard navigation
- [ ] Focus state visible

## SUCCESS CRITERIA
- [ ] retro-switch.tsx created
- [ ] Radix Switch primitive wrapped
- [ ] Retro styling applied
- [ ] Toggle animation working

---

# ═══════════════════════════════════════════════════════════════
# TASK P1-16: CREATE RETRO PROGRESS WRAPPER
# ═══════════════════════════════════════════════════════════════════

## FILE TO CREATE/MODIFY
**Path:** `/frontend/src/components/ui/retro-progress.tsx`
**Action:** Create Radix Progress wrapper with retro styling

## FEATURES TO IMPLEMENT

### Progress Wrapper
- Radix Progress primitive
- Retro track styling
- Retro fill styling
- Animated fill

## INTERFACES/TYPES
```typescript
import * as Progress from '@radix-ui/react-progress';

export interface RetroProgressProps {
  value?: number;
  max?: number;
}
```

## DETAILED CHECKLIST

### Component Structure
- [ ] Import Progress from '@radix-ui/react-progress'
- [ ] Create RetroProgress component

### Track Styling
- [ ] Apply radius-full
- [ ] Apply honey-light background
- [ ] Apply h-2

### Fill Styling
- [ ] Apply radius-full
- [ ] Apply terracotta-warm background
- [ ] Animate fill transition
- [ ] Apply shadow-glow

### Accessibility
- [ ] Proper ARIA attributes
- [ ] Screen reader announcements

## SUCCESS CRITERIA
- [ ] retro-progress.tsx created
- [ ] Radix Progress primitive wrapped
- [ ] Retro styling applied
- [ ] Fill animation working

---

# ═══════════════════════════════════════════════════════════════
# TASK P1-17: CREATE RETRO SLIDER WRAPPER
# ═══════════════════════════════════════════════════════════════════

## FILE TO CREATE/MODIFY
**Path:** `/frontend/src/components/ui/retro-slider.tsx`
**Action:** Create Radix Slider wrapper with retro styling

## FEATURES TO IMPLEMENT

### Slider Wrapper
- Radix Slider primitive
- Retro track styling
- Retro thumb styling
- Retro hover states

## INTERFACES/TYPES
```typescript
import * as Slider from '@radix-ui/react-slider';

export interface RetroSliderProps {
  value?: number[];
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}
```

## DETAILED CHECKLIST

### Component Structure
- [ ] Import Slider from '@radix-ui/react-slider'
- [ ] Create RetroSlider component

### Track Styling
- [ ] Apply radius-full
- [ ] Apply honey-light background
- [ ] Apply h-2
- [ ] Active: terracotta-warm background

### Thumb Styling
- [ ] Apply radius-full
- [ ] Apply terracotta-warm background
- [ ] Apply w-5 h-5
- [ ] Apply shadow-button
- [ ] Hover: scale-110
- [ ] Focus: 3px coral-pop outline

### Accessibility
- [ ] Proper ARIA attributes
- [ ] Keyboard navigation
- [ ] Focus state visible

## SUCCESS CRITERIA
- [ ] retro-slider.tsx created
- [ ] Radix Slider primitive wrapped
- [ ] Retro styling applied
- [ ] Thumb hover working

---

# ═══════════════════════════════════════════════════════════════
# SECTION 4: ANIMATION CONFIGURATION (6 Tasks)
# ═══════════════════════════════════════════════════════════════════

# ═══════════════════════════════════════════════════════════════
# TASK P1-18: ADD SLOW ROTATE ANIMATION
# ═══════════════════════════════════════════════════════════════════

## FILE TO MODIFY
**Path:** `/frontend/tailwind.config.ts`
**Action:** Add slow-rotate animation for sunburst

## FEATURES TO IMPLEMENT

### Animation Definition
- 120s linear infinite
- 0%: translateX(-50%) rotate(0deg)
- 100%: translateX(-50%) rotate(360deg)

## DETAILED CHECKLIST
- [ ] Add 'slow-rotate' to animations
- [ ] Define 'slowRotate' keyframe
- [ ] Set duration to 120s
- [ ] Set timing function to linear
- [ ] Set iteration to infinite
- [ ] Define from transform
- [ ] Define to transform

## SUCCESS CRITERIA
- [ ] animate-slow-rotate class available
- [ ] Animation rotates 360 degrees over 120s
- [ ] Timing is linear
- [ ] Iterates infinitely

---

# ═══════════════════════════════════════════════════════════════
# TASK P1-19: ADD BEAN BOUNCE ANIMATION
# ═══════════════════════════════════════════════════════════════════

## FILE TO MODIFY
**Path:** `/frontend/tailwind.config.ts`
**Action:** Add bean-bounce animation

## DETAILED CHECKLIST
- [ ] Add 'bean-bounce' to animations
- [ ] Define 'beanBounce' keyframe
- [ ] 0%, 100%: translateY(0)
- [ ] 50%: translateY(-8px)

## SUCCESS CRITERIA
- [ ] animate-bean-bounce class available
- [ ] Animation bounces up and down

---

# ═══════════════════════════════════════════════════════════════
# TASK P1-20: ADD STEAM RISE ANIMATION
# ═══════════════════════════════════════════════════════════════════

## FILE TO MODIFY
**Path:** `/frontend/tailwind.config.ts`
**Action:** Add steam-rise animation

## DETAILED CHECKLIST
- [ ] Add 'steam-rise' to animations
- [ ] Define 'steamRise' keyframe
- [ ] 0%: opacity 0, translateY 0, scale 1
- [ ] 50%: opacity 1
- [ ] 100%: opacity 0, translateY -30px, scale 0.5

## SUCCESS CRITERIA
- [ ] animate-steam-rise class available
- [ ] Particles fade in, rise, fade out

---

# ═══════════════════════════════════════════════════════════════
# TASK P1-21: ADD GENTLE FLOAT ANIMATION
# ═══════════════════════════════════════════════════════════════════

## FILE TO MODIFY
**Path:** `/frontend/tailwind.config.ts`
**Action:** Add gentle-float animation

## DETAILED CHECKLIST
- [ ] Add 'gentle-float' to animations
- [ ] Define 'gentleFloat' keyframe
- [ ] 0%, 100%: translateY(0) rotate(0deg)
- [ ] 50%: translateY(-20px) rotate(3deg)

## SUCCESS CRITERIA
- [ ] animate-gentle-float class available
- [ ] Hero illustration floats gently

---

# ═══════════════════════════════════════════════════════════════
# TASK P1-22: ADD MARKER PULSE ANIMATION
# ═══════════════════════════════════════════════════════════════════

## FILE TO MODIFY
**Path:** `/frontend/tailwind.config.ts`
**Action:** Add marker-pulse animation

## DETAILED CHECKLIST
- [ ] Add 'marker-pulse' to animations
- [ ] Define 'markerPulse' keyframe
- [ ] 0%, 100%: scale(1)
- [ ] 50%: scale(1.1)

## SUCCESS CRITERIA
- [ ] animate-marker-pulse class available
- [ ] Map markers pulse on hover

---

# ═══════════════════════════════════════════════════════════════
# TASK P1-23: ADD FADE IN ANIMATION
# ═══════════════════════════════════════════════════════════════════

## FILE TO MODIFY
**Path:** `/frontend/tailwind.config.ts`
**Action:** Add fade-in animation with visible class

## DETAILED CHECKLIST
- [ ] Add 'fade-in' to animations
- [ ] Define 'fadeIn' keyframe
- [ ] 0%: opacity 0, translateY 20px
- [ ] 100%: opacity 1, translateY 0
- [ ] Create visible class for triggering

## SUCCESS CRITERIA
- [ ] animate-fade-in class available
- [ ] Fade-in works on scroll

---

# ═══════════════════════════════════════════════════════════════
# SECTION 5: FRONTEND ANIMATION UTILITIES (4 Tasks)
# ═══════════════════════════════════════════════════════════════════

# ═══════════════════════════════════════════════════════════════
# TASK P1-24: CREATE FADEIN COMPONENT
# ═══════════════════════════════════════════════════════════════════

## FILE TO CREATE/MODIFY
**Path:** `/frontend/src/components/ui/fade-in.tsx`
**Action:** Create FadeIn component with Intersection Observer

## FEATURES TO IMPLEMENT

### FadeIn Component
- Intersection Observer for viewport detection
- Fade-in animation when visible
- Staggered delay support
- Duration support
- Respects reduced motion

## INTERFACES/TYPES
```typescript
export interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  threshold?: number;
  once?: boolean;
}
```

## DETAILED CHECKLIST

### Component Structure
- [ ] Create FadeIn component
- [ ] Accept children prop
- [ ] Accept delay prop
- [ ] Accept duration prop
- [ ] Accept threshold prop
- [ ] Accept once prop

### Intersection Observer
- [ ] Create ref for element
- [ ] Setup IntersectionObserver
- [ ] Detect when element enters viewport
- [ ] Trigger animation when visible
- [ ] Cleanup observer on unmount

### Animation Styling
- [ ] Initial state: opacity 0, translateY 20px
- [ ] Animate to: opacity 1, translateY 0
- [ ] Apply delay
- [ ] Apply duration
- [ ] Use ease-smooth timing

### Reduced Motion
- [ ] Check prefers-reduced-motion
- [ ] Skip animation if reduced motion enabled
- [ ] Show content immediately

### TypeScript
- [ ] Define FadeInProps interface
- [ ] Add proper types for all props

## SUCCESS CRITERIA
- [ ] fade-in.tsx created
- [ ] Intersection Observer working
- [ ] Fade-in animation triggers on scroll
- [ ] Staggered delay working
- [ ] Respects reduced motion

---

# ═══════════════════════════════════════════════════════════════
# TASK P1-25: CREATE USEINVIEW HOOK
# ═══════════════════════════════════════════════════════════════════

## FILE TO CREATE/MODIFY
**Path:** `/frontend/src/hooks/use-in-view.ts`
**Action:** Create useInView hook for element visibility

## FEATURES TO IMPLEMENT

### useInView Hook
- Intersection Observer for visibility
- Return ref and inView state
- Configurable threshold
- Configurable root margin
- Cleanup observer

## INTERFACES/TYPES
```typescript
export interface UseInViewOptions {
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
  initialInView?: boolean;
}

export function useInView(options?: UseInViewOptions): {
  ref: React.RefObject<HTMLElement>;
  inView: boolean;
  entry: IntersectionObserverEntry | null;
}
```

## DETAILED CHECKLIST

### Hook Structure
- [ ] Create useInView function
- [ ] Accept options parameter
- [ ] Return ref, inView, entry

### Intersection Observer
- [ ] Create ref for element
- [ ] Setup IntersectionObserver
- [ ] Track inView state
- [ ] Update on intersection change
- [ ] Cleanup observer on unmount

### Options
- [ ] Support threshold option
- [ ] Support rootMargin option
- [ ] Support triggerOnce option
- [ ] Support initialInView option

### TypeScript
- [ ] Define UseInViewOptions interface
- [ ] Define return type
- [ ] Add proper types

## SUCCESS CRITERIA
- [ ] use-in-view.ts created
- [ ] Hook returns ref and inView state
- [ ] Intersection Observer working
- [ ] Cleanup working

---

# ═══════════════════════════════════════════════════════════════
# TASK P1-26: CREATE ANIMATEDSECTION COMPONENT
# ═══════════════════════════════════════════════════════════════════

## FILE TO CREATE/MODIFY
**Path:** `/frontend/src/components/ui/animated-section.tsx`
**Action:** Create AnimatedSection wrapper component

## FEATURES TO IMPLEMENT

### AnimatedSection Component
- Wrap children with FadeIn
- Apply section-level animation
- Stagger children support

## INTERFACES/TYPES
```typescript
export interface AnimatedSectionProps {
  children: React.ReactNode;
  delay?: number;
  staggerChildren?: boolean;
  staggerDelay?: number;
}
```

## DETAILED CHECKLIST

### Component Structure
- [ ] Create AnimatedSection component
- [ ] Accept children prop
- [ ] Accept delay prop
- [ ] Accept staggerChildren prop
- [ ] Accept staggerDelay prop

### Animation Logic
- [ ] Wrap content with FadeIn
- [ ] Apply delay
- [ ] Stagger children if enabled
- [ ] Calculate stagger delays

### TypeScript
- [ ] Define AnimatedSectionProps interface

## SUCCESS CRITERIA
- [ ] animated-section.tsx created
- [ ] Fade-in animation applied
- [ ] Stagger working

---

# ═══════════════════════════════════════════════════════════════
# TASK P1-27: CREATE FADEIN UTILITY CLASS
# ═══════════════════════════════════════════════════════════════════

## FILE TO CREATE/MODIFY
**Path:** `/frontend/src/styles/animations.css`
**Action:** Create FadeIn utility class

## FEATURES TO IMPLEMENT

### FadeIn Utility
- .fade-in class
- .visible class to trigger
- CSS transition

## DETAILED CHECKLIST
- [ ] Create .fade-in class
- [ ] Set initial opacity 0
- [ ] Set initial transform translateY 20px
- [ ] Add transition
- [ ] Create .visible class
- [ ] Set opacity 1
- [ ] Set translateY 0

## SUCCESS CRITERIA
- [ ] animations.css created
- [ ] fade-in utility working
- [ ] visible class triggers animation

---

## PHASE 1 VALIDATION CHECKPOINT

### Design Token Validation
- [ ] All 38 color variables extracted with RGB values
- [ ] All 3 gradients documented
- [ ] All 2 font families documented
- [ ] All 13 spacing values mapped
- [ ] All 6 border radii defined
- [ ] All 4 shadows defined
- [ ] All 6 animation curves captured
- [ ] All 4 texture data URIs extracted

### Retro Component Wrappers
- [ ] All 9 retro component wrappers created
- [ ] Dialog wrapper styled
- [ ] Button wrapper styled
- [ ] Dropdown wrapper styled
- [ ] Popover wrapper styled
- [ ] Select wrapper styled
- [ ] Checkbox wrapper styled
- [ ] Switch wrapper styled
- [ ] Progress wrapper styled
- [ ] Slider wrapper styled

### Animation Configuration
- [ ] All 6 Tailwind animations configured
- [ ] slow-rotate working
- [ ] bean-bounce working
- [ ] steam-rise working
- [ ] gentle-float working
- [ ] marker-pulse working
- [ ] fade-in working

### Frontend Animation Utilities
- [ ] FadeIn component created
- [ ] useInView hook created
- [ ] AnimatedSection component created
- [ ] FadeIn utility class created

### WCAG AAA Compliance
- [ ] All color pairs meet 7:1 contrast
- [ ] Large text exemptions documented
- [ ] Focus indicators visible
- [ ] Reduced motion supported

### Documentation
- [ ] Design token inventory complete
- [ ] WCAG validation report complete
- [ ] All components documented

---

## PHASE 1 SUMMARY

**Total Tasks:** 27
**Estimated Effort:** 10-14 hours
**Deliverables:**
- Design token inventory document
- tokens.css with all custom properties
- globals.css with reset and base styles
- tailwind.config.ts with complete token mapping
- utils.ts with all utility functions
- 9 retro-styled Shadcn UI wrappers
- 6 custom Tailwind animations
- 4 animation utility components/hooks
- patterns.css with decorative patterns
- accessibility.css with reduced motion and print styles
- WCAG AAA validation report

**NEXT STEPS:**
1. Complete Phase 1 validation checkpoint
2. Begin Phase 2: Frontend Architecture & Page Structure
3. Execute Phase 2 tasks in dependency order

---

## DOCUMENT END

**Phase 1 Detailed Sub-Plan Complete**

This completes the comprehensive Phase 1 sub-plan with all 27 tasks, including detailed breakdowns for:
- Section 1: Design Token Extraction (P1-1 through P1-4)
- Section 2: Design Token Validation (P1-5 through P1-8)
- Section 3: Retro-Fit Abstraction Layer (P1-9 through P1-17)
- Section 4: Animation Configuration (P1-18 through P1-23)
- Section 5: Frontend Animation Utilities (P1-24 through P1-27)

All tasks include file paths, features, interfaces/types, detailed checklists, and success criteria.
