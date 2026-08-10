export const EVIDENCE_SOURCE_POLICY = Object.freeze({
  pubmed: { label: 'PubMed', organization: 'US National Library of Medicine', peerReviewedIndex: true, faqSource: true },
  cochrane: { label: 'Cochrane Library', organization: 'Cochrane', peerReviewedIndex: false, faqSource: true },
  nice: { label: 'NICE', organization: 'National Institute for Health and Care Excellence', peerReviewedIndex: false, faqSource: true },
  who: { label: 'WHO', organization: 'World Health Organization', peerReviewedIndex: false, faqSource: true },
  cdc: { label: 'CDC', organization: 'US Centers for Disease Control and Prevention', peerReviewedIndex: false, faqSource: true },
  europePmc: { label: 'Europe PMC', organization: 'Europe PMC', peerReviewedIndex: true, faqSource: false },
  doi: { label: 'DOI record', organization: 'Scholarly publisher', peerReviewedIndex: true, faqSource: false },
  unsupported: { label: 'Unverified source', organization: '', peerReviewedIndex: false, faqSource: false },
});

export function classifyEvidenceSource(url = '') {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return 'unsupported';
  }

  const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
  if (host === 'pubmed.ncbi.nlm.nih.gov' && /^\/\d+\/?$/.test(parsed.pathname)) return 'pubmed';
  if (host === 'cochrane.org' || host.endsWith('.cochrane.org')) return 'cochrane';
  if (host === 'nice.org.uk' || host.endsWith('.nice.org.uk')) return 'nice';
  if (host === 'who.int' || host.endsWith('.who.int')) return 'who';
  if (host === 'cdc.gov' || host.endsWith('.cdc.gov')) return 'cdc';
  if (host === 'europepmc.org' || host.endsWith('.europepmc.org')) return 'europePmc';
  if (host === 'doi.org' && /^\/10\.\d{4,9}\/.+/.test(parsed.pathname)) return 'doi';
  return 'unsupported';
}

export function normalizeEvidenceSource(source = {}) {
  const sourceKind = source.sourceKind || classifyEvidenceSource(source.url);
  const policy = EVIDENCE_SOURCE_POLICY[sourceKind] || EVIDENCE_SOURCE_POLICY.unsupported;
  return {
    ...source,
    sourceKind,
    sourceDatabase: source.sourceDatabase || policy.label,
    sourceOrganization: source.sourceOrganization || policy.organization,
    isPeerReviewedIndex: policy.peerReviewedIndex,
    isFaqSource: policy.faqSource,
    verificationStatus: source.verificationStatus || (sourceKind === 'unsupported' ? 'unverified' : 'source-identified'),
  };
}
