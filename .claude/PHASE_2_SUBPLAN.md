# PHASE 2: FRONTEND ARCHITECTURE & PAGE STRUCTURE SUB-PLAN

**Objective:** Transform the static HTML mockup into a robust Next.js 15 App Router structure. This phase focuses on layout, navigation, and the faithful recreation of the visual aesthetic using React components and Tailwind CSS v4, strictly adhering to the "Anti-Generic" design philosophy.

**Source of Truth:** `static_landing_page_mockup.html` and `VALIDATED_EXECUTION_PLAN.md`.

## 1. Page Structure & Layout Implementation

### 1.1 Root Layout & Global Providers
**File:** `frontend/src/app/layout.tsx`
**Description:** The root shell of the application.
- **Features:**
    - Import `globals.css` (with Tailwind layers).
    - `ThemeProvider` (Shadcn/Next-themes) wrapper.
    - `SkipLink` component (from Phase 1/Mockup) for accessibility.
    - `Header` and `Footer` components.
    - Font configuration (`Fraunces` and `DM Sans`) via `next/font/google`.
    - Metadata configuration (title, description, open graph).
- **Checklist:**
    - [ ] Fonts configured correctly (`variable` mode).
    - [ ] `SkipLink` targets main content area.
    - [ ] Header/Footer present on all pages.
    - [ ] Background texture (grain overlay) applied via CSS or simple component.

### 1.2 Shared Layout Components
**Files:**
- `frontend/src/components/layout/header.tsx`
- `frontend/src/components/layout/footer.tsx`
- `frontend/src/components/layout/mobile-menu.tsx`
- `frontend/src/components/ui/wave-divider.tsx`

**Description:**
- **Header:** Sticky positioning, transparent-to-solid on scroll (glassmorphism), logo with 70s flair, desktop navigation, cart trigger, mobile menu toggle.
- **Mobile Menu:** Full-screen overlay, animated entrance, ARIA management (trap focus), close on `Esc` or click outside.
- **Footer:** Espresso dark theme, grid layout, social links with hover effects, decorative top border.
- **WaveDivider:** Reusable SVG component prop `flip` to invert orientation (top/bottom).

**Checklist:**
- [ ] Header glassmorphism effect matches mockup (`backdrop-blur`).
- [ ] Mobile menu is fully accessible (keyboard trap).
- [ ] Wave divider supports both top and bottom orientations.
- [ ] Footer links have the specific hover transition defined in mockup.

## 2. Page Components (BFF Architecture)

### 2.1 Hero Section (Server Component)
**File:** `frontend/src/app/page.tsx` (Home Page / Hero Section)
**Description:** The "Sunrise at the Kopitiam" visual hook.
- **Features:**
    - `SunburstBackground` animation.
    - `FloatingCoffeeCup` illustration (SVG).
    - `HeroStats` with fade-in animation.
    - Main CTA buttons ("Explore Menu", "Order Online").
    - "Est. 1973" Retro Badge.
- **Checklist:**
    - [ ] Sunburst animation rotates smoothly (120s cycle).
    - [ ] Floating cup has gentle float animation.
    - [ ] Text hierarchy matches `Fraunces` display typography.

### 2.2 Menu Section (Client Component)
**File:** `frontend/src/app/menu/page.tsx`
**Description:** Interactive menu display.
- **Features:**
    - Category filter buttons (`All`, `Kopi`, `Teh`, `Food`) - *Note: Local state for now, will connect to store in Phase 3*.
    - Product Grid with `MenuCard` components.
    - `MenuCard`: "Vintage Ticket" style, hover lift effect, `BeanBounce` animation on hover.
- **Checklist:**
    - [ ] Filter buttons show active state.
    - [ ] Grid responsiveness (auto-fill minmax).
    - [ ] Menu cards have the specific "ticket stub" top border gradient.

### 2.3 Heritage Section (Server Component)
**File:** `frontend/src/app/heritage/page.tsx`
**Description:** Storytelling section with rich typography.
- **Features:**
    - Editorial layout with `DropCap`.
    - `PolaroidGallery` with rotated images.
    - Values grid (Authentic, Community, Sustainable).
    - Blockquote with vintage styling.
- **Checklist:**
    - [ ] Typography uses correct editorial styles (Drop cap, blockquote).
    - [ ] Polaroids have random/staggered rotation angles.
    - [ ] Wood grain texture overlay (subtle).

### 2.4 Locations Section (Client Component)
**File:** `frontend/src/app/locations/page.tsx`
**Description:** Store locator information.
- **Features:**
    - Location cards with "Sage Fresh" theme.
    - `MapMarker` pulse animation.
    - Operating hours and features list.
- **Checklist:**
    - [ ] Location cards hover lift effect.
    - [ ] Map markers pulse continuously.
    - [ ] Features icons render correctly.

## 3. Decorative & Animation Components

**Directory:** `frontend/src/components/decorative/`

- **`SunburstBackground.tsx`:** CSS repeating-conic-gradient.
- **`BeanBounce.tsx`:** 3 SVGs of coffee beans with staggered animation delays (`animation-delay`).
- **`SteamRise.tsx`:** Particle system for hot coffee steam.
- **`FloatingCoffeeCup.tsx`:** Complex SVG composition from mockup.
- **`MapMarker.tsx`:** SVG with pulsing ring effect.
- **`PolaroidGallery.tsx`:** Container for images with CSS transform rotation.
- **`CoffeeRing.tsx`:** SVG background decoration.
- **`HeroStats.tsx`:** layout for numbers with label, supports fade-in.

## 4. Implementation Steps & Verification

### Step 1: Layout Core
1.  Setup `layout.tsx` with fonts and providers.
2.  Implement `Header`, `Footer`, and `MobileMenu`.
3.  **Verify:** Navigation works, mobile menu opens/closes, responsive behavior.

### Step 2: Decorative Primitives
1.  Implement all components in `src/components/decorative/`.
2.  **Verify:** Animations run smoothly, `prefers-reduced-motion` is respected.

### Step 3: Page Composition
1.  Build `Hero` section.
2.  Build `Menu` section (UI only, mock data).
3.  Build `Heritage` section.
4.  Build `Locations` section.
5.  **Verify:** Visual regression check against `static_landing_page_mockup.html`.

### Step 4: Refinement
1.  Apply `WaveDivider` between sections.
2.  Ensure `FadeIn` (from Phase 1) is applied to section contents.
3.  Check accessibility (ARIA labels, focus states).

## 5. Success Criteria
- [ ] Visual fidelity: 95%+ match with the HTML mockup.
- [ ] Performance: LCP < 2.5s, CLS < 0.1.
- [ ] Accessibility: Keyboard navigation works for Menu/Header.
- [ ] Responsiveness: seamless transition from Mobile -> Tablet -> Desktop.
- [ ] "Soul": The retro 70s vibe is preserved via fonts, colors, and specific animations.
