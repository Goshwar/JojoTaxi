-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can insert reviews" ON reviews;
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON reviews;

-- Recreate reviews table with updated structure
DROP TABLE IF EXISTS reviews;
CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL,
  photo_urls text[] DEFAULT '{}',
  approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Recreate policies with correct permissions
CREATE POLICY "Anyone can insert reviews"
  ON reviews FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can view approved reviews"
  ON reviews FOR SELECT
  TO anon
  USING (approved = true);

-- Ensure storage bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('reviews', 'reviews', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Anyone can upload review photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view review photos" ON storage.objects;

-- Create storage policies
CREATE POLICY "Anyone can upload review photos"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (
    bucket_id = 'reviews'
    AND (lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png'))
  );

CREATE POLICY "Anyone can view review photos"
  ON storage.objects FOR SELECT
  TO anon
  USING (bucket_id = 'reviews');