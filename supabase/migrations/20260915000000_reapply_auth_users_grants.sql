-- Re-apply auth.users grants that were lost.
--
-- Migration 20260831000000 was tracked as "applied" in supabase_migrations
-- but the GRANTs never persisted on the live database. This caused
-- "permission denied for table users" (42501) on every query touching
-- user-owned tables (favorites, remedy_schedules, schedule_completions,
-- profile_shares) because migration 046's profile-sharing RLS policies
-- run `select email from auth.users where id = auth.uid()`.
--
-- This migration re-applies the grants and adds a safety check.
-- See: 20260831000000_grant_auth_users_to_authenticated.sql for full context.

-- 1. Grant the privileges the FK checks and RLS policy pass-through need
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT ON auth.users TO authenticated;
GRANT REFERENCES ON auth.users TO authenticated;

-- 2. Verify — these should all return true
SELECT has_schema_privilege('authenticated', 'auth', 'usage')            AS auth_schema_usage_ok;
SELECT has_table_privilege('authenticated', 'auth.users', 'select')     AS auth_select_ok;
SELECT has_table_privilege('authenticated', 'auth.users', 'references') AS auth_references_ok;

-- 3. Reload PostgREST schema cache so the grants take effect immediately
SELECT pg_notify('pgrst', 'reload schema');
