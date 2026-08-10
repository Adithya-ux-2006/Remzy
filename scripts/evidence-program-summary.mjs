#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = new Map(process.argv.slice(2).map((arg) => {
  const [key, ...value] = arg.replace(/^--/, '').split('=');
  return [key, value.length ? value.join('=') : true];
}));
const reviewPath = resolve(String(args.get('review') || 'reports/evidence-review-all-claims.json'));
const baselinePath = resolve(String(args.get('baseline') || 'reports/semantic-evidence-baseline.json'));
const output = resolve(String(args.get('output') || 'reports/evidence-program-summary.json'));
const review = JSON.parse(readFileSync(reviewPath, 'utf8'));
const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
const packets = review.packets || [];
const candidates = packets.flatMap((packet) => packet.candidates || []);
const countBy = (values, selector) => values.reduce((counts, value) => {
  const key = selector(value) || 'unset';
  counts[key] = (counts[key] || 0) + 1;
  return counts;
}, {});

const report = {
  generatedAt: new Date().toISOString(),
  publicationWarning: 'Candidate discovery and AI pre-review are not clinical approval.',
  catalogue: baseline.totals,
  discovery: {
    claimsQueued: packets.length,
    candidatesRetrieved: candidates.length,
    claimsWithAtLeastThreeCandidates: packets.filter((packet) => packet.candidates.length >= 3).length,
    claimsWithFewerThanThreeCandidates: packets.filter((packet) => packet.candidates.length < 3).length,
    deterministicTriage: countBy(candidates, (candidate) => candidate.triageStatus),
  },
  aiPrereview: {
    packetStatuses: countBy(packets, (packet) => packet.aiPrereview?.status),
    candidatesAssessed: packets.reduce((sum, packet) => sum + (packet.aiPrereview?.assessments?.length || 0), 0),
    automaticApprovals: 0,
  },
  remainingGates: [
    'Retrieve and assess full text where abstracts are missing or insufficient',
    'Add independent guideline and safety-authority sources',
    'Extract effect estimates, uncertainty, adverse events, and funding',
    'Complete study-level risk-of-bias assessment',
    'Complete body-of-evidence certainty assessment',
    'Obtain qualified clinical approval and second review for high-risk claims',
    'Stage and review 399 additional symptoms before public expansion',
  ],
};
writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Evidence programme summary: ${report.discovery.claimsQueued} claims, ${report.discovery.candidatesRetrieved} candidates, ${report.aiPrereview.candidatesAssessed} AI pre-reviewed, 0 automatically approved.`);
