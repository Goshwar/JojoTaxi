/**
 * Build-time snapshot of the zone pricing held in Supabase.
 *
 * GENERATED FILE — written by scripts/sync-rates.mjs, which runs at the start
 * of `npm run build`. Edit prices in the admin dashboard, not here.
 *
 * It is committed on purpose, for three reasons:
 *   1. `npm run build` never depends on the database being reachable. A paused
 *      Supabase project or an offline build falls back to these values instead
 *      of shipping a site with no prices on it.
 *   2. Every price change shows up in `git diff`, so the published history of
 *      what the site claimed is auditable.
 *   3. Prerendering, llms.txt and the Offer schema all run in Node at build
 *      time and cannot await a network round-trip.
 *
 * The browser re-reads the live values after hydration (see
 * src/hooks/useLiveZones.ts), so visitors see an admin edit immediately; this
 * snapshot is what crawlers and AI engines see until the next deploy.
 */
import type { Zone } from './zones';

export interface ZoneSnapshot {
  zones: Zone[];
  /** Round trip is two one-way UVF fares less this fraction. */
  roundTripDiscount: number;
  /** ISO date these fares were last changed. Rendered as "July 2026". */
  ratesUpdated: string;
}

export const ZONE_SNAPSHOT: ZoneSnapshot = {
  zones: [
    { key: 'zone-1', name: 'Zone 1', areas: 'Vieux Fort, Laborie', uvf: 30, slu: 85 },
    { key: 'zone-2', name: 'Zone 2', areas: 'Choiseul, Soufrière', uvf: 65, slu: 95 },
    { key: 'zone-3', name: 'Zone 3', areas: 'Anse La Raye, Canaries', uvf: 80, slu: 55 },
    { key: 'zone-4', name: 'Zone 4', areas: 'Castries, Marigot Bay', uvf: 90, slu: 30 },
    { key: 'zone-5', name: 'Zone 5', areas: 'Rodney Bay, Gros Islet, Cap Estate', uvf: 100, slu: 45 },
  ],
  roundTripDiscount: 0.1,
  ratesUpdated: '2026-07-01',
};
