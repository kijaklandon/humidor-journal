-- ============================================================
--  Lock friend codes. Run once in Supabase: SQL Editor -> New snippet -> paste -> Run
--
--  Signed-in app users can edit their own profile, but not their friend
--  code. Changes made from the Supabase dashboard (no app user) still work,
--  which is how special codes like MW-00001 are given out.
-- ============================================================

create or replace function public.lock_friend_code() returns trigger
language plpgsql as $$
begin
  if new.friend_code is distinct from old.friend_code and auth.uid() is not null then
    raise exception 'Friend codes can''t be changed';
  end if;
  return new;
end $$;

drop trigger if exists profiles_lock_code on public.profiles;
create trigger profiles_lock_code before update on public.profiles
  for each row execute function public.lock_friend_code();
