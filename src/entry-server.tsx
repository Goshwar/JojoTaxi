/* eslint-disable react-refresh/only-export-components --
   This module runs only in Node during the build (see scripts/prerender.mjs)
   and is never part of the browser bundle, so Fast Refresh does not apply.
   Exporting the render function and build-time constants is the point of it. */
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { HelmetProvider, type HelmetServerState } from 'react-helmet-async';
import App from './App';

// Re-exported so scripts/prerender.mjs can read the route list straight off
// the SSR bundle rather than parsing TypeScript source.
export { PRERENDER_ROUTES } from './lib/routes';
export { ZONES, roundTripFare, discountLabel, RATES_UPDATED } from './data/zones';
export { SITE_URL, BUSINESS_PROFILES } from './lib/site';
export { TRANSFER_ROUTES, routeFare, AIRPORT_NAMES } from './data/transferRoutes';
export { TOURS } from './data/tours';

export interface RenderResult {
  /** Rendered markup for the #root container. */
  html: string;
  /** Head tags collected by react-helmet-async, already serialised. */
  head: string;
}

/**
 * Renders a route to static HTML at build time. Called by scripts/prerender.mjs
 * once per public route so crawlers that do not execute JavaScript — including
 * GPTBot, ClaudeBot and PerplexityBot — receive real content.
 */
export function render(url: string): RenderResult {
  const helmetContext: { helmet?: HelmetServerState } = {};

  const html = renderToString(
    <StrictMode>
      <HelmetProvider context={helmetContext}>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </HelmetProvider>
    </StrictMode>
  );

  const { helmet } = helmetContext;
  const head = helmet
    ? [helmet.title.toString(), helmet.meta.toString(), helmet.link.toString(), helmet.script.toString()]
        .filter(Boolean)
        .join('\n    ')
    : '';

  return { html, head };
}
