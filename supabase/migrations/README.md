# Supabase Migrations

Run these in order in the Supabase SQL Editor when setting up a new environment.

| File | Description |
|------|-------------|
| 001_initial_schema.sql | Core tables, RLS, triggers |
| 002_phase3a.sql | Gender, onboarding, allergens |
| 003_notify_launch.sql | Nearby launch notification flag |
| 004_product_analytics.sql | Search analytics, remedy analytics, feedback |
| 005_admin_authorization.sql | Admin access flag and analytics read protection |
| 006_profile_collection_fields.sql | Personalization profile collection fields |
| 008_expanded_remedies.sql | Expand remedy list with additional entries |
| 009_symptom_remedies.sql | Symptom-to-remedy mappings |
| 010_body_pain_symptoms.sql | Body pain symptom entries |
| 011_symptom_search_fix.sql | Symptom search indexing fix |
| 012_symptom_expansion.sql | Expand symptom taxonomy |
| 013_database_repair.sql | Repair damaged data and indexes |
| 014_symptom_remedies_expansion.sql | Expand symptom-remedy relationships |
| 015_remedy_schedules.sql | Add remedy scheduling support |
| 016_sexual_wellness.sql | Add sexual wellness remedies and categories |
| 017_search_count.sql | Add search tracking counters |
| 018_search_optimization_and_mapping_fix.sql | Search optimization and mapping corrections |
| 019_fix_trigger_and_sync_schema.sql | Fix triggers and sync schema inconsistencies |
| 020_age_child_safety_remove_tcm.sql | Remove TCM from child safety pathway |
| 021_rename_anxiety_label.sql | Rename "Anxiety" to "Anxious" symptom label |
| 022_remedy_interactions.sql | Add remedy-interaction tracking |
| 023_remedy_popularity.sql | Add remedy popularity metrics |
| 024_symptom_embeddings.sql | Add symptom embedding vectors |
| 025_consolidate_user_columns.sql | Consolidate and rename user columns |
| 026_add_missing_foreign_keys.sql | Add missing foreign key constraints |
| 027_strip_parenthetical_titles.sql | Remove parenthetical text from remedy titles |
| 028_cleanup_rls_policies.sql | Clean up RLS policies for security |
| 029_audit_logging.sql | Add audit logging for data changes |
| 030_merge_junction_tables.sql | Merge junction tables for normalization |
| 031_standardize_timestamps.sql | Standardize timestamp formats across tables |
| 032_add_performance_indexes.sql | Add performance indexes for query optimization |
| 033_remove_medication_allergies.sql | Remove medication allergies from onboarding |
| 034_merge_ayurveda_into_natural.sql | Merge Ayurveda remedies into Natural category |
| 035_merge_ibuprofen_duplicate.sql | Rename canonical Ibuprofen row to "Ibuprofen (Advil / Motrin)" |
| 036_strip_parenthetical_titles.sql | Remove parenthetical text from remedy titles (duplicate/renamed from 027) |
| 037_add_remedy_taglines.sql | Add short display taglines for compact list rows |
| 038_schedule_completions.sql | Add schedule completion tracking |
| 039_fix_trigger_null_columns.sql | Fix NULL columns in trigger results |
| 040_add_is_child_safe_to_users.sql | Add child_safe flag to users table |
| 041_populate_child_safe_remedies.sql | Populate child_safe field for remedies |
| 043_update_category_conventional_to_otc.sql | Update category: conventional → OTC |
| 044_verify_category_changes.sql | Verify and categorize remedy category changes |
| 045_remove_remedies_without_evidence.sql | Delete remedies with no linked research papers |
| 20260810144738_support_google_oauth_profiles.sql | Add Google OAuth profiles support |
| 20260810174433_add_evidence_review_backend.sql | Add the secured evidence review workflow and approved-only public view |

New changes: always create the next numbered file and add a row to this table.
Never modify existing migration files.

Naming scheme note: Migrations 001 through 041 use sequential numbering. Starting at 043, the project switched to timestamp-based naming (YYYYMMDDHHMMSS_description.sql) to avoid merge conflicts on sequential number files when multiple contributors add migrations simultaneously. The project has experienced multiple migration drift incidents (unapplied 015_remedy_schedules.sql, untracked combined_migrations_fixed.sql / fix_stomach_ache_mappings.sql) where migrations existed in repo but were never applied to production. Using the CLI `supabase db push` after linking the project ensures local and remote migrations stay in sync.

If starting a new project, prefer sequential numbering with strict branch protection, or use timestamps from the outset to avoid the migration drift issues seen in this project's history.