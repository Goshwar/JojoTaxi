# SEO & GEO Implementation Plan — FUNtastic Taxi & Tours

**Companion documents:** `SEO_GEO_AUDIT.md` (findings & gap table) · `GITHUB_ISSUES_GUIDE.md` (tracking protocol)
**Tracking:** GitHub issues [#1](https://github.com/Goshwar/JojoTaxi/issues/1)–[#6](https://github.com/Goshwar/JojoTaxi/issues/6), one per phase.
**Status:** Phases 1–4 merged in PR #7. Phase 5 complete (issue #5). Phase 6 remaining — mostly non-code.

> ### Open item for the owner: two unverified figures
> `src/data/transferRoutes.ts` carries `duration`/`distance` only for UVF → Rodney Bay, which is sourced from the published FAQ answer. The Soufrière and Marigot Bay corridors have **no drive time or distance** because none is published anywhere on the site, and inventing one would put a wrong figure into page copy, schema and `llms.txt` at once. Fill those two fields in and the pages pick them up automatically.
>
> Tour pages likewise show **no price** — there is no published tour price list to derive one from. Add a `price` field to `src/data/tours.ts` when confirmed.

> ### Standing rule — do not activate dormant routes
> Some pages exist in the codebase but are deliberately **not routed** (currently
> `src/pages/FleetAndDrivers.tsx`). They were de-routed because the underlying
> operation isn't at scale yet — there is no multi-vehicle fleet or driver roster
> to show. They stay in the repo for a simple reconnect later. **No SEO work may
> route, link to, add to the sitemap, or otherwise surface a dormant page.** If a
> phase seems to need one, raise it with the owner instead of enabling it.

This document translates the audit into concrete, file-level engineering work: what changes, in which files, in what order, and how each phase is verified before its issue is closed.

---

## 0. Decisions Required Before Work Starts

| ID | Decision | Resolution | Blocks |
|----|----------|------------|--------|
| **D1** | Canonical domain | ✅ **`funtastictaxitours.com`** — confirmed owned and connected to Netlify (owner, 2026-07-26) | Phases 1–6 (every URL written anywhere) |
| **D2** | Prerender approach | ✅ **Custom Vite SSG script** — no new risky deps | Phase 2 |
| **D3** | FR/DE strategy | ✅ **Drop hreflang now**, revisit URL-based locales later | Phase 1 item 1.4 |

A placeholder constant will make the domain swappable in one place:

```ts
// src/lib/site.ts — shipped in Phase 1
export const SITE_URL = 'https://funtastictaxitours.com';
export const SITE_NAME = 'FUNtastic Taxi & Tours';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/Images/pitons-1.jpg`;
export const absoluteUrl = (path: string) => …;
```

### Two defects found and fixed while implementing Phase 1
1. **`robots.txt` was being overwritten at build time.** `vite-plugin-sitemap` generates its own `dist/robots.txt`, silently discarding `public/robots.txt` — so `Disallow: /admin` never reached production despite being in source. Fixed by declaring the rules in the plugin's `robots` option in `vite.config.ts`.
2. **Duplicate meta tags on every page.** Static tags in `index.html` and Helmet's per-page tags coexisted, so crawlers reading the first match got the generic homepage description/og:url on all six pages. Fixed by marking the static tags `data-rh="true"`, which makes react-helmet-async take ownership and replace them.

---

## Phase 1 — Foundation Fixes (Issue #1)

**Goal:** one domain identity, crawlable deep links, canonical signals. All changes are small and independent; ship as one PR.

### 1.1 Netlify SPA fallback + domain redirect — `public/_redirects` (new)
```
# Redirect Netlify subdomain to canonical domain (D1)
https://funtastictaxiandtours.netlify.app/* https://funtastictaxitours.com/:splat 301!

# SPA fallback — must be last
/* /index.html 200
```
Note: `public/404.html` stays (used by the offline/service-worker flow) but the fallback rule means Netlify no longer serves it with a 404 status for real routes.

### 1.2 Canonical + per-page URL component — `src/components/ui/Seo.tsx` (new)
A tiny wrapper around Helmet so every page declares the same set of tags consistently:

```tsx
interface SeoProps { title: string; description: string; path: string; image?: string }
// Renders: <title>, meta description, <link rel="canonical" href={SITE_URL + path}>,
// og:title/og:description/og:url/og:image (absolute), twitter:card/title/description/image
```
Refactor the six public pages (`Home`, `Services`, `RatesAndZones`, `Reviews`, `Faq`, `Contact`) to use `<Seo …/>` instead of their hand-rolled Helmet blocks. This kills the netlify.app og:urls in one sweep.

### 1.3 `index.html` cleanup
- Remove `meta keywords` (line 9).
- Fix `og:image` → `${SITE_URL}/Images/pitons-1.jpg` (absolute; see 1.5), add `og:image:width/height`, `og:locale`, `twitter:image`.
- Update JSON-LD `url` field to `SITE_URL` (full schema overhaul happens in Phase 3).

### 1.4 hreflang (D3a)
Remove the three `<link rel="alternate" hreflang…>` tags from `index.html` — `/fr` and `/de` don't exist as URLs, so the tags are actively harmful. Re-introduce with `x-default` only if/when URL-based locales ship.

### 1.5 Share image
Copy `public/Images/Pitons 1.jpg` → `public/Images/pitons-1.jpg` (no space; keep original to avoid breaking the hero slider) and point og/twitter tags at it.

### 1.6 Align sitemap + robots to D1
- `vite.config.ts` sitemap `hostname` ← `SITE_URL`.
- `public/robots.txt` `Sitemap:` line ← `SITE_URL/sitemap.xml`.

**Verify (before closing #1):** `npm run build && npm run lint` pass; built `dist/index.html` contains no `netlify.app` references (grep); after deploy, `curl -I <domain>/faq` → 200, and a WhatsApp share preview shows the image.

---

## Phase 2 — Build-Time Prerendering (Issue #2) — the big lever

**Approach (D2a): custom Vite SSG script.** Standard two-entry Vite SSR pattern, no headless browser, no unmaintained plugins.

### 2.1 Restructure entries
- `src/App.tsx` stays as-is (owns providers + routes), but `BrowserRouter` moves out to the client entry so the server render can use `StaticRouter`.
- `src/main.tsx` (client): switch `createRoot(...).render(...)` → `hydrateRoot(container, app)` **when the container has children** (prerendered page), falling back to `createRoot` (dev, `/booking`, `/admin`).
- `src/entry-server.tsx` (new): exports `render(url)` → `{ html, helmet }` using `ReactDOMServer.renderToString`, `StaticRouter`, and `HelmetProvider` context.

### 2.2 Prerender script — `scripts/prerender.mjs` (new)
Post-build step (`"build": "vite build && vite build --ssr src/entry-server.tsx --outDir dist-ssr && node scripts/prerender.mjs"`):
1. Routes: `/`, `/services`, `/rates-and-zones`, `/reviews`, `/faq`, `/contact` (import the list from one shared module also used by the sitemap config).
2. For each route: call `render(url)`, inject `html` into `dist/index.html`'s `<div id="root">`, replace head tags with Helmet output, write `dist/<route>/index.html`.
3. Explicitly **skip** `/booking`, `/thank-you`, `/admin/*`, `/login`.

### 2.3 Browser-only guards
Audit for SSR crashers and guard with `typeof window !== 'undefined'` or lazy-mount:
- Swiper init in `Home.tsx` (`document.querySelector`), service-worker code, `WhatsAppWidget`, `CookieConsent`, Supabase calls in `Reviews.tsx` (render with empty state server-side; hydrate fetches live data).
- i18next: force `lng: 'en'` during SSR (language detector needs `navigator`), so prerendered HTML is English; client re-detects on hydration.

### 2.4 Service worker interaction
`NetworkFirst` for HTML is already correct for prerendered pages — verify the PWA `navigateFallback` doesn't shadow the static route files.

**Verify (before closing #2):** `grep -l "Hewanorra" dist/faq.html` succeeds; each prerendered file contains its own unique `<title>` and canonical; no hydration errors; after deploy, `curl <domain>/rates-and-zones` shows rate figures without JS.

### Implementation notes (as built)
- Output is **flat files** (`dist/faq.html`), not directory indexes (`dist/faq/index.html`). Both work on Netlify, but the flat form also resolves under `vite preview` and avoids trailing-slash ambiguity — with directory indexes, a request for `/faq` (no trailing slash) fell through to the SPA fallback and served homepage markup, which then failed to hydrate against the real route.
- `src/lib/routes.ts` is the single route list feeding both the prerenderer and the sitemap, so a page cannot appear in one without the other.
- The prerender script fails the build if any route yields empty markup or no canonical tag, so a silent regression cannot ship.
- The SSR build skips the sitemap and PWA plugins (`isSsrBuild`) since it exists only to feed the prerenderer.
- **Follow-up observed, not changed:** prerendered pages are absent from the Workbox precache manifest because the PWA plugin runs before the prerender step. Harmless today — there is no `navigateFallback`, and `index.html` unregisters all service workers on load, so the SW is inert. Worth revisiting if the PWA is ever re-enabled.

---

## Phase 3 — Structured Data (Issue #3)

### 3.1 `src/components/ui/JsonLd.tsx` (new)
`<JsonLd data={object}/>` → renders `<script type="application/ld+json">` via Helmet (so it's captured by Phase 2 prerendering — this ordering is why Phase 3 follows Phase 2).

### 3.2 Schema blocks
| Page | Schema | Source of truth |
|------|--------|-----------------|
| `/faq` | `FAQPage` (16 Q&As) | generated from the existing `categories` array — zero duplication |
| all pages | `TaxiService` (upgraded from LocalBusiness; add `areaServed`, `availableLanguage`, real `sameAs`) | moved from `index.html` into `Layout` via `JsonLd` |
| `/services` | `Service` per offering | services array in `Services.tsx` |
| subpages | `BreadcrumbList` | route path |
| `/` | `WebSite` | `SITE_URL` |
| `/reviews` (later) | `AggregateRating` once reviews prerender with real data | Supabase `reviews` table |

**Verify (before closing #3):** every prerendered page passes Google Rich Results Test; FAQ page shows FAQPage eligibility; no validator errors.

### Implementation notes (as built)
- All schema lives in `src/lib/schema.ts` and is emitted through `<JsonLd>` → Helmet → the prerenderer, so it ships in the static HTML rather than appearing only after JavaScript runs.
- FAQ and Service schema are **generated from the same data the pages render**, so structured data cannot drift from visible copy — a common cause of manual actions.
- The business entity has a stable `@id` (`/#business`); `WebSite` and every `Service` reference it rather than restating it, so engines resolve one entity instead of several.
- The static JSON-LD block was removed from `index.html`; keeping it would have given every page two competing business entities.
- **`AggregateRating` deliberately omitted.** Reviews load from Supabase in the browser, so at prerender time the page has none. Emitting a rating that isn't in the served HTML risks a Google manual action for structured data that doesn't match visible content. To do this properly the reviews need fetching at build time (or an ISR-style rebuild hook) — tracked as a follow-up on issue #3 rather than faked now.

---

## Phase 4 — GEO Layer (Issue #4)

### 4.1 `public/llms.txt` (new)
Markdown profile per the llms.txt convention: business identity, services (airport transfers UVF/SLU, private tours, charters, weddings), coverage (island-wide), sample prices from `src/data/rates.ts` with "per vehicle" units and an as-of date, contact (phone/WhatsApp/email), booking URL, languages (EN/FR/DE), licensing/credential notes.

### 4.2 `public/robots.txt` — explicit AI-crawler policy
```
User-agent: GPTBot
User-agent: ClaudeBot
User-agent: Claude-Web
User-agent: PerplexityBot
User-agent: Google-Extended
User-agent: CCBot
User-agent: Amazonbot
Allow: /
Disallow: /admin

User-agent: *
Allow: /
Disallow: /admin

Sitemap: <SITE_URL>/sitemap.xml
```

### 4.3 Citation-friendly rates
`RatesAndZones.tsx`: add visible "Rates updated: <month year> · all prices per vehicle, USD" line (also lands in prerendered HTML and llms.txt).

**Verify (before closing #4):** `<domain>/llms.txt` returns 200 with correct content-type; robots.txt validates in Google's robots tester.

### Implementation notes (as built)
- `llms.txt` is **generated at build time** (`scripts/generate-llms-txt.mjs`) from `src/data/zones.ts` — the same module that renders the rates table — so prices quoted to AI engines cannot drift from prices shown to visitors. A hand-written file would have gone stale at the first price change.
- The zone rates were extracted from hardcoded JSX into `src/data/zones.ts` to make that possible. Round-trip fares are now derived (`2 × one-way − 10%`) rather than restated; verified to produce values identical to the previous hardcoded table.
- Prices are interpolated as single strings (`` {`$${z.uvf}`} ``) rather than a literal `$` beside an expression. React emits a `<!-- -->` separator between adjacent text nodes, which crude text extractors read as `$ 30` instead of `$30`.
- AI crawlers are enumerated individually in the robots config rather than relying on the wildcard, so the permission is a recorded decision. Each still inherits the `/admin` disallow.
- `src/entry-server.tsx` disables `react-refresh/only-export-components` at file level: it runs only in Node at build time and is never in the browser bundle, so the rule does not apply.

---

## Phase 5 — Content Expansion (Issue #5)

1. **Route landing pages** (new `src/pages/routes/` components, data-driven from an extended `src/data/rates.ts`): `/airport-transfers/uvf-to-rodney-bay`, `/uvf-to-soufriere`, `/uvf-to-marigot-bay`. Each: H1 matching the query, price (ow/rt), duration/distance, what's-included, FAQ subset, `Service` + `BreadcrumbList` schema, CTA to `/booking`.
2. ~~Wire up `FleetAndDrivers.tsx`~~ — **removed from scope.** The page is intentionally dormant (see standing rule above); it is not to be routed or surfaced until the owner says the fleet/driver roster is ready.
3. **Tour pages**: `/tours/soufriere-pitons-day-tour`, `/tours/sulphur-springs` — same pattern.
4. All new routes are added to the single shared route list (sitemap + prerender pick them up automatically).
5. i18n keys added to `src/locales/{en,fr,de}.json`.

**Verify (before closing #5):** each new page prerenders with unique meta + schema; internal links resolve; lint/build pass.

### Implementation notes (as built)
- Both page types are **data-driven** (`src/data/transferRoutes.ts`, `src/data/tours.ts`) behind dynamic routes (`/airport-transfers/:slug`, `/tours/:slug`). Adding a corridor or tour is a data entry — the page, prerendering, sitemap and `llms.txt` all follow automatically from `PRERENDER_ROUTES`.
- Corridor fares are **looked up from `ZONES`**, never restated, so the landing pages, the rates table and `llms.txt` cannot disagree. Verified: Rodney Bay $100/$180, Soufrière $65/$117, Marigot Bay $90/$162 — matching the zone table in both page copy and the `Offer` schema.
- Each corridor emits `Service` + `Offer` schema with `price`, `priceCurrency` and a description stating **per vehicle**, so an engine answering "how much is a taxi from UVF to Rodney Bay" gets a number with correct units. Tours emit `TouristTrip` with an itinerary `ItemList`.
- Unknown slugs redirect rather than render an empty shell (`/airport-transfers/*` → rates page, `/tours/*` → services).
- **Pre-existing defect fixed:** `/faq` had **no `<h1>`** — its hero used `SectionHeading`, which renders `<h2>`. The site's most citation-valuable page was missing its top-level heading. Now a real `<h1>`, matching the other pages' hero markup.
- Nothing dormant was activated; `FleetAndDrivers.tsx` remains unrouted.

---

## Phase 6 — Off-Site & Measurement (Issue #6)

Code touchpoints only (the rest is an owner checklist in the issue):
1. Search Console + Bing Webmaster verification (DNS record preferred; else meta tag in `Seo`/`index.html`).
2. Submit sitemap in both consoles after Phase 2 deploy.
3. Add GBP / TripAdvisor / social URLs to the `sameAs` array (Phase 3 schema) as the owner creates them.
4. Baseline + monthly review of Search Console coverage and query reports.

---

## Execution Order & Dependency Graph

```
D1 (domain) ─► Phase 1 ─► Phase 2 ─► Phase 3 ─► Phase 5
                    │                     │
                    └────► Phase 4 ◄──────┘   (4 can ship any time after 1; best after 2)
Phase 6 runs in parallel from Phase 1 onward (owner tasks) — code touchpoints after Phase 2.
```

Suggested PR breakdown (one PR per phase, each closing its issue via `Closes #n`):
1. **PR 1** — Phase 1 (small, mechanical, low-risk)
2. **PR 2** — Phase 2 (the only structurally risky change; test hydration thoroughly)
3. **PR 3** — Phase 3 + 4 (additive, low-risk)
4. **PR 4+** — Phase 5 pages, shipped incrementally
5. Phase 6 — mostly non-code; verification snippets as needed

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Hydration mismatch after prerender (Swiper, i18n language, Supabase data) | Guard browser-only code (2.3); render deterministic English/empty-state HTML server-side; test every route in dev + preview |
| Service worker serves stale HTML after deploys | `autoUpdate` is already set; verify `navigateFallback` excludes prerendered routes; bump cache on release |
| Netlify redirect ordering breaks admin/API paths | SPA fallback rule last; `/admin` unaffected (client-routed); test `/admin/login` post-deploy |
| Renaming hero image breaks slider | Copy, don't rename (1.5) |
| Prices in llms.txt/landing pages drift from `rates.ts` | Generate from `rates.ts` at build time where possible; "rates updated" date makes staleness visible |

## Per-Phase Definition of Done

A phase is complete only when: `npm run build` + `npm run lint` pass · phase-specific verification steps above pass · verification evidence posted as an issue comment (per `GITHUB_ISSUES_GUIDE.md`) · the issue is closed via PR (`Closes #n`) or `issue_write` with `state_reason: completed`.
