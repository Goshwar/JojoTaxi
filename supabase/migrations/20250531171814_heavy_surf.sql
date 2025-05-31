-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can insert reviews" ON reviews;
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON reviews;
DROP POLICY IF EXISTS "Anyone can upload review photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view review photos" ON storage.objects;

-- Drop existing table if it exists
DROP TABLE IF EXISTS reviews;

-- Create reviews table
CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL,
  photo_urls text[],
  approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create storage bucket for review photos if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'reviews'
  ) THEN
    INSERT INTO storage.buckets (id, name)
    VALUES ('reviews', 'reviews');
  END IF;
END $$;

-- Policy to allow anonymous users to insert reviews
CREATE POLICY "Anyone can insert reviews"
  ON reviews
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy to allow anyone to view approved reviews
CREATE POLICY "Anyone can view approved reviews"
  ON reviews
  FOR SELECT
  TO anon
  USING (approved = true);

-- Storage policy to allow anonymous uploads to reviews bucket
CREATE POLICY "Anyone can upload review photos"
  ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (
    bucket_id = 'reviews'
  );

-- Storage policy to allow anyone to read review photos
CREATE POLICY "Anyone can view review photos"
  ON storage.objects
  FOR SELECT
  TO anon
  USING (
    bucket_id = 'reviews'
  );