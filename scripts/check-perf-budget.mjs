/**
 * Route-level performance budget check. Run with `npm run perf:budget` after a
 * build; it inspects dist/ and fails on regressions.
 *
 * These are deliberately DETERMINISTIC budgets — byte counts and structural
 * rules read straight off the build output. They cannot flake, so they are safe
 * to fail a build on, unlike wall-clock metrics such as LCP which vary run to
 * run and need a Lighthouse run against a served build to measure honestly.
 *
 * The limits are set a little above what the build currently produces, so
 * ordinary content edits pass and a genuine regression — an unoptimized
 * full-size photo, a heavy dependency landing in the initial bundle — trips
 * them. When a limit is raised, it should be because the page got better for
 * users, not because the number got inconvenient.
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, dirname, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

const KIB = 1024;

const BUDGETS = {
  /** Gzipped JS parsed on first load of a public page: entry + vendor + ui. */
  initialJsGzip: 165 * KIB,
  /** Gzipped CSS on first load. */
  initialCssGzip: 20 * KIB,
  /** Any single image served to a browser. Full-size originals live in image-sources/. */
  largestImage: 600 * KIB,
  /** Every deployed image combined — catches a stray originals directory. */
  totalImages: 9 * KIB * KIB,
  /** Prerendered HTML per route. */
  largestHtml: 80 * KIB,
};

const failures = [];
const notes = [];

const walk = async (dir) => {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
};

const check = (label, actual, limit, fmt) => {
  const line = `${label}: ${fmt(actual)} (budget ${fmt(limit)})`;
  if (actual > limit) failures.push(`${line} — OVER by ${fmt(actual - limit)}`);
  else notes.push(`  ok  ${line}`);
};

const kib = (n) => `${(n / KIB).toFixed(0)} KiB`;

const files = await walk(dist);

// ── Initial JavaScript and CSS ────────────────────────────────────────────────
// Read the entry graph out of the prerendered homepage rather than guessing at
// filenames: whatever index.html loads with <script> or preloads with modulepreload
// is by definition what a first-time visitor parses before the page is interactive.
const html = await readFile(join(dist, 'index.html'), 'utf8');
const referenced = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((m) => m[1]);

let jsGzip = 0;
let cssGzip = 0;
for (const ref of new Set(referenced)) {
  const p = join(dist, ref);
  let buf;
  try {
    buf = await readFile(p);
  } catch {
    failures.push(`index.html references ${ref}, which is not in dist/`);
    continue;
  }
  const size = gzipSync(buf).length;
  if (ref.endsWith('.js')) jsGzip += size;
  if (ref.endsWith('.css')) cssGzip += size;
}

check('initial JS (gzip)', jsGzip, BUDGETS.initialJsGzip, kib);
check('initial CSS (gzip)', cssGzip, BUDGETS.initialCssGzip, kib);

// ── Images ────────────────────────────────────────────────────────────────────
const imageExt = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif']);
const images = files.filter((f) => imageExt.has(extname(f).toLowerCase()));

let totalImages = 0;
let largest = { path: '', size: 0 };
for (const p of images) {
  const { size } = await stat(p);
  totalImages += size;
  if (size > largest.size) largest = { path: p.replace(`${dist}/`, ''), size };
}

check(`largest deployed image (${largest.path || 'none'})`, largest.size, BUDGETS.largestImage, kib);
check('all deployed images', totalImages, BUDGETS.totalImages, kib);

// ── Deterministic structural rules ────────────────────────────────────────────
// An image the browser must paint for LCP cannot be lazy-loaded, and every <img>
// needs intrinsic dimensions or it shifts the layout when it arrives. Both are
// properties of the markup, so they are checked on the prerendered HTML for
// every route rather than inferred from a metric.
const htmlFiles = files.filter((f) => f.endsWith('.html') && !basename(f).match(/^(404|500|offline)\.html$/));

for (const p of htmlFiles) {
  const route = p.replace(`${dist}/`, '');
  const source = await readFile(p, 'utf8');

  const { size } = await stat(p);
  if (size > BUDGETS.largestHtml) {
    failures.push(`${route}: HTML is ${kib(size)} (budget ${kib(BUDGETS.largestHtml)})`);
  }

  // Only markup the browser acts on counts. <noscript> content is inert for any
  // client running the app, so a plain stylesheet link inside it is a correct
  // fallback rather than a regression; comments are inert for everyone, and
  // prose about <link rel="stylesheet"> would otherwise read as one.
  const active = source
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<noscript>[\s\S]*?<\/noscript>/gi, '');

  const tags = [...source.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
  for (const tag of tags) {
    const src = (tag.match(/src="([^"]*)"/) || [])[1] ?? '(no src)';
    if (/fetchpriority="high"/.test(tag) && /loading="lazy"/.test(tag)) {
      failures.push(`${route}: ${src} is both fetchpriority=high and loading=lazy`);
    }
    if (!/\bwidth="/.test(tag) || !/\bheight="/.test(tag)) {
      failures.push(`${route}: ${src} has no explicit width/height`);
    }
  }

  const highPriority = tags.filter((t) => /fetchpriority="high"/.test(t));
  if (highPriority.length > 1) {
    failures.push(
      `${route}: ${highPriority.length} images marked fetchpriority=high — the hint ` +
        `only helps when it singles out the LCP image`,
    );
  }

  // A render-blocking third-party stylesheet in <head> undoes the font fix.
  const blocking = [...active.matchAll(/<link\b[^>]*>/g)]
    .map((m) => m[0])
    .filter((t) => /rel="stylesheet"/.test(t))
    .filter((t) => /https?:\/\//.test(t) && !/media="print"/.test(t));
  if (blocking.length > 0) {
    failures.push(`${route}: render-blocking third-party stylesheet: ${blocking[0].slice(0, 110)}`);
  }
}

// ── Report ────────────────────────────────────────────────────────────────────
console.log(`Performance budget — ${htmlFiles.length} routes, ${images.length} images\n`);
console.log(notes.join('\n'));

if (failures.length > 0) {
  console.error(`\n${failures.length} budget failure(s):`);
  for (const f of failures) console.error(`  FAIL  ${f}`);
  console.error(
    '\nIf a limit needs to move, change it in scripts/check-perf-budget.mjs and say ' +
      'in the commit why the page is still fast for users.',
  );
  process.exit(1);
}

console.log('\nAll budgets pass.');
