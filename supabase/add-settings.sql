-- ============================================================
--  Adds a private "settings" box to each account (used for the color theme,
--  so it follows you to every device you sign in on).
--  Run once in Supabase: SQL Editor -> New snippet -> paste -> Run
-- ============================================================

alter table public.user_state add column if not exists settings jsonb not null default '{}';
