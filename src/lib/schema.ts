import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE, BUSINESS_PROFILES, absoluteUrl } from './site';

/**
 * schema.org structured data for the site.
 *
 * These objects are emitted as JSON-LD via <JsonLd> and captured by the
 * build-time prerenderer, so search engines get rich-result eligibility and
 * AI engines can extract prices, services and answers without guessing.
 */

const TELEPHONE = '+17584860790';
const EMAIL = 'funtastictaxitours@gmail.com';

/** Stable @id so other schema blocks can reference the same business entity. */
export const BUSINESS_ID = `${SITE_URL}/#business`;

/**
 * Primary business entity. TaxiService is the specific schema.org type for
 * this operation; LocalBusiness is kept as an additional type so consumers
 * that only understand the general type still resolve it.
 */
export const taxiServiceSchema = {
  '@context': 'https://schema.org',
  '@type': ['TaxiService', 'LocalBusiness'],
  '@id': BUSINESS_ID,
  name: 'FUNtastic Taxi and Tours',
  description:
    'St. Lucia private airport transfers, island tours, and taxi service. Licensed local experts available 24/7.',
  url: SITE_URL,
  image: DEFAULT_OG_IMAGE,
  telephone: TELEPHONE,
  email: EMAIL,
  priceRange: '$$',
  currenciesAccepted: 'USD, XCD',
  paymentAccepted: 'Cash, Credit Card, Debit Card',
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '00:00',
    closes: '23:59',
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Castries',
    addressRegion: 'Saint Lucia',
    addressCountry: 'LC',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '14.0101',
    longitude: '-60.9874',
  },
  areaServed: [
    { '@type': 'Country', name: 'Saint Lucia' },
    { '@type': 'City', name: 'Castries' },
    { '@type': 'City', name: 'Soufrière' },
    { '@type': 'City', name: 'Vieux Fort' },
    { '@type': 'City', name: 'Gros Islet' },
    { '@type': 'Place', name: 'Rodney Bay' },
    { '@type': 'Place', name: 'Marigot Bay' },
  ],
  availableLanguage: [{ '@type': 'Language', name: 'English' }],
  // Sourced from BUSINESS_PROFILES so the schema and llms.txt cannot list
  // different profiles. Add Google Business Profile and socials there as they
  // are created — see issue #6.
  sameAs: Object.values(BUSINESS_PROFILES),
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Transportation Services',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Airport Transfer' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Island Tour' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Hourly Charter' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Hotel Transfer' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Wedding Transfer' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Night Out Service' } },
    ],
  },
};

/** Site-level entity, mainly so engines resolve the site name correctly. */
export const webSiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: SITE_URL,
  publisher: { '@id': BUSINESS_ID },
  inLanguage: 'en',
};

/** Builds FAQPage schema from the questions already rendered on the page. */
export const faqPageSchema = (
  categories: { items: { question: string; answer: string }[] }[]
) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': `${absoluteUrl('/faq')}#faq`,
  mainEntity: categories.flatMap((category) =>
    category.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    }))
  ),
});

/** Builds Service schema for each offering listed on the services page. */
export const servicesSchema = (services: { name: string; description: string }[]) =>
  services.map((service) => ({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    serviceType: service.name,
    provider: { '@id': BUSINESS_ID },
    areaServed: { '@type': 'Country', name: 'Saint Lucia' },
    url: absoluteUrl('/services'),
  }));

/**
 * Schema for a single airport-transfer corridor page. Modelled as a Service
 * with a concrete offer, so the fare is machine-readable rather than buried
 * in prose — this is what lets an engine answer "how much is a taxi from UVF
 * to Rodney Bay" with a number.
 */
export const transferRouteSchema = (route: {
  destination: string;
  slug: string;
  airportName: string;
  fare: number;
  intro: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: `${route.airportName} to ${route.destination} Private Transfer`,
  description: route.intro,
  serviceType: 'Airport transfer',
  provider: { '@id': BUSINESS_ID },
  areaServed: { '@type': 'Country', name: 'Saint Lucia' },
  url: absoluteUrl(`/airport-transfers/${route.slug}`),
  offers: {
    '@type': 'Offer',
    price: String(route.fare),
    priceCurrency: 'USD',
    // The fare buys one vehicle, not one seat — stated so engines do not
    // reproduce it as a per-person price.
    description: 'One-way, per vehicle',
    availability: 'https://schema.org/InStock',
    url: absoluteUrl(`/airport-transfers/${route.slug}`),
  },
});

/** Schema for a tour page. TouristTrip is the specific type engines expect. */
export const tourSchema = (tour: {
  name: string;
  slug: string;
  intro: string;
  stops: string[];
}) => ({
  '@context': 'https://schema.org',
  '@type': 'TouristTrip',
  name: tour.name,
  description: tour.intro,
  url: absoluteUrl(`/tours/${tour.slug}`),
  provider: { '@id': BUSINESS_ID },
  touristType: 'Leisure travellers',
  itinerary: {
    '@type': 'ItemList',
    itemListElement: tour.stops.map((stop, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: stop,
    })),
  },
});

/** Builds BreadcrumbList schema. Pass the trail excluding Home, which is added. */
export const breadcrumbSchema = (trail: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [{ name: 'Home', path: '/' }, ...trail].map((crumb, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: crumb.name,
    item: absoluteUrl(crumb.path),
  })),
});
