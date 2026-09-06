-- =========================================================
-- CampusMarket — 0002_storage.sql
-- Storage bucket for listing photos + access policies.
-- Safe to re-run: drops its own policies first (we don't own
-- storage.objects itself, so we can't drop/recreate the table —
-- only the policies we added to it).
-- =========================================================

insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

drop policy if exists "listing images are publicly viewable" on storage.objects;
drop policy if exists "users can upload their own listing images" on storage.objects;
drop policy if exists "users can delete their own listing images" on storage.objects;

-- anyone can view listing photos (bucket is public, this covers the API path too)
create policy "listing images are publicly viewable"
  on storage.objects for select
  using (bucket_id = 'listing-images');

-- only signed-in users can upload, and only into a folder named after their own user id
-- (front end should upload to `listing-images/<user_id>/<filename>`)
create policy "users can upload their own listing images"
  on storage.objects for insert
  with check (
    bucket_id = 'listing-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "users can delete their own listing images"
  on storage.objects for delete
  using (
    bucket_id = 'listing-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
