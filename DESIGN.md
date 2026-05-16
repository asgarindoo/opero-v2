---
name: Monochrome Precision
colors:
  surface: '#fdf8f8'
  surface-dim: '#ddd9d8'
  surface-bright: '#fdf8f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3f2'
  surface-container: '#f1edec'
  surface-container-high: '#ebe7e6'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#444748'
  inverse-surface: '#313030'
  inverse-on-surface: '#f4f0ef'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c9c6c5'
  secondary: '#5e5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e1dfdf'
  on-secondary-container: '#626262'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1b1c1c'
  on-tertiary-container: '#848484'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c9c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474646'
  secondary-fixed: '#e4e2e2'
  secondary-fixed-dim: '#c7c6c6'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#464747'
  tertiary-fixed: '#e3e2e2'
  tertiary-fixed-dim: '#c7c6c6'
  on-tertiary-fixed: '#1b1c1c'
  on-tertiary-fixed-variant: '#464747'
  background: '#fdf8f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display:
    fontFamily: Aspekta
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  h1:
    fontFamily: Aspekta
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  h2:
    fontFamily: Aspekta
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  h3:
    fontFamily: Aspekta
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Aspekta
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Aspekta
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Aspekta
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Aspekta
    fontSize: 11px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  accent-note:
    fontFamily: Fasthand
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.2'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1440px
  gutter: 24px
  margin: 48px
  stack-xs: 4px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
  grid-pattern-size: 32px
---

## Brand & Style

This design system is anchored in architectural precision and high-density functionalism. It targets a professional audience that values clarity over decoration, evoking an emotional response of organized control and understated luxury.

The style is a synthesis of **Minimalism** and **Modern Corporate** aesthetics. It utilizes a rigorous grid-based framework, where negative space is treated as a structural element rather than a void. The visual narrative is driven by stark tonal contrasts and a "technical-editorial" feel, using subtle grid overlays to reinforce a sense of alignment and systemic integrity. The aesthetic is intentionally monochromatic to allow the user's data and content to remain the primary focus.

## Colors

The palette is a disciplined grayscale spectrum designed to communicate hierarchy through value rather than hue. 

- **Primary (#080808):** Used for core text, primary actions, and heavy structural lines. It provides the "ink" of the design.
- **Muted (#696969):** Reserved for secondary labels, metadata, and supporting information where focus should be diverted.
- **Accent (#8D8D8D):** Utilized for interactive states, borders, and subtle graphical elements that require visibility without the weight of the primary black.
- **Dark Section (#292929):** A specialized surface color used for navigation sidebars, footers, or immersive "focus" areas to create depth and visual separation.
- **Background (#FFFFFF):** The canvas. High-gloss white maintains the clean, professional SaaS look.

## Typography

The typography strategy leverages the technical clarity of **Aspekta** for all functional UI elements. A high-information-density environment is achieved through tight line heights and meticulous letter spacing in headings.

**Fasthand** serves as a secondary "humanizing" layer. It is used sparingly for handwritten annotations, signatures, tooltips, or brief editorial callouts that break the rigid geometric grid of the primary sans-serif. 

Hierarchy is established through weight transitions and the use of uppercase labels for technical data points. Body text is optimized for readability with a slightly more generous line height than the display styles.

## Layout & Spacing

The layout is built on a **12-column fluid-to-fixed grid**. A base unit of 8px dictates all internal component padding and external margins, ensuring mathematical harmony across the UI.

The information density is high; components are packed closely but separated by clear white space and hairline dividers. A subtle, non-intrusive grid pattern (32px intervals) should be applied to the background of large sections to provide a visual anchor for content alignment. Large sections use 48px margins to provide "breathing room" against the high-density data tables and forms within.

## Elevation & Depth

This design system avoids heavy drop shadows in favor of **Tonal Layers** and **Refined Ambient Depth**. 

- **Level 0 (Base):** The pure white background or the Dark Section (#292929).
- **Level 1 (Cards/Containers):** Flat surfaces defined by a 1px border using the Accent color (#8D8D8D) at low opacity (15%). 
- **Level 2 (Active/Floating):** Subtle, highly diffused shadows with a large blur radius and very low opacity (e.g., `box-shadow: 0 10px 30px rgba(0,0,0,0.04)`).
- **Depth Markers:** Vertical and horizontal hairlines are used more frequently than shadows to denote hierarchy, creating a "blueprint" feel.

## Shapes

The shape language is "Soft-Technical." Elements use a **0.25rem (4px)** corner radius to maintain a professional, crisp appearance while avoiding the harshness of 0px corners. 

Buttons, input fields, and tags all follow this 4px standard. For larger containers like cards or modals, a `rounded-lg` (8px) radius is permitted to soften the visual impact of large blocks. Elements should never reach "pill" status; they must always retain a rectangular presence to uphold the grid-based aesthetic.

## Components

### Buttons
- **Primary:** Solid #080808 background, white Aspekta text. No shadow, 4px radius.
- **Secondary:** Ghost style. 1px border (#8D8D8D), Aspekta text.
- **Tertiary:** Text only, bold weight, with a subtle underline on hover.

### Inputs & Form Fields
Fields use a white background with a 1px border (#8D8D8D). On focus, the border transitions to #080808. Labels use `label-caps` for a technical feel.

### Cards
Cards are defined by their structure rather than their depth. Use a 1px border (#8D8D8D at 20%) and the subtle grid pattern in the background for empty states.

### Chips & Badges
Small, rectangular with 2px radius. Light gray background (#F5F5F5) with Muted (#696969) text.

### Grid Patterns
Apply a CSS-generated dot or line pattern to Section backgrounds. This pattern should be `rgba(8, 8, 8, 0.03)` to ensure it is felt rather than seen, reinforcing the high-end SaaS aesthetic.