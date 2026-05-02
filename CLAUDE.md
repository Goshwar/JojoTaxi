# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**FUNtastic Taxi & Tours** — a taxi/airport transfer booking website for St. Lucia. Has a public-facing booking platform and a password-protected admin dashboard.

## Commands

```bash
npm run dev       # Start development server
npm run build     # Production build (tsc + vite build)
npm run lint      # ESLint
npm run preview   # Preview production build locally
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
- PWA service worker is at `src/service-worker.ts` with CacheFirst for static assets and NetworkFirst for HTML.
- The build splits chunks manually: `vendor` (React + Router) and `ui` (Lucide + Swiper).

## Internationalization

Translation files are at `src/locales/{en,fr,de}.json`. Browser language is auto-detected; `LanguageSwitcher` component handles manual switching.
