// Canonical site identity. Every absolute URL emitted by the app (canonical
// tags, Open Graph, structured data, sitemap) derives from SITE_URL so the
// domain only ever needs changing in one place.
export const SITE_URL = 'https://funtastictaxitours.com';

export const SITE_NAME = 'FUNtastic Taxi & Tours';

/** Default social share image — absolute URL, no spaces in the filename. */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/Images/pitons-1.jpg`;

/**
 * External profiles for the same business entity.
 *
 * These feed the `sameAs` array in the structured data and the contact block
 * in llms.txt. Each verified profile makes it easier for Google and for AI
 * engines to resolve the site, the listing and the reviews as one real,
 * verifiable operator rather than three unrelated mentions — which is a large
 * part of how an assistant decides whether to recommend a transport provider.
 *
 * Add Google Business Profile and social URLs here as they are created.
 * TripAdvisor is given on the .com domain rather than a regional variant
 * (.ca/.co.uk); the listing IDs are identical and .com is the locale-neutral
 * form, which is what belongs in canonical entity data.
 */
export const BUSINESS_PROFILES = {
  whatsapp: 'https://wa.me/17584860790',
  tripadvisor:
    'https://www.tripadvisor.com/Attraction_Review-g147343-d33249587-Reviews-FUNtastic_Taxi_Tours-Castries_Castries_Quarter_St_Lucia.html',
} as const;

/** Builds an absolute URL from a route path, e.g. '/faq' → 'https://…/faq'. */
export const absoluteUrl = (path: string): string =>
  path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
