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
import { TRANSFER_ROUTES } from '../data/transferRoutes';
import { TOURS } from '../data/tours';

export const PRERENDER_ROUTES = [
  '/',
  '/services',
  '/rates-and-zones',
  '/reviews',
  '/faq',
  '/contact',
  // Corridor and tour landing pages are derived from their data files, so a
  // new entry there is prerendered and listed in the sitemap automatically.
  ...TRANSFER_ROUTES.map((r) => `/airport-transfers/${r.slug}`),
  ...TOURS.map((t) => `/tours/${t.slug}`),
];

/** Sitemap entries other than the homepage, which vite-plugin-sitemap adds itself. */
export const SITEMAP_ROUTES = PRERENDER_ROUTES.filter((r) => r !== '/');
