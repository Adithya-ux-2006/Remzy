#!/usr/bin/env node
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
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = new Map(process.argv.slice(2).map((arg) => { const [k, ...v] = arg.replace(/^--/, '').split('='); return [k, v.length ? v.join('=') : true]; }));
const scope = args.get('scope') || 'runtime';
const symptomCode = readFileSync(new URL('../src/data/symptoms.js', import.meta.url), 'utf8');
const symptomIds = new Set([...symptomCode.matchAll(/\bid:\s*'([^']+)'/g)].map((match) => match[1]));
const validCategories = new Set(['Natural', 'Lifestyle', 'OTC']);
const required = ['category', 'isPurchasable', 'childSafe', 'ingredients', 'allergen_tags', 'contraindications'];
let all = filterEvidenceReviewedRemedies(scope === 'primary' ? REMEDIES : applyMultiSourceRemedyBatch1([...REMEDIES, ...applyLegacyEvidenceTierOverlay(applyLegacyBatch5(applyLegacyBatch4(applyLegacyBatch3(applyLegacyBatch2(applyLegacyBatch1(LOCAL_REMEDIES))))))]).filter((r, i, a) => a.findIndex((x) => x.id === r.id) === i));
if (args.get('ids')) {
  const ids = new Set(String(args.get('ids')).split(',').filter(Boolean));
  all = all.filter((remedy) => ids.has(remedy.id));
}
const details = all.map((remedy) => {
  const errors = [];
  for (const field of required) {
    if (!(field in remedy)) errors.push(`missing ${field}`);
  }
  for (const field of ['ingredients', 'allergen_tags', 'contraindications']) if (field in remedy && !Array.isArray(remedy[field])) errors.push(`${field} must be an array`);
  if (!validCategories.has(remedy.category)) errors.push(`invalid category: ${remedy.category}`);
  if (typeof remedy.isPurchasable !== 'boolean') errors.push('isPurchasable must be boolean');
  if (typeof remedy.childSafe !== 'boolean') errors.push('childSafe must be boolean');
  if (remedy.childSafe === false && !remedy.childSafetyNote) errors.push('childSafetyNote required when childSafe=false');
  if (remedy.evidenceTier && !['traditional', 'supportive'].includes(remedy.evidenceTier)) errors.push(`invalid evidenceTier: ${remedy.evidenceTier}`);
  if (remedy.evidenceTier && !remedy.evidenceNote) errors.push('evidenceNote required for non-research tier');
  const mapped = [...new Set([...(remedy.primarySymptoms || []), ...(remedy.secondarySymptoms || []), ...(remedy.symptoms || [])])];
  if (!(remedy.primarySymptoms || []).length) errors.push('at least one primarySymptoms id is required');
  for (const id of mapped) if (!symptomIds.has(id)) errors.push(`unknown symptom id: ${id}`);
  return { remedyId: remedy.id, remedyName: remedy.name, status: errors.length ? 'FAIL' : 'PASS', errors };
});
const report = { generatedAt: new Date().toISOString(), scope, remedies: all.length, passed: details.filter((x) => x.status === 'PASS').length, failed: details.filter((x) => x.status === 'FAIL').length, details };
console.log(`Integration audit (${scope}): ${report.passed} passed, ${report.failed} failed.`);
for (const item of details.filter((x) => x.status === 'FAIL')) console.log(`FAIL\t${item.remedyId}\t${item.errors.join('; ')}`);
if (args.get('output')) writeFileSync(resolve(String(args.get('output'))), JSON.stringify(report, null, 2));
process.exitCode = report.failed ? 1 : 0;
