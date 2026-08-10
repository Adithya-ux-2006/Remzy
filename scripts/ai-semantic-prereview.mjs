#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { GoogleGenAI } from '@google/genai';

const args = new Map(process.argv.slice(2).map((arg) => {
  const [key, ...value] = arg.replace(/^--/, '').split('=');
  return [key, value.length ? value.join('=') : true];
}));
const input = resolve(String(args.get('input') || 'reports/evidence-review-all-claims.json'));
const output = resolve(String(args.get('output') || input));
const limit = Math.max(1, Number(args.get('limit') || Number.MAX_SAFE_INTEGER));
const model = String(args.get('model') || 'gemini-3.6-flash');

function loadLocalApiKey() {
  if (process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_STUDIO_API_KEY) {
    return process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_STUDIO_API_KEY;
  }
  try {
    const env = readFileSync(resolve('.env'), 'utf8');
    for (const line of env.split(/\r?\n/)) {
      const match = line.match(/^\s*(?:GEMINI_API_KEY|GOOGLE_AI_STUDIO_API_KEY)\s*=\s*(.+?)\s*$/);
      if (match) return match[1].replace(/^['"]|['"]$/g, '');
    }
  } catch {
    return null;
  }
  return null;
}

function validDimension(value) {
  return ['confirmed', 'not-confirmed', 'unclear'].includes(value);
}

function validateAssessment(value, candidateIds) {
  if (!value || !Array.isArray(value.assessments)) return false;
  return value.assessments.every((assessment) => (
    candidateIds.has(assessment.publicationId)
    && validDimension(assessment.populationMatch)
    && validDimension(assessment.interventionMatch)
    && validDimension(assessment.outcomeMatch)
    && ['possible-direct', 'partial', 'indirect', 'mismatch', 'insufficient-metadata'].includes(assessment.overallApplicability)
    && ['human', 'animal', 'laboratory', 'unclear'].includes(assessment.populationType)
    && typeof assessment.reason === 'string'
    && Array.isArray(assessment.missingInformation)
  ));
}

function promptFor(packet, candidates) {
  const compact = candidates.map((candidate) => ({
    publicationId: candidate.publicationId || candidate.url,
    title: candidate.title,
    publicationTypes: candidate.publicationTypes,
    abstract: candidate.abstract,
  }));
  return `You are performing conservative evidence triage, not medical approval. Compare each supplied publication only with the proposed Remzy claim and PICO draft.

Rules:
- Use only the supplied title and abstract. Do not use memory or invent missing details.
- If sex, age, diagnosis, formulation, dose, comparator, or outcome is absent, mark it unclear.
- A related topic is not a match.
- Animal, laboratory, comparator-only, prevention-vs-treatment, combination-vs-component, formulation, sex, or outcome mismatches must be identified.
- Never mark evidence approved, safe, effective, or research-backed.
- Return JSON only with {"assessments":[...]}. Include every publicationId exactly once.
- Each assessment must contain publicationId, populationMatch, interventionMatch, outcomeMatch (confirmed|not-confirmed|unclear), populationType (human|animal|laboratory|unclear), overallApplicability (possible-direct|partial|indirect|mismatch|insufficient-metadata), reason, and missingInformation (string array).

Claim ID: ${packet.claimId}
Proposed claim: ${packet.proposedClaim}
PICO draft: ${JSON.stringify(packet.picoDraft)}
Publications: ${JSON.stringify(compact)}`;
}

function responseSchema(candidateIds) {
  return {
    type: 'object',
    properties: {
      assessments: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            publicationId: { type: 'string', enum: candidateIds },
            populationMatch: { type: 'string', enum: ['confirmed', 'not-confirmed', 'unclear'] },
            interventionMatch: { type: 'string', enum: ['confirmed', 'not-confirmed', 'unclear'] },
            outcomeMatch: { type: 'string', enum: ['confirmed', 'not-confirmed', 'unclear'] },
            populationType: { type: 'string', enum: ['human', 'animal', 'laboratory', 'unclear'] },
            overallApplicability: { type: 'string', enum: ['possible-direct', 'partial', 'indirect', 'mismatch', 'insufficient-metadata'] },
            reason: { type: 'string' },
            missingInformation: { type: 'array', items: { type: 'string' } },
          },
          required: ['publicationId', 'populationMatch', 'interventionMatch', 'outcomeMatch', 'populationType', 'overallApplicability', 'reason', 'missingInformation'],
        },
      },
    },
    required: ['assessments'],
  };
}

const apiKey = loadLocalApiKey();
if (!apiKey) throw new Error('GOOGLE_AI_STUDIO_API_KEY or GEMINI_API_KEY is required.');
const ai = new GoogleGenAI({ apiKey });
const report = JSON.parse(readFileSync(input, 'utf8'));
for (const packet of report.packets || []) {
  if (packet.aiPrereview?.status === 'failed' && /429|quota|RESOURCE_EXHAUSTED/i.test(packet.aiPrereview.error || '')) {
    packet.aiPrereview = { status: 'deferred-quota', automaticApproval: false, error: 'Gemini request quota exhausted; safe to resume later.' };
  }
}
let processed = 0;
let assessedCandidates = 0;
let failures = 0;

for (const packet of report.packets || []) {
  if (processed >= limit) break;
  if (['completed-needs-human-review', 'skipped-no-abstract', 'deferred-quota'].includes(packet.aiPrereview?.status)) continue;
  const candidates = packet.candidates.filter((candidate) => candidate.abstract && (candidate.publicationId || candidate.url)).slice(0, 8);
  if (!candidates.length) {
    packet.aiPrereview = { status: 'skipped-no-abstract', automaticApproval: false };
    processed += 1;
    continue;
  }
  const ids = new Set(candidates.map((candidate) => candidate.publicationId || candidate.url));
  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: promptFor(packet, candidates) }] }],
      config: {
        temperature: 0,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json',
        responseJsonSchema: responseSchema([...ids]),
      },
    });
    const parsed = JSON.parse(response.text || '{}');
    if (!validateAssessment(parsed, ids)) throw new Error('model output failed deterministic validation');
    packet.aiPrereview = {
      status: 'completed-needs-human-review', model, automaticApproval: false,
      limitations: 'Title/abstract-only AI triage; not a risk-of-bias assessment or clinical approval.',
      assessments: parsed.assessments,
    };
    assessedCandidates += parsed.assessments.length;
  } catch (error) {
    failures += 1;
    const quotaExhausted = /429|quota|RESOURCE_EXHAUSTED/i.test(error.message || '');
    packet.aiPrereview = {
      status: quotaExhausted ? 'deferred-quota' : 'failed',
      automaticApproval: false,
      error: quotaExhausted ? 'Gemini request quota exhausted; safe to resume later.' : error.message,
    };
    if (quotaExhausted) {
      writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
      break;
    }
  }
  processed += 1;
  writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
}

report.aiPrereviewRun = {
  completedAt: new Date().toISOString(), model, packetsProcessed: processed,
  candidatesAssessed: assessedCandidates, failures, automaticApproval: false,
};
writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(`AI semantic pre-review: ${processed} packets, ${assessedCandidates} candidates, ${failures} failures.`);
