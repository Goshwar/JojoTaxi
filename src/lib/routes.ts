/**
 * Public routes that are prerendered to static HTML at build time and listed
 * in the sitemap. Keeping one list means a new page cannot be added to the
 * sitemap without also being prerendered, or vice versa.
 *
 * Deliberately excluded:
 *  - '/booking', '/thank-you' — transactional, no search value
 *  - '/login', '/admin/*'     — private
 *  - any de-routed page (e.g. Fleet & Drivers) — dormant by owner decision
 */
export const PRERENDER_ROUTES = [
  '/',
  '/services',
  '/rates-and-zones',
  '/reviews',
  '/faq',
  '/contact',
] as const;

/** Sitemap entries other than the homepage, which vite-plugin-sitemap adds itself. */
export const SITEMAP_ROUTES = PRERENDER_ROUTES.filter((r) => r !== '/');
