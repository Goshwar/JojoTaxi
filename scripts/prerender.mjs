/**
 * Build-time prerenderer.
 *
 * Runs after the client and SSR builds. For each public route it renders the
 * app to HTML and writes a standalone file into dist/, so a crawler that does
 * not execute JavaScript still receives headings, prices and FAQ answers.
 *
 * Netlify serves an existing static file in preference to a non-forced
 * redirect rule, so dist/faq/index.html wins over the SPA fallback in
 * public/_redirects, while routes without a prerendered file still fall back.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(root, 'dist');

const { render, PRERENDER_ROUTES } = await import(join(root, 'dist-ssr', 'entry-server.js'));

const template = await readFile(join(distDir, 'index.html'), 'utf8');

/**
 * Strips the tags Helmet owns from the template head. The static copies in
 * index.html are fallbacks for the un-prerendered case; once Helmet supplies
 * per-page values they would otherwise remain as duplicates, and a crawler
 * reading the first match would get the generic homepage values.
 */
const stripHelmetManagedTags = (html) =>
  html
    .replace(/\n?\s*<title>[\s\S]*?<\/title>/i, '')
    .replace(/\n?\s*<(?:meta|link)\b[^>]*\bdata-rh="true"[^>]*\/?>/gi, '');

/**
 * Flat files (dist/faq.html) rather than directory indexes (dist/faq/index.html).
 * Both work on Netlify, but the flat form also resolves correctly under
 * `vite preview` and avoids trailing-slash ambiguity: a request for /faq with
 * no trailing slash otherwise falls through to the SPA fallback and serves the
 * homepage markup, which then fails to hydrate against the real route.
 */
const outputPath = (route) =>
  route === '/' ? join(distDir, 'index.html') : join(distDir, `${route.replace(/^\//, '')}.html`);

let written = 0;

for (const route of PRERENDER_ROUTES) {
  const { html, head } = render(route);

  if (!html.trim()) {
    throw new Error(`Prerender produced empty markup for ${route}`);
  }
  if (!head.includes('rel="canonical"')) {
    throw new Error(`Prerender produced no canonical tag for ${route}`);
  }

  const page = stripHelmetManagedTags(template)
    .replace('</head>', `  ${head}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${html}</div>`);

  const target = outputPath(route);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, page, 'utf8');
  written += 1;
  console.log(`  prerendered ${route.padEnd(18)} → ${target.replace(`${root}/`, '')}`);
}

console.log(`\nPrerendered ${written} route${written === 1 ? '' : 's'}.`);
