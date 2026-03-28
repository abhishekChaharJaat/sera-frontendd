## 1. CSS Theme Variables

- [x] 1.1 In `globals.css`, rename existing `:root` variable block to `[data-theme="dark"]` (keep `:root` as an alias) to formalize dark as the base theme
- [x] 1.2 Add a `[data-theme="light"]` block in `globals.css` with light theme values for `--background`, `--foreground`, `--sidebar-bg`, and `--input-bg`
- [x] 1.3 Add a global `transition` rule for `background-color`, `color`, and `border-color` (≤ 300ms) — scoped so it only applies after the page has loaded (via a `.theme-loaded` class on `<html>`)

## 2. Flash Prevention (Inline Script)

- [x] 2.1 Add an inline `<script>` tag inside `<head>` in `layout.tsx` that reads `localStorage.getItem("theme")` and sets `document.documentElement.setAttribute("data-theme", ...)`, defaulting to `"dark"` if no value is found
- [x] 2.2 After setting `data-theme`, have the script add the `theme-loaded` class to `<html>` so CSS transitions only activate after initial load

## 3. ThemeToggle Component

- [x] 3.1 Create `src/components/ThemeToggle.tsx` as a `"use client"` component
- [x] 3.2 On mount, read `data-theme` from `document.documentElement` to initialize local state
- [x] 3.3 Implement toggle handler: flip `data-theme` attribute on `<html>` and save new value to `localStorage`
- [x] 3.4 Render a toggle button (sun/moon icon or labeled switch) that reflects the current theme state

## 4. Integrate Toggle into TopNav

- [x] 4.1 Import and render `<ThemeToggle />` in `TopNav.tsx` in the top-right area, alongside the existing `<UserButton />` / auth buttons
- [x] 4.2 Ensure the toggle is visible on both desktop and mobile layouts

## 5. Audit Hardcoded Colors

- [x] 5.1 Search all component files for hardcoded hex values (`#212121`, `#171717`, `#2f2f2f`, `#ececec`) that bypass CSS variables
- [x] 5.2 Replace hardcoded values in `SideNav.tsx`, `TopNav.tsx`, and other components with `var(--background)`, `var(--sidebar-bg)`, etc. where applicable

## 6. Verify & Polish

- [ ] 6.1 Test dark → light → dark toggle: confirm colors switch, transition animates, and no flash on reload
- [ ] 6.2 Test first visit (clear localStorage): confirm dark mode is default with no flash
- [ ] 6.3 Confirm the toggle is visible and functional on mobile viewport

## 14. Fix: Hydration Error, Clerk Auth, SeraLogo

- [x] 14.1 Add `suppressHydrationWarning` to the `<html>` element in `layout.tsx` to suppress the hydration mismatch caused by the inline theme script
- [x] 14.2 In `auth.css`, add `[data-theme="light"]` scoped overrides for all color-specific dark rules: input/social button backgrounds (`#ffffff`), text colors (`#111111`), muted text (`rgba(0,0,0,0.5)`), borders (`rgba(0,0,0,0.12)`), autofill, alerts, placeholder, and password show button
- [x] 14.3 In `SeraLogo.tsx`, change the "era" text inline style from hardcoded `rgba(255,255,255,0.88)` to `var(--foreground)`

## 7. Fix: Add Relative-Color CSS Variables

- [x] 7.1 Add six new CSS variables to `globals.css` under both `[data-theme="dark"]` and `[data-theme="light"]`: `--text-muted`, `--text-subtle`, `--border-subtle`, `--border-muted`, `--surface-subtle`, `--surface-muted`
- [x] 7.2 Verify values: dark uses white-rgba variants, light uses black-rgba variants for each

## 8. Fix: ThemeToggle & TopNav Icon/Text Colors

- [x] 8.1 In `ThemeToggle.tsx`, replace `text-white/50 hover:text-white hover:bg-white/5` with `text-(--text-muted) hover:text-(--foreground) hover:bg-(--surface-subtle)`
- [x] 8.2 In `TopNav.tsx`, replace all `text-white/50`, `text-white/60`, `text-white/70` with `text-(--text-muted)`
- [x] 8.3 In `TopNav.tsx`, replace all `text-white/30`, `text-white/40` with `text-(--text-subtle)`
- [x] 8.4 In `TopNav.tsx`, replace `border-white/10` with `border-(--border-subtle)`, `border-white/20` and `border-white/40` with `border-(--border-muted)`
- [x] 8.5 In `TopNav.tsx`, replace `bg-white/5` and `bg-white/10` with `bg-(--surface-subtle)` and `bg-(--surface-muted)`

## 9. Fix: SideNav Colors

- [x] 9.1 In `SideNav.tsx`, replace all `text-white/X` with appropriate `text-(--text-muted)` or `text-(--text-subtle)`
- [x] 9.2 In `SideNav.tsx`, replace all `border-white/X` with `border-(--border-subtle)` or `border-(--border-muted)`
- [x] 9.3 In `SideNav.tsx`, replace all `bg-white/X` with `bg-(--surface-subtle)` or `bg-(--surface-muted)`

## 10. Fix: ChatBox Colors

- [x] 10.1 In `ChatBox.tsx`, replace `placeholder-white/30` with `placeholder-(--text-subtle)` on the textarea
- [x] 10.2 In `ChatBox.tsx`, replace `bg-white/10` on file chips with `bg-(--surface-muted)`
- [x] 10.3 In `ChatBox.tsx`, replace `text-white/50`, `text-white/70`, `text-white/40` icon/label classes with `text-(--text-muted)` or `text-(--text-subtle)`
- [x] 10.4 In `ChatBox.tsx`, replace `text-white/30`, `text-white/15` (disabled states) with `text-(--text-subtle)`
- [x] 10.5 In `ChatBox.tsx`, replace `hover:bg-white/5` with `hover:bg-(--surface-subtle)`
- [x] 10.6 In `ChatBox.tsx`, replace `text-white/20` (disclaimer text) with `text-(--text-subtle)`

## 11. Fix: MessageBubble Colors

- [x] 11.1 In `MessageBubble.tsx`, replace `border-white/10` with `border-(--border-subtle)`
- [x] 11.2 In `MessageBubble.tsx`, replace `bg-white/5`, `bg-white/10` with `bg-(--surface-subtle)`, `bg-(--surface-muted)`
- [x] 11.3 In `MessageBubble.tsx`, replace `text-white/40`, `text-white/80` with `text-(--text-subtle)`, `text-(--text-muted)`
- [x] 11.4 In `MessageBubble.tsx`, replace `text-white/50`, `text-white/70` (attachment icons/labels) with `text-(--text-muted)`
- [x] 11.5 In `MessageBubble.tsx`, replace `text-white` on `<strong>` markdown with `text-(--foreground)`
- [x] 11.6 In `MessageBubble.tsx`, replace `border-white/20`, `border-t-white/60` (spinner) with `border-(--border-muted)`

## 12. Fix: ModalBase & Modal Text Colors

- [x] 12.1 In `ModalBase.tsx`, replace `text-white/40`, `hover:text-white/80`, `hover:bg-white/10`, `border-white/10` with CSS variable equivalents
- [x] 12.2 In `DeleteThread.tsx`, replace `text-white`, `text-white/50`, `border-white/10`, `text-white/60`, `hover:bg-white/5` with CSS variable equivalents
- [x] 12.3 In `FileUploadAlert.tsx` and `UnderConstruction.tsx`, replace `text-white`, `text-white/50`, `bg-white/10`, `hover:bg-white/15` with CSS variable equivalents

## 13. Fix: Page-Level Text Colors

- [x] 13.1 In `src/app/page.tsx`, replace `text-white`, `text-white/50`, `text-white/40`, `text-white/30` with CSS variable equivalents
- [x] 13.2 In `src/app/home/page.tsx`, replace `text-white`, `text-white/50`, `text-white/40`, `text-white/30` with CSS variable equivalents
- [x] 13.3 In `src/app/chat/[threadId]/page.tsx`, replace `text-white/40` with `text-(--text-subtle)`
- [x] 13.4 In `src/app/shared/[threadId]/page.tsx`, replace all `text-white/X`, `border-white/X` with CSS variable equivalents
- [x] 13.5 In `ThinkingBubble.tsx`, replace `bg-white/40` dots with `bg-(--text-subtle)`

