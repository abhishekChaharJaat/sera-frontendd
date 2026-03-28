## Why

The application currently only supports a light theme, which can cause eye strain in low-light environments. Dark mode is now a standard expectation for modern web apps, and adding it improves accessibility and user comfort.

## What Changes

- Add a dark/light mode toggle button in the navbar (top-right corner)
- Dark mode is the default theme on first load
- Theme preference is persisted in `localStorage` and restored on page reload
- All UI components updated to support both themes via CSS variables
- Smooth CSS transition between theme switches

### Fix (Phase 3): Hydration error, Clerk auth forms, SeraLogo

Three additional issues surfaced after Phase 2:

- **Hydration mismatch** — The inline script sets `data-theme` and `class="theme-loaded"` on `<html>` before React hydrates, causing a Next.js hydration error because the SSR-rendered `<html>` doesn't include those attributes. Fix: add `suppressHydrationWarning` to `<html>`.
- **Clerk auth form dark styling** — `auth.css` overrides all Clerk form elements with hardcoded dark values (`#3a3a3a`, `#ececec`, etc.) using `!important`. These don't respond to `[data-theme]`. Fix: add `[data-theme="light"]` scoped overrides for all color-specific rules.
- **SeraLogo "era" text invisible** — The word "era" uses inline `color: rgba(255,255,255,0.88)` which is invisible on a light background. Fix: change to `var(--foreground)`.

### Fix (Phase 2): Resolve light mode contrast failures

The initial implementation migrated background colors to CSS variables but left all text, border, and surface colors as hardcoded `text-white/X`, `border-white/X`, and `bg-white/X` Tailwind opacity utilities. These are invisible in light mode (white on white). The following additional changes are required:

- Add CSS variables for muted text, subtle text, borders, and surfaces
- Replace all `white/X` opacity classes in every component and page with theme-aware CSS variable classes
- Fix `ThemeToggle` icon visibility in light mode
- Fix `ChatBox` placeholder, file chip, and icon contrast
- Fix `SideNav`, `TopNav`, `MessageBubble`, `ModalBase`, and all modal/page text colors

## Capabilities

### New Capabilities

- `theme-toggle`: Toggle control in the navbar that switches between dark and light themes, with preference persisted to localStorage and restored on reload

### Modified Capabilities

<!-- No existing spec-level requirements are changing -->

## Impact

- **CSS**: Global CSS variables introduced for theme colors; all component styles updated to use them
- **Navbar**: Toggle switch component added
- **HTML/Root**: Theme class applied at root level on load based on localStorage value
- **No API or dependency changes required**
