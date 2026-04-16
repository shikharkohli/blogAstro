# TODO Component System — Design Spec

**Date:** 2026-04-06
**Status:** Approved

## Overview

A development-only system that lets blog authors mark incomplete content with a `<Todo>` MDX component. The system has three parts: a visual inline component, a terminal warning at dev-server start, and a site-wide fixed banner whenever any article contains a TODO.

All three parts are dev-only — nothing renders or logs in production builds.

---

## 1. `Todo.astro` Component

**Location:** `src/components/Todo.astro`

**Props:** None. Content passed via `<slot />`.

**Usage in MDX:**
```mdx
import Todo from '../../components/Todo.astro';

<Todo>Expand this section with real supporting data.</Todo>
```

Or as a standalone marker with no body:
```mdx
<Todo />
```

**Behavior:**
- `import.meta.env.DEV === true`: renders a styled inline callout block with an amber/yellow color scheme, a "TODO" badge, and the slotted text (if any).
- `import.meta.env.DEV === false`: renders nothing — the component returns an empty fragment so no markup is emitted in production.

**Visual style:**
- Left border accent in amber
- Subtle amber-tinted background
- Small "TODO" label in uppercase, bold, matching the accent
- Slotted content rendered below the label in normal weight

---

## 2. Compile-Time Warning (Vite Plugin)

**Location:** Inline in `astro.config.mjs` as a local Vite plugin function `todoWarningPlugin()`.

**Trigger points:**
- `buildStart` hook — runs on both `astro dev` startup and `astro build`
- `handleHotUpdate` hook — re-runs when any `.md` or `.mdx` file changes during dev

**Behavior:**
1. Reads all files matching `src/content/blog/**/*.{md,mdx}` using Node's `fs` and `path`
2. Checks each file's raw content for the string `<Todo`
3. For each matching file, emits: `console.warn(\`[TODO] ${relativePath} contains TODO items\`)`
4. Logs a summary if multiple files match: `[TODO] 3 blog post(s) contain TODO items`

**Production:** The plugin still runs during `astro build` and logs warnings to the build output. This is intentional — it flags TODOs that would be silently hidden in the production build, giving the author a final reminder.

---

## 3. `TodoBanner.astro` Component

**Location:** `src/components/TodoBanner.astro`

**Injected into:** `Header.astro` — rendered as the first element inside `<header>`, above all nav content. Since every page imports `Header`, this ensures site-wide coverage without modifying individual pages.

**Build-time detection:**
Uses `import.meta.glob('../content/blog/**/*.{md,mdx}', { as: 'raw', eager: true })` to read all content files synchronously at build time. Checks raw content for the string `<Todo`. Counts the number of matching files.

**Render condition:** Only renders if `import.meta.env.DEV && todoCount > 0`.

**Visual style:**
- Fixed position, `top: 0`, full width, `z-index` above the header
- Amber/yellow background strip, high contrast dark text
- Copy: `"⚠ Dev only — {N} article(s) have TODO items"`
- Dismiss button (✕) on the right edge
- When dismissed, stores `"true"` in `sessionStorage` under key `todo-banner-dismissed`. On page load, the banner checks this key and hides itself if set.
- The header and page body must account for the banner's height (approx 36px) when visible — done by pushing the header down, not overlapping content.

**Dismissed state:** Lives in `sessionStorage` so it reappears on a fresh browser session but not on in-session navigation.

---

## 4. Layout Integration

**File changed:** `src/components/Header.astro`

- Import `TodoBanner` at the top of the frontmatter
- Render `<TodoBanner />` as the first child of the `<header>` element
- Add a CSS custom property `--todo-banner-height` (default `0px`, set to `36px` when banner is present) so the fixed header offset can account for the banner without hardcoding

No other pages or layouts need to change.

---

## Data Flow

```
astro dev / astro build
       │
       ├── Vite plugin (buildStart)
       │      └── scans src/content/blog/**
       │             └── console.warn per file with <Todo
       │
       └── Component render
              ├── TodoBanner (in Header)
              │      └── import.meta.glob → count files with <Todo
              │             └── renders banner if DEV && count > 0
              │
              └── Blog post page
                     └── <Todo> in MDX
                            └── renders callout if DEV, empty if PROD
```

---

## Files Changed / Created

| File | Action |
|------|--------|
| `src/components/Todo.astro` | Create |
| `src/components/TodoBanner.astro` | Create |
| `src/components/Header.astro` | Modify — add TodoBanner |
| `astro.config.mjs` | Modify — add todoWarningPlugin |
