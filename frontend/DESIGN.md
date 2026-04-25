---
name: Civic Clarity System
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#44474d'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#74777e'
  outline-variant: '#c4c6ce'
  surface-tint: '#4c5f7e'
  primary: '#021934'
  on-primary: '#ffffff'
  primary-container: '#1a2e4a'
  on-primary-container: '#8296b7'
  inverse-primary: '#b4c7eb'
  secondary: '#5b4ac7'
  on-secondary: '#ffffff'
  secondary-container: '#8e7ffe'
  on-secondary-container: '#24008c'
  tertiary: '#3c0003'
  on-tertiary: '#ffffff'
  tertiary-container: '#630009'
  on-tertiary-container: '#ff5e59'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d5e3ff'
  primary-fixed-dim: '#b4c7eb'
  on-primary-fixed: '#051c37'
  on-primary-fixed-variant: '#344765'
  secondary-fixed: '#e4dfff'
  secondary-fixed-dim: '#c7bfff'
  on-secondary-fixed: '#170065'
  on-secondary-fixed-variant: '#422fae'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3ad'
  on-tertiary-fixed: '#410004'
  on-tertiary-fixed-variant: '#930012'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display:
    fontFamily: Public Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Public Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.25'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Public Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Public Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Public Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-lg:
    fontFamily: Public Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Public Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  container-max: 1140px
---

## Brand & Style

This design system is engineered for civic utility, prioritizing institutional trust, accessibility, and absolute clarity. The aesthetic is rooted in **Minimalism** with a **Corporate/Modern** structure, intentionally stripped of any visual noise that could distract from the gravity of governmental processes. 

The emotional response should be one of stability and efficiency. By removing decorative elements—specifically illustrations and non-functional iconography—the interface positions itself as a neutral, reliable tool for the public. The reliance on generous white space and high-contrast typography conveys a sense of transparency and organizational integrity.

## Colors

The palette is anchored by a deep navy primary color to establish authority and permanence. The secondary color, an institutional indigo, is reserved for interactive elements and subtle highlights, while a sharp red is utilized exclusively for critical alerts and error states.

- **Primary:** Deep Navy (#1a2e4a) for headers, primary actions, and brand presence.
- **Background:** Soft Off-White (#F4F4F4) to reduce eye strain and provide a calm canvas.
- **Surface:** Pure White (#FFFFFF) for content containers to maximize legibility and perceived cleanliness.
- **Stroke/Border:** A muted grey (#D1D5DB) for subtle definition without creating visual clutter.

## Typography

The design system utilizes **Public Sans**, an institutional typeface designed specifically for government interfaces. It provides exceptional legibility across all screen sizes and maintains a neutral, official tone.

Typography is treated as the primary visual element. Headline weights are kept semi-bold to ensure hierarchy without appearing aggressive. Body text utilizes a generous 1.6 line height to facilitate the reading of long-form civic documentation and form instructions.

## Layout & Spacing

This design system follows a **Fixed Grid** philosophy for desktop layouts to ensure line lengths remain optimal for readability (approx. 70-80 characters). The content is centered within a 1140px container.

Spacing is governed by an 8px base unit. "Generous padding" is a core tenet: sections are separated by large vertical gaps (48px to 80px) to prevent the user from feeling overwhelmed. Interior card padding is set to a minimum of 32px to ensure that text content has sufficient "breathing room," reinforcing the feeling of clarity and ease of use.

## Elevation & Depth

To maintain a grounded and trustworthy feel, this design system avoids floating elements or heavy drop shadows. Depth is communicated through **Low-contrast outlines** and tonal shifts.

- **Cards:** Use a 1px solid border (#E5E7EB) instead of a shadow.
- **Active States:** Subtle 2px inset borders or light grey background shifts indicate interaction.
- **Layering:** When a modal or overlay is required, a high-opacity semi-transparent dark overlay is used with a zero-blur, sharp-edged surface to maintain the minimal, structured aesthetic.

## Shapes

The shape language is conservative. A **Soft** (0.25rem) corner radius is applied to buttons, input fields, and cards. This slight rounding takes the "edge" off the interface to make it feel accessible, while remaining square enough to feel professional and institutional. 

Circular shapes are prohibited except for radio buttons, ensuring the UI feels constructed and intentional rather than organic.

## Components

### Buttons
Buttons are solid and rectangular with minimal rounding. The Primary Button uses the deep navy background with white text. Hover states should be a simple darken effect. No icons are permitted unless they are functional arrows (e.g., "Next" or "Back").

### Cards
Cards are the primary content vessel. They must have a white background, a 1px subtle border, and no shadow. Padding within cards should be generous (32px) to separate distinct pieces of information.

### Form Fields
Inputs should feature a clear 1px border that thickens to 2px in the primary navy color when focused. Labels must always be visible (never use placeholder text as a label) to ensure accessibility.

### Lists & Tables
Information density should be kept low. List items are separated by subtle horizontal rules. Tables should be used for data, utilizing simple headers with a light grey background and no vertical borders to maintain a clean look.

### Navigation
The navigation bar is white with a thin bottom border. Links are navy, switching to a bold weight or showing a 3px bottom bar in the primary color to indicate the active page. No icons should accompany navigation labels.
