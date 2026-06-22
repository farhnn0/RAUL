---
name: Cinematic Editorial
colors:
  surface: '#111317'
  surface-dim: '#111317'
  surface-bright: '#37393e'
  surface-container-lowest: '#0c0e12'
  surface-container-low: '#1a1c20'
  surface-container: '#1e2024'
  surface-container-high: '#282a2e'
  surface-container-highest: '#333539'
  on-surface: '#e2e2e8'
  on-surface-variant: '#d3c5ae'
  inverse-surface: '#e2e2e8'
  inverse-on-surface: '#2f3035'
  outline: '#9b8f7a'
  outline-variant: '#4f4634'
  surface-tint: '#f6be39'
  primary: '#f6be39'
  on-primary: '#402d00'
  primary-container: '#d4a017'
  on-primary-container: '#503a00'
  inverse-primary: '#795900'
  secondary: '#c3c6d0'
  on-secondary: '#2d3138'
  secondary-container: '#43474f'
  on-secondary-container: '#b2b5be'
  tertiary: '#c1c7d4'
  on-tertiary: '#2b313b'
  tertiary-container: '#a2a8b5'
  on-tertiary-container: '#373d48'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdfa0'
  primary-fixed-dim: '#f6be39'
  on-primary-fixed: '#261a00'
  on-primary-fixed-variant: '#5c4300'
  secondary-fixed: '#dfe2ec'
  secondary-fixed-dim: '#c3c6d0'
  on-secondary-fixed: '#181c23'
  on-secondary-fixed-variant: '#43474f'
  tertiary-fixed: '#dde2f0'
  tertiary-fixed-dim: '#c1c7d4'
  on-tertiary-fixed: '#161c25'
  on-tertiary-fixed-variant: '#414752'
  background: '#111317'
  on-background: '#e2e2e8'
  surface-variant: '#333539'
  gold-hover: '#E0AF28'
  surface-card: '#1D232C'
  text-primary: '#FFFFFF'
  text-secondary: '#A7AFBA'
  text-muted: '#6B7280'
typography:
  headline-xl:
    fontFamily: Sora
    fontSize: 64px
    fontWeight: '800'
    lineHeight: 72px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-sm:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1280px
  section-gap: 96px
  grid-gutter: 24px
  margin-page: 24px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is anchored in a cinematic, editorial aesthetic that prioritizes the visual power of film over decorative UI trends. It evokes the feeling of a premium film journal or a high-end physical cinema environment, characterized by deep blacks, metallic accents, and rigorous structural clarity.

The style is **Modern / Corporate** with an editorial lean, focusing on high-contrast legibility and a sophisticated "dark mode first" experience. By avoiding glassmorphism, glows, and neon, the interface recedes to let movie posters and high-fidelity content take center stage. The emotional response is one of authority and timelessness, positioning the platform as a serious destination for film critics and enthusiasts alike.

## Colors

The palette is strictly curated to reflect the "silver screen" heritage. The primary gold accent (#D4A017) serves as the "Director's Spotlight," used sparingly for calls to action, ratings, and critical highlights. 

The background hierarchy uses subtle tonal shifts rather than shadows to define depth:
- **Base:** The deepest black (#0F1115) for page backgrounds.
- **Surface:** A slightly elevated grey (#171B22) for navigation bars and search inputs.
- **Card:** The most prominent elevation level (#1D232C) for interactive movie tiles.
- **Border:** A functional grey (#2A303A) used for hairline strokes to maintain structural definition without adding visual weight.

## Typography

This design system utilizes a high-contrast typographic pairing to reinforce its editorial character. **Sora** provides a bold, geometric presence for headlines, with tight letter-spacing for a modern, high-impact feel. **Inter** is used for all body copy and metadata, chosen for its exceptional legibility and systematic neutrality.

- **Headlines:** Use Sora ExtraBold (800) for hero sections and Sora SemiBold (600) for section titles.
- **Body:** Inter Regular (400) is the standard for reviews and descriptions. Use Medium (500) for emphasis.
- **Labels:** Small caps or increased letter spacing should be applied to labels and metadata (like release years or genres) to distinguish them from prose.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy, centering content within a 1280px max-width container to maintain focus on the editorial experience. 

- **Desktop:** A 12-column grid with 24px gutters. Hero sections use a 60/40 split (Text/Visual).
- **Tablet:** 8-column grid. Carousels reflow to 4 cards.
- **Mobile:** 4-column grid. Section padding reduces from 96px to 48px. Hero sections stack vertically.

The rhythm is generous, using whitespace (section gaps of 96px) to separate different categories and content types, preventing the "cluttered dashboard" look typical of streaming sites.

## Elevation & Depth

Elevation is achieved through **Tonal Layers** and sharp geometric separation rather than atmospheric shadows. 

- **Surface Levels:** The background is #0F1115. Interactive elements like cards sit on #1D232C.
- **Outlines:** Use 1px solid borders (#2A303A) to define containers. Do not use shadows to create depth on static elements.
- **Interactivity:** On hover, movie cards utilize a subtle vertical translation (-4px) to signal interactivity. No glow or drop shadow is added during this state to keep the focus on the image scaling and clarity.

## Shapes

The design system uses a **Rounded** shape language to soften the high-contrast color palette, providing a premium, contemporary feel.

- **Standard Elements:** Buttons and inputs use a 10px - 12px radius.
- **Content Containers:** Movie posters and cards use a 12px radius (`rounded-lg`) to create a consistent framing for artwork.
- **Interactive States:** Radius remains consistent during hover and active states to maintain structural integrity.

## Components

### Buttons
- **Primary:** Solid Gold (#D4A017) with Black text (#0F1115). High contrast for primary conversion points.
- **Secondary:** Ghost style with #2A303A border and White text.
- **State:** 200ms transition for hover, switching to Gold Hover (#E0AF28).

### Movie Cards
- **Structure:** 2:3 Aspect ratio posters with 12px radius. 
- **Content:** Title (Sora), Year (Inter Muted), and Rating (Gold Sora).
- **Behavior:** Subtle `translateY` on hover to provide feedback.

### Search & Inputs
- **Search:** 52px height, #171B22 background with a #2A303A border.
- **Visuals:** Use a minimalist magnifying glass icon. No heavy inner shadows.

### Carousels & Lists
- **Layout:** Standardized 6-card row for desktop. 
- **Interaction:** Snap scrolling enabled for touch and mouse-drag. Arrow navigation placed at the vertical center of the card row.

### Chips & Ratings
- **Ratings:** Always displayed in the primary Gold color to signify their importance as the core platform metric.
- **Genre Chips:** Low-contrast background (#1D232C) with muted text to avoid competing with movie titles.