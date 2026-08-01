---
name: Deep Tech Amber
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#d8c3ad'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#a08e7a'
  outline-variant: '#534434'
  surface-tint: '#ffb95f'
  primary: '#ffc174'
  on-primary: '#472a00'
  primary-container: '#f59e0b'
  on-primary-container: '#613b00'
  inverse-primary: '#855300'
  secondary: '#b7c8e1'
  on-secondary: '#213145'
  secondary-container: '#3a4a5f'
  on-secondary-container: '#a9bad3'
  tertiary: '#56e5a9'
  on-tertiary: '#003824'
  tertiary-container: '#30c88f'
  on-tertiary-container: '#004e34'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffddb8'
  primary-fixed-dim: '#ffb95f'
  on-primary-fixed: '#2a1700'
  on-primary-fixed-variant: '#653e00'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.2'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  container-max: 1440px
---

## Brand & Style
This design system is built for high-stakes technical environments where precision and focus are paramount. It targets engineers, researchers, and data scientists who require a workspace that feels like a specialized instrument rather than a general-purpose application.

The aesthetic follows a **Technical Minimalism** approach, blending the structured efficiency of a high-end code editor with a premium, obsidian-toned editorial feel. The UI emphasizes high-contrast clarity, utilizing thin borders and intentional glows to guide the eye without causing visual fatigue. The emotional response is one of "Technical Craftsmanship"—stable, authoritative, and sophisticated.

## Colors
The palette is centered on a high-contrast "Amber on Obsidian" foundation. 

- **Primary (Amber):** Used sparingly for critical actions, active states, and focus indicators. It should feel like a glowing filament in a dark room.
- **Surface (Obsidian):** The background uses a true black (#0a0a0a) to maximize contrast and reduce glare on OLED displays.
- **Accents:** A muted Slate-Blue (#64748b) is used for secondary metadata to keep the hierarchy clear, while a functional Emerald (#10b981) is reserved for success states and "system healthy" indicators.
- **Borders:** Use a low-opacity white (10-15%) to define structure without adding visual bulk.

## Typography
The system utilizes **Geist** for its clean, technical sans-serif proportions and excellent legibility in dark modes. For data-heavy elements and metadata, **JetBrains Mono** provides the necessary "code-like" precision.

- **Headlines:** Keep tight tracking on larger sizes to maintain a sophisticated look.
- **Body:** Prioritize line height (1.5-1.6) to ensure long-form technical documentation remains readable against the dark background.
- **Labels:** Always use the monospaced font for numbers, timestamps, and status tags to reinforce the engineering aesthetic.

## Layout & Spacing
The layout follows a **Rigid Grid** philosophy. Elements should feel snapped to a 4px baseline grid, reflecting the precision of a technical blueprint.

- **Desktop:** 12-column grid with 16px gutters. Sidebars should be fixed-width (e.g., 240px or 280px) to mimic IDE layouts.
- **Content Density:** High. Information density is preferred over excessive whitespace to allow users to see more data at once.
- **Borders as Spacers:** Use thin 1px borders to separate sections instead of large gaps of empty space.

## Elevation & Depth
In this dark environment, depth is communicated through **Tonal Layering** and **Subtle Glows** rather than heavy shadows.

- **Surface Tiers:** Background is #0a0a0a. Raised containers (cards, sidebars) use #171717. Floating elements (modals, tooltips) use #1f1f1f.
- **Inner Glows:** For primary active elements, use a very subtle inner-shadow or border-glow in Amber (#f59e0b) at 20% opacity to simulate a light-emitting interface.
- **Glassmorphism:** Use sparingly for floating overlays. Apply a 20px background blur with a 10% white tint to maintain legibility without losing the obsidian feel.

## Shapes
The shape language is **Sharply Defined**. 

- **Corners:** Standard radius is 4px (Soft). This provides just enough approachable warmth without losing the architectural, rigid feel of a tool.
- **Buttons:** Small buttons use 4px, while larger action buttons can scale to 6px. Avoid pill shapes (rounded-full) as they conflict with the technical grid.
- **Data Points:** Use square or diamond markers for charts and graphs to maintain the "high-precision" visual theme.

## Components
- **Buttons:** Primary buttons are solid Amber with black text. Secondary buttons are ghost-style with a thin 1px white/10% border and white text. Focus states must feature a 2px Amber outer ring with an offset.
- **Input Fields:** Use a subtle dark-grey fill (#171717) with a bottom-border-only focus state in Amber. This mimics terminal-style prompts.
- **Chips/Tags:** Use the monospaced font. Status tags should use a "dot" indicator (e.g., a small 6px circle) to signify status instead of full-pill backgrounds.
- **Cards:** No shadows. Define cards using a 1px border (#262626). On hover, the border color should shift to the Amber primary color at 40% opacity.
- **Code Blocks:** Use a slightly deeper background than the main surface (#050505) with a subtle vertical Amber accent bar on the left side of the active line.
- **Progress Bars:** Thin (4px) with an Amber fill and a soft glow effect on the "head" of the progress indicator.