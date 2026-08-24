-- Restore table privileges for public.users, favorites, remedy_schedules, etc.
--
-- Symptom: sign-in (email + Google) fails for valid credentials because
-- authStore.buildUser() reads public.users after auth succeeds, and PostgREST
-- returns 403 "permission denied for table users". Same for favorites and
-- remedy_schedules. Content tables (remedies, symptoms) are unaffected.
--
-- Cause: table-level GRANTs for anon/authenticated were lost on the live
-- project (RLS policies still exist and remain the real row-level guardrail).
-- This restores Supabase's default baseline grants.

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- Verify: all three lines must return true
SELECT has_table_privilege('anon', 'public.users', 'select') AS anon_ok;
SELECT has_table_privilege('authenticated', 'public.users', 'select') AS auth_select_ok;
SELECT has_table_privilege('authenticated', 'public.users', 'update') AS auth_update_ok;
