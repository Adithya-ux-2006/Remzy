-- Grant the authenticated role read/reference access to auth.users.
--
-- Symptom: liking/saving remedies does nothing — the heart flips briefly then
-- reverts. Console logs:
--   "Error adding favorite: {code: 42501 ... permission denied for table users}"
-- The same 42501 hits fetching favorites, remedy schedules, and schedule
-- completions.
--
-- Root cause: the user-owned tables (public.favorites, remedy_schedules,
-- schedule_completions) reference auth.users via:
--   1. A foreign key (user_id REFERENCES auth.users(id)), which Postgres
--      validates on INSERT/UPDATE/DELETE.
--   2. RLS "Viewer reads shared ..." policies (migration 046) whose USING
--      clause runs `select email from auth.users where id = auth.uid()`.
-- Because RLS policies are evaluated on every row touched by a query, every
-- SELECT/INSERT/DELETE on these tables evaluates auth.users, and the
-- `authenticated` role currently lacks any privilege on auth.users, so the
-- whole statement fails with 42501 ("permission denied for table users").
--
-- Fix: grant exactly the privileges the FK checks and RLS policy pass-through
-- need on auth.users. Minimal and scoped to the one table (not the whole
-- auth schema). App code is correct — no client/Store change required.

GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT ON auth.users TO authenticated;
GRANT REFERENCES ON auth.users TO authenticated;

-- Verify: all three must return true for the authenticated role.
SELECT has_table_privilege('authenticated', 'auth.users', 'select')    AS auth_select_ok;
SELECT has_table_privilege('authenticated', 'auth.users', 'references') AS auth_references_ok;
SELECT has_schema_privilege('authenticated', 'auth', 'usage')           AS auth_schema_usage_ok;
