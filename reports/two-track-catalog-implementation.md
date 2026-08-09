# Two-track remedy catalogue implementation

Date: 2026-08-09

## Result

- Total runtime remedies: 107
- Research-backed with specific citations: 97
- Traditional-use entries: 3
- Supportive-care entries: 7
- Verification failures: 0
- Integration failures: 0

## Product behavior

- Research-backed remedies retain citation verification and rank above non-research entries.
- Traditional entries display **Traditional Use** and an explicit evidence limitation.
- Supportive entries display **Supportive Care** and state that they are not proven treatments.
- Non-research entries cannot pass the content gate without an approved tier and a non-empty evidence note.
- Search-result URLs and fabricated citations remain forbidden.
- Remedy detail pages show the evidence note instead of claiming that research exists.

## Restored catalogue value

Ten previously removed low-risk entries were restored under transparent non-research tiers. Claims and names were narrowed where necessary, including changing palming to brief eyes-closed rest. Research-backed remedies remain the recommended higher-ranked results.

## Verification

- Citation/tier gate: passed
- Schema and symptom integration: 107 passed, 0 failed
- Browser evidence-label regression: 2 passed
- Production build: passed
