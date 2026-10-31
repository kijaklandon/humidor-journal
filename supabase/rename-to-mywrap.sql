-- ============================================================
--  Rename friend codes from HJ- (Humidor Journal) to MW- (MyWrap)
--  Run once in Supabase: SQL Editor -> New snippet -> paste -> Run
--  Everyone keeps the same letters, just the new prefix.
-- ============================================================

update public.profiles
set friend_code = 'MW-' || substr(friend_code, 4)
where friend_code like 'HJ-%';

-- New accounts get MW- codes from now on
create or replace function public.new_friend_code() returns text
language plpgsql as $$
declare
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text;
begin
  loop
    code := 'MW-';
    for i in 1..5 loop
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from public.profiles where friend_code = code);
  end loop;
  return code;
end $$;
