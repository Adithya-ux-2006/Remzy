#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { SYMPTOM_EXPANSION_CANDIDATES } from '../src/data/symptomExpansionCandidates.js';

const TARGET = 500;
const symptomCode = readFileSync(new URL('../src/data/symptoms.js', import.meta.url), 'utf8');
const publicIds = new Set([...symptomCode.matchAll(/\bid:\s*'([^']+)'/g)].map((match) => match[1]));
const candidateIds = new Set();
const errors = [];

for (const [index, candidate] of SYMPTOM_EXPANSION_CANDIDATES.entries()) {
  const prefix = `candidate[${index}]`;
  if (!candidate?.id || !/^[a-z0-9_]+$/.test(candidate.id)) errors.push(`${prefix}: invalid id`);
  if (candidateIds.has(candidate?.id) || publicIds.has(candidate?.id)) errors.push(`${prefix}: duplicate id ${candidate?.id}`);
  candidateIds.add(candidate?.id);
  if (!candidate?.label) errors.push(`${prefix}: label required`);
  if (!candidate?.clinicalTerm) errors.push(`${prefix}: clinicalTerm required`);
  if (!Array.isArray(candidate?.synonyms)) errors.push(`${prefix}: synonyms must be an array`);
  if (!Array.isArray(candidate?.medicalCareWarnings) || candidate.medicalCareWarnings.length === 0) errors.push(`${prefix}: medicalCareWarnings required`);
  if (!candidate?.reviewStatus) errors.push(`${prefix}: reviewStatus required`);
  if (candidate?.reviewStatus === 'ready') {
    if (!candidate.terminologyReviewedBy) errors.push(`${prefix}: terminology reviewer required`);
    if (!candidate.clinicallyReviewedBy) errors.push(`${prefix}: clinical reviewer required`);
    if (!Array.isArray(candidate.approvedClaimIds) || candidate.approvedClaimIds.length === 0) errors.push(`${prefix}: approved claims required`);
  }
}

const ready = SYMPTOM_EXPANSION_CANDIDATES.filter((candidate) => candidate.reviewStatus === 'ready').length;
const projected = publicIds.size + ready;
console.log(`Symptom expansion audit: ${publicIds.size} public, ${SYMPTOM_EXPANSION_CANDIDATES.length} staged, ${ready} ready.`);
console.log(`Projected reviewed coverage: ${projected}/${TARGET}; ${Math.max(0, TARGET - projected)} remaining.`);
for (const error of errors) console.log(`FAIL\t${error}`);
if (errors.length) process.exitCode = 1;
