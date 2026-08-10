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
| 020_remove_medication_allergies.sql | Remove Medication Allergies from onboarding options |
| 021_rename_anxiety_label.sql | Rename "Anxiety" symptom label to "Anxious" |
| 025_merge_ayurveda_into_natural.sql | Merge Ayurveda remedies into Natural category |
| 026_merge_ibuprofen_duplicate.sql | Rename canonical Ibuprofen row to "Ibuprofen (Advil / Motrin)" |
| 027_strip_parenthetical_titles.sql | Remove parenthetical text from all remedy titles |
| 028_add_remedy_taglines.sql | Add short display taglines for compact list rows |
| 20260810174433_add_evidence_review_backend.sql | Add the secured evidence review workflow and approved-only public view |

New changes: always create the next numbered file and add a row to this table.
Never modify existing migration files.
