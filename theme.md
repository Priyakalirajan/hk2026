# OBL SwiftOnboard - Theme Documentation

## Overview
This document defines the core visual language and design system tokens for the **OBL SwiftOnboard** platform (Hackathon 2025). The theme is designed to feel premium, modern, and aligned with a "Supernova/Mustard/Sea Green" MVP aesthetic.

## Color Palette

The application uses a dark mode primary aesthetic accented by vibrant brand colors.

| Color Name | Hex Code | RGB | HSL | CMYK | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Supernova** | `#FFCC00` | 255, 204, 0 | 48, 100, 50 | 0, 20, 100, 0 | Primary Accent, Highlights, Active States |
| **Mustard** | `#FED94B` | 254, 217, 75 | 48, 99, 65 | 0, 15, 70, 0 | Secondary Accent, Hover States, Subtle Highlights |
| **Sea Green** | `#288840` | 40, 136, 64 | 135, 55, 35 | 71, 0, 53, 47 | Success States, Positive Actions (e.g., Verified, Completed) |

### Backgrounds & Surfaces (Dark Theme)

*   `bg`: `#0a0d14` - Main application background.
*   `surface`: `#111520` - Primary surface for cards, headers, and footers.
*   `surface2`: `#161b2e` - Secondary surface for inputs and nested content.
*   `surface3`: `#1e2540` - Tertiary surface for active tabs or highlighted blocks.
*   `border`: `#252d47` - Standard border color for dividers and inputs.

### Typography Colors

*   `text`: `#e8eaf2` - Primary text (high emphasis).
*   `textSecondary`: `#8892b0` - Secondary text (medium emphasis).
*   `textMuted`: `#4a5568` - Muted text (low emphasis, placeholders).

### System Status Colors

*   `green`: `#288840` (Sea Green) - Success / Verified.
*   `red`: `#ef4444` - Error / Rejected / Failed.
*   `blue`: `#3b82f6` - Information / Submitted.
*   `purple`: `#8b5cf6` - Under Review.

## Typography (FONTS)

We rely on the native System fonts (San Francisco on iOS, Roboto on Android) to ensure maximum performance and native feel, styled via weights and standardized sizes.

*   `xs`: 11px
*   `sm`: 13px
*   `base`: 15px
*   `md`: 17px
*   `lg`: 20px
*   `xl`: 24px
*   `xxl`: 30px
*   `hero`: 38px

## Layout & Geometry

### Spacing
A 4px baseline grid is used for all margins and padding.
*   `xs`: 4px | `sm`: 8px | `md`: 12px | `base`: 16px | `lg`: 20px | `xl`: 24px | `xxl`: 32px | `xxxl`: 48px

### Border Radius (RADIUS)
*   `sm`: 6px
*   `md`: 10px (Standard for inputs and buttons)
*   `lg`: 14px (Standard for cards)
*   `xl`: 20px
*   `full`: 999px (Pills, avatars)

## Shadows
Used sparingly in the dark theme to create subtle elevation.
*   **Card Shadow**: Standard elevation for floating elements.
*   **Accent Shadow**: Glow effect using the `Supernova` accent color for primary call-to-action buttons.
