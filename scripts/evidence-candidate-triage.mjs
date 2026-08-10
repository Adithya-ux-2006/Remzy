#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = new Map(process.argv.slice(2).map((arg) => {
  const [key, ...value] = arg.replace(/^--/, '').split('=');
  return [key, value.length ? value.join('=') : true];
}));
const input = resolve(String(args.get('input') || 'reports/evidence-review-batch-01.json'));
const output = resolve(String(args.get('output') || input));
const report = JSON.parse(readFileSync(input, 'utf8'));

const ANIMAL_TERMS = /\b(?:mice|mouse|rats?|murine|porcine|pig model|in vitro|cell line|laboratory study)\b/i;
const RETRACTION_TERMS = /\b(?:retracted|retraction|withdrawn article)\b/i;
const HIGH_LEVEL_TERMS = /\b(?:guideline|systematic review|meta-analysis|practice guideline)\b/i;
const TRIAL_TERMS = /\b(?:randomized|randomised|controlled trial|clinical trial)\b/i;
const STOP_WORDS = new Set(['acid', 'care', 'during', 'exercise', 'for', 'mild', 'oil', 'the', 'therapy', 'treatment', 'with']);

function meaningfulTokens(value) {
  return String(value || '').toLowerCase().split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3 && !STOP_WORDS.has(token));
}

function includesAny(text, tokens) {
  return tokens.some((token) => text.includes(token));
}

function triageCandidate(candidate, packet) {
  const text = `${candidate.title || ''} ${candidate.abstract || ''} ${(candidate.publicationTypes || []).join(' ')}`.toLowerCase();
  const interventionTokens = meaningfulTokens(packet.searchStrategy.intervention);
  const conditionTokens = meaningfulTokens(packet.searchStrategy.condition);
  const flags = [];
  const hasIntervention = includesAny(text, interventionTokens);
  const hasCondition = includesAny(text, conditionTokens);
  if (!candidate.title) flags.push('metadata-title-missing');
  if (!hasIntervention) flags.push('intervention-not-confirmed-in-retrieved-text');
  if (!hasCondition) flags.push('condition-not-confirmed-in-retrieved-text');
  if (ANIMAL_TERMS.test(text)) flags.push('possible-non-human-evidence');
  if (RETRACTION_TERMS.test(text)) flags.push('possible-retraction-or-withdrawal');
  if (!candidate.abstract && candidate.retrievalSource !== 'existing-catalogue') flags.push('abstract-not-retrieved');

  let evidenceClass = 'other';
  if (HIGH_LEVEL_TERMS.test(text) || /guideline|systematic-review|meta-analysis/.test(candidate.evidenceType || '')) evidenceClass = 'higher-level';
  else if (TRIAL_TERMS.test(text)) evidenceClass = 'trial';

  let triageStatus = 'manual-review-required';
  if (flags.includes('possible-retraction-or-withdrawal') || flags.includes('possible-non-human-evidence')) triageStatus = 'priority-exclusion-review';
  else if (hasIntervention && hasCondition) triageStatus = 'possible-direct-match';
  else if (!hasIntervention && !hasCondition) triageStatus = 'possible-mismatch';

  return { ...candidate, evidenceClass, triageStatus, triageFlags: flags };
}

for (const packet of report.packets || []) {
  packet.candidates = packet.candidates.map((candidate) => triageCandidate(candidate, packet));
  packet.triageSummary = packet.candidates.reduce((summary, candidate) => {
    summary[candidate.triageStatus] = (summary[candidate.triageStatus] || 0) + 1;
    return summary;
  }, {});
}
report.triagedAt = new Date().toISOString();
report.triagePolicy = {
  automaticApproval: false,
  purpose: 'Prioritize human review and obvious exclusion checks; lexical matches do not establish clinical applicability.',
};
writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);

const candidates = (report.packets || []).flatMap((packet) => packet.candidates);
const counts = candidates.reduce((summary, candidate) => {
  summary[candidate.triageStatus] = (summary[candidate.triageStatus] || 0) + 1;
  return summary;
}, {});
console.log(`Evidence triage: processed ${candidates.length} candidates across ${report.packets?.length || 0} claims.`);
console.log(JSON.stringify(counts));
