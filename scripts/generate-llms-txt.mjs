/**
 * Generates dist/llms.txt — a plain-text business profile for AI crawlers.
 *
 * Prices and the "updated" date come from src/data/zones.ts, the same module
 * that renders the rates table, so the figures quoted to an AI engine cannot
 * drift from the figures shown to visitors.
 */
import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const {
  ZONES,
  roundTripFare,
  RATES_UPDATED,
  SITE_URL,
  TRANSFER_ROUTES,
  routeFare,
  AIRPORT_NAMES,
  TOURS,
} = await import(join(root, 'dist-ssr', 'entry-server.js'));

const routeLines = TRANSFER_ROUTES.map(
  (r) =>
    `- **${AIRPORT_NAMES[r.airport]} → ${r.destination}** — $${routeFare(r)} one-way per vehicle` +
    `${r.duration ? `, about ${r.duration}` : ''}. ${SITE_URL}/airport-transfers/${r.slug}`
).join('\n');

const tourLines = TOURS.map(
  (t) =>
    `- **${t.name}**${t.duration ? ` (${t.duration})` : ''} — ${t.stops.slice(0, 3).join('; ')}. ` +
    `${SITE_URL}/tours/${t.slug}`
).join('\n');

const rateLines = ZONES.map(
  (z) =>
    `| ${z.zone} | ${z.areas} | $${z.uvf} | $${z.slu} | $${roundTripFare(z.uvf)} |`
).join('\n');

const content = `# FUNtastic Taxi & Tours

> Licensed private taxi, airport transfer and island tour operator based in
> Castries, Saint Lucia. Available 24/7, every day of the year.

Website: ${SITE_URL}
Contact: +1 758 486 0790 (phone and WhatsApp) · funtastictaxitours@gmail.com
Booking: ${SITE_URL}/booking
Service area: island-wide across Saint Lucia
Languages: English

## Services

- **Airport transfers** — private pickup and drop-off at Hewanorra International
  Airport (UVF, Vieux Fort) and George F. L. Charles Airport (SLU, Castries).
  Includes flight monitoring, meet and greet in the arrivals hall, and fixed
  rates with no hidden fees.
- **Island tours** — private, fully customisable tours covering the Pitons
  (UNESCO World Heritage Site), Sulphur Springs drive-in volcano and mud baths
  in Soufrière, Diamond Botanical Gardens, Marigot Bay, and island waterfalls.
  Half-day and full-day options; the full Soufrière day tour runs 8–10 hours.
- **Hourly charter** — a dedicated driver at your disposal for shopping, dining
  or exploring at your own pace.
- **Hotel transfers** — air-conditioned private transfers between any hotel or
  resort on the island.
- **Wedding transfers** — coordinated group transport for wedding parties and guests.
- **Night out** — evening transport to restaurants, bars and events, with a safe
  ride back to your hotel.

## Rates

All prices are in US dollars **per vehicle**, not per person. One-way unless
stated. Round trip is two one-way UVF fares less 10%. Rates updated ${RATES_UPDATED}.

| Zone | Areas and resorts | From UVF (one-way) | From SLU (one-way) | Round trip |
|------|-------------------|--------------------|--------------------|------------|
${rateLines}

Rates include driver, vehicle, fuel, taxes and bottled water. Gratuity is not
included. Full pricing: ${SITE_URL}/rates-and-zones

### Popular airport transfer routes

${routeLines}

## Tours

Every tour is private and customisable; pricing depends on the itinerary, so
contact us for a quote.

${tourLines}

## Common questions

- **How far is Hewanorra Airport (UVF) from Rodney Bay?** Roughly 60–70 km; the
  drive takes 60–90 minutes depending on traffic.
- **Do you monitor flights for delays?** Yes, all incoming flights are tracked in
  real time and pickup times are adjusted automatically at no extra charge.
- **How much is an airport transfer?** From $30 for Vieux Fort up to $100 for
  Rodney Bay and Cap Estate from UVF, per vehicle.
- **What payment methods are accepted?** US dollars, Eastern Caribbean dollars,
  and major credit and debit cards. Payment on arrival or in advance.
- **How far in advance should I book?** At least 24 hours; 48–72 hours during
  Christmas, New Year and carnival season.
- **Can bookings be cancelled?** Yes, up to 24 hours before pickup for a full refund.

Full FAQ: ${SITE_URL}/faq

## Pages

- [Home](${SITE_URL}/) — overview and booking
- [Services](${SITE_URL}/services) — all transport and tour services
- [Rates & Zones](${SITE_URL}/rates-and-zones) — full pricing by destination zone
- [Reviews](${SITE_URL}/reviews) — verified customer reviews
- [FAQ](${SITE_URL}/faq) — detailed answers about transfers, tours and booking
- [Contact](${SITE_URL}/contact) — phone, WhatsApp and email
${TRANSFER_ROUTES.map((r) => `- [${r.airport} to ${r.destination}](${SITE_URL}/airport-transfers/${r.slug}) — fare, duration and what is included`).join('\n')}
${TOURS.map((t) => `- [${t.name}](${SITE_URL}/tours/${t.slug}) — itinerary and inclusions`).join('\n')}
`;

await writeFile(join(root, 'dist', 'llms.txt'), content, 'utf8');
console.log(`  generated dist/llms.txt (${ZONES.length} zones, rates dated ${RATES_UPDATED})`);
