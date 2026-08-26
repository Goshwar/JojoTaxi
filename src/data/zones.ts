/**
 * Airport transfer pricing by destination zone.
 *
 * Single source of truth for the rates table on /rates-and-zones, the three
 * corridor landing pages, the FAQ price answer, the Offer schema and the
 * prices published in llms.txt — so the figures quoted to AI engines can never
 * drift from the figures shown to visitors.
 *
 * The numbers themselves live in Supabase (`zone_rates` and `service_rates`)
 * and are edited in the admin dashboard. This module reads the build-time
 * snapshot of those tables (./pricing.generated.ts) because prerendering,
 * llms.txt generation and schema building all run in Node with no chance to
 * await a query. Browsers refresh
 * from the live table after hydration via useLiveZones().
 *
 * Prices are USD per vehicle (not per person), one-way unless stated.
 */
import { PRICING_SNAPSHOT } from './pricing.generated';

export interface Zone {
  /** Stable slug ('zone-1'). Referenced by transferRoutes so renaming a zone
   *  in admin cannot break a corridor page's fare lookup. */
  key: string;
  /** Display label, e.g. 'Zone 1'. */
  name: string;
  /** Areas and resorts covered by this zone. */
  areas: string;
  /** One-way fare from Hewanorra International Airport (UVF), Vieux Fort. */
  uvf: number;
  /** One-way fare from George F. L. Charles Airport (SLU), Castries. */
  slu: number;
}

/**
 * A tour or charter product priced as a flat rate or by the hour — the cards
 * under "Island Tour & Hourly Charter Rates" on the rates page.
 *
 * `summary` and `includes` live here rather than in JSX because they describe
 * the same offer as the price: an owner who raises the half-day tour to $175
 * without being able to change "4 hours" is exactly how the FAQ ended up
 * quoting a fare the rates table disagreed with.
 */
export interface ServiceRate {
  /** Stable slug ('half-day-tour'). */
  key: string;
  name: string;
  price: number;
  /** 'flat' renders "$150"; 'hourly' renders "$45/hr". */
  unit: 'flat' | 'hourly';
  /** The line under the price, e.g. "Up to 4 people, 4 hours". */
  summary: string;
  /** Ticked feature bullets. */
  includes: string[];
}

/** Round trips are two one-way UVF fares less this fraction. */
export const ROUND_TRIP_DISCOUNT = PRICING_SNAPSHOT.roundTripDiscount;

/**
 * Round-trip fare for a one-way price.
 *
 * The discount is a parameter rather than a closed-over constant so the live
 * client-side data can apply an admin-changed discount without this module
 * being rebuilt.
 */
export const roundTripFare = (oneWay: number, discount: number = ROUND_TRIP_DISCOUNT): number =>
  Math.round(oneWay * 2 * (1 - discount));

/** Percentage form used in page copy: 0.1 → "10%". */
export const discountLabel = (discount: number = ROUND_TRIP_DISCOUNT): string =>
  `${Math.round(discount * 100)}%`;

export const ZONES: Zone[] = PRICING_SNAPSHOT.zones;

export const SERVICE_RATES: ServiceRate[] = PRICING_SNAPSHOT.services;

/** "$150" for a flat rate, "$45/hr" for an hourly one. */
export const formatServicePrice = (service: ServiceRate): string =>
  service.unit === 'hourly' ? `$${service.price}/hr` : `$${service.price}`;

export const findZone = (key: string, zones: Zone[] = ZONES): Zone | undefined =>
  zones.find((z) => z.key === key);

/**
 * Renders an ISO date as "July 2026" for the "Rates updated" line.
 *
 * Months are spelled out from a fixed table rather than via `Intl`, and the
 * date is split by hand rather than passed to `new Date`: the string is
 * rendered both in Node at build time and in the browser at hydration, and
 * `new Date('2026-07-01')` is UTC midnight, which reads as June in any
 * negative-offset timezone. A mismatch there is a hydration error.
 */
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const formatRatesUpdated = (isoDate: string): string => {
  const [year, month] = isoDate.split('-');
  const name = MONTHS[Number(month) - 1];
  return name ? `${name} ${year}` : isoDate;
};

/**
 * When these fares were last reviewed. Shown on the rates page, the corridor
 * pages and in llms.txt so an engine quoting a price can tell how current it
 * is. Maintained by a database trigger on every price change — nobody has to
 * remember to update it.
 */
export const RATES_UPDATED = formatRatesUpdated(PRICING_SNAPSHOT.ratesUpdated);
