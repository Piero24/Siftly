---
sidebar_position: 6
---

# Theming

Siftly uses a glassmorphic design system with CSS custom properties (design tokens).

## Design Tokens

All design tokens are defined in `src/styles/tokens.css` and scoped to `[data-theme]`:

```css
:root,
[data-theme='light'] {
  --bg-app: #f2f2f7;
  --bg-surface: #ffffff;
  --text-primary: #1c1c1e;
  --text-secondary: #8e8e93;
  --accent: #007aff;
  --glass-bg: rgba(255, 255, 255, 0.72);
  --glass-border: rgba(0, 0, 0, 0.06);
  /* ... */
}

[data-theme='dark'] {
  --bg-app: #000000;
  --bg-surface: #1c1c1e;
  --text-primary: #f5f5f7;
  --text-secondary: #8e8e93;
  --accent: #0a84ff;
  --glass-bg: rgba(28, 28, 30, 0.72);
  --glass-border: rgba(255, 255, 255, 0.06);
  /* ... */
}
```

## Theme Switching

Theme mode is managed by `SettingsContext`:

- **Light** / **Dark** / **System**
- System follows `prefers-color-scheme` media query
- Stored in `localStorage` and applied via `data-theme` attribute on `<html>`

## Component Styling

- Use **vanilla CSS** with design tokens — no CSS-in-JS
- One CSS file per component or feature area in `src/styles/`
- Always reference tokens (`var(--bg-surface)`) instead of hardcoded colors
- Use `border-radius: 16px` for cards, `12px` for inputs, `8px` for buttons

## Glass Effect

The signature glass effect combines:

```css
background: var(--glass-bg);
backdrop-filter: blur(40px) saturate(1.6);
-webkit-backdrop-filter: blur(40px) saturate(1.6);
border: 1px solid var(--glass-border);
```
