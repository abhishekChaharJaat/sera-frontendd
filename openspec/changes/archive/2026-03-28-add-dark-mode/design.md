## Context

The app is built with Next.js (App Router), React 19, and Tailwind CSS 4. Styles are organized via a single `globals.css` file with CSS custom properties (`--background`, `--foreground`, `--sidebar-bg`, `--input-bg`) already defined for a dark theme. Component styling uses Tailwind utility classes that reference these variables (e.g., `bg-[var(--background)]`). The `TopNav.tsx` component is the persistent header, and `layout.tsx` is the root layout wrapping all pages.

The app is effectively already in "dark mode" as a hard-coded default. This change formalizes dark as the default, adds a light theme, and introduces a runtime toggle.

## Goals / Non-Goals

**Goals:**
- Dark mode is the default theme (applied on first visit)
- Users can toggle between dark and light themes via a button in `TopNav`
- Theme preference is saved to `localStorage` and restored on next page load
- Theme switching uses a CSS class on `<html>` (`data-theme="dark"` / `data-theme="light"`)
- Smooth CSS transition when switching themes
- All existing component styles continue to work via CSS variables

**Non-Goals:**
- System-level `prefers-color-scheme` detection (user toggle only)
- Per-page or per-component theme overrides
- Changes to authentication modal styles (`auth.css`)

## Decisions

### 1. CSS variable approach with `data-theme` on `<html>`

Apply `data-theme="dark"` or `data-theme="light"` to the `<html>` element and define CSS variable overrides under each selector in `globals.css`:

```css
:root, [data-theme="dark"] {
  --background: #212121;
  --foreground: #ececec;
  --sidebar-bg: #171717;
  --input-bg: #2f2f2f;
}

[data-theme="light"] {
  --background: #f9f9f9;
  --foreground: #111111;
  --sidebar-bg: #e8e8e8;
  --input-bg: #ffffff;
}
```

**Why over alternatives:**
- **vs. Tailwind `dark:` variant** — Tailwind 4's class-based dark mode would require adding `dark:` prefixed classes to every element. The app already uses CSS variables, so extending them is zero-touch for existing components.
- **vs. CSS-in-JS / context** — Adds runtime overhead and complexity; CSS variables cascade natively.
- **vs. `class="dark"` on `<body>`** — `data-theme` is more semantically expressive and avoids Tailwind class conflicts.

### 2. Apply theme class via inline script in `<head>` (no flash)

To avoid flash of wrong theme (FOWT) on reload, inject a small inline `<script>` in `layout.tsx` that reads `localStorage` and sets `data-theme` on `<html>` before the page paints. This runs synchronously before React hydration.

**Why:** Any React-state or `useEffect`-based approach applies the theme after the initial render, causing a visible flash. The inline script is the standard pattern for this (used by most dark mode libraries).

### 3. Toggle in `TopNav` using a client component wrapper

`TopNav.tsx` is a server component. The toggle button requires client-side interactivity (`onClick`, `localStorage`). Extract a small `ThemeToggle` client component (`"use client"`) and compose it inside `TopNav`.

**Why:** Keeps `TopNav` as a server component while isolating client boundary to the smallest possible surface.

### 4. Dark as the default

`localStorage` is checked first; if absent, `data-theme="dark"` is set as the default. The CSS `:root` definition also defaults to dark colors, ensuring no FOWT even if the script hasn't run yet.

## Risks / Trade-offs

- **Hardcoded hex colors in Tailwind classes** — Some components may use `bg-[#171717]` or `bg-[#212121]` directly instead of CSS variables. These won't respond to theme switching.
  → **Mitigation:** Audit components during implementation; replace hardcoded hex values with `bg-[var(--background)]` equivalents.

- **Clerk auth modals (`auth.css`)** — These have hardcoded overrides with `!important`. They will not theme-switch.
  → **Mitigation:** Out of scope; excluded from Non-Goals.

- **Server-side rendering** — The `data-theme` attribute is set client-side, so SSR HTML will not include it. The inline script closes this gap before paint.
  → **Mitigation:** Inline script in `<head>` handles this correctly.

- **CSS transition flash on first load** — Adding `transition: background-color 0.2s` globally can cause a brief animated transition on initial load.
  → **Mitigation:** Apply transition class only after the first user interaction (add it via JS after mount), or accept the minor visual artifact on theme switch only (not on load).

---

## Phase 3: Hydration Error, Clerk Auth, SeraLogo

### Hydration fix — `suppressHydrationWarning`

The inline script in `<head>` modifies `<html>` before React hydrates, setting `data-theme` and adding `theme-loaded` to `className`. Next.js App Router renders `<html>` on the server without these attributes, causing a hydration mismatch warning/error.

**Fix:** Add `suppressHydrationWarning` to the `<html>` element in `layout.tsx`. This tells React to ignore attribute mismatches on this specific element — the standard pattern for this use case.

### Clerk auth forms — `[data-theme="light"]` scoped overrides

`auth.css` uses hardcoded dark values with `!important` (e.g. `background-color: #3a3a3a`, `color: #ececec`). Since `!important` overrides cascade normally, adding `[data-theme="light"] .cl-...` selectors with `!important` will win due to higher specificity.

Light values:
- Input/social button backgrounds: `#ffffff` (white)
- Input border: `rgba(0,0,0,0.12)`
- Primary text: `#111111`
- Muted text: `rgba(0,0,0,0.50)`
- Placeholder: `rgba(0,0,0,0.30)`
- Autofill: white background, dark text
- Alerts: `#f5f5f5` background

### SeraLogo "era" text

Change `color: "rgba(255,255,255,0.88)"` inline style to `color: "var(--foreground)"`. This makes it `#ececec` in dark mode (effectively identical to before) and `#111111` in light mode.

---

## Phase 2: Fix Light Mode Contrast (Additional Design)

### Problem

Phase 1 replaced hardcoded hex background values but left `text-white/X`, `border-white/X`, and `bg-white/X` Tailwind opacity utilities throughout every component. These render as white-at-N%-opacity, which is correct on dark surfaces but invisible on light surfaces.

### Decision: Six new semantic CSS variables

Extend `globals.css` with six relative-color variables under both theme selectors:

| Variable | Dark value | Light value | Replaces |
|---|---|---|---|
| `--text-muted` | `rgba(255,255,255,0.55)` | `rgba(0,0,0,0.50)` | `text-white/50`, `text-white/60`, `text-white/70` |
| `--text-subtle` | `rgba(255,255,255,0.28)` | `rgba(0,0,0,0.38)` | `text-white/25`, `text-white/30`, `text-white/40` |
| `--border-subtle` | `rgba(255,255,255,0.08)` | `rgba(0,0,0,0.10)` | `border-white/5`, `border-white/10` |
| `--border-muted` | `rgba(255,255,255,0.20)` | `rgba(0,0,0,0.18)` | `border-white/20`, `border-white/40` (hover borders) |
| `--surface-subtle` | `rgba(255,255,255,0.05)` | `rgba(0,0,0,0.04)` | `bg-white/5` |
| `--surface-muted` | `rgba(255,255,255,0.10)` | `rgba(0,0,0,0.08)` | `bg-white/10`, `bg-white/15` |

Use Tailwind 4 shorthand: `text-(--text-muted)`, `border-(--border-subtle)`, `bg-(--surface-muted)`, etc.

**What stays hardcoded (intentional):**
- `text-white` on green CTA buttons, red delete buttons — these are on colored surfaces, contrast is fine
- `bg-white text-black` on the active send button — intentional inverse treatment
- The green accent `#19c37d` — sufficient contrast in both modes
- `bg-black/50` modal backdrop — decorative, not text

### ThemeToggle icon fix

The `ThemeToggle` button uses `text-white/50 hover:text-white` — invisible in light mode. Replace with `text-(--text-muted) hover:text-(--foreground)` and change `hover:bg-white/5` to `hover:bg-(--surface-subtle)`.

### `<strong>` in markdown

`MessageBubble` renders bold text as `text-white` (hardcoded). Change to `text-(--foreground)` so it has contrast in light mode.
