-- First ensure the reviews bucket exists
insert into storage.buckets (id, name, public)
values ('reviews', 'reviews', true)
on conflict (id) do nothing;

-- Drop existing policies if they exist
drop policy if exists "Anyone can upload review photos" on storage.objects;
drop policy if exists "Anyone can view review photos" on storage.objects;

-- Add storage policy for anonymous uploads
create policy "Anyone can upload review photos"
on storage.objects for insert
to anon
with check (
  bucket_id = 'reviews'
  and (lower(storage.extension(name)) in ('jpg', 'jpeg', 'png'))
);

-- Add storage policy for anonymous reads
create policy "Anyone can view review photos"
on storage.objects for select
to anon
using (bucket_id = 'reviews');

-- Ensure RLS is enabled for reviews table
alter table reviews enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Anyone can insert reviews" on reviews;
drop policy if exists "Anyone can view approved reviews" on reviews;

-- Recreate policies with correct permissions
create policy "Anyone can insert reviews"
on reviews for insert
to anon
with check (true);

create policy "Anyone can view approved reviews"
on reviews for select
to anon
using (approved = true);