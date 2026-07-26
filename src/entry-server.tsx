import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { HelmetProvider, type HelmetServerState } from 'react-helmet-async';
import App from './App';

// Re-exported so scripts/prerender.mjs can read the route list straight off
// the SSR bundle rather than parsing TypeScript source.
export { PRERENDER_ROUTES } from './lib/routes';

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
