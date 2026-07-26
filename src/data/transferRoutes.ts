import { ZONES, roundTripFare } from './zones';

/**
 * Landing-page content for the highest-demand airport transfer corridors.
 *
 * These pages exist because travellers (and the AI assistants they ask) phrase
 * queries as routes — "how much is a taxi from UVF to Rodney Bay" — not as
 * "taxi service". Fares are looked up from ZONES rather than restated, so a
 * price change in one place updates the rates table, these pages and llms.txt
 * together.
 */

export interface TransferRoute {
  slug: string;
  /** Destination as travellers say it, used in the H1 and title. */
  destination: string;
  /** Zone whose fare applies, keyed to ZONES[].zone. */
  zone: string;
  /** Which airport this corridor is priced from. */
  airport: 'UVF' | 'SLU';
  /**
   * Typical drive time. Only set where we have a figure we can stand behind —
   * an invented duration would end up in page copy, schema and llms.txt.
   * Leave undefined until confirmed by the operator.
   */
  duration?: string;
  /** Approximate road distance. Same sourcing rule as `duration`. */
  distance?: string;
  intro: string;
  highlights: string[];
}

export const TRANSFER_ROUTES: TransferRoute[] = [
  {
    slug: 'uvf-to-rodney-bay',
    destination: 'Rodney Bay',
    zone: 'Zone 5',
    airport: 'UVF',
    // Sourced from the published FAQ answer.
    duration: '60–90 minutes',
    distance: '60–70 km',
    intro:
      'Rodney Bay sits in the north of St. Lucia, at the opposite end of the island from Hewanorra International Airport (UVF) in Vieux Fort. It is the longest of our common transfer routes and the one most travellers ask about. We run it every day of the year in air-conditioned private vehicles, with your driver waiting in the arrivals hall.',
    highlights: [
      'Serves Rodney Bay, Gros Islet, Cap Estate and Reduit Beach hotels',
      'Meet and greet in the arrivals hall with a name sign',
      'Flight tracked in real time — delays cost you nothing',
      'Scenic drive up the west coast',
    ],
  },
  {
    slug: 'uvf-to-soufriere',
    destination: 'Soufrière',
    zone: 'Zone 2',
    airport: 'UVF',
    intro:
      'Soufrière is the closest of the major resort areas to Hewanorra International Airport (UVF), sitting on the west coast beneath the Pitons. It is the shortest transfer to St. Lucia’s most photographed corner of the island, serving the resorts around the Pitons and Soufrière town itself.',
    highlights: [
      'Serves Soufrière town, Sugar Beach, Ladera and the Piton resorts',
      'Closest major resort area to UVF',
      'Meet and greet in the arrivals hall with a name sign',
      'Can be combined with a Sulphur Springs or Pitons stop on the way',
    ],
  },
  {
    slug: 'uvf-to-marigot-bay',
    destination: 'Marigot Bay & Castries',
    zone: 'Zone 4',
    airport: 'UVF',
    intro:
      'Marigot Bay and the capital, Castries, sit mid-island on the west coast, roughly halfway between Hewanorra International Airport (UVF) and the northern resorts. The route follows the coast road through the fishing villages of the west coast.',
    highlights: [
      'Serves Marigot Bay, Castries and the cruise port',
      'Convenient for mid-island and marina hotels',
      'Meet and greet in the arrivals hall with a name sign',
      'Flight tracked in real time — delays cost you nothing',
    ],
  },
];

/** One-way fare for a route, taken from the zone pricing table. */
export const routeFare = (route: TransferRoute): number => {
  const zone = ZONES.find((z) => z.zone === route.zone);
  if (!zone) throw new Error(`Unknown zone "${route.zone}" for route ${route.slug}`);
  return route.airport === 'UVF' ? zone.uvf : zone.slu;
};

export const routeRoundTripFare = (route: TransferRoute): number =>
  roundTripFare(routeFare(route));

export const findTransferRoute = (slug?: string): TransferRoute | undefined =>
  TRANSFER_ROUTES.find((r) => r.slug === slug);

export const AIRPORT_NAMES: Record<TransferRoute['airport'], string> = {
  UVF: 'Hewanorra International Airport (UVF)',
  SLU: 'George F. L. Charles Airport (SLU)',
};
