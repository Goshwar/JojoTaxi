/*
  # Add bookings, contact_messages, rates, and fleet_vehicles tables

  1. New Tables
    - `bookings`
      - `id` (uuid, primary key)
      - `booking_ref` (text, unique) - e.g. SL-20260422-ABCD
      - `name` (text) - passenger full name
      - `email` (text)
      - `phone` (text)
      - `pickup` (text) - pickup location
      - `dropoff` (text) - drop-off location
      - `pickup_date` (date)
      - `pickup_time` (time)
      - `passengers` (integer)
      - `luggage` (text, nullable)
      - `notes` (text, nullable)
      - `status` (text) - pending / confirmed / cancelled
      - `created_at` (timestamptz)

    - `contact_messages`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text)
      - `phone` (text, nullable)
      - `subject` (text, nullable)
      - `message` (text)
      - `read` (boolean) - admin read flag
      - `created_at` (timestamptz)

    - `rates`
      - `id` (uuid, primary key)
      - `airport` (text) - UVF or SLU
      - `destination` (text)
      - `one_way_usd` (numeric)
      - `round_trip_usd` (numeric)
      - `updated_at` (timestamptz)

    - `fleet_vehicles`
      - `id` (uuid, primary key)
      - `name` (text) - e.g. Executive Sedan
      - `description` (text)
      - `capacity` (integer) - max passengers
      - `luggage_capacity` (integer) - standard suitcases
      - `image_url` (text, nullable)
      - `active` (boolean) - show/hide on public fleet page
      - `sort_order` (integer) - display order
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - `bookings`: anonymous INSERT, authenticated SELECT/UPDATE
    - `contact_messages`: anonymous INSERT, authenticated SELECT/UPDATE
    - `rates`: public SELECT, authenticated INSERT/UPDATE
    - `fleet_vehicles`: public SELECT of active vehicles, authenticated INSERT/UPDATE

  3. Seed Data
    - Insert rate data from existing static file
    - Insert default fleet vehicle types
*/

-- ============================================================
-- bookings
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_ref text UNIQUE NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  pickup text NOT NULL,
  dropoff text NOT NULL,
  pickup_date date NOT NULL,
  pickup_time time NOT NULL,
  passengers integer NOT NULL DEFAULT 1,
  luggage text DEFAULT '',
  notes text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a booking"
  ON bookings FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Admins can view all bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update booking status"
  ON bookings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- contact_messages
-- ============================================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text DEFAULT '',
  subject text DEFAULT '',
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can send a contact message"
  ON contact_messages FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Admins can view all messages"
  ON contact_messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update message read status"
  ON contact_messages FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- rates
-- ============================================================
CREATE TABLE IF NOT EXISTS rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  airport text NOT NULL CHECK (airport IN ('UVF','SLU')),
  destination text NOT NULL,
  one_way_usd numeric(10,2) NOT NULL,
  round_trip_usd numeric(10,2) NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view rates"
  ON rates FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Admins can insert rates"
  ON rates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update rates"
  ON rates FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete rates"
  ON rates FOR DELETE
  TO authenticated
  USING (true);

-- Seed rates from static data
INSERT INTO rates (airport, destination, one_way_usd, round_trip_usd) VALUES
  ('UVF', 'Sandals Grande',    90,  170),
  ('UVF', 'Ladera Resort',     80,  150),
  ('UVF', 'Sugar Beach',       85,  160),
  ('UVF', 'Soufrière Town',    70,  130),
  ('UVF', 'Marigot Bay',      105,  190),
  ('SLU', 'Cap Maison',        45,   85),
  ('SLU', 'Sandals Halcyon',   30,   55),
  ('SLU', 'Rodney Bay',        25,   45),
  ('SLU', 'Castries Cruise Port', 20, 35),
  ('SLU', 'Pigeon Island',     35,   65)
ON CONFLICT DO NOTHING;

-- ============================================================
-- fleet_vehicles
-- ============================================================
CREATE TABLE IF NOT EXISTS fleet_vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  capacity integer NOT NULL DEFAULT 1,
  luggage_capacity integer NOT NULL DEFAULT 0,
  image_url text DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE fleet_vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active vehicles"
  ON fleet_vehicles FOR SELECT
  TO anon
  USING (active = true);

CREATE POLICY "Admins can view all vehicles"
  ON fleet_vehicles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert vehicles"
  ON fleet_vehicles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update vehicles"
  ON fleet_vehicles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Seed default fleet types
INSERT INTO fleet_vehicles (name, description, capacity, luggage_capacity, sort_order) VALUES
  ('Executive Sedan', 'Comfortable, air-conditioned sedan perfect for couples or small groups. Includes ample luggage space.', 3, 2, 1),
  ('Luxury SUV', 'Spacious SUV ideal for families or small groups who want extra comfort and luggage space.', 5, 4, 2),
  ('Passenger Van', 'Spacious van perfect for larger families or groups traveling together with plenty of luggage.', 8, 8, 3),
  ('Group Bus', 'Comfortable bus for larger groups, corporate events, or wedding parties.', 20, 20, 4)
ON CONFLICT DO NOTHING;
