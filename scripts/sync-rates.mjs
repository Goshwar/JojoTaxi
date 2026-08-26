/**
 * Refreshes src/data/pricing.generated.ts from the live pricing tables.
 *
 * Runs first in `npm run build`, before Vite, so the client bundle, the
 * prerendered HTML, the Offer schema and llms.txt are all built from the same
 * prices the admin dashboard is currently serving.
 *
 * Failure is never fatal. If the database is unreachable, paused, or returns
 * nothing, the committed snapshot is left exactly as it is and the build
 * continues — shipping last-known-good prices beats shipping a site with an
 * empty rates table. The warning is loud so a stale snapshot is noticed.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const target = join(root, 'src', 'data', 'pricing.generated.ts');

/** Non-fatal exit: keep the committed snapshot, tell the operator why. */
const keepSnapshot = (reason) => {
  console.warn(`  ⚠ sync-rates: ${reason}`);
  console.warn('    Building from the committed snapshot in src/data/pricing.generated.ts.');
  process.exit(0);
};

/**
 * Netlify exposes build environment variables on process.env, but a local
 * `npm run build` does not — Vite reads .env itself and a plain Node script
 * never sees it. Parsed by hand rather than adding a dotenv dependency for
 * two keys.
 */
const readEnv = async () => {
  const env = { ...process.env };
  try {
    const file = await readFile(join(root, '.env'), 'utf8');
    for (const line of file.split('\n')) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      const [, key, rawValue] = match;
      if (env[key]) continue; // a real environment variable wins over the file
      env[key] = rawValue.replace(/^["']|["']$/g, '');
    }
  } catch {
    // No .env file — expected in CI, where the variables are already set.
  }
  return env;
};

const env = await readEnv();
const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  keepSnapshot('VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set.');
}

/**
 * Queried over REST rather than through @supabase/supabase-js: this needs one
 * anonymous read, and the client library brings auth and realtime machinery
 * that has no meaning in a build script.
 *
 * Reads only active zones, which is exactly what an anonymous visitor sees —
 * the snapshot must match what the live refresh will later return, or every
 * page would visibly reshuffle a moment after it loads.
 */
const get = async (path) => {
  const response = await fetch(`${url}/rest/v1/${path}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} on /${path}`);
  }
  return response.json();
};

let zones;
let services;
let settings;
try {
  [zones, services, settings] = await Promise.all([
    get('zone_rates?select=zone_key,name,areas,uvf_usd,slu_usd&active=eq.true&order=sort_order.asc,name.asc'),
    get('service_rates?select=service_key,name,price_usd,price_unit,summary,includes&active=eq.true&order=sort_order.asc,name.asc'),
    get('pricing_settings?select=round_trip_discount,rates_updated&id=eq.1'),
  ]);
} catch (error) {
  keepSnapshot(`could not read pricing from Supabase — ${error.message}`);
}

if (!Array.isArray(zones) || zones.length === 0) {
  keepSnapshot('the zone_rates table returned no active rows.');
}

// Tours and charters are allowed to be empty in a way zones are not: an owner
// who stops offering them should see the section disappear, not see the build
// refuse. Only a failed read (handled above) falls back.
if (!Array.isArray(services)) services = [];

const setting = settings?.[0] ?? {};
const roundTripDiscount = Number(setting.round_trip_discount ?? 0.1);
const ratesUpdated = setting.rates_updated ?? new Date().toISOString().slice(0, 10);

const escape = (value) => String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");

const list = (values) => `[${(values ?? []).map((v) => `'${escape(v)}'`).join(', ')}]`;

const zoneRows = zones
  .map(
    (z) =>
      `    { key: '${escape(z.zone_key)}', name: '${escape(z.name)}', ` +
      `areas: '${escape(z.areas)}', uvf: ${Number(z.uvf_usd)}, slu: ${Number(z.slu_usd)} },`
  )
  .join('\n');

const serviceRows = services
  .map(
    (s) =>
      `    { key: '${escape(s.service_key)}', name: '${escape(s.name)}', ` +
      `price: ${Number(s.price_usd)}, unit: '${escape(s.price_unit)}', ` +
      `summary: '${escape(s.summary)}', includes: ${list(s.includes)} },`
  )
  .join('\n');

const contents = `/**
 * Build-time snapshot of the pricing held in Supabase.
 *
 * GENERATED FILE — written by scripts/sync-rates.mjs, which runs at the start
 * of \`npm run build\`. Edit prices in the admin dashboard, not here.
 *
 * It is committed on purpose, for three reasons:
 *   1. \`npm run build\` never depends on the database being reachable. A paused
 *      Supabase project or an offline build falls back to these values instead
 *      of shipping a site with no prices on it.
 *   2. Every price change shows up in \`git diff\`, so the published history of
 *      what the site claimed is auditable.
 *   3. Prerendering, llms.txt and the Offer schema all run in Node at build
 *      time and cannot await a network round-trip.
 *
 * The browser re-reads the live values after hydration (see
 * src/hooks/useLiveZones.ts), so visitors see an admin edit immediately; this
 * snapshot is what crawlers and AI engines see until the next deploy.
 */
import type { ServiceRate, Zone } from './zones';

export interface PricingSnapshot {
  zones: Zone[];
  /** Island tours and hourly charter — the cards below the zone table. */
  services: ServiceRate[];
  /** Round trip is two one-way UVF fares less this fraction. */
  roundTripDiscount: number;
  /** ISO date the zone fares were last changed. Rendered as "July 2026". */
  ratesUpdated: string;
}

export const PRICING_SNAPSHOT: PricingSnapshot = {
  zones: [
${zoneRows}
  ],
  services: [
${serviceRows}
  ],
  roundTripDiscount: ${roundTripDiscount},
  ratesUpdated: '${escape(ratesUpdated)}',
};
`;

const previous = await readFile(target, 'utf8').catch(() => '');
if (previous === contents) {
  console.log(`  sync-rates: snapshot already current (${zones.length} zones, ${services.length} services, dated ${ratesUpdated}).`);
} else {
  await writeFile(target, contents, 'utf8');
  console.log(`  sync-rates: snapshot updated (${zones.length} zones, ${services.length} services, dated ${ratesUpdated}).`);
}
