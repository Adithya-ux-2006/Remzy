#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
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

const outputArg = process.argv.find((arg) => arg.startsWith('--output='))?.slice(9);
const symptomCode = readFileSync(new URL('../src/data/symptoms.js', import.meta.url), 'utf8');
const symptoms = [...symptomCode.matchAll(/\{\s*id:\s*'([^']+)'[\s\S]{0,300}?label:\s*'([^']+)'/g)]
  .map((match) => ({ id: match[1], label: match[2] }));
const local = applyLegacyEvidenceTierOverlay(applyLegacyBatch5(applyLegacyBatch4(applyLegacyBatch3(applyLegacyBatch2(applyLegacyBatch1(LOCAL_REMEDIES))))));
const remedies = applyMultiSourceRemedyBatch1([...REMEDIES, ...local])
  .filter((remedy, index, all) => all.findIndex((candidate) => candidate.id === remedy.id) === index);

const coverage = symptoms.map((symptom) => {
  const matches = remedies.filter((remedy) => new Set([
    ...(remedy.symptoms || []), ...(remedy.primarySymptoms || []), ...(remedy.secondarySymptoms || []),
  ]).has(symptom.id));
  return { ...symptom, count: matches.length, remedyIds: matches.map((remedy) => remedy.id) };
}).sort((a, b) => a.count - b.count || a.label.localeCompare(b.label));

const report = {
  generatedAt: new Date().toISOString(),
  symptoms: symptoms.length,
  remedies: remedies.length,
  zeroCoverage: coverage.filter((item) => item.count === 0),
  lowCoverage: coverage.filter((item) => item.count > 0 && item.count <= 2),
  coverage,
};

console.log(`Runtime gap analysis: ${report.remedies} remedies across ${report.symptoms} symptoms.`);
console.log(`Zero coverage: ${report.zeroCoverage.length}; low coverage (1-2): ${report.lowCoverage.length}.`);
for (const item of report.zeroCoverage) console.log(`ZERO\t${item.id}\t${item.label}`);
for (const item of report.lowCoverage) console.log(`LOW\t${item.id}\t${item.count}\t${item.label}`);
if (outputArg) writeFileSync(resolve(outputArg), JSON.stringify(report, null, 2));
