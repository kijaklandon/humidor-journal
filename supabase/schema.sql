-- ============================================================
--  MyWrap: accounts, sync and friends
--  Run once in Supabase: SQL Editor -> New query -> paste all -> Run
--
--  Who can see what (enforced by the database, not the app):
--    - You can read and change everything of your own.
--    - People who FOLLOW you can read your profile, your humidor,
--      and your logs that aren't marked "Keep private".
--    - People you follow can't see you unless they follow you too,
--      except your name/code in their Followers list.
--    - Vault reviews, achievements and your email are never shared.
-- ============================================================

-- ---------- Tables ----------

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  friend_code text not null unique,
  name text,
  location text,
  since int,
  bio text,
  fav_cigar text,
  pairing text,
  strength int,
  wrapper text,
  featured text[] not null default '{}',
  age_confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One row per journal entry. `data` holds the entry exactly as the app stores it.
create table public.logs (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  data jsonb not null,
  smoked_on date,
  is_private boolean not null default false,
  deleted boolean not null default false,   -- kept so deletes sync to other devices
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- One row per humidor item
create table public.inventory (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  data jsonb not null,
  deleted boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- Private per-user state: vault reviews, earned achievements, humidor peak
create table public.user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  reviews jsonb not null default '{}',
  achievements jsonb not null default '{}',
  humidor_peak int not null default 0,
  settings jsonb not null default '{}',   -- app preferences, e.g. { theme, themeAt }
  updated_at timestamptz not null default now()
);

-- follower follows following (one-way)
create table public.follows (
  follower uuid not null references auth.users(id) on delete cascade,
  following uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower, following),
  check (follower <> following)
);

create table public.blocks (
  blocker uuid not null references auth.users(id) on delete cascade,
  blocked uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker, blocked)
);

create index logs_feed_idx on public.logs (user_id, smoked_on desc, updated_at desc);
create index follows_following_idx on public.follows (following);

-- ---------- Keep updated_at current ----------

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
create trigger logs_touch before update on public.logs for each row execute function public.touch_updated_at();
create trigger inventory_touch before update on public.inventory for each row execute function public.touch_updated_at();
create trigger user_state_touch before update on public.user_state for each row execute function public.touch_updated_at();

-- ---------- Friend codes & new accounts ----------

-- Codes look like MW-7K3Q9. No 0/O or 1/I, so they're easy to read aloud.
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

-- Every new account gets a profile, a friend code and an empty private state
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, friend_code) values (new.id, public.new_friend_code());
  insert into public.user_state (user_id) values (new.id);
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Relationship helpers (used by the access rules) ----------

-- Do I follow `target` (and they haven't blocked me)?
create or replace function public.i_follow(target uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from follows where follower = auth.uid() and following = target)
     and not exists (select 1 from blocks where blocker = target and blocked = auth.uid());
$$;

-- Does `target` follow me?
create or replace function public.follows_me(target uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from follows where follower = target and following = auth.uid());
$$;

-- Follow someone by their friend code. Returns who you just followed.
create or replace function public.follow_by_code(code text)
returns table (friend_id uuid, friend_name text)
language plpgsql security definer set search_path = public as $$
declare
  target uuid;
begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  select p.id into target from profiles p where p.friend_code = upper(trim(code));
  if target is null then raise exception 'No one has that friend code'; end if;
  if target = auth.uid() then raise exception 'That''s your own code'; end if;
  if exists (select 1 from blocks where blocker = target and blocked = auth.uid()) then
    raise exception 'No one has that friend code';
  end if;
  insert into follows (follower, following) values (auth.uid(), target) on conflict do nothing;
  return query select p.id, p.name from profiles p where p.id = target;
end $$;

-- Block someone: removes follows both ways and stops them seeing you
create or replace function public.block_user(target uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  insert into blocks (blocker, blocked) values (auth.uid(), target) on conflict do nothing;
  delete from follows where (follower = auth.uid() and following = target)
                         or (follower = target and following = auth.uid());
end $$;

-- Delete my account and everything in it
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  delete from auth.users where id = auth.uid();   -- everything else cascades
end $$;

revoke all on function public.follow_by_code(text) from public, anon;
revoke all on function public.block_user(uuid) from public, anon;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.follow_by_code(text) to authenticated;
grant execute on function public.block_user(uuid) to authenticated;
grant execute on function public.delete_my_account() to authenticated;

-- ---------- Access rules (Row Level Security) ----------

alter table public.profiles enable row level security;
alter table public.logs enable row level security;
alter table public.inventory enable row level security;
alter table public.user_state enable row level security;
alter table public.follows enable row level security;
alter table public.blocks enable row level security;

-- Profiles: yours; people you follow; people who follow you (for your Followers list)
create policy "read profiles" on public.profiles for select to authenticated
  using (id = auth.uid() or public.i_follow(id) or public.follows_me(id));
create policy "edit own profile" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- Logs: all of yours; followers see the ones not marked private
create policy "own logs" on public.logs for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "followers read shared logs" on public.logs for select to authenticated
  using (not is_private and not deleted and public.i_follow(user_id));

-- Humidor: all of yours; followers can see it
create policy "own inventory" on public.inventory for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "followers read inventory" on public.inventory for select to authenticated
  using (not deleted and public.i_follow(user_id));

-- Private state: only you
create policy "own state" on public.user_state for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Follows: see your own following/followers; unfollow or remove a follower.
-- New follows go through follow_by_code() so codes can't be skipped.
create policy "read my follows" on public.follows for select to authenticated
  using (follower = auth.uid() or following = auth.uid());
create policy "unfollow or remove follower" on public.follows for delete to authenticated
  using (follower = auth.uid() or following = auth.uid());

-- Blocks: see and undo your own
create policy "read my blocks" on public.blocks for select to authenticated
  using (blocker = auth.uid());
create policy "unblock" on public.blocks for delete to authenticated
  using (blocker = auth.uid());
