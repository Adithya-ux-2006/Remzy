/**
 * Human-reviewed, claim-level evidence assessments.
 *
 * A citation appearing in a remedy is discovery metadata only. It becomes
 * publishable evidence only after a reviewer records its applicability here.
 * Keep this registry empty until an assessment has actually been completed.
 */
export const EVIDENCE_ASSESSMENTS = Object.freeze({});

export const APPLICABILITY = Object.freeze({
  EXACT: 'exact',
  MOSTLY_APPLICABLE: 'mostly-applicable',
  INDIRECT: 'indirect',
  MISMATCH: 'mismatch',
  UNASSESSED: 'unassessed',
});

export const CERTAINTY = Object.freeze({
  HIGH: 'high',
  MODERATE: 'moderate',
  LOW: 'low',
  VERY_LOW: 'very-low',
  UNRATED: 'unrated',
});

export const REVIEW_STATUS = Object.freeze({
  APPROVED: 'approved',
  NEEDS_REVIEW: 'needs-review',
  QUARANTINED: 'quarantined',
});
