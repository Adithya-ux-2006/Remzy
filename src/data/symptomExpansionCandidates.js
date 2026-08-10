/**
 * Private staging registry for the 500-symptom evidence programme.
 *
 * Candidate records are deliberately excluded from the public SYMPTOMS list.
 * Add them here in clinically reviewable batches; promotion requires every
 * readiness flag below plus qualifying approved evidence claims.
 */
export const SYMPTOM_EXPANSION_CANDIDATES = Object.freeze([]);

export const SYMPTOM_REVIEW_STATUS = Object.freeze({
  DISCOVERY: 'discovery',
  TERMINOLOGY_REVIEW: 'terminology-review',
  EVIDENCE_REVIEW: 'evidence-review',
  CLINICAL_REVIEW: 'clinical-review',
  READY: 'ready',
  REJECTED: 'rejected',
});
