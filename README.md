# Reading Progress Bar + Sticky TOC — Deployment Instructions

## What changed

### New files (add to your repo)
1. `src/components/ReadingProgress.astro` — Thin accent-colored progress bar fixed to top of viewport
2. `src/components/TableOfContents.astro` — Auto-generated TOC with mobile floating pill

### Modified files (replace in your repo)
3. `src/layouts/BlogPost.astro` — Updated to import and render both new components

## How to deploy

```bash
cd blogAstro

# Copy the 3 downloaded files into their matching paths
# Then:

git add .
git commit -m "Add reading progress bar and sticky table of contents"
git push origin master
```

Vercel auto-deploys on push.

## How they work

### Reading Progress Bar
- 3px accent-colored bar fixed to the very top of the viewport
- Tracks scroll position relative to the `<article>` element
- Uses `requestAnimationFrame` for smooth 60fps updates
- Zero layout impact — absolutely positioned, pointer-events: none
- Respects theme — uses `var(--accent)` so it matches light/dark mode

### Table of Contents
- **Auto-generated** — extracts all `h2` and `h3` headings from the `.prose` container via JS
- **Inline on load** — renders as a collapsible "Contents" box below the article title
- **Collapsible** — click the "Contents" header to expand/collapse
- **Active section tracking** — highlights the current section as you scroll (IntersectionObserver)
- **Mobile floating pill** — after you scroll past the inline TOC on mobile (<720px), a floating pill appears at the bottom center showing the current section name
- **Slide-up panel** — tapping the pill opens a bottom sheet with the full TOC; tapping a section smooth-scrolls to it and closes the panel
- **Auto-hides** — if the article has fewer than 2 headings, the TOC doesn't render at all
- Closes on Escape key and overlay tap

### No changes needed to your blog posts
Both components work automatically with any existing `.md` or `.mdx` post that has `h2`/`h3` headings. No imports or frontmatter changes required in individual posts.
