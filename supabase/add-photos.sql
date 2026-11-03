-- ============================================================
--  Cigar photos: a private storage bucket plus who can see what.
--  Run once in Supabase: SQL Editor -> New snippet -> paste -> Run
--
--  Each photo is stored as  <user id>/<log id>-<version>.jpg
--  You can add, replace and delete your own photos. People who follow
--  you can see photos on your shared logs (never on private ones).
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', false, 3145728, array['image/jpeg'])
on conflict (id) do nothing;

create policy "photos: add own" on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "photos: replace own" on storage.objects for update to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "photos: delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "photos: see own and followed" on storage.objects for select to authenticated
  using (bucket_id = 'photos' and (
    (storage.foldername(name))[1] = auth.uid()::text
    or exists (
      select 1 from public.logs l
      where l.user_id::text = (storage.foldername(name))[1]
        and l.id = split_part(storage.filename(name), '-', 1)
        and not l.is_private and not l.deleted
        and public.i_follow(l.user_id)
    )
  ));
