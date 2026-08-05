# SEO Optimization Design — kavimeetings.com

**Date:** 2026-08-05
**Scope:** Full technical + on-page fixes (code-only round; content round deferred)

## Current state (verified via web search, Aug 2026)

- Site is indexed; **#1 for brand queries** ("KAVI offline meeting recorder").
- **Absent from page 1** for all generic target keywords:
  - "offline meeting recorder local AI transcription"
  - "best offline meeting recorder no cloud"
  - "HIPAA compliant meeting recorder local transcription"
  - "meeting recorder that works without internet"
- Page 1 for those queries is owned by competitor blog content (Meetily, SpeakWise, VoiceScriber, BuildBetter, Plaud) — almost all listicles/guides, not homepages.

## Problems found in the codebase

1. All 11 HTML pages load Tailwind via the Play CDN (`cdn.tailwindcss.com`) — a ~110KB render-blocking script that compiles CSS in the browser. Kills PageSpeed/Core Web Vitals scores; Tailwind explicitly says not for production.
2. `aggregateRating` (4.8, reviewCount 1) in SoftwareApplication schema — self-serving review markup that risks a structured-data spam action.
3. privacy.html and terms.html lack canonical tags; weak titles/descriptions.
4. Logo images have empty `alt=""`; some images lack lazy-loading/dimensions.
5. No Organization/WebSite schema on homepage; no BreadcrumbList on features/blog.
6. Thin internal linking between blog posts and product pages.
7. sitemap.xml lastmod dates stale (2026-06-17).

## Design

### 1. Page speed (Core Web Vitals)
- Compile Tailwind once via Tailwind CLI scanning all `*.html`, output minified `assets/tailwind.css`, commit it. Replace CDN `<script>` + inline `tailwind.config` on every page with `<link rel="stylesheet" href="/assets/tailwind.css">`.
- Add `loading="lazy"` + width/height to below-the-fold images; fill in empty logo `alt` attributes.

### 2. Structured data
- Remove `aggregateRating` from SoftwareApplication schema.
- Add `Organization` + `WebSite` JSON-LD to homepage.
- Add `BreadcrumbList` JSON-LD to features.html and all blog pages.
- Verify each blog post has valid Article schema + OG/Twitter tags.

### 3. On-page gaps
- Canonicals + improved titles/descriptions on privacy.html and terms.html.
- Related-posts links at the end of each blog article; blog ↔ features cross-links.

### 4. Housekeeping
- Refresh sitemap.xml lastmod dates.

## Verification
- Rebuild CSS with content globs over all HTML; serve locally and visually spot-check every page for style regressions.
- Validate JSON-LD blocks parse and match schema.org types.
- Grep-verify every page has: title, description, canonical, OG, Twitter, single H1.

## Out of scope (next round — content & authority)
Ranking on page 1 for the generic keywords requires content matching search intent:
- Listicle/comparison posts: "Best offline meeting recorders (2026)", "Meetily vs KAVI vs BB Recorder", "Otter.ai alternatives that run offline".
- Intent guides: "HIPAA-compliant meeting recording: complete guide", "How to record meetings without internet".
- Authority: get KAVI listed in third-party roundups (BuildBetter, MeetingNotes, dev.to), directories (AlternativeTo, Product Hunt), and open-source/dev communities.
