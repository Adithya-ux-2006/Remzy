#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { REMEDIES } from '../src/data/remedies.js';
import { LOCAL_REMEDIES } from '../src/data/localCatalog.js';
import { applyLegacyBatch1 } from '../src/data/legacyRemedyBatch1.js';
import { applyLegacyBatch2 } from '../src/data/legacyRemedyBatch2.js';
import { applyLegacyBatch3 } from '../src/data/legacyRemedyBatch3.js';
import { applyLegacyBatch4 } from '../src/data/legacyRemedyBatch4.js';
import { applyLegacyBatch5 } from '../src/data/legacyRemedyBatch5.js';
import { applyLegacyEvidenceTierOverlay } from '../src/data/legacyEvidenceTierOverlay.js';
import { applyMultiSourceRemedyBatch1 } from '../src/data/multiSourceRemedyBatch1.js';
import { filterEvidenceReviewedRemedies } from '../src/data/evidenceReview.js';
import { EVIDENCE_ASSESSMENTS } from '../src/data/evidenceAssessments.js';
import { classifyEvidenceSource, EVIDENCE_SOURCE_POLICY } from '../src/utils/evidenceSources.js';

const args = new Map(process.argv.slice(2).map((arg) => {
  const [key, ...value] = arg.replace(/^--/, '').split('=');
  return [key, value.length ? value.join('=') : true];
}));
const strict = args.has('strict');
const output = args.get('output');
const HIGH_LEVEL_TYPES = new Set(['guideline', 'systematic-review', 'meta-analysis']);

function runtimeRemedies() {
  const legacy = applyLegacyEvidenceTierOverlay(applyLegacyBatch5(applyLegacyBatch4(applyLegacyBatch3(applyLegacyBatch2(applyLegacyBatch1(LOCAL_REMEDIES))))));
  return filterEvidenceReviewedRemedies(
    applyMultiSourceRemedyBatch1([...REMEDIES, ...legacy])
      .filter((remedy, index, all) => all.findIndex((candidate) => candidate.id === remedy.id) === index)
  );
}

function symptomIdsOf(remedy) {
  return [...new Set([...(remedy.primarySymptoms || []), ...(remedy.symptoms || [])])];
}

function discoverySourcesOf(remedy) {
  return [...(remedy.researchPapers || []), ...(remedy.researchLinks || [])].filter((source) => source?.url);
}

function canonicalPublicationId(source) {
  if (source.publicationId) return source.publicationId.toLowerCase();
  const kind = classifyEvidenceSource(source.url);
  if (kind === 'pubmed') return `pmid:${source.url.match(/\/(\d+)\/?$/)?.[1]}`;
  if (kind === 'europePmc') return `epmc:${source.url.match(/\/article\/(?:MED|PMC)\/(\w+)/i)?.[1]?.toLowerCase()}`;
  if (kind === 'doi') return `doi:${new URL(source.url).pathname.slice(1).toLowerCase()}`;
  return new URL(source.url).toString().replace(/\/$/, '').toLowerCase();
}

function sourceOrganization(source) {
  if (source.organization) return source.organization.trim().toLowerCase();
  const kind = classifyEvidenceSource(source.url);
  return (source.sourceOrganization || EVIDENCE_SOURCE_POLICY[kind]?.organization || '').trim().toLowerCase();
}

function auditClaim(remedy, symptomId) {
  const claimId = `${remedy.id}__${symptomId}`;
  const assessment = EVIDENCE_ASSESSMENTS[claimId];
  const discoverySources = discoverySourcesOf(remedy);
  const reviewedSources = assessment?.sources || [];
  const publicationIds = new Set(reviewedSources.map(canonicalPublicationId));
  const organizations = new Set(reviewedSources.map(sourceOrganization).filter(Boolean));
  const exactSources = reviewedSources.filter((source) => source.applicability === 'exact');
  const highLevelSources = reviewedSources.filter((source) => HIGH_LEVEL_TYPES.has(source.evidenceType));
  const safetySources = reviewedSources.filter((source) => ['safety', 'both'].includes(source.benefitOrSafety));
  const failures = [];

  if (!assessment) failures.push('missing claim-level semantic assessment');
  if (publicationIds.size < 3) failures.push(`requires 3 distinct reviewed publications; found ${publicationIds.size}`);
  if (organizations.size < 2) failures.push(`requires 2 independent source organizations; found ${organizations.size}`);
  if (exactSources.length < 1) failures.push('requires at least one exact population/intervention/outcome match');
  if (highLevelSources.length < 1) failures.push('requires at least one guideline, systematic review, or meta-analysis');
  if (!assessment?.safetyReviewed || safetySources.length < 1) failures.push('requires a completed safety review and safety evidence');
  if (!assessment?.reviewedBy || !assessment?.reviewedAt) failures.push('requires reviewer identity and review date');
  if (assessment?.reviewStatus !== 'approved') failures.push('claim is not approved');
  if (!assessment?.claimText || !assessment?.population || !assessment?.intervention || !assessment?.outcomes?.length) failures.push('incomplete PICO claim definition');

  return {
    claimId,
    remedyId: remedy.id,
    remedyName: remedy.name,
    symptomId,
    discoveryCitationCount: new Set(discoverySources.map(canonicalPublicationId)).size,
    reviewedPublicationCount: publicationIds.size,
    independentOrganizationCount: organizations.size,
    exactMatchCount: exactSources.length,
    highLevelEvidenceCount: highLevelSources.length,
    safetyEvidenceCount: safetySources.length,
    status: failures.length ? 'NOT_RESEARCH_BACKED' : 'RESEARCH_BACKED',
    failures,
  };
}

const remedies = runtimeRemedies();
const claims = remedies.flatMap((remedy) => symptomIdsOf(remedy).map((symptomId) => auditClaim(remedy, symptomId)));
const uniqueSymptoms = new Set(claims.map((claim) => claim.symptomId));
const backedClaims = claims.filter((claim) => claim.status === 'RESEARCH_BACKED');
const backedSymptoms = new Set(backedClaims.map((claim) => claim.symptomId));
const report = {
  generatedAt: new Date().toISOString(),
  standard: {
    minimumDistinctPublications: 3,
    minimumIndependentOrganizations: 2,
    exactMatchRequired: true,
    highLevelEvidenceRequired: true,
    safetyReviewRequired: true,
    humanApprovalRequired: true,
  },
  totals: {
    remedies: remedies.length,
    mappedSymptoms: uniqueSymptoms.size,
    claims: claims.length,
    researchBackedClaims: backedClaims.length,
    researchBackedSymptoms: backedSymptoms.size,
    claimsNeedingReview: claims.length - backedClaims.length,
    targetSymptoms: 500,
    remainingSymptomsToTarget: Math.max(0, 500 - backedSymptoms.size),
  },
  claims,
};

console.log(`Semantic evidence audit: ${backedClaims.length}/${claims.length} claims meet the publication standard.`);
console.log(`Research-backed symptom coverage: ${backedSymptoms.size}/500 target symptoms.`);
if (output) writeFileSync(resolve(String(output)), `${JSON.stringify(report, null, 2)}\n`);
if (strict && claims.some((claim) => claim.status !== 'RESEARCH_BACKED')) process.exitCode = 1;
