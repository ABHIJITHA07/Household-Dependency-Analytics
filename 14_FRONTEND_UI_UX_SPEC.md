# 14 — Frontend UI/UX Specification

## 1. Design System & Theme Principles

The application implements a warm, sophisticated **Biscoff / Cream / Caramel** aesthetic suited for personal financial tools.

> **Design Anti-Patterns (Forbidden):**
> - NO neon colors or generic purple "AI dashboard" themes.
> - NO heavy glassmorphism or distracting animated gradients.
> - NO unformatted raw numbers or missing currency symbols.

---

## 2. Color Palette & CSS Tokens

The CSS design system tokens are defined in `src/styles/theme.css`:

```css
:root {
  /* Color Palette */
  --bg-primary: #F8F1E7;         /* Warm Soft Cream */
  --card-bg: #F3E4CF;            /* Cream Panel Fill */
  --border-color: #E2D2BC;       /* Subtle Border Cream */
  --accent-biscuit: #D8B38A;     /* Soft Biscuit Accent */
  --accent-caramel: #B98255;     /* Warm Caramel Primary */
  --accent-caramel-hover: #A06D44;
  --text-primary: #2F2925;       /* Charcoal Dark Text */
  --text-cocoa: #6B4A35;         /* Deep Cocoa Text */
  --text-muted: #756B63;         /* Warm Muted Gray */
  --accent-sage: #71806A;        /* Sage Green (Positive Status) */
  --accent-amber: #C98A2E;       /* Amber Warning */
  --accent-rust: #B84A39;        /* Rust Red Danger */

  /* Typography */
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.5rem;
  --font-size-2xl: 2rem;

  /* Spacing & Elevation */
  --border-radius-sm: 6px;
  --border-radius-md: 10px;
  --border-radius-lg: 16px;
  --shadow-sm: 0 1px 3px rgba(47, 41, 37, 0.05);
  --shadow-md: 0 4px 12px rgba(47, 41, 37, 0.08);
}
```

---

## 3. Responsive Layout Strategy

- **Mobile (< 768px):** Single-column stack, collapsible hamburger drawer navigation, horizontal scrollable charts.
- **Tablet (768px – 1023px):** 2-column dashboard grid, persistent compact sidebar.
- **Desktop ($\ge$ 1024px):** Fixed left sidebar (240px width), 3-column dashboard grid layout.

---

## 4. Standard UI State Enforcements

Every data-driven page MUST implement four explicit UI states:

1. **Loading State:** Smooth skeleton loader component (pulsing cream cards). No layout shift.
2. **Empty State:** Clean illustration/icon with helpful call-to-action (e.g., *"No expenses added yet. Click 'Add Expense' to get started."*).
3. **Error State:** Alert banner with clear message and retry button (e.g., *"Failed to load analytics. [Retry]"*).
4. **Success State:** Toast notification confirming action (e.g., *"Household snapshot saved successfully!"*).
