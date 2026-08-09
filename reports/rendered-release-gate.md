# Rendered release gate

Date: 2026-08-09

## Result

- Local rendered catalogue: passed
- Runtime integration audit: 107 passed, 0 failed
- Specific-citation UI guard: passed
- Limited-evidence visibility: passed
- Symptom-card route: passed (`insomnia`)
- Free-text route: passed (`eye strain`)
- Category grouping: passed (Natural and Lifestyle rendered in their expected groups)
- Child-safe SafetyBadge path: passed (`Not Recommended` rendered after enabling Child Safe Mode)
- Supabase/production mutations: none

## Defects found and corrected

1. `RemedyDetail` still appended a Google Scholar search-results link when a remedy carried `googleScholarUrl`. The dynamic link generation was removed.
2. Successful Supabase loads discarded reviewed local remedies that were not yet present in the database. Catalogue enrichment now retains local-only reviewed entries while keeping existing Supabase records authoritative.
3. Explicit `evidenceTier: limited` entries were mapped as unknown and hidden. The mapper and evidence classifier now preserve, display, and label them as Limited Evidence.

## Automated regression coverage

`e2e/google-scholar-links.spec.js` verifies that representative remedy pages never render search-result URLs and that the reviewed `20-20-20 Screen Reset` remains reachable with a Limited Evidence label.

## Remaining production-only check

Repeat the same representative routes against the deployed URL after deployment. Database migration remains separately gated by a read-only row-count dry run and explicit approval.
