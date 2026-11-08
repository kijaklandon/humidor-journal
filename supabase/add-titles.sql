-- ============================================================
--  Badge titles. Run once in Supabase: SQL Editor -> New snippet -> paste -> Run
--
--  profiles.title holds the id of the title you picked (e.g. 'globetrotter').
--  It's shared the same way as the rest of your profile.
-- ============================================================

alter table public.profiles add column if not exists title text;
