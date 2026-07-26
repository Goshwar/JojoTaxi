// Canonical site identity. Every absolute URL emitted by the app (canonical
// tags, Open Graph, structured data, sitemap) derives from SITE_URL so the
// domain only ever needs changing in one place.
export const SITE_URL = 'https://funtastictaxitours.com';

export const SITE_NAME = 'FUNtastic Taxi & Tours';

/** Default social share image — absolute URL, no spaces in the filename. */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/Images/pitons-1.jpg`;

/** Builds an absolute URL from a route path, e.g. '/faq' → 'https://…/faq'. */
export const absoluteUrl = (path: string): string =>
  path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
