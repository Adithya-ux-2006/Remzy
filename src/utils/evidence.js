/**
 * Evidence Classification Utility
 * 
 * Provides functions to classify remedies and their evidence into:
 * - RESEARCH_BACKED: has a real, paper-specific citation
 * - TRADITIONAL: traditional use without established clinical evidence
 * - SUPPORTIVE: comfort/supportive care without a treatment claim
 * - UNVERIFIED: has citations but none are verifiable
 * - UNKNOWN: no citations at all
 * 
 * Also computes evidence scores from actual citation data rather than
 * hardcoded thresholds.
 */

export const EVIDENCE_CLASSIFICATION = {
  RESEARCH_BACKED: 'RESEARCH_BACKED',
  TRADITIONAL: 'TRADITIONAL',
  SUPPORTIVE: 'SUPPORTIVE',
  UNVERIFIED: 'UNVERIFIED',
  UNKNOWN: 'UNKNOWN',
};

export const CITATION_SOURCE = {
  PUBMED: 'pubmed',
  DOI: 'doi',
  WEB_OF_SCIENCE: 'web-of-science',
  SCHOLAR: 'scholar',
  JOURNAL: 'journal',
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
 * Only Google Scholar citation-detail pages count. Search-result URLs never do.
 */
export function isRealScholarUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return /^https:\/\/scholar\.google\.[^/]+\/citations\?.*\bview_op=view_citation\b/i.test(url);
}

export function isSpecificDoiUrl(url) {
  return /^https:\/\/doi\.org\/10\.\d{4,9}\/[\S]+$/i.test(url || '');
}

export function isSpecificWebOfScienceUrl(url) {
  return /^https:\/\/www\.webofscience\.com\/wos\/woscc\/full-record\/[^/?#]+/i.test(url || '');
}

export function isSpecificJournalUrl(url) {
  if (!/^https?:\/\//i.test(url || '')) return false;
  return !/(?:scholar\.google\.[^/]+\/scholar|pubmed\.ncbi\.nlm\.nih\.gov\/(?:\?|search)|webofscience\.com\/wos\/woscc\/(?:basic-search|search|summary)|[?&](?:q|query|term|as_q)=)/i.test(url);
}

/**
 * Detect the source type of a citation URL.
 */
export function detectCitationSource(url) {
  if (isRealPubMedUrl(url)) return CITATION_SOURCE.PUBMED;
  if (isSpecificDoiUrl(url)) return CITATION_SOURCE.DOI;
  if (isSpecificWebOfScienceUrl(url)) return CITATION_SOURCE.WEB_OF_SCIENCE;
  if (isRealScholarUrl(url)) return CITATION_SOURCE.SCHOLAR;
  if (isSpecificJournalUrl(url)) return CITATION_SOURCE.JOURNAL;
  return CITATION_SOURCE.UNKNOWN;
}

/**
 * Check if a URL is a real, verifiable citation (PubMed or Google Scholar).
 */
export function isRealCitation(url) {
  return detectCitationSource(url) !== CITATION_SOURCE.UNKNOWN;
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

  if (remedy.evidenceTier === 'traditional' && remedy.evidenceNote) {
    return EVIDENCE_CLASSIFICATION.TRADITIONAL;
  }
  if (remedy.evidenceTier === 'supportive' && remedy.evidenceNote) {
    return EVIDENCE_CLASSIFICATION.SUPPORTIVE;
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
 * - 2: 1 real citation
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

  // Identified sources remain useful to inspect, but they must not increase
  // the evidence score until the claim-level review is approved.
  if (remedy._evidenceBackendAuthoritative && remedy.evidenceBackendStatus !== 'approved') return 0;

  const details = getEvidenceDetails(remedy);

  if (details.real === 0) {
    if (details.fake > 0) return 1;
    if (['traditional', 'supportive'].includes(remedy.evidenceTier) && remedy.evidenceNote) return 1;
    return 0;
  }

  if (details.real >= 6) return 10;
  if (details.real >= 5) return 9;
  if (details.real >= 4) return 8;
  if (details.real >= 3) return 7;
  if (details.real >= 2) return 6;
  return 2;
}

/**
 * Get the evidence level label and color for UI display.
 * 
 * @param {number} score - Evidence score (0-10)
 * @returns {Object|null} { text, color } or null if no evidence
 */
export function getEvidenceLevel(score) {
  if (score == null || score === 0) return null;
  if (score >= 7) return { text: '3+ Linked Sources', color: 'bg-success/10 text-success' };
  if (score >= 6) return { text: '2 Linked Sources', color: 'bg-warning/10 text-warning' };
  if (score > 0) return { text: '1 Linked Source', color: 'bg-ink-muted/10 text-ink-muted' };
  return null;
}

/**
 * Get a short evidence text for card display.
 * 
 * @param {number} score - Evidence score (0-10)
 * @returns {string} Short label
 */
export function getEvidenceText(score) {
  if (score >= 7) return '3+ sources';
  if (score >= 6) return '2 sources';
  if (score > 0) return '1 source';
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
    case EVIDENCE_CLASSIFICATION.TRADITIONAL:
    case EVIDENCE_CLASSIFICATION.SUPPORTIVE:
      return true;
    case EVIDENCE_CLASSIFICATION.UNVERIFIED:
      return allowUnverified;
    case EVIDENCE_CLASSIFICATION.UNKNOWN:
      return allowUnknown;
    default:
      return false;
  }
}
