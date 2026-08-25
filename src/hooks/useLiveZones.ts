import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  ROUND_TRIP_DISCOUNT,
  ZONES,
  formatRatesUpdated,
  type Zone,
} from '../data/zones';
import { ZONE_SNAPSHOT } from '../data/zones.generated';

export interface LivePricing {
  zones: Zone[];
  /** Fraction taken off two one-way UVF fares for a round trip. */
  roundTripDiscount: number;
  /** Already formatted for display, e.g. "July 2026". */
  ratesUpdated: string;
  /** True once live values have replaced the build-time snapshot. */
  isLive: boolean;
}

const SNAPSHOT: LivePricing = {
  zones: ZONES,
  roundTripDiscount: ROUND_TRIP_DISCOUNT,
  ratesUpdated: formatRatesUpdated(ZONE_SNAPSHOT.ratesUpdated),
  isLive: false,
};

/**
 * Zone pricing, starting from the build-time snapshot and refreshing from
 * Supabase once the page is interactive.
 *
 * Why it works this way:
 *
 *  - **The first render must be the snapshot.** /rates-and-zones and the
 *    corridor pages are prerendered to static HTML, and the browser hydrates
 *    against that markup. Returning anything other than the baked values on
 *    the first render is a hydration mismatch, and React would throw the
 *    server markup away.
 *
 *  - **The fetch lives in an effect**, which never runs under
 *    `renderToString`, so the build-time render stays synchronous and the
 *    prerendered HTML keeps real prices in it for crawlers that run no
 *    JavaScript.
 *
 *  - **Failure is silent and keeps the snapshot.** A visitor seeing a fare
 *    that is a deploy out of date is a small problem; a visitor seeing a blank
 *    rates table because the database was briefly unreachable is a large one.
 *
 * Note what this can and cannot refresh. Everything a human reads updates the
 * moment an admin saves. The static copies — dist/*.html as a crawler receives
 * it, and llms.txt — are files, so they change only on the next deploy. That
 * gap is what the "Publish" button in the admin dashboard closes.
 */
export const useLiveZones = (): LivePricing => {
  const [pricing, setPricing] = useState<LivePricing>(SNAPSHOT);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const [zoneResult, settingsResult] = await Promise.all([
        supabase
          .from('zone_rates')
          .select('zone_key,name,areas,uvf_usd,slu_usd')
          .eq('active', true)
          .order('sort_order')
          .order('name'),
        supabase
          .from('pricing_settings')
          .select('round_trip_discount,rates_updated')
          .eq('id', 1)
          .maybeSingle(),
      ]);

      if (cancelled) return;

      // No rows is not an empty price list — it is a failed read, a paused
      // project, or an admin mid-edit. Either way the snapshot is better.
      if (zoneResult.error || !zoneResult.data?.length) return;

      const zones: Zone[] = zoneResult.data.map((row) => ({
        key: row.zone_key,
        name: row.name,
        areas: row.areas ?? '',
        uvf: Number(row.uvf_usd),
        slu: Number(row.slu_usd),
      }));

      const settings = settingsResult.error ? null : settingsResult.data;

      const next: LivePricing = {
        zones,
        roundTripDiscount: Number(settings?.round_trip_discount ?? ROUND_TRIP_DISCOUNT),
        ratesUpdated: settings?.rates_updated
          ? formatRatesUpdated(String(settings.rates_updated))
          : SNAPSHOT.ratesUpdated,
        isLive: true,
      };

      // Re-rendering identical numbers would churn the DOM on every page view
      // for the overwhelmingly common case where nothing has changed since the
      // last deploy.
      const unchanged =
        JSON.stringify(next.zones) === JSON.stringify(pricing.zones) &&
        next.roundTripDiscount === pricing.roundTripDiscount &&
        next.ratesUpdated === pricing.ratesUpdated;

      if (unchanged) return;

      setPricing(next);
    };

    void load();

    return () => {
      cancelled = true;
    };
    // Runs once per mount: this is a refresh of static content, not a
    // subscription. `pricing` is read inside only to skip a no-op update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return pricing;
};
