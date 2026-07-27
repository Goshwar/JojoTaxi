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
```

No test suite is configured.

## Environment Variables

Required in `.env` (not committed):
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

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

**Key database tables:** `bookings` (status: pending/confirmed/cancelled), `contact_messages` (read: boolean), `rates`, `fleet_vehicles`, `reviews`.

**Static pricing data** lives in `src/data/rates.ts` — the `RatesAndZones` page currently uses this static file; a TODO exists to replace it with a live component.

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
