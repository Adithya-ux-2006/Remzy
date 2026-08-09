# Legacy remedy cleanup — final report

Generated: 2026-08-09

## Final runtime catalog

- Runtime remedies: 107
- Research-cited remedies: 89
- Explicit limited-evidence remedies: 18
- Citation/schema failures: 0
- Removed legacy entries: 77
- Supabase mutations: 0

The cleanup reviewed all 121 formerly failing legacy entries across five batches. Entries were
retained only when their claim could be narrowed to the available evidence or honestly presented as
limited-evidence supportive care. Duplicate remedies, invented mechanisms, unsafe broad symptom
mappings, and unsupported Ayurvedic or folk-treatment claims were excluded from the runtime merge.

## Batch outcomes

| Batch | Reviewed | Retained | Cited | Limited evidence | Excluded |
|---|---:|---:|---:|---:|---:|
| 1 | 20 | 12 | 12 | 0 | 8 |
| 2 | 20 | 10 | 4 | 6 | 10 |
| 3 | 25 | 6 | 2 | 4 | 19 |
| 4 | 30 | 10 | 5 | 5 | 20 |
| 5 | 26 | 6 | 3 | 3 | 20 |
| Total | 121 | 44 | 26 | 18 | 77 |

Together with the original 63-remedy baseline, the runtime catalog now has 89 cited and 18
limited-evidence remedies. Every retained remedy has valid symptom IDs, a valid category, explicit
purchase/child-safety fields, ingredients, allergen tags, and contraindications.

No database migration or deployed-site mutation was performed. Live deployed search and
SafetyBadge sampling still remain before production upsert eligibility.
