/**
 * Build-time snapshot of the pricing held in Supabase.
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
import type { ServiceRate, Zone } from './zones';

export interface PricingSnapshot {
  zones: Zone[];
  /** Island tours and hourly charter — the cards below the zone table. */
  services: ServiceRate[];
  /** Round trip is two one-way UVF fares less this fraction. */
  roundTripDiscount: number;
  /** ISO date the zone fares were last changed. Rendered as "July 2026". */
  ratesUpdated: string;
}

export const PRICING_SNAPSHOT: PricingSnapshot = {
  zones: [
    { key: 'zone-1', name: 'Zone 1', areas: 'Vieux Fort, Laborie', uvf: 30, slu: 85 },
    { key: 'zone-2', name: 'Zone 2', areas: 'Choiseul, Soufrière', uvf: 65, slu: 95 },
    { key: 'zone-3', name: 'Zone 3', areas: 'Anse La Raye, Canaries', uvf: 80, slu: 55 },
    { key: 'zone-4', name: 'Zone 4', areas: 'Castries, Marigot Bay', uvf: 90, slu: 30 },
    { key: 'zone-5', name: 'Zone 5', areas: 'Rodney Bay, Gros Islet, Cap Estate', uvf: 100, slu: 45 },
  ],
  services: [
    { key: 'half-day-tour', name: 'Half-Day Island Tour', price: 150, unit: 'flat', summary: 'Up to 4 people, 4 hours', includes: ['Customizable itinerary', 'Professional driver/guide', 'Hotel pickup and drop-off', 'Bottled water included'] },
    { key: 'full-day-tour', name: 'Full-Day Island Tour', price: 250, unit: 'flat', summary: 'Up to 4 people, 8 hours', includes: ['Comprehensive island exploration', 'Professional driver/guide', 'Hotel pickup and drop-off', 'Bottled water and refreshments'] },
    { key: 'hourly-charter', name: 'Hourly Charter', price: 45, unit: 'hourly', summary: 'Minimum 4 hours', includes: ['Flexible scheduling', 'Dedicated driver', 'Create your own itinerary', 'Ideal for shopping or restaurant visits'] },
  ],
  roundTripDiscount: 0.1,
  ratesUpdated: '2026-07-01',
};
