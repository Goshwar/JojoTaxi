/**
 * Airport transfer pricing by destination zone.
 *
 * Single source of truth for the rates table on /rates-and-zones and for the
 * prices published in llms.txt, so the figures quoted to AI engines can never
 * drift from the figures shown to visitors.
 *
 * Prices are USD per vehicle (not per person), one-way unless stated.
 */

export interface Zone {
  zone: string;
  /** Areas and resorts covered by this zone. */
  areas: string;
  /** One-way fare from Hewanorra International Airport (UVF), Vieux Fort. */
  uvf: number;
  /** One-way fare from George F. L. Charles Airport (SLU), Castries. */
  slu: number;
}

/** Round trips are two one-way UVF fares less 10%. */
export const ROUND_TRIP_DISCOUNT = 0.1;

export const roundTripFare = (oneWay: number): number =>
  Math.round(oneWay * 2 * (1 - ROUND_TRIP_DISCOUNT));

export const ZONES: Zone[] = [
  { zone: 'Zone 1', areas: 'Vieux Fort, Laborie', uvf: 30, slu: 85 },
  { zone: 'Zone 2', areas: 'Choiseul, Soufrière', uvf: 65, slu: 95 },
  { zone: 'Zone 3', areas: 'Anse La Raye, Canaries', uvf: 80, slu: 55 },
  { zone: 'Zone 4', areas: 'Castries, Marigot Bay', uvf: 90, slu: 30 },
  { zone: 'Zone 5', areas: 'Rodney Bay, Gros Islet, Cap Estate', uvf: 100, slu: 45 },
];

/**
 * When these fares were last reviewed. Shown on the rates page and published
 * in llms.txt so an engine quoting a price can tell how current it is.
 * Update this whenever ZONES changes.
 */
export const RATES_UPDATED = 'July 2026';
