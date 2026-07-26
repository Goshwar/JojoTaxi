# SEO & AI-Discoverability (GEO) Audit — FUNtastic Taxi & Tours

**Date:** July 26, 2026
**Scope:** Full codebase review of the public-facing site, focused on (1) traditional Google/Bing SEO and (2) Generative Engine Optimization — whether AI assistants like ChatGPT, Claude, Gemini, and Perplexity can find, read, and cite this site when travelers ask them for a St. Lucia taxi or airport transfer.

---

## The One-Paragraph Verdict

The site has a solid SEO *skeleton* — per-page titles and descriptions, a LocalBusiness schema, a sitemap plugin, robots.txt, and genuinely good FAQ content. But three structural problems undercut everything: **(1) the site ships as an empty JavaScript shell**, so AI crawlers (which mostly don't run JavaScript) see a blank page; **(2) the site tells search engines it lives at two different domains at once**, splitting its ranking identity; and **(3) there is no SPA redirect config in the repo**, which on Netlify typically means every page except the homepage returns a 404 status to crawlers. Fix those three and the existing good work starts actually counting.

---

## Where We Are vs. Where We're Lacking

| # | Area | Where We Are | Where We're Lacking | Severity |
|---|------|--------------|---------------------|----------|
| 1 | **Rendering (the big one)** | React SPA; content renders fine in browsers. | The HTML served to crawlers is `<div id="root"></div>` — no text, no headings, no prices, no FAQ. GPTBot (OpenAI), ClaudeBot (Anthropic), PerplexityBot, and most AI crawlers **do not execute JavaScript**, so to them the site is empty. Google renders JS but slower and less reliably. | 🔴 Critical |
| 2 | **Domain identity** | Custom domain (`funtastictaxitours.com`) referenced in robots.txt and sitemap config. | The site claims **two identities**: `robots.txt` + sitemap say `funtastictaxitours.com`, while every `og:url`, hreflang tag, and the LocalBusiness schema say `funtastictaxiandtours.netlify.app`. Google treats these as different sites; ranking signals split and the sitemap URLs don't match the pages that serve them. | 🔴 Critical |
| 3 | **Deep-link status codes** | `public/404.html` exists. | No `netlify.toml` or `public/_redirects` with an SPA fallback (`/* /index.html 200`). On Netlify that means `/faq`, `/services`, `/rates-and-zones` return **HTTP 404** to crawlers — those pages cannot be indexed at all. *(Verify on the live site; the config is definitively absent from the repo.)* | 🔴 Critical |
| 4 | **Canonical URLs** | — | Not a single `<link rel="canonical">` anywhere. Combined with the two-domain problem, Google has no signal for which URL is the real one. | 🔴 High |
| 5 | **hreflang / languages** | EN/FR/DE hreflang tags exist; i18next serves 3 languages. | hreflang points to `/fr` and `/de` URLs that **don't exist as routes** (language is browser-detected, not URL-based) — a broken signal that's worse than none. No `x-default`. | 🟠 High |
| 6 | **Structured data** | One static `LocalBusiness` JSON-LD in `index.html` with geo, hours, and an offer catalog. Good start. | No `FAQPage` schema (despite 16 excellent Q&As on `/faq` — a free rich-result + AI-citation opportunity). No `TaxiService`/`Service`, `BreadcrumbList`, `WebSite`, or `AggregateRating`/`Review` schema. Schema `url` points at the Netlify domain. Only `sameAs` link is WhatsApp. | 🟠 High |
| 7 | **AI/GEO signals** | Nothing blocks AI crawlers (good default). | No `llms.txt`. robots.txt doesn't explicitly welcome AI agents (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc.). No plain-text/crawlable version of rates or FAQs for engines to quote. | 🟠 High |
| 8 | **Social/OG previews** | OG + Twitter Card tags on all pages; per-page og:title/og:url. | `og:image` is a **relative path with a space** (`/Images/Pitons 1.jpg`) — broken on WhatsApp/Facebook/iMessage shares, which is a big deal for a taxi business shared via WhatsApp. No `twitter:image`, no `og:locale`, no image dimensions. | 🟠 Medium |
| 9 | **Sitemap** | `vite-plugin-sitemap` generates one at build with the 6 public routes. | Hostname is the custom domain while the site may live on Netlify (see #2). No `lastmod`, no hreflang alternates in the sitemap. Not verifiable in Search Console until the domain question is settled. | 🟠 Medium |
| 10 | **Content depth** | FAQ page is genuinely strong: real prices ($80–110 UVF→Rodney Bay), drive times, airport codes (UVF/SLU), attraction names. This is exactly what AI engines like to cite. | No route-level landing pages ("Hewanorra Airport to Rodney Bay Transfer"), no tour detail pages, no blog. Rates live in a JS file, invisible until rendering is fixed. *(Note: `FleetAndDrivers.tsx` is unrouted **by design** — the fleet/driver roster isn't at scale yet. Out of scope for SEO work.)* | 🟠 Medium |
| 11 | **Images & performance** | PWA, code splitting, terser minification, reduced-motion support — good hygiene. | JPEGs only (no WebP/AVIF), filenames with spaces, no explicit width/height (CLS risk), Google Fonts render-blocking. Favicon is a PNG logo used for everything. | 🟡 Medium |
| 12 | **Off-site local SEO** | Phone, WhatsApp, email consistent in schema. | No evidence of Google Business Profile linkage, no social profiles in `sameAs`, no TripAdvisor presence referenced. For "taxi near me / St. Lucia airport transfer" queries, **GBP is the single biggest ranking lever** — bigger than anything on the site. | 🟡 Medium |
| 13 | **Measurement** | — | No Search Console/Bing Webmaster verification visible, no analytics on organic performance. We're flying blind on what's actually ranking. | 🟡 Medium |
| 14 | **Meta hygiene** | Unique titles/descriptions per page. | `meta keywords` (obsolete, ignored by Google since 2009), duplicate title logic between `index.html` and Helmet. Minor. | 🟢 Low |

---

## Why AI Assistants Can't Recommend This Site Today

When someone asks ChatGPT or Perplexity *"how much is a taxi from UVF airport to Rodney Bay?"*, the engine either answers from its training data or sends a crawler to fetch pages live. Here's what happens with this site today:

1. **The crawler fetches `/faq` or `/rates-and-zones`** → likely gets an HTTP 404 (no SPA fallback) or, at best, an empty `<div id="root">` — because these crawlers don't run React.
2. **It finds no FAQPage or Service schema** to extract structured answers from.
3. **It sees two conflicting domains**, lowering confidence in the entity.
4. **There's no llms.txt** offering it a clean summary of who you are and what you charge.

Result: the engine cites TripAdvisor forums, competitors, or generic travel blogs instead. The irony is the site *already has* citation-quality content (the FAQ answers with real prices and drive times are exactly what these engines quote) — it's just invisible to them.

---

## The Improvement Plan

### Phase 1 — Foundation Fixes (do first, ~1 day of work)
The prerequisite for everything else.

1. **Pick ONE canonical domain** (recommend `funtastictaxitours.com` if it's owned and connected in Netlify) and use it *everywhere*: og:url, hreflang, JSON-LD, sitemap, robots.txt.
2. **Add `public/_redirects`** with the SPA fallback (`/* /index.html 200`) plus a 301 from the `.netlify.app` domain to the custom domain.
3. **Add per-page `<link rel="canonical">`** via Helmet on all six public pages.
4. **Fix hreflang**: remove the `/fr` and `/de` tags (the URLs don't exist). Re-add only if URL-based locales (`/fr/...`) are implemented later; include `x-default` then.
5. **Fix og:image**: absolute URL, no spaces in filename, add `twitter:image` and dimensions. (This also fixes WhatsApp share previews — directly relevant to a WhatsApp-driven business.)
6. Drop `meta keywords`.

### Phase 2 — Make the Site Visible to Crawlers (the single biggest lever, ~1–2 days)
7. **Pre-render the public routes to static HTML at build time** (e.g. a Vite prerender step over `/`, `/services`, `/rates-and-zones`, `/reviews`, `/faq`, `/contact`). Crawlers and AI bots then receive full HTML — headings, FAQ text, rates — with React hydrating on top for users. This is the moment the site goes from "invisible to AI" to "quotable by AI." (A full SSR/Next.js migration would also work but is not required.)

### Phase 3 — Structured Data Buildout (~1 day)
8. **FAQPage schema** on `/faq` generated from the existing `categories` array — the data is already structured in code; it just needs to be emitted as JSON-LD. Eligible for rich results and heavily used by AI engines.
9. **Upgrade LocalBusiness → `TaxiService`** (a recognized schema type), add `areaServed`, `availableLanguage`, real `sameAs` links (Google Business Profile, socials, TripAdvisor).
10. **`Service` schema** per service on `/services`, **`BreadcrumbList`** on subpages, **`WebSite`** schema on the homepage.
11. Once reviews are prerendered: **`AggregateRating`** (within Google's self-serving review guidelines).

### Phase 4 — GEO / AI-Specific Layer (~half a day)
12. **Add `public/llms.txt`**: a concise plain-text/markdown profile — who you are, services, coverage area, sample prices, contact, booking URL — the emerging convention AI crawlers check.
13. **robots.txt: explicitly allow AI crawlers** (GPTBot, ClaudeBot, Claude-Web, PerplexityBot, Google-Extended, Bingbot, CCBot, Amazonbot) so the policy is deliberate, not accidental.
14. **Format content for citation**: keep prices in HTML tables with "per vehicle" units and an "updated" date; keep answers in question-headed sections. (Mostly already true — it just needs Phase 2 to become visible.)

### Phase 5 — Content Expansion (ongoing)
15. **Route landing pages** for the money queries: "Hewanorra (UVF) Airport Transfer to Rodney Bay / Soufrière / Marigot Bay", each with price, duration, and schema. These match exactly how people phrase queries to both Google and AI assistants.
16. **Wire up the orphaned `FleetAndDrivers` page** — vehicle photos + driver credentials build the trust/licensing signals AI engines look for when recommending transport operators.
17. Tour detail pages (Piton tours, Sulphur Springs) targeting long-tail "St. Lucia tour" queries.

### Phase 6 — Off-Site & Measurement (parallel, mostly non-code)
18. **Google Business Profile** (create/claim, link on site, gather reviews there) — the #1 lever for "taxi + near me/St. Lucia" queries in both Google Maps and AI answers, which lean heavily on GBP data.
19. **Bing Places** (Bing powers ChatGPT's web results — disproportionately important for GEO).
20. **TripAdvisor listing** — the most-cited source for Caribbean transport recommendations in AI answers today.
21. **Google Search Console + Bing Webmaster Tools**: verify the canonical domain, submit the sitemap, monitor indexing/queries.

---

## Verification Steps (need live-site access; couldn't be run from this environment)

- Confirm which domain currently serves the site and whether `funtastictaxitours.com` is connected in Netlify.
- `curl -I https://<domain>/faq` — confirm whether deep links return 200 or 404 (tests issue #3).
- Google Search Console coverage report — see what's actually indexed today.
- Test WhatsApp/Facebook link previews before and after the og:image fix.

## Suggested Execution Order

**Week 1:** Phase 1 + Phase 2 + Phase 3 items 8–9 (all pure code, all in this repo).
**Week 2:** Rest of Phase 3, Phase 4, start GBP/Bing/TripAdvisor.
**Ongoing:** Phase 5 content pages, review generation, Search Console monitoring.
