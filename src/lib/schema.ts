import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE, absoluteUrl } from './site';

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
  // Add Google Business Profile, TripAdvisor and social URLs here as they are
  // created — see issue #6. Each one strengthens entity recognition.
  sameAs: ['https://wa.me/17584860790'],
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
