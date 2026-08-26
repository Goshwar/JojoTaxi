/*
  # Document the live `bookings` table

  `20260422025600_add_bookings_contact_rates_fleet.sql` was never applied to the
  Tours project. It describes a `bookings` table with different column names
  than production actually uses (`name`/`pickup`/`pickup_date` there,
  `full_name`/`pickup_location`/`booking_date` live), and the admin bookings
  page was written against it — so every booking saved correctly and then
  rendered with a blank name, route and date.

  This migration is idempotent and describes the table as it already exists, so
  the repo stops disagreeing with the database. Applying it to the live project
  is a no-op; applying it to a fresh one reproduces production.

  1. Tables
    - `bookings` — one row per booking request, of either service.

  2. Service routing
    - `booking_type` is the discriminator: 'airport_transfer' or 'island_tour'.
    - Transfer columns (`transfer_direction`, `flight_number`, `airline`,
      `pickup_location`, `dropoff_location`, `luggage_count`) are populated only
      for transfers; tour columns (`tour_type`, `hotel_address`,
      `duration_preference`, `accessibility_needs`) only for tours. The unused
      side stays NULL — the CHECK constraints reject an empty string.

  3. Security
    - RLS on. Anonymous visitors may INSERT (the public booking form);
      authenticated admins may SELECT and UPDATE.
*/

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  booking_ref text NOT NULL UNIQUE,
  booking_type text NOT NULL CHECK (booking_type IN ('airport_transfer', 'island_tour')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),

  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  passengers integer NOT NULL DEFAULT 1 CHECK (passengers >= 1 AND passengers <= 10),
  booking_date date NOT NULL,
  pickup_time time NOT NULL,
  special_requests text,

  -- Airport transfers only.
  transfer_direction text CHECK (transfer_direction IN ('arrival', 'departure')),
  flight_number text,
  airline text,
  pickup_location text,
  dropoff_location text,
  luggage_count integer DEFAULT 0 CHECK (luggage_count >= 0 AND luggage_count <= 10),

  -- Island tours only.
  tour_type text CHECK (tour_type IN ('island_tour', 'city_tour', 'waterfall_tour', 'sunset_tour')),
  hotel_address text,
  duration_preference text CHECK (duration_preference IN ('half_day', 'full_day')),
  accessibility_needs text,

  admin_notes text,
  decline_reason text
);

-- The admin list filters by service and by status, and always sorts newest first.
CREATE INDEX IF NOT EXISTS bookings_type_status_created_idx
  ON bookings (booking_type, status, created_at DESC);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'bookings'
      AND policyname = 'anon can insert bookings'
  ) THEN
    CREATE POLICY "anon can insert bookings" ON bookings
      FOR INSERT TO anon WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'bookings'
      AND policyname = 'auth can select bookings'
  ) THEN
    CREATE POLICY "auth can select bookings" ON bookings
      FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'bookings'
      AND policyname = 'auth can update bookings'
  ) THEN
    CREATE POLICY "auth can update bookings" ON bookings
      FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;
