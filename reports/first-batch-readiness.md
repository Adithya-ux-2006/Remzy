# First-batch readiness report

Generated: 2026-08-09

## Gate status

| Scope | Remedies | Citation shape | HTTP | Integration schema/mapping | Eligible to migrate |
|---|---:|---:|---:|---:|---:|
| Primary catalog | 63 | 63/63 | 63/63 | 63/63 | Existing baseline only |
| Runtime merged catalog | 184 unique | 63 pass, 121 pending | Not run for shape failures | 58 pass, 126 fail | No |
| New first batch | 0 | 0 | 0 | 0 | No batch drafted or migrated |

The runtime catalog is larger than the stated 63-item baseline because `catalogStore` merges
`src/data/remedies.js` with 126 entries from `src/data/localCatalog.js` (five duplicate IDs).
Those generated fallback entries are not eligible to be counted as an evidence-backed expansion:
121 unique entries have no citation or explicit limited-evidence tier, and the generated schema omits
required filtering fields on those entries.

Twenty forbidden Google Scholar search URLs were also supplied by the former
`supabaseRemedyGoogleScholarMap` runtime enrichment. That enrichment and its tests were removed.

## Coverage gaps used for prioritization

The current 63-item catalog covers 96 symptom IDs. Two have zero mapped remedies:
`chills` and `swollen_lymph_nodes`. Seventy-nine have only one or two mapped remedies.
The first evidence-reviewed batch should prioritize the two zero-coverage symptoms and the
lowest-coverage groups identified in `kaggle-symptom-gap-analysis.json`, including cough,
sinus pressure, burnout, brain fog, back pain, neck pain, muscle pain, leg pain, knee pain,
eye pain, and eye strain.

The Kaggle comparison contains 477 normalized dataset symptom terms: 50 exact catalog matches,
71 likely phrasing gaps, and 356 terms requiring clinical/product review rather than automatic
catalog expansion. Fuzzy matches are leads only, not symptom mappings.

## Required next batch process

1. Draft 20–30 remedies in a separate staging module with complete schema fields.
2. Clinically review every claim and citation-title match.
3. Run `npm run content:verify-citations` and `npm run content:audit-integration`.
4. Test at least five staged remedies against the deployed app, weighted toward allergy and
   contraindication cases, covering card click, free text, SafetyBadge, and category grouping.
5. Produce a Supabase SELECT/dry-run and request explicit row-count approval before any upsert.

No production database operation was performed.
