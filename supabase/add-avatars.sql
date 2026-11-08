-- ============================================================
--  Profile photos. Run once in Supabase: SQL Editor -> New snippet -> paste -> Run
--
--  The photo goes in the same private "photos" bucket as cigar photos,
--  as <user id>/avatar-<version>.jpg, and profiles.avatar holds the version.
--  People you follow and people who follow you can see it.
-- ============================================================

alter table public.profiles add column if not exists avatar text;

-- Safe to run again: replaces the rule if it's already there
drop policy if exists "photos: see avatars of friends" on storage.objects;
create policy "photos: see avatars of friends" on storage.objects for select to authenticated
  using (bucket_id = 'photos' and storage.filename(name) like 'avatar-%' and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.i_follow(((storage.foldername(name))[1])::uuid)
    or public.follows_me(((storage.foldername(name))[1])::uuid)
  ));
