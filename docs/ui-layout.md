# GoodEggs — UI Layout & Design Tokens Specification

This document defines the structural grid, breakpoints, color palette, typography scales, and UI component hierarchies matching the reference design.

---

## 1. Color System

| Token Name | Hex Code | OKLCH Equivalent | Usage |
|---|---|---|---|
| `--cream` | `#F8F4E8` | `oklch(96.6% .022 99)` | Primary page background, light cards, badge surfaces |
| `--yolk` | `#F5D85E` | `oklch(88.7% .146 96)` | Comparison & Farm section background, highlight pills |
| `--golden-ochre` | `#EFBF35` | `oklch(85.8% .155 88)` | Primary action buttons, headline text accents, stars |
| `--bark` | `#24120D` | `oklch(25.3% .048 58)` | Packaging section background, dark text, footer background |
| `--shell-brown` | `#A66B3F` | `oklch(61.6% .112 55)` | Brown egg shell color, rustic badges |
| `--shell-white` | `#FFFFFF` | `oklch(100% 0 0)` | White egg shell, cards, dialog surfaces |

---

## 2. Typography Hierarchy

- **Display Headline**: `Bricolage Grotesque`, weight 800 (ExtraBold), letter-spacing `-0.03em`.
  - Desktop: `4.5rem` (`72px`)
  - Tablet: `3.5rem` (`56px`)
  - Mobile: `2.75rem` (`44px`)
- **Script Eyebrows**: `Caveat`, cursive, weight 700.
  - Size: `1.85rem` to `2.35rem`, line-height `1.1`.
  - Accompanied by dynamic SVG wavy squiggly underlines.
- **Editorial Subtitles**: `Fraunces` / `Bricolage Grotesque`, weight 600.
  - Size: `1.4rem` to `1.85rem`.
- **Body & UI**: `DM Sans` / `Plus Jakarta Sans`, weight 400, 500, 600.
  - Body: `1rem` (`16px`), line-height `1.65`.
  - Micro-copy: `0.85rem` (`13.6px`).
  - Badges & Pills: `0.775rem` (`12.4px`).

---

## 3. Section Grid & Container System

- **Max Container Width**: `1320px` (standard container `1280px`).
- **Padding**:
  - Desktop: `0 28px`
  - Mobile: `0 16px`
- **Breakpoints**:
  - Desktop: `> 1024px` (2-column split layouts)
  - Tablet: `768px – 1023px` (stacked centered columns)
  - Mobile: `< 768px` (single-column fluid flow)

---

## 4. UI Components Specification

1. **Header**:
   - Fixed or sticky top bar with blur backdrop (`backdrop-filter: blur(12px)`).
   - Centered pill navigation with active indicator dot.
   - Farm Shop cart badge counter.
2. **Hero Section**:
   - Split $50\% / 50\%$ layout on desktop.
   - Interactive Mode Toggle pill: `🐔 3D Motion (Walk & Lay)` / `🧊 3D WebGL`.
   - Twinkling 4-point golden star accents (`✦`).
3. **Egg Comparison**:
   - Centered cards flanking 3D WebGL presentation viewport.
   - Dual floating badges with micro-copy tags.
   - Responsive tab switcher for mobile screens.
4. **Pack Showcase**:
   - 3 open carton cards (`6-pack`, `10-pack`, `12-pack`).
   - Moulded paper-pulp grid cradles with individually tappable eggs.
   - Shell variety toggle (`● Brown` / `White`).
5. **Packaging Story**:
   - Left timeline with auto-advancing step indicators.
   - Right interactive open carton with tamper-evident seal and 10 nested eggs.
6. **Farm Story**:
   - Side-by-side photography cards (`the farm`, `inside the barn`).
   - Interactive tour video modal.
7. **Footer**:
   - Dark chocolate surface with ₹50 welcome discount strip.
   - Brand slogan: `"Good eggs. Better mornings."`.
   - Structured columns and smooth scroll-to-top pill.

