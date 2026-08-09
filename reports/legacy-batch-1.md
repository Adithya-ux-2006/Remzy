# Legacy cleanup batch 1

Generated: 2026-08-09

## Outcome

- Reviewed: 20 legacy entries
- Retained and cleaned: 12
- Excluded from runtime: 8
- Retained with specific peer-reviewed citations: 12
- Retained as limited-evidence without a citation: 0
- Web of Science full-record URLs added: 0
- PubMed paper URLs added: 12
- Supabase rows changed: 0

The eight exclusions were seven duplicates of already verified remedies and one peppermint-tea
nausea entry whose direct clinical support was insufficient. Keeping them would inflate counts or
overstate evidence.

The retained remedies received explicit `isPurchasable`, `childSafe`, `ingredients`,
`allergen_tags`, and `contraindications` values, corrected symptom mappings, narrowed claims, and
paper-specific PubMed citations. The batch IDs are:

`rem_c01`, `rem_c05`, `rem_a01`, `rem_a02`, `rem_a05`, `rem_i01`, `rem_i02`, `rem_i05`,
`rem_s01`, `rem_s02`, `rem_s05`, `rem_bp02`.

## Web of Science limitation

Public searching did not expose stable Web of Science Core Collection accession IDs for these
records. A valid WoS link requires a specific `/full-record/<accession>` target. Search URLs and
guessed accession IDs are prohibited, so PubMed specific-paper records were used instead. WoS links
can be supplemented after an authenticated WoS export supplies the accession IDs.

## Remaining runtime backlog

After this batch, the runtime catalog contains 176 unique remedies: 75 pass both automated gates
and 101 remain quarantined by the gates. No database migration is eligible until a reviewed batch
also completes deployed-search and SafetyBadge testing.
