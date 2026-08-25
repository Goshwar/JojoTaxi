/*
  # Zone-based pricing: `zone_rates` and `pricing_settings`

  Replaces the destination-keyed `rates` table as the source of the prices the
  public site actually publishes.

  ## Why a new table rather than reshaping `rates`

  `rates` is keyed by (airport, destination) — Sandals Grande, Ladera, etc. —
  but every public surface prices by ZONE: the table on /rates-and-zones, the
  three corridor landing pages, the Offer schema and llms.txt all read the five
  zone rows in src/data/zones.ts. The admin screen was therefore editing a
  shape nothing published. `zone_rates` matches what the site renders.

  `rates` is deliberately left in place — it may hold edits made through the
  old admin screen — but nothing reads it any more.

  1. New Tables
    - `zone_rates`
      - `zone_key` (text, unique) — stable slug ('zone-1') referenced by
        src/data/transferRoutes.ts, so renaming a zone cannot break a corridor
        page's fare lookup
      - `name` (text) — display label, e.g. 'Zone 1'
      - `areas` (text) — areas and resorts covered
      - `uvf_usd` / `slu_usd` (numeric) — one-way fare from each airport
      - `sort_order` (integer), `active` (boolean), `updated_at` (timestamptz)

    - `pricing_settings` — single row (id is forced to 1)
      - `round_trip_discount` (numeric) — 0.10 = round trip is two one-way UVF
        fares less 10%. Published in llms.txt, so it has to be data.
      - `rates_updated` (date) — maintained by trigger, never by hand
      - `last_published_at` (timestamptz) — when a site rebuild was last
        requested from the dashboard. Compared against `updated_at` to show
        whether the static HTML and llms.txt still match the live prices.

  2. Security
    - `zone_rates`: anon SELECT of active rows only; authenticated full CRUD
    - `pricing_settings`: anon SELECT; authenticated UPDATE

  3. Automation
    - `zone_rates.updated_at` is set by trigger, not by the client
    - any change to `zone_rates` stamps `pricing_settings.rates_updated`, so the
      "Rates updated <month year>" line on the site and in llms.txt cannot go
      stale while prices change underneath it

  4. Seed Data
    - The exact five zones currently hardcoded in src/data/zones.ts, and
      rates_updated set to the July 2026 those values already claim. Deploying
      this changes no published figure.
*/

-- ============================================================
-- zone_rates
-- ============================================================
CREATE TABLE IF NOT EXISTS zone_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_key text UNIQUE NOT NULL,
  name text NOT NULL,
  areas text NOT NULL DEFAULT '',
  uvf_usd numeric(10,2) NOT NULL CHECK (uvf_usd >= 0),
  slu_usd numeric(10,2) NOT NULL CHECK (slu_usd >= 0),
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE zone_rates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active zone rates" ON zone_rates;
CREATE POLICY "Public can view active zone rates"
  ON zone_rates FOR SELECT
  TO anon
  USING (active = true);

DROP POLICY IF EXISTS "Admins can view all zone rates" ON zone_rates;
CREATE POLICY "Admins can view all zone rates"
  ON zone_rates FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can insert zone rates" ON zone_rates;
CREATE POLICY "Admins can insert zone rates"
  ON zone_rates FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update zone rates" ON zone_rates;
CREATE POLICY "Admins can update zone rates"
  ON zone_rates FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can delete zone rates" ON zone_rates;
CREATE POLICY "Admins can delete zone rates"
  ON zone_rates FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- pricing_settings (single row)
-- ============================================================
CREATE TABLE IF NOT EXISTS pricing_settings (
  -- Forced to a single row: there is one price list, and a second row would
  -- silently give the site two different round-trip discounts.
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  round_trip_discount numeric(4,3) NOT NULL DEFAULT 0.100
    CHECK (round_trip_discount >= 0 AND round_trip_discount < 1),
  rates_updated date NOT NULL DEFAULT CURRENT_DATE,
  -- Set when an admin triggers a rebuild. Deliberately NOT touched by the
  -- updated_at trigger below, or publishing would instantly mark itself stale.
  last_published_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE pricing_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view pricing settings" ON pricing_settings;
CREATE POLICY "Public can view pricing settings"
  ON pricing_settings FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Admins can view pricing settings" ON pricing_settings;
CREATE POLICY "Admins can view pricing settings"
  ON pricing_settings FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can update pricing settings" ON pricing_settings;
CREATE POLICY "Admins can update pricing settings"
  ON pricing_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- Triggers
-- ============================================================

-- updated_at belongs to the database. The previous admin screen sent it from
-- the browser on every write, which meant a code path that forgot to include
-- it silently backdated the row.
CREATE OR REPLACE FUNCTION touch_zone_rate() RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS zone_rates_touch ON zone_rates;
CREATE TRIGGER zone_rates_touch
  BEFORE INSERT OR UPDATE ON zone_rates
  FOR EACH ROW EXECUTE FUNCTION touch_zone_rate();

-- Any price change re-dates the whole published price list, so the
-- "Rates updated <month year>" line shown to visitors and quoted in llms.txt
-- tracks reality without anyone remembering to edit it.
CREATE OR REPLACE FUNCTION stamp_rates_updated() RETURNS trigger AS $$
BEGIN
  -- updated_at is set explicitly rather than left to the trigger above: two
  -- price edits on the same day leave rates_updated unchanged, and the
  -- dashboard still needs to know the published site is behind.
  UPDATE pricing_settings
     SET rates_updated = CURRENT_DATE,
         updated_at    = now()
   WHERE id = 1;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Distinguishes a real pricing change from recording a publish. Without the
-- guard, writing last_published_at would bump updated_at and the dashboard
-- would report the site as out of date the instant it was published.
CREATE OR REPLACE FUNCTION touch_pricing_settings() RETURNS trigger AS $$
BEGIN
  IF NEW.round_trip_discount IS DISTINCT FROM OLD.round_trip_discount THEN
    NEW.updated_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS pricing_settings_touch ON pricing_settings;
CREATE TRIGGER pricing_settings_touch
  BEFORE UPDATE ON pricing_settings
  FOR EACH ROW EXECUTE FUNCTION touch_pricing_settings();

DROP TRIGGER IF EXISTS zone_rates_stamp_updated ON zone_rates;
CREATE TRIGGER zone_rates_stamp_updated
  AFTER INSERT OR UPDATE OR DELETE ON zone_rates
  FOR EACH STATEMENT EXECUTE FUNCTION stamp_rates_updated();

-- ============================================================
-- Seed — the values currently hardcoded in src/data/zones.ts
-- ============================================================
INSERT INTO pricing_settings (id, round_trip_discount, rates_updated)
VALUES (1, 0.100, DATE '2026-07-01')
ON CONFLICT (id) DO NOTHING;

INSERT INTO zone_rates (zone_key, name, areas, uvf_usd, slu_usd, sort_order) VALUES
  ('zone-1', 'Zone 1', 'Vieux Fort, Laborie',                 30,  85, 1),
  ('zone-2', 'Zone 2', 'Choiseul, Soufrière',                 65,  95, 2),
  ('zone-3', 'Zone 3', 'Anse La Raye, Canaries',              80,  55, 3),
  ('zone-4', 'Zone 4', 'Castries, Marigot Bay',               90,  30, 4),
  ('zone-5', 'Zone 5', 'Rodney Bay, Gros Islet, Cap Estate', 100,  45, 5)
ON CONFLICT (zone_key) DO NOTHING;

-- The seed above fired the stamp trigger and set rates_updated to today.
-- Restore the date these figures actually carry, so a fresh deploy does not
-- claim the prices were reviewed the day the migration ran.
UPDATE pricing_settings SET rates_updated = DATE '2026-07-01' WHERE id = 1;
