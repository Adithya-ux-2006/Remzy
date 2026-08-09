/**
 * Evidence Classification Utility
 * 
 * Provides functions to classify remedies and their evidence into:
 * - RESEARCH_BACKED: has a real, verifiable PubMed or Google Scholar citation
 * - UNVERIFIED: has citations but none are verifiable
 * - UNKNOWN: no citations at all
 * 
 * Also computes evidence scores from actual citation data rather than
 * hardcoded thresholds.
 */

export const EVIDENCE_CLASSIFICATION = {
  RESEARCH_BACKED: 'RESEARCH_BACKED',
  UNVERIFIED: 'UNVERIFIED',
  UNKNOWN: 'UNKNOWN',
};

export const CITATION_SOURCE = {
  PUBMED: 'pubmed',
  SCHOLAR: 'scholar',
  UNKNOWN: 'unknown',
};

/**
 * Check if a URL is a real, verifiable PubMed citation.
 * Requires a numeric PubMed ID in the URL path.
 */
export function isRealPubMedUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return /pubmed\.ncbi\.nlm\.nih\.gov\/\d+/.test(url);
}

/**
 * Check if a URL is a real Google Scholar citation link.
 * Accepts:
 * - scholar.google.com/scholar?... (search results linking to a specific paper)
 * - scholar.google.com/citations?... (individual citation pages)
 * Rejects generic search URLs with no paper-specific parameters.
 */
export function isRealScholarUrl(url) {
  if (!url || typeof url !== 'string') return false;
  // Must be on scholar.google.com
  if (!/scholar\.google\.com/.test(url)) return false;
  // Must have either citations?view_op=view_citation or be a direct paper link
  // Reject the generic placeholder URLs like scholar?q=rem%20001%20remedy%20clinical%20study
  // Accept URLs with actual citation parameters
  return /citations\?view_op=view_citation|scholar\?.*as_sdt=|scholar\?.*btnG=/.test(url);
}

/**
 * Detect the source type of a citation URL.
 */
export function detectCitationSource(url) {
  if (isRealPubMedUrl(url)) return CITATION_SOURCE.PUBMED;
  if (isRealScholarUrl(url)) return CITATION_SOURCE.SCHOLAR;
  return CITATION_SOURCE.UNKNOWN;
}

/**
 * Check if a URL is a real, verifiable citation (PubMed or Google Scholar).
 */
export function isRealCitation(url) {
  return isRealPubMedUrl(url) || isRealScholarUrl(url);
}

/**
 * Classify a single remedy's evidence based on its researchPapers and researchLinks.
 * 
 * @param {Object} remedy - The remedy object with researchPapers and/or researchLinks
 * @returns {string} EVIDENCE_CLASSIFICATION value
 */
export function classifyRemedyEvidence(remedy) {
  if (!remedy) return EVIDENCE_CLASSIFICATION.UNKNOWN;

  const papers = remedy.researchPapers || [];
  const links = remedy.researchLinks || [];

  const hasRealPaper = papers.some(p => isRealCitation(p.url));
  const hasRealLink = links.some(l => isRealCitation(l.url));

  if (hasRealPaper || hasRealLink) {
    return EVIDENCE_CLASSIFICATION.RESEARCH_BACKED;
  }

  const hasAnyCitation = papers.length > 0 || links.length > 0;
  if (hasAnyCitation) {
    return EVIDENCE_CLASSIFICATION.UNVERIFIED;
  }

  return EVIDENCE_CLASSIFICATION.UNKNOWN;
}

/**
 * Get detailed citation analysis for a remedy.
 * 
 * @param {Object} remedy - The remedy object
 * @returns {Object} { total, real, fake, realCitations, fakeCitations }
 */
export function getEvidenceDetails(remedy) {
  if (!remedy) return { total: 0, real: 0, fake: 0, realCitations: [], fakeCitations: [] };

  const papers = remedy.researchPapers || [];
  const links = remedy.researchLinks || [];

  const allCitations = [
    ...papers.map(p => ({
      type: 'researchPaper',
      url: p.url,
      journal: p.journal,
      finding: p.keyFinding,
      source: detectCitationSource(p.url),
    })),
    ...links.map(l => ({
      type: 'researchLink',
      url: l.url,
      label: l.label,
      source: detectCitationSource(l.url),
    })),
  ];

  const realCitations = allCitations.filter(c => isRealCitation(c.url));
  const fakeCitations = allCitations.filter(c => !isRealCitation(c.url));

  return {
    total: allCitations.length,
    real: realCitations.length,
    fake: fakeCitations.length,
    realCitations,
    fakeCitations,
  };
}

/**
 * Compute an evidence score from actual citation data.
 * 
 * Scoring (PubMed and Google Scholar citations count equally):
 * - 0: no citations
 * - 1: has citations but none verifiable (UNVERIFIED)
 * - 4: 1 real citation
 * - 6: 2 real citations
 * - 7: 3 real citations
 * - 8: 4+ real citations
 * - 9: 5+ real citations
 * - 10: 6+ real citations
 * 
 * @param {Object} remedy - The remedy object
 * @returns {number} Evidence score from 0-10
 */
export function computeEvidenceScore(remedy) {
  if (!remedy) return 0;

  const details = getEvidenceDetails(remedy);

  if (details.real === 0) {
    if (details.fake > 0) return 1;
    return 0;
  }

  if (details.real >= 6) return 10;
  if (details.real >= 5) return 9;
  if (details.real >= 4) return 8;
  if (details.real >= 3) return 7;
  if (details.real >= 2) return 6;
  return 4;
}

/**
 * Get the evidence level label and color for UI display.
 * 
 * @param {number} score - Evidence score (0-10)
 * @returns {Object|null} { text, color } or null if no evidence
 */
export function getEvidenceLevel(score) {
  if (score == null || score === 0) return null;
  if (score >= 7) return { text: 'High Evidence', color: 'bg-success/10 text-success' };
  if (score >= 4) return { text: 'Moderate Evidence', color: 'bg-warning/10 text-warning' };
  if (score > 0) return { text: 'Limited Evidence', color: 'bg-ink-muted/10 text-ink-muted' };
  return null;
}

/**
 * Get a short evidence text for card display.
 * 
 * @param {number} score - Evidence score (0-10)
 * @returns {string} Short label
 */
export function getEvidenceText(score) {
  if (score >= 7) return 'High';
  if (score >= 4) return 'Moderate';
  if (score > 0) return 'Limited';
  return '—';
}

/**
 * Check if a remedy should be shown to users based on evidence classification.
 * UNVERIFIED and UNKNOWN remedies are soft-flagged (hidden by default).
 * 
 * @param {Object} remedy - The remedy object
 * @param {Object} options - { allowUnverified: boolean, allowUnknown: boolean }
 * @returns {boolean} Whether the remedy should be displayed
 */
export function isRemedyDisplayable(remedy, options = {}) {
  const { allowUnverified = false, allowUnknown = false } = options;
  const classification = classifyRemedyEvidence(remedy);

  switch (classification) {
    case EVIDENCE_CLASSIFICATION.RESEARCH_BACKED:
      return true;
    case EVIDENCE_CLASSIFICATION.UNVERIFIED:
      return allowUnverified;
    case EVIDENCE_CLASSIFICATION.UNKNOWN:
      return allowUnknown;
    default:
      return false;
  }
}
