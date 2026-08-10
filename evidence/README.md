# Remzy evidence programme

Remzy treats a citation as a discovery lead until it passes claim-level semantic review. A working link, PubMed record, or peer-reviewed label is not proof that a source supports the displayed remedy.

## Publication standard

A symptom-remedy claim may be labelled `RESEARCH_BACKED` only when it has:

1. A complete PICO-style claim definition.
2. Three distinct reviewed publications.
3. Evidence from at least two independent source organizations.
4. At least one exact population, intervention, and outcome match.
5. At least one guideline, systematic review, or meta-analysis when available.
6. A completed safety assessment with supporting safety evidence.
7. A named human reviewer and review date.
8. An explicit `approved` decision.

The same paper indexed by PubMed, Europe PMC, Crossref, or a publisher counts once. Databases and search engines are not automatically independent evidence producers.

## Workflow

1. Define the consumer-facing claim before searching.
2. Search guidelines, systematic reviews, trials, and safety authorities.
3. Deduplicate candidates by PMID, DOI, trial identifier, or canonical URL.
4. Extract population, intervention, comparator, outcomes, effect estimates, adverse events, limitations, and funding.
5. Compare the evidence with the displayed claim.
6. Record accepted and rejected sources with reasons.
7. Obtain clinical review for high-risk or uncertain claims.
8. Run `npm run content:audit-semantic` and inspect the generated report.
9. Run `npm run content:audit-semantic:strict` only when enforcing publication readiness.

## Expansion to 500 symptoms

New symptoms enter a private candidate registry first. They must not appear in recommendations until red flags, terminology, claim mappings, evidence reviews, and safety review are complete. Expansion should use reviewable batches of 25-50 symptoms, prioritizing common lower-risk concerns before medication-sensitive, pediatric, pregnancy, sexual-health, neurological, or emergency-adjacent topics.

The JSON schema in `claim.schema.json` is the contract for reviewed assessments. The runtime registry is `src/data/evidenceAssessments.js`.

Candidate symptoms belong in `src/data/symptomExpansionCandidates.js`, never directly in the public catalogue. Run `npm run content:audit-expansion` to validate staged batches and measure progress toward 500 reviewed symptoms.

Run `npm run content:discover-batch` to create the next 25 structured review packets from NCBI PubMed, Europe PMC, and already linked guideline/public-health sources. These packets are candidates only: discovery never writes to the approved assessment registry and never changes what users see.

Run `npm run content:triage-batch` after retrieval. Triage flags missing intervention/condition terms, possible animal evidence, possible retractions, and missing abstracts. A lexical match is never treated as clinical approval.

`npm run content:prereview-all` performs a schema-validated, abstract-only Gemini pre-review across the consolidated queue. It is constrained to the supplied text, cannot approve evidence, and records missing information explicitly. Full-text assessment, risk-of-bias review, safety review, and qualified clinical approval remain required.

`study-assessment.schema.json` defines the full-text, applicability, effect, harm, and RoB 2/ROBINS-I/AMSTAR-2/AGREE-II review record. `body-of-evidence.schema.json` defines the final GRADE-like synthesis and requires a named clinical approver. Automated tooling is intentionally unable to manufacture either approval field.
