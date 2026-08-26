# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**FUNtastic Taxi & Tours** — a taxi/airport transfer booking website for St. Lucia. Has a public-facing booking platform and a password-protected admin dashboard.

## Commands

```bash
npm run dev          # Start development server
npm run build        # Production build (vite build + SSR build + prerender + llms.txt)
npm run lint         # ESLint
npm run preview      # Preview production build locally
npm run images       # Regenerate responsive image variants from image-sources/
npm run perf:budget  # Check dist/ against the performance budget (run after build)
npm run rates:sync   # Refresh src/data/pricing.generated.ts from Supabase (runs first in build)
```

No test suite is configured.

## Environment Variables

Required in `.env` (not committed):
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Note that every `VITE_` variable is inlined into the client bundle, so nothing secret belongs in one. The Netlify build hook behind the admin "Publish" button is held as the `NETLIFY_BUILD_HOOK` secret on the `publish-site` Edge Function instead.

## Architecture

**Stack:** React 18 + TypeScript, Vite, Tailwind CSS, Supabase (Postgres + Auth), React Router v6, i18next (EN/FR/DE).

**No API layer** — the frontend calls Supabase directly via `src/lib/supabase.ts`. RLS policies on each table control access:
- Anonymous users: INSERT on `bookings` and `contact_messages`
- Authenticated users: SELECT/UPDATE on all tables (admin operations)

**Routing** (`src/App.tsx`):
- Public pages under `<Layout>` (Header/Footer wrapper)
- Admin pages under `/admin/*` wrapped in `<ProtectedRoute>` → `<AdminLayout>`
- `ProtectedRoute` reads `AuthContext` and redirects to `/admin/login` if no session

**Auth** (`src/contexts/AuthContext.tsx`): Supabase email/password auth. Use `useAuth()` for `{ session, user, signIn, signOut }`.

**Live database tables** (Supabase project `Tours`): `bookings`, `reviews`, `zone_rates`, `service_rates`, `pricing_settings`. That is all of them.

⚠️ **`supabase/migrations/` does not describe the live database.** The older migrations define a `bookings` table with different column names than production actually uses (`full_name`/`booking_type`/`pickup_location` live, vs `name`/`pickup` in the migration), plus `contact_messages`, `rates` and `fleet_vehicles` tables that **do not exist**. Consequently `/admin/messages` and `/admin/fleet` query missing tables and silently render empty, and the Dashboard's unread-message count is always 0. Check the real schema before trusting a migration file.

`20260826140000_document_live_bookings_schema.sql` is the one file that does describe the live `bookings` table — it is idempotent and was written from the deployed schema, so treat it as the reference. Along with `20260825120000_add_zone_rates_pricing_settings.sql` and `20260826090000_add_service_rates.sql`, it is the only migration that matches the live project.

## Booking Flow

One wizard serves both services. `BookingModal` renders as the `/booking` page (`mode="page"`) and as the site-wide modal every "Book Now" opens (`mode="modal"`); step 1 picks the service and everything downstream branches on it.

`src/lib/bookings.ts` is the single description of a booking — the live column names, the two `booking_type` values, the status vocabulary, the reference format, and the payload builder. **Anything that names a `bookings` column imports it from there.** The form and the admin list previously each carried a private copy of the shape and drifted: the form wrote the live names while `/admin/bookings` read the ones from the never-applied `20260422025600` migration, so every booking saved correctly and then rendered with a blank name, route and date.

`booking_type` (`'airport_transfer' | 'island_tour'`) is the discriminator, and it decides which columns are populated:

- **Airport transfer** — `transfer_direction`, `flight_number`, `airline`, `pickup_location`, `dropoff_location`, `luggage_count`
- **Island tour** — `tour_type`, `hotel_address`, `duration_preference`, `accessibility_needs`

The unused side must be **NULL, not `''`** — `bookings_tour_type_check` and `bookings_duration_preference_check` reject an empty string, so a transfer that sent `tour_type: ''` would fail the insert outright. `buildBookingPayload()` branches for that reason, not for tidiness.

The same discriminator drives `/admin/bookings`, which splits into Airport Transfers and Island Tours and renders each booking only the fields that apply to it. A dispatcher meets a transfer at a terminal against a flight number and collects a tour from a hotel lobby; the two were previously listed together with neither one's fields on screen.

A booking reaches staff by two independent paths, and both must keep working:

1. **Supabase** — the anon INSERT is the record. It is the only step allowed to fail the customer's submit.
2. **n8n** (`VITE_N8N_WEBHOOK_URL` → `FTT — New Booking Received`) — emails the admin an approve/decline pair and the customer a receipt. Fire-and-forget: a booking already in Postgres is a booking, so a bad minute on Render must not lose it.

Status changes have the same shape. `/admin/bookings` writes the status **and** posts to `VITE_N8N_STATUS_WEBHOOK_URL` (`FTT — Booking Status Update`) so the customer hears about it — before that call existed on the button, confirming in the admin panel updated Postgres and told the customer nothing, and only the approve link in the admin's email ever notified them.

⚠️ **Two status vocabularies exist.** The database is constrained to `pending | confirmed | cancelled`; the n8n workflows switch on `confirmed | declined`. The database wins, and `notifyBookingStatus()` maps `cancelled → declined` at the boundary so nothing else has to know both. Note that the `FTT — Email Approval` workflow's decline branch still writes `status: 'declined'` **directly** to Supabase, which the CHECK constraint rejects — that write fails silently while the workflow still emails the customer a decline and shows a success page. Fix it in n8n, not by widening the constraint.

## Pricing

All prices are edited at `/admin/rates` and stored in Supabase:

- `zone_rates` — airport transfer fares by zone
- `service_rates` — island tours and hourly charter (price, unit, summary line and feature bullets)
- `pricing_settings` — single row: round-trip discount, rates-updated date, last-published time

Everything that publishes a price reads `src/data/zones.ts` and nothing else — the rates table, the tour and charter cards, the corridor pages, the FAQ price answer, the `Offer` schema and `llms.txt`.

Prices reach the public site two ways, and both matter:

1. **Build time.** `npm run rates:sync` (first step of `npm run build`) fetches the live tables and rewrites `src/data/pricing.generated.ts`, which `zones.ts` re-exports. This is what lands in the prerendered HTML and `llms.txt`, so crawlers and AI engines get real prices without running JavaScript. The generated file is **committed** — if Supabase is unreachable the sync warns and the build continues from the last known values rather than shipping a site with no prices.
2. **Runtime.** `useLiveZones()` re-reads the table after hydration, so an admin price edit is visible to visitors without a redeploy. It must return the baked snapshot on first render or hydration breaks; the fetch lives in an effect for that reason.

The gap between the two is the static files: `dist/*.html` as a crawler downloads it, and `llms.txt`. Only a rebuild updates those, which is what the "Publish" button on `/admin/rates` triggers. The dashboard compares `pricing_settings.last_published_at` against `updated_at` to show whether the published copy is behind.

Publish goes through the `publish-site` Edge Function (`supabase/functions/publish-site/`), which holds the Netlify build hook as a server-side secret and verifies the caller is a signed-in admin before firing it. It checks `auth.getUser()` explicitly rather than relying on the gateway's JWT verification alone — the project's anon key is itself a valid JWT, so gateway verification would let an unauthenticated request through.

`transferRoutes.ts` links a corridor page to a zone by `zoneKey` (`'zone-5'`), never by display name, so renaming a zone in admin cannot break a fare. `routeFare()` throws on an unknown key — deliberately, to fail the build rather than publish a page with no price — so `safeRouteFare()` is the browser-side variant that falls back to the snapshot.

Never hand-edit `src/data/pricing.generated.ts`; edit prices in the admin dashboard.

A `service_rates` row carries its `summary` ("Up to 4 people, 4 hours") and `includes` bullets alongside the price, deliberately: they describe the same offer, and a price that can change without its duration is how the FAQ came to quote a fare the rates table disagreed with.

## Conventions

- Admin pages follow a consistent pattern: `useEffect` calls a local `load()` async function that queries Supabase, and mutations call `load()` again to refresh state.
- Booking references are generated client-side: `SL-YYYYMMDD-XXXX` format.
- SweetAlert2 (`Swal`) is used for confirmation dialogs before destructive actions.
- Custom Tailwind classes: `.btn`, `.btn-primary`, `.btn-cta`, `.btn-outline`, `.card`, `.section`, `.nav-link` — defined in `src/index.css`.
- Brand colors: `turquoise: #00B8B8`, `yellow: #FFC845`. Fonts: Poppins (headings), Inter (body).
- **No service worker runs.** `vite-plugin-pwa` is configured with `selfDestroying: true` and `injectRegister: false`: it emits a `sw.js` that unregisters any worker left over from an earlier deploy, and nothing registers a new one. See the comment in `vite.config.ts` before re-enabling the PWA.
- The build splits chunks manually: `vendor` (React + Router) and `ui` (Lucide + Swiper).
- Routes that are **prerendered** (`src/lib/routes.ts`) must stay eagerly imported in `App.tsx` — a `React.lazy` boundary makes React swap the prerendered markup for a Suspense fallback during hydration. Non-prerendered routes (`/booking`, `/thank-you`, `/login`, `/admin/*`) are lazy.

## Images

Full-resolution photographs live in `image-sources/` and are **not deployed**. `npm run images` (`scripts/optimize-images.mjs`) generates everything in `public/Images/` — an AVIF ladder plus a coarser JPEG/PNG fallback ladder — and writes the manifest `src/data/optimizedImages.ts`. Both the generated files and the manifest are committed.

- Never hand-edit `public/Images/`; it is regenerated wholesale.
- Render images with `<ResponsiveImage src="/Images/Marigot 1.jpg" sizes="..." />`. It keys off the original source path. **Always pass a `sizes` value that matches the real layout width** — the browser picks a rung from `sizes` before layout, so a wrong value downloads the wrong file. It defaults to `100vw`, which is right only for full-bleed images.
- Set `priority` on the single LCP image per route, and no more than one.
- Images inside a Swiper `effect="fade"` carousel are all in-viewport, so `loading="lazy"` does nothing for them. Gate the non-first slides on `useAfterLoad()` instead.
- Two sources (`UVF Airport.jpg`, `Viewpoint 2.jpg`) are truncated mid-upload and only partly decode; `npm run images` warns about them. They need replacing at source.

## Internationalization

Translation files are at `src/locales/{en,fr,de}.json`. Browser language is auto-detected; `LanguageSwitcher` component handles manual switching.
