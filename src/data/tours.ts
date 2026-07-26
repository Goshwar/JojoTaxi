/**
 * Landing-page content for the flagship island tours.
 *
 * Content is drawn from the answers already published on the FAQ page, so
 * nothing here asserts a fact the site was not already making. Tour pricing is
 * deliberately absent: unlike transfers, there is no published tour price list
 * to source from, and inventing one would put a wrong number in front of both
 * customers and AI engines. Add a `price` field once the operator confirms.
 */

export interface Tour {
  slug: string;
  name: string;
  /** Typical length, where published on the FAQ page. */
  duration?: string;
  intro: string;
  stops: string[];
  includes: string[];
}

export const TOURS: Tour[] = [
  {
    slug: 'soufriere-pitons-day-tour',
    name: 'Soufrière & Pitons Day Tour',
    // Published in the FAQ: "the full Soufriere day tour typically runs 8–10 hours".
    duration: '8–10 hours (full day)',
    intro:
      'Our most popular tour, covering the south-west of the island and the landmarks St. Lucia is known for. We collect you from your hotel or resort, drive down the scenic west coast to Soufrière, take in the key sights at your own pace, and return by late afternoon. A shorter half-day version is available.',
    stops: [
      'The Pitons — the UNESCO World Heritage twin volcanic peaks',
      'Sulphur Springs, the drive-in volcano, and the mud baths',
      'Diamond Botanical Gardens and waterfall',
      'Soufrière town and the west coast fishing villages',
      'Marigot Bay on the return leg',
    ],
    includes: [
      'Private air-conditioned vehicle and driver for the day',
      'Hotel or resort pickup and drop-off anywhere on the island',
      'Fully customisable itinerary — the stops are yours to choose',
      'Fuel, taxes and bottled water',
    ],
  },
  {
    slug: 'sulphur-springs-tour',
    name: 'Sulphur Springs & Mud Baths Tour',
    intro:
      'Sulphur Springs in Soufrière is the Caribbean’s only drive-in volcano, and the warm mineral mud baths beside it are among the most memorable stops on the island. This shorter tour focuses on the springs and the immediate area, ideal if you have half a day or are joining from a cruise call.',
    stops: [
      'Sulphur Springs drive-in volcano',
      'The warm mineral mud baths',
      'Views across the Pitons from the Soufrière side',
      'Optional stop at Diamond Botanical Gardens',
    ],
    includes: [
      'Private air-conditioned vehicle and driver',
      'Hotel, resort or cruise port pickup',
      'Flexible timing around your schedule',
      'Fuel, taxes and bottled water',
    ],
  },
];

export const findTour = (slug?: string): Tour | undefined =>
  TOURS.find((t) => t.slug === slug);
