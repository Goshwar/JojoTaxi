/*
  # Tour and charter pricing: `service_rates`

  The three cards under "Island Tour & Hourly Charter Rates" on /rates-and-zones
  were hardcoded in JSX. This brings them under the same admin control as
  `zone_rates`, so every published price on the site has one editable source.

  1. New Table
    - `service_rates`
      - `service_key` (text, unique) — stable slug ('half-day-tour')
      - `name` (text) — card heading
      - `price_usd` (numeric)
      - `price_unit` (text) — 'flat' renders "$150", 'hourly' renders "$45/hr"
      - `summary` (text) — the line under the price, e.g. "Up to 4 people, 4 hours"
      - `includes` (text[]) — the ticked feature bullets
      - `sort_order`, `active`, `updated_at`

  Why `summary` and `includes` are editable too: the duration and party size sit
  next to the price and are part of the same offer. Making only the number
  editable would leave an owner able to change $150 to $175 but not "4 hours" to
  "5 hours" — the exact drift that put a wrong fare in the FAQ before it was
  derived from the zone table.

  2. Security
    - anon SELECT of active rows; authenticated full CRUD — same shape as `zone_rates`

  3. Automation
    - `updated_at` set by trigger
    - a change stamps `pricing_settings.updated_at`, so the dashboard's
      "published copy is behind" indicator covers these prices too.
      Deliberately does NOT touch `pricing_settings.rates_updated`: that date is
      rendered beside the airport transfer table and is a claim about when the
      *zone* fares were reviewed.

  4. Seed Data
    - The three cards exactly as they were hardcoded, so applying this changes
      no published figure.
*/

CREATE TABLE IF NOT EXISTS service_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_key text UNIQUE NOT NULL,
  name text NOT NULL,
  price_usd numeric(10,2) NOT NULL CHECK (price_usd >= 0),
  price_unit text NOT NULL DEFAULT 'flat' CHECK (price_unit IN ('flat', 'hourly')),
  summary text NOT NULL DEFAULT '',
  includes text[] NOT NULL DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE service_rates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active service rates" ON service_rates;
CREATE POLICY "Public can view active service rates"
  ON service_rates FOR SELECT TO anon USING (active = true);

DROP POLICY IF EXISTS "Admins can view all service rates" ON service_rates;
CREATE POLICY "Admins can view all service rates"
  ON service_rates FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can insert service rates" ON service_rates;
CREATE POLICY "Admins can insert service rates"
  ON service_rates FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update service rates" ON service_rates;
CREATE POLICY "Admins can update service rates"
  ON service_rates FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can delete service rates" ON service_rates;
CREATE POLICY "Admins can delete service rates"
  ON service_rates FOR DELETE TO authenticated USING (true);

-- Reuses the same function as zone_rates: updated_at belongs to the database,
-- not to whichever client remembered to send it.
DROP TRIGGER IF EXISTS service_rates_touch ON service_rates;
CREATE TRIGGER service_rates_touch
  BEFORE INSERT OR UPDATE ON service_rates
  FOR EACH ROW EXECUTE FUNCTION touch_zone_rate();

-- Marks the published site as behind, without re-dating the zone table's
-- "Rates updated" line, which is a separate claim about separate prices.
CREATE OR REPLACE FUNCTION stamp_pricing_touched() RETURNS trigger AS $$
BEGIN
  UPDATE pricing_settings SET updated_at = now() WHERE id = 1;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS service_rates_stamp_updated ON service_rates;
CREATE TRIGGER service_rates_stamp_updated
  AFTER INSERT OR UPDATE OR DELETE ON service_rates
  FOR EACH STATEMENT EXECUTE FUNCTION stamp_pricing_touched();

INSERT INTO service_rates (service_key, name, price_usd, price_unit, summary, includes, sort_order) VALUES
  ('half-day-tour', 'Half-Day Island Tour', 150, 'flat', 'Up to 4 people, 4 hours',
   ARRAY['Customizable itinerary', 'Professional driver/guide', 'Hotel pickup and drop-off', 'Bottled water included'], 1),
  ('full-day-tour', 'Full-Day Island Tour', 250, 'flat', 'Up to 4 people, 8 hours',
   ARRAY['Comprehensive island exploration', 'Professional driver/guide', 'Hotel pickup and drop-off', 'Bottled water and refreshments'], 2),
  ('hourly-charter', 'Hourly Charter', 45, 'hourly', 'Minimum 4 hours',
   ARRAY['Flexible scheduling', 'Dedicated driver', 'Create your own itinerary', 'Ideal for shopping or restaurant visits'], 3)
ON CONFLICT (service_key) DO NOTHING;
