# TODO Component System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dev-only `<Todo>` MDX component that highlights incomplete content inline, a Vite plugin that warns in the terminal at startup, and a fixed site-wide banner whenever any article contains a TODO.

**Architecture:** `Todo.astro` renders an amber callout in dev and nothing in prod. `TodoBanner.astro` uses `import.meta.glob` to scan all content files at build time and renders a fixed top banner in dev. A Vite plugin in `astro.config.mjs` scans the same files on server start and on file change, logging `console.warn` entries to the terminal. `TodoBanner` is injected into `Header.astro` so it appears on every page without touching individual page files.

**Tech Stack:** Astro 6, Vite 6, MDX, Node.js `fs` module (for Vite plugin), `import.meta.glob` with `query: '?raw'` (Vite 6 syntax), `sessionStorage` (for dismiss state).

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/components/Todo.astro` | Create | Inline callout in dev, empty in prod |
| `src/components/TodoBanner.astro` | Create | Fixed top banner, glob-based detection, dismiss logic |
| `src/components/Header.astro` | Modify | Import and render `<TodoBanner />` |
| `astro.config.mjs` | Modify | Add `todoWarningPlugin` Vite plugin |

---

### Task 1: Create `Todo.astro`

**Files:**
- Create: `src/components/Todo.astro`

- [ ] **Step 1: Create the component**

Create `src/components/Todo.astro` with this exact content:

```astro
---
const isDev = import.meta.env.DEV;
---

{isDev && (
  <aside class="todo-callout">
    <span class="todo-badge">TODO</span>
    <slot />
  </aside>
)}

<style>
  .todo-callout {
    border-left: 3px solid #f59e0b;
    background: rgba(245, 158, 11, 0.08);
    padding: 0.75em 1em;
    margin: 1em 0;
    border-radius: 0 6px 6px 0;
  }
  .todo-badge {
    display: block;
    font-size: 0.7em;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: #b45309;
    text-transform: uppercase;
    margin-bottom: 0.3em;
  }
</style>
```

- [ ] **Step 2: Add a `<Todo>` to a blog post to verify rendering**

Open `src/content/blog/a-growth-pms-guide-to-not-lying-with-data-1.mdx`. At the top of the imports section (after the existing imports) add:

```mdx
import Todo from '../../components/Todo.astro';
```

Then add somewhere in the body (after the first `<Callout>` block is fine):

```mdx
<Todo>This section needs more supporting data.</Todo>
```

- [ ] **Step 3: Start the dev server and verify**

```bash
npm run dev
```

Open the blog post in the browser. Expected: an amber-bordered box with "TODO" label and the note text is visible inline in the article.

- [ ] **Step 4: Verify prod renders nothing**

```bash
npm run build 2>&1 | head -30
```

Expected: build completes. The built HTML in `dist/` should NOT contain `todo-callout`. Verify:

```bash
grep -r "todo-callout" dist/ || echo "Clean - no TODO markup in build"
```

Expected output: `Clean - no TODO markup in build`

- [ ] **Step 5: Commit**

```bash
git add src/components/Todo.astro
git commit -m "feat: add dev-only Todo component"
```

---

### Task 2: Add `todoWarningPlugin` to `astro.config.mjs`

**Files:**
- Modify: `astro.config.mjs`

- [ ] **Step 1: Add Node.js imports and the plugin function**

Open `astro.config.mjs`. Replace the entire file content with:

```js
// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig, fontProviders } from 'astro/config';
import icon from 'astro-icon';

function getContentFiles(dir) {
  let results = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getContentFiles(fullPath));
    } else if (/\.(md|mdx)$/.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

function todoWarningPlugin() {
  function scan(root) {
    const contentDir = join(root, 'src', 'content', 'blog');
    const files = getContentFiles(contentDir);
    const todoFiles = files.filter(f => readFileSync(f, 'utf-8').includes('<Todo'));
    if (todoFiles.length === 0) return;
    todoFiles.forEach(f => {
      const rel = f.replace(root + '/', '');
      console.warn(`\x1b[33m[TODO]\x1b[0m ${rel} contains TODO items`);
    });
    console.warn(`\x1b[33m[TODO]\x1b[0m ${todoFiles.length} blog post(s) contain TODO items`);
  }

  return {
    name: 'todo-warning',
    buildStart() {
      scan(process.cwd());
    },
    handleHotUpdate({ file }) {
      if (/src[/\\]content[/\\]blog[/\\].*\.(md|mdx)$/.test(file)) {
        scan(process.cwd());
      }
    },
  };
}

// https://astro.build/config
export default defineConfig({
	site: 'https://example.com',
	image: {
    responsiveStyles: true,
    layout: 'constrained',
  	},
	fonts: [
		{
			provider: fontProviders.local(),
			name: 'Atkinson Hyperlegible Next',
			cssVariable: '--font-atkinson',
			options: {
				variants: [
					{
						src: ['./src/assets/fonts/AtkinsonHyperlegibleNext-VariableFont_wght.ttf'],
						weight: '100 900',
						style: 'normal',
					},
					{
						src: ['./src/assets/fonts/AtkinsonHyperlegibleNext-Italic-VariableFont_wght.ttf'],
						weight: '100 900',
						style: 'italic',
					},
				],
			},
		},
		{
			provider: fontProviders.local(),
			name: 'Atkinson Hyperlegible Mono',
			cssVariable: '--font-atkinson-mono',
			options: {
				variants: [
					{
						src: ['./src/assets/fonts/AtkinsonHyperlegibleMono-VariableFont_wght.ttf'],
						weight: '100 900',
						style: 'normal',
					},
				],
			},
		},
	],
	integrations: [
		mdx(),
		sitemap(),
		icon({
			include: {
				   mdi: ['mastodon', 'linkedin', 'github', 'email', 'youtube', 'account', 'calendar', 'calendar-outline', 'account-outline', 'weather-sunny', 'weather-night', 'arrow-left'],
			},
		}),
	],
	vite: {
		plugins: [todoWarningPlugin()],
	},
});
```

- [ ] **Step 2: Restart dev server and verify terminal warning**

Stop the dev server (`Ctrl+C`) then:

```bash
npm run dev 2>&1 | grep TODO
```

Expected output (with the test `<Todo>` added in Task 1 still present):
```
[TODO] src/content/blog/a-growth-pms-guide-to-not-lying-with-data-1.mdx contains TODO items
[TODO] 1 blog post(s) contain TODO items
```

- [ ] **Step 3: Verify warning fires on file change**

With the dev server running, open any `.mdx` file and save it without changes (add and remove a space). Expected: the TODO warning re-prints in the terminal.

- [ ] **Step 4: Commit**

```bash
git add astro.config.mjs
git commit -m "feat: add Vite plugin for TODO compile-time warnings"
```

---

### Task 3: Create `TodoBanner.astro`

**Files:**
- Create: `src/components/TodoBanner.astro`

- [ ] **Step 1: Create the component**

Create `src/components/TodoBanner.astro` with this exact content:

```astro
---
const isDev = import.meta.env.DEV;

let todoCount = 0;
if (isDev) {
  const files = import.meta.glob('../content/blog/**/*.{md,mdx}', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>;
  todoCount = Object.values(files).filter(content => content.includes('<Todo')).length;
}
---

{isDev && todoCount > 0 && (
  <div class="todo-banner" id="todo-banner">
    <span>⚠ Dev only — {todoCount} article{todoCount !== 1 ? 's' : ''} ha{todoCount !== 1 ? 've' : 's'} TODO items</span>
    <button class="todo-banner-dismiss" id="todo-banner-dismiss" aria-label="Dismiss TODO banner">✕</button>
  </div>
)}

<style>
  .todo-banner {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 10000;
    height: 36px;
    background: #f59e0b;
    color: #1c1917;
    align-items: center;
    justify-content: center;
    padding: 0 2.5em 0 1em;
    font-size: 0.8em;
    font-weight: 600;
    font-family: inherit;
  }
  .todo-banner-dismiss {
    position: absolute;
    right: 0.75em;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1em;
    color: #1c1917;
    padding: 0.25em;
    line-height: 1;
  }
</style>

<script is:inline>
  (function () {
    var banner = document.getElementById('todo-banner');
    if (!banner) return;
    if (sessionStorage.getItem('todo-banner-dismissed') === 'true') return;
    banner.style.display = 'flex';
    document.body.style.paddingTop = '36px';
    var btn = document.getElementById('todo-banner-dismiss');
    if (btn) {
      btn.addEventListener('click', function () {
        banner.style.display = 'none';
        document.body.style.paddingTop = '';
        sessionStorage.setItem('todo-banner-dismissed', 'true');
      });
    }
  })();
</script>
```

- [ ] **Step 2: Temporarily add the banner to a page to verify it renders**

Open `src/pages/index.astro`. After the existing imports in the frontmatter, add:

```astro
import TodoBanner from '../components/TodoBanner.astro';
```

And add `<TodoBanner />` as the first element inside `<body>`:

```astro
<body>
  <TodoBanner />
  <Header />
  ...
```

- [ ] **Step 3: Start dev server and verify banner**

```bash
npm run dev
```

Open `http://localhost:4321` in the browser. Expected:
- An amber banner at the very top of the page reading "⚠ Dev only — 1 article has TODO items"
- Page content is pushed down by 36px (not overlapped)
- Clicking ✕ hides the banner
- Refreshing the page keeps it hidden (sessionStorage)
- Opening a new browser tab / new private window shows it again

- [ ] **Step 4: Undo the temporary addition to `index.astro`**

Revert the changes made to `src/pages/index.astro` in Step 2 (remove the import and `<TodoBanner />`). The permanent integration happens in Task 4.

- [ ] **Step 5: Commit**

```bash
git add src/components/TodoBanner.astro
git commit -m "feat: add TodoBanner component with glob-based TODO detection"
```

---

### Task 4: Integrate `TodoBanner` into `Header.astro`

**Files:**
- Modify: `src/components/Header.astro`

- [ ] **Step 1: Add import and render `TodoBanner` in `Header.astro`**

Open `src/components/Header.astro`. In the frontmatter (between the `---` fences), add the import after the existing imports:

```astro
---
import { SITE_TITLE } from '../consts';
import HeaderLink from './HeaderLink.astro';
import ThemeToggle from './ThemeToggle.astro';
import TodoBanner from './TodoBanner.astro';
import { Icon } from 'astro-icon/components';
---
```

Then add `<TodoBanner />` as the first element in the template, directly before `<header>`:

```astro
<TodoBanner />
<header>
  <a href="#main" class="skip-link">Skip to main content</a>
  ...
```

- [ ] **Step 2: Verify banner appears on all pages**

With the dev server running, visit:
- `http://localhost:4321` (home)
- `http://localhost:4321/blog` (blog index)
- The blog post that contains `<Todo>` (e.g. `http://localhost:4321/blog/ab-testing-guide`)

Expected: the amber banner appears at the top of every page. Content is pushed down by 36px. Dismiss works and persists across in-session navigation.

- [ ] **Step 3: Verify banner does NOT appear in production build**

```bash
npm run build 2>&1 | tail -5
```

Inspect the built HTML:

```bash
grep -r "todo-banner" dist/ || echo "Clean - no banner markup in build"
```

Expected: `Clean - no banner markup in build`

- [ ] **Step 4: Final commit**

```bash
git add src/components/Header.astro
git commit -m "feat: inject TodoBanner into Header for site-wide TODO visibility"
```

---

## Self-Review

**Spec coverage:**
- ✅ `<Todo>` component visually highlights TODOs — Task 1
- ✅ Compile-time warning in terminal — Task 2
- ✅ Dev-only across all three pieces — `import.meta.env.DEV` guards in Tasks 1, 3; plugin runs on build but warns rather than blocking
- ✅ Fixed banner when any article has a TODO — Task 3 + 4
- ✅ Banner on entire website (not just blog pages) — injected in `Header.astro` which is universal — Task 4

**Placeholder scan:** No TBDs, no "implement later", no vague steps. All steps include exact code.

**Type consistency:**
- `todoCount` used consistently across TodoBanner tasks
- `scan(root)` called consistently in both `buildStart` and `handleHotUpdate`
- `todo-banner` / `todo-banner-dismiss` IDs used consistently between HTML and script
