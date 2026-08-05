# SEO Technical Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all technical/on-page SEO issues on kavimeetings.com per the 2026-08-05 design doc: compiled Tailwind CSS, clean structured data, complete meta coverage, internal linking, fresh sitemap.

**Architecture:** Static HTML site on GitHub Pages (custom domain kavimeetings.com). No build pipeline — Tailwind CSS is compiled once locally with the Tailwind v3 CLI and the output committed. All edits are direct HTML edits across 11 pages.

**Tech Stack:** Plain HTML, Tailwind CSS v3 (CLI, one-shot build), JSON-LD structured data.

## Global Constraints

- Site root is served at `https://kavimeetings.com/` — use root-absolute URLs (`/assets/tailwind.css`) in `<link>` tags so they work from both `/` and `/blog/`.
- Do not change visible copy, layout, or design; this round is technical SEO only.
- Verification is grep/build/local-serve based — there is no test framework in this repo.
- Pages: `index.html`, `features.html`, `privacy.html`, `terms.html`, `blog/index.html`, and 5 posts in `blog/` (`what-is-kavi`, `getting-started-with-kavi`, `meeting-recorder-for-consultants`, `where-do-meeting-recordings-go`, `your-meetings-deserve-privacy`).
- Today's date for lastmod/dateModified values: `2026-08-05`.
- Commit after each task with a conventional message.

---

### Task 1: Compile Tailwind CSS

**Files:**
- Create: `tailwind.config.js`
- Create: `tailwind-input.css`
- Create: `assets/tailwind.css` (build output, committed)

**Interfaces:**
- Produces: `assets/tailwind.css` — the stylesheet every page links in Task 2. Merged theme is the superset config used by index/features/blog; privacy/terms used a subset with `kavi.bg: '#0a0a0f'` — unify on `#050508` (visually indistinguishable near-blacks).

- [ ] **Step 1: Write `tailwind.config.js`** (superset of all inline configs found on the pages)

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html', './blog/*.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      colors: {
        sage: { 400: '#4ade80', 500: '#22c55e', 600: '#16a34a' },
        kavi: {
          cyan: '#38BDF8',
          gold: '#FBBF24',
          purple: '#a78bfa',
          bg: '#050508',
          surface: '#0f172a',
          card: '#131c2e',
          border: 'rgba(255,255,255,0.06)'
        }
      }
    }
  }
};
```

- [ ] **Step 2: Write `tailwind-input.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 3: Build the CSS**

Run (from repo root):
```bash
npx tailwindcss@3.4.17 -c tailwind.config.js -i tailwind-input.css -o assets/tailwind.css --minify
```
Expected: exits 0, `assets/tailwind.css` created.

- [ ] **Step 4: Verify the build output**

Run:
```bash
wc -c assets/tailwind.css && grep -c 'kavi-cyan\|text-kavi' assets/tailwind.css
```
Expected: file > 20KB; grep count ≥ 1 (custom theme colors made it into the build).

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.js tailwind-input.css assets/tailwind.css
git commit -m "build: compile Tailwind to static CSS for page speed"
```

---

### Task 2: Replace Tailwind CDN with compiled CSS on all 11 pages

**Files:**
- Modify: all 11 HTML pages (see Global Constraints list)

**Interfaces:**
- Consumes: `assets/tailwind.css` from Task 1.

- [ ] **Step 1: On each page, delete the CDN script and inline config, insert the stylesheet link**

On every page, remove these two blocks (they are adjacent; exact formatting varies slightly per page — locate via `grep -n 'cdn.tailwindcss' <file>`):

```html
<script src="https://cdn.tailwindcss.com"></script>
<script>
    tailwind.config = { ... }
</script>
```

Replace with:

```html
<link rel="stylesheet" href="/assets/tailwind.css">
```

Keep any separate `<style>` blocks on the pages — only the CDN script and the `tailwind.config` script go.

- [ ] **Step 2: Verify no CDN references remain**

Run:
```bash
grep -rn 'cdn.tailwindcss\|tailwind.config' --include='*.html' .
```
Expected: no output.

Run:
```bash
grep -c 'assets/tailwind.css' index.html features.html privacy.html terms.html blog/*.html
```
Expected: every file reports ≥ 1.

- [ ] **Step 3: Visual spot-check**

Run:
```bash
python3 -m http.server 8901 --directory . &
```
Fetch each page (`curl -s localhost:8901/index.html | head`) to confirm 200s, and if a browser/screenshot tool is available, spot-check `index.html`, `features.html`, `privacy.html`, and one blog post render with dark background and styled layout (not unstyled HTML). Kill the server after.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "perf: replace Tailwind Play CDN with compiled stylesheet on all pages"
```

---

### Task 3: Fix homepage structured data

**Files:**
- Modify: `index.html` (JSON-LD blocks, ~lines 28–128)

- [ ] **Step 1: Remove the `aggregateRating` object** from the SoftwareApplication JSON-LD in `index.html` (the `"aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "reviewCount": "1" }` property and its preceding comma).

- [ ] **Step 2: Add Organization + WebSite JSON-LD** as a new script block after the existing FAQ block in `<head>`:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://kavimeetings.com/#organization",
      "name": "KAVI",
      "url": "https://kavimeetings.com/",
      "logo": "https://kavimeetings.com/assets/kavi-logo.svg"
    },
    {
      "@type": "WebSite",
      "@id": "https://kavimeetings.com/#website",
      "name": "KAVI",
      "url": "https://kavimeetings.com/",
      "publisher": { "@id": "https://kavimeetings.com/#organization" }
    }
  ]
}
</script>
```

- [ ] **Step 3: Validate all JSON-LD on the page parses**

Run:
```bash
python3 - <<'EOF'
import re, json
html = open('index.html').read()
for i, m in enumerate(re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.S)):
    json.loads(m)
    print(f"block {i}: OK")
EOF
```
Expected: every block prints OK; `aggregateRating` absent (`grep -c aggregateRating index.html` → 0).

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "seo: remove risky aggregateRating, add Organization/WebSite schema"
```

---

### Task 4: Add BreadcrumbList schema to features and blog pages

**Files:**
- Modify: `features.html`, `blog/index.html`, all 5 `blog/*.html` posts

- [ ] **Step 1: Add to `features.html` `<head>`** (after existing meta tags):

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://kavimeetings.com/" },
    { "@type": "ListItem", "position": 2, "name": "Features", "item": "https://kavimeetings.com/features.html" }
  ]
}
</script>
```

- [ ] **Step 2: Add to `blog/index.html` `<head>`:** same structure with position 2 = `{ "name": "Blog", "item": "https://kavimeetings.com/blog/" }`.

- [ ] **Step 3: Add to each of the 5 blog posts:** three-level breadcrumb — Home → Blog → the post. Use the post's existing `<title>` text (before the `|` separator) as `name` and its canonical URL as `item`, e.g. for `blog/what-is-kavi.html`:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://kavimeetings.com/" },
    { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://kavimeetings.com/blog/" },
    { "@type": "ListItem", "position": 3, "name": "What Is KAVI? A Meeting Tool That Never Touches the Cloud", "item": "https://kavimeetings.com/blog/what-is-kavi.html" }
  ]
}
</script>
```

- [ ] **Step 4: Validate** — run the same Python JSON-LD parse loop from Task 3 Step 3 over each modified file; expected all OK, and `grep -l BreadcrumbList features.html blog/*.html` lists all 7 files.

- [ ] **Step 5: Commit**

```bash
git add features.html blog/
git commit -m "seo: add BreadcrumbList structured data"
```

---

### Task 5: Canonicals and meta for privacy.html and terms.html

**Files:**
- Modify: `privacy.html`, `terms.html`

- [ ] **Step 1: In `privacy.html` `<head>`**, after the description meta, add:

```html
<link rel="canonical" href="https://kavimeetings.com/privacy.html">
```

Replace title/description with:

```html
<title>Privacy Policy — KAVI Offline Meeting Recorder</title>
<meta name="description" content="KAVI's privacy policy: all recordings, transcripts, and AI processing stay on your device. No cloud storage, no data collection, no third-party sharing.">
```

- [ ] **Step 2: In `terms.html` `<head>`**, add:

```html
<link rel="canonical" href="https://kavimeetings.com/terms.html">
```

Replace title with `<title>Terms of Service — KAVI Offline Meeting Recorder</title>` and ensure a description meta exists (add if missing):

```html
<meta name="description" content="Terms of service for KAVI, the offline meeting recorder with local AI transcription for Windows, macOS, and Linux.">
```

- [ ] **Step 3: Verify**

Run:
```bash
grep -c 'rel="canonical"' privacy.html terms.html
```
Expected: 1 each.

- [ ] **Step 4: Commit**

```bash
git add privacy.html terms.html
git commit -m "seo: add canonicals and improved meta to privacy/terms"
```

---

### Task 6: Image alt text

**Files:**
- Modify: `index.html` (logo imgs ~lines 251, 1139), `features.html` (logo imgs ~lines 117, 866), plus any other `alt=""` occurrences found by grep across all pages

- [ ] **Step 1: Find all empty alts**

Run:
```bash
grep -rn 'alt=""' --include='*.html' .
```

- [ ] **Step 2: Fill them** — every `<img src="...kavi-logo.svg" alt="">` becomes `alt="KAVI logo"`. Any other empty-alt image gets a short literal description of what it shows.

- [ ] **Step 3: Verify** — rerun the grep from Step 1; expected: no output.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "seo: add descriptive alt text to images"
```

---

### Task 7: Related-posts internal linking on blog articles

**Files:**
- Modify: all 5 `blog/*.html` posts (insert before each post's closing `</article>` tag)

**Interfaces:**
- Consumes: nothing new; pure HTML using existing Tailwind classes (available via Task 1's compiled CSS — `border-white/[0.06]`, `text-sage-400` etc. are already in use on these pages so they compile in).

- [ ] **Step 1: Insert a Related reading block** immediately before `</article>` in each post, using this template (styling matches the site's existing classes):

```html
<section class="mt-16 pt-8 border-t border-white/[0.06]">
  <h2 class="text-xl font-semibold mb-4">Related reading</h2>
  <ul class="space-y-2">
    <!-- 3 links per the mapping below -->
    <li><a href="LINK.html" class="text-sage-400 hover:underline">LINK TITLE</a></li>
  </ul>
</section>
```

Link mapping (3 related links each; product pages included to pass authority):
- `what-is-kavi.html` → getting-started-with-kavi.html ("Getting Started with KAVI"), your-meetings-deserve-privacy.html ("Your Meetings Deserve Privacy"), ../features.html ("Explore All KAVI Features")
- `getting-started-with-kavi.html` → what-is-kavi.html ("What Is KAVI?"), where-do-meeting-recordings-go.html ("Where Do Meeting Recordings Go?"), ../features.html ("Explore All KAVI Features")
- `meeting-recorder-for-consultants.html` → your-meetings-deserve-privacy.html ("Your Meetings Deserve Privacy"), what-is-kavi.html ("What Is KAVI?"), ../index.html ("KAVI — Offline Meeting Recorder")
- `where-do-meeting-recordings-go.html` → your-meetings-deserve-privacy.html ("Your Meetings Deserve Privacy"), getting-started-with-kavi.html ("Getting Started with KAVI"), ../features.html ("Explore All KAVI Features")
- `your-meetings-deserve-privacy.html` → where-do-meeting-recordings-go.html ("Where Do Meeting Recordings Go?"), meeting-recorder-for-consultants.html ("A Meeting Recorder Built for Consultants"), ../index.html ("KAVI — Offline Meeting Recorder")

- [ ] **Step 2: Verify**

Run:
```bash
grep -c 'Related reading' blog/*.html
```
Expected: 1 for each of the 5 posts (0 for blog/index.html is fine).

- [ ] **Step 3: Commit**

```bash
git add blog/
git commit -m "seo: add related-posts internal links to blog articles"
```

---

### Task 8: Sitemap refresh and final verification

**Files:**
- Modify: `sitemap.xml`

- [ ] **Step 1: Update every `<lastmod>` in `sitemap.xml`** from `2026-06-17` to `2026-08-05`.

- [ ] **Step 2: Full-site meta audit**

Run:
```bash
for f in index.html features.html privacy.html terms.html blog/index.html blog/*.html; do
  [ -f "$f" ] || continue
  t=$(grep -c '<title>' $f); d=$(grep -c 'name="description"' $f)
  c=$(grep -c 'rel="canonical"' $f); h=$(grep -c '<h1' $f)
  echo "$f title=$t desc=$d canonical=$c h1=$h"
done
```
Expected: every page reports title=1 desc≥1 canonical=1; content pages report h1=1 (privacy/terms may use h1=1 too — flag any 0s or >1s and fix).

- [ ] **Step 3: JSON-LD sweep** — run the Task 3 Step 3 Python parse loop over every HTML file; expected: all blocks parse.

- [ ] **Step 4: Commit**

```bash
git add sitemap.xml
git commit -m "seo: refresh sitemap lastmod dates"
```
