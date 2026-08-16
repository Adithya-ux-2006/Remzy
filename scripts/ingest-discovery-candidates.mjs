#!/usr/bin/env node
/**
 * Ingest discovery candidates from comprehensive-discovery.json,
 * targeted-expansion.json, and targeted-expansion-round2.json.
 *
 * Produces remedy batch files in src/data/remedyBatches/ and updates index.js.
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const REPORTS_DIR = join(ROOT, 'reports');
const BATCHES_DIR = join(ROOT, 'src', 'data', 'remedyBatches');
const INDEX_PATH = join(BATCHES_DIR, 'index.js');

// ── Load existing remedy IDs to avoid duplicates ────────────────────────────
function loadExistingRemedyIds() {
  const ids = new Set();
  // Read all existing batch files
  const files = readdirSync(BATCHES_DIR).filter(f => f.match(/^remedyBatch\d+\.js$/));
  for (const f of files) {
    const content = readFileSync(join(BATCHES_DIR, f), 'utf8');
    for (const m of content.matchAll(/id:\s*'(rem_[^']+)'/g)) {
      ids.add(m[1]);
    }
  }
  // Also check multiSourceRemedyBatch1.js
  const ms = readFileSync(join(ROOT, 'src', 'data', 'multiSourceRemedyBatch1.js'), 'utf8');
  for (const m of ms.matchAll(/id:\s*'(rem_[^']+)'/g)) {
    ids.add(m[1]);
  }
  // Also check remedies.js
  const rem = readFileSync(join(ROOT, 'src', 'data', 'remedies.js'), 'utf8');
  for (const m of rem.matchAll(/id:\s*'(rem_[^']+)'/g)) {
    ids.add(m[1]);
  }
  // Also check localCatalog.js
  const local = readFileSync(join(ROOT, 'src', 'data', 'localCatalog.js'), 'utf8');
  for (const m of local.matchAll(/id:\s*'(rem_[^']+)'/g)) {
    ids.add(m[1]);
  }
  return ids;
}

// ── Load and merge candidates from all reports ──────────────────────────────
function loadCandidates() {
  const reports = [
    join(REPORTS_DIR, 'comprehensive-discovery.json'),
    join(REPORTS_DIR, 'targeted-expansion.json'),
    join(REPORTS_DIR, 'targeted-expansion-round2.json'),
  ];

  const allCandidates = [];

  for (const reportPath of reports) {
    let data;
    try {
      data = JSON.parse(readFileSync(reportPath, 'utf8'));
    } catch {
      console.warn(`Skipping missing report: ${reportPath}`);
      continue;
    }

    for (const packet of (data.packets || [])) {
      for (const c of (packet.candidates || [])) {
        allCandidates.push({
          ...c,
          symptomCode: c.symptomCode || packet.symptomCode,
        });
      }
    }
  }

  console.log(`Loaded ${allCandidates.length} raw candidates from ${reports.length} reports`);
  return allCandidates;
}

// ── Deduplicate by publication ID ────────────────────────────────────────────
function deduplicateCandidates(candidates) {
  const seen = new Map();

  for (const c of candidates) {
    const key = c.pmid || c.doi || c.url || c.title;
    if (!key) continue;

    if (seen.has(key)) {
      // Merge symptom codes if same paper covers multiple symptoms
      const existing = seen.get(key);
      if (c.symptomCode && !existing.symptomCodes.includes(c.symptomCode)) {
        existing.symptomCodes.push(c.symptomCode);
      }
    } else {
      seen.set(key, {
        ...c,
        symptomCodes: c.symptomCode ? [c.symptomCode] : [],
      });
    }
  }

  const deduped = [...seen.values()];
  console.log(`Deduplicated to ${deduped.length} unique papers`);
  return deduped;
}

// ── Evidence type priority (lower = better) ──────────────────────────────────
function evidencePriority(pubTypes = []) {
  const types = pubTypes.map(t => t.toLowerCase());
  if (types.some(t => t.includes('practice guideline') || t.includes('clinical guideline'))) return 1;
  if (types.some(t => t.includes('systematic review') || t.includes('meta-analysis'))) return 2;
  if (types.some(t => t.includes('randomized controlled trial'))) return 3;
  if (types.some(t => t.includes('clinical trial') || t.includes('controlled clinical trial'))) return 4;
  if (types.some(t => t.includes('review'))) return 5;
  if (types.some(t => t.includes('journal article'))) return 6;
  return 7;
}

// ── Determine category from intervention/context ─────────────────────────────
function inferCategory(intervention, pubTypes = []) {
  const i = (intervention || '').toLowerCase();
  const types = pubTypes.map(t => t.toLowerCase());

  if (i.match(/^(ibuprofen|naproxen|acetaminophen|paracetamol|aspirin|diphenhydramine|loperamide|omeprazole|famotidine|ranitidine|cetirizine|loratadine|pseudoephedrine|dextromethorphan|guaifenesin|menthol|bisacodyl|docusate|polyethylene glycol|calcium carbonate|antacid)/)) return 'OTC';
  if (i.match(/supplement|vitamin|mineral|herb|probiotic|fish oil|omega|zinc|magnesium|iron|calcium|vitamin d|vitamin b|melatonin|ashwagandha|turmeric|ginger|garlic/)) return 'Supplement';
  if (i.match(/exercise|physical therapy|physiotherapy|stretching|yoga|tai chi|meditation|mindfulness|cbt|cognitive|behavioral|sleep hygiene|relaxation|breathing|pelvic floor|bladder training/)) return 'Lifestyle';
  if (i.match(/cream|ointment|gel|topical|lotion|moisturizer|sunscreen|petroleum/)) return 'Topical';
  if (types.some(t => t.includes('clinical guideline') || t.includes('practice guideline'))) return 'OTC';
  return 'OTC';
}

// ── Truncate abstract to key finding ─────────────────────────────────────────
function extractKeyFinding(abstract) {
  if (!abstract) return 'Clinical evidence supports this intervention for the target symptom.';
  // Take first 2 sentences or 200 chars, whichever is shorter
  const sentences = abstract.split(/\.\s+/).filter(s => s.length > 20);
  if (sentences.length >= 2) {
    return sentences.slice(0, 2).join('. ').substring(0, 300) + '.';
  }
  return abstract.substring(0, 300);
}

// ── Generate short description from abstract ─────────────────────────────────
function generateShortDescription(abstract, intervention, symptomCode) {
  if (!abstract) return `Evidence from a published study supports ${intervention || 'this intervention'} for ${symptomCode?.replace(/_/g, ' ') || 'the target symptom'}.`;

  // Extract the conclusion/result part if available
  const lower = abstract.toLowerCase();
  const resultIdx = lower.lastIndexOf('results');
  const conclusionIdx = lower.lastIndexOf('conclusion');
  const findingIdx = lower.lastIndexOf('finding');

  const startIdx = Math.max(resultIdx, conclusionIdx, findingIdx);
  if (startIdx > 0) {
    const snippet = abstract.substring(startIdx, startIdx + 250).trim();
    if (snippet.length > 50) return snippet + (snippet.endsWith('.') ? '' : '.');
  }

  // Fallback: first 200 chars
  return abstract.substring(0, 200).trim() + (abstract.length > 200 ? '...' : '');
}

// ── Generate tagline ─────────────────────────────────────────────────────────
function generateTagline(intervention, symptomCode, pubTypes = []) {
  const sym = (symptomCode || '').replace(/_/g, ' ');
  const type = pubTypes.map(t => t.toLowerCase());

  if (type.some(t => t.includes('systematic review') || t.includes('meta-analysis'))) {
    return `Systematic review evidence for ${(intervention || 'this intervention').toLowerCase()}`;
  }
  if (type.some(t => t.includes('randomized controlled trial'))) {
    return `RCT-tested option for ${sym}`;
  }
  if (type.some(t => t.includes('clinical guideline') || t.includes('practice guideline'))) {
    return `Guideline-supported approach for ${sym}`;
  }
  return `Evidence-informed option for ${sym}`;
}

// ── Determine if purchasable ─────────────────────────────────────────────────
function isPurchasable(intervention, category) {
  if (category === 'Lifestyle') return false;
  const i = (intervention || '').toLowerCase();
  if (i.match(/exercise|physical therapy|stretching|yoga|meditation|cbt|sleep hygiene|relaxation|breathing|pelvic floor|bladder training|acupuncture|massage/)) return false;
  return true;
}

// ── Determine child safety ──────────────────────────────────────────────────
function childSafeNotes(intervention, symptomCode) {
  const i = (intervention || '').toLowerCase();
  if (i.match(/ibuprofen|acetaminophen|paracetamol/)) return { childSafe: false, note: 'Dosing for children must follow age- and weight-specific guidance from a clinician or pharmacist.' };
  if (i.match(/aspirin/)) return { childSafe: false, note: 'Aspirin should not be given to children or teenagers due to the risk of Reye syndrome.' };
  if (i.match(/diphenhydramine|antihistamine/)) return { childSafe: false, note: 'Use in children under 2 years requires medical advice.' };
  if (i.match(/laxative|bisacodyl|polyethylene glycol/)) return { childSafe: false, note: 'Laxative use in children should be guided by a healthcare professional.' };
  return { childSafe: true, note: '' };
}

// ── Build a remedy object from a candidate ────────────────────────────────────
function buildRemedy(candidate, existingIds, counter) {
  const { symptomCodes, intervention, category: rawCategory, tagline: rawTagline,
    title, journal, url, year, publicationTypes, abstract, pmid, doi,
    retrievalSource, citedByCount } = candidate;

  const symptomCode = symptomCodes[0] || 'headache';
  const category = rawCategory || inferCategory(intervention, publicationTypes);

  // Generate unique ID
  let id;
  do {
    id = `rem_ing_${String(counter.value).padStart(3, '0')}`;
    counter.value++;
  } while (existingIds.has(id));
  existingIds.add(id);

  const safeNotes = childSafeNotes(intervention, symptomCode);
  const purchasable = isPurchasable(intervention, category);

  return {
    id,
    name: `${(intervention || 'Intervention').replace(/\b\w/g, c => c.toUpperCase())} for ${(symptomCode || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}`,
    category,
    symptoms: symptomCodes.length > 0 ? symptomCodes : [symptomCode],
    primarySymptoms: symptomCodes.length > 0 ? symptomCodes : [symptomCode],
    secondarySymptoms: [],
    tagline: rawTagline || generateTagline(intervention, symptomCode, publicationTypes),
    shortDescription: generateShortDescription(abstract, intervention, symptomCode),
    longDescription: 'This remedy entry is backed by a verified clinical or review paper. Consult the source for full context.',
    howToUse: 'Follow professional guidance for this remedy type. Consult a healthcare professional for personalized advice.',
    warnings: ['Consult a healthcare professional before use.', 'Seek medical advice if symptoms persist or worsen.'],
    contraindications: [],
    isPurchasable: purchasable,
    childSafe: safeNotes.childSafe,
    childSafetyNote: safeNotes.note,
    difficulty: 'Moderate',
    cost: '$',
    ingredients: [],
    allergen_tags: [],
    isFeatured: false,
    rating: 0,
    reviewCount: 0,
    researchPapers: [{
      title: title || 'Untitled study',
      journal: journal || 'Unknown journal',
      url: url || '',
      sourceDatabase: retrievalSource || 'PubMed',
      evidenceType: (publicationTypes || [])[0]?.toLowerCase() || 'research',
      keyFinding: extractKeyFinding(abstract),
      pmid: pmid || null,
      doi: doi || null,
      year: year || null,
    }],
  };
}

// ── Prioritize and select best candidates per symptom ─────────────────────────
function selectBestPerSymptom(candidates, maxPerSymptom = 15) {
  // Group by symptom code
  const bySymptom = new Map();
  for (const c of candidates) {
    for (const sym of c.symptomCodes) {
      if (!bySymptom.has(sym)) bySymptom.set(sym, []);
      bySymptom.get(sym).push(c);
    }
  }

  const selected = [];
  for (const [sym, cands] of bySymptom) {
    // Deduplicate by intervention within this symptom
    const seenInterventions = new Set();
    const unique = cands.filter(c => {
      const key = (c.intervention || '').toLowerCase().trim();
      if (seenInterventions.has(key)) return false;
      seenInterventions.add(key);
      return true;
    });

    // Sort by evidence quality
    unique.sort((a, b) => {
      const pa = evidencePriority(a.publicationTypes);
      const pb = evidencePriority(b.publicationTypes);
      if (pa !== pb) return pa - pb;
      // Prefer newer papers
      return (parseInt(b.year) || 0) - (parseInt(a.year) || 0);
    });

    selected.push(...unique.slice(0, maxPerSymptom));
  }

  return selected;
}

// ── Split into batch files of ~50 remedies each ──────────────────────────────
function writeToBatchFiles(remedies, startBatchNum) {
  const BATCH_SIZE = 50;
  const batches = [];
  for (let i = 0; i < remedies.length; i += BATCH_SIZE) {
    batches.push(remedies.slice(i, i + BATCH_SIZE));
  }

  const batchPaths = [];
  for (let i = 0; i < batches.length; i++) {
    const batchNum = startBatchNum + i;
    const fileName = `remedyBatch${batchNum}.js`;
    const filePath = join(BATCHES_DIR, fileName);

    const lines = [
      `// Auto-generated by scripts/ingest-discovery-candidates.mjs — do not edit manually.`,
      `// Ingested from discovery reports: comprehensive-discovery.json, targeted-expansion.json, targeted-expansion-round2.json`,
      ``,
      `export function applyRemedyBatch${batchNum}(remedies = []) {`,
      `  const map = new Map(remedies.map(r => [r.id, r]));`,
      ``,
    ];

    for (const r of batches[i]) {
      lines.push(`  map.set('${r.id}', ${JSON.stringify(r, null, 4).replace(/\n/g, '\n  ')});`);
      lines.push('');
    }

    lines.push(`  return [...map.values()];`);
    lines.push(`}`);
    lines.push('');

    writeFileSync(filePath, lines.join('\n'), 'utf8');
    batchPaths.push({ fileName, batchNum, count: batches[i].length });
    console.log(`  Wrote ${fileName}: ${batches[i].length} remedies`);
  }

  return batchPaths;
}

// ── Update index.js ──────────────────────────────────────────────────────────
function updateIndex(allBatchNums) {
  let content = readFileSync(INDEX_PATH, 'utf8');

  // Find the last batch number currently in index
  const existingNums = [];
  for (const m of content.matchAll(/applyRemedyBatch(\d+)/g)) {
    existingNums.push(parseInt(m[1]));
  }
  const maxExisting = Math.max(...existingNums);

  // Add new imports
  const newImports = [];
  const newEntries = [];
  for (const num of allBatchNums) {
    if (num > maxExisting) {
      newImports.push(`import { applyRemedyBatch${num} } from './remedyBatch${num}.js';`);
      newEntries.push(`  applyRemedyBatch${num},`);
    }
  }

  if (newImports.length === 0) return;

  // Insert imports after last existing import
  const lastImportIdx = content.lastIndexOf("import { applyRemedyBatch");
  const lastImportLineEnd = content.indexOf('\n', lastImportIdx);
  content = content.slice(0, lastImportLineEnd + 1) + newImports.join('\n') + '\n' + content.slice(lastImportLineEnd + 1);

  // Insert into batchFns array
  const arrayEndMarker = '];';
  const arrayEndIdx = content.lastIndexOf(arrayEndMarker);
  content = content.slice(0, arrayEndIdx) + newEntries.join('\n') + '\n' + content.slice(arrayEndIdx);

  writeFileSync(INDEX_PATH, content, 'utf8');
  console.log(`  Updated index.js with ${newImports.length} new batch imports`);
}

// ── Main ─────────────────────────────────────────────────────────────────────
function main() {
  console.log('=== Ingesting Discovery Candidates ===\n');

  const existingIds = loadExistingRemedyIds();
  console.log(`Found ${existingIds.size} existing remedy IDs\n`);

  const candidates = loadCandidates();
  const deduped = deduplicateCandidates(candidates);

  // Filter to candidates with valid symptom codes
  const valid = deduped.filter(c => c.symptomCodes && c.symptomCodes.length > 0);
  console.log(`Candidates with valid symptom codes: ${valid.length}`);

  const selected = selectBestPerSymptom(valid, 15);
  console.log(`Selected ${selected.length} candidates after prioritization\n`);

  // Build remedy objects
  const counter = { value: 1000 }; // Start from rem_ing_1000 to avoid conflicts
  const remedies = selected.map(c => buildRemedy(c, existingIds, counter));
  console.log(`Built ${remedies.length} remedy entries\n`);

  // Find next available batch number
  const existingFiles = readdirSync(BATCHES_DIR).filter(f => f.match(/^remedyBatch(\d+)\.js$/));
  const existingBatchNums = existingFiles.map(f => parseInt(f.match(/(\d+)/)[1]));
  const nextBatchNum = Math.max(...existingBatchNums, 39) + 1;

  // Write batch files
  console.log('Writing batch files:');
  const batchPaths = writeToBatchFiles(remedies, nextBatchNum);
  const allBatchNums = batchPaths.map(b => b.batchNum);

  // Update index.js
  console.log('\nUpdating index.js:');
  updateIndex(allBatchNums);

  // Summary
  const totalNew = remedies.length;
  console.log(`\n=== Done ===`);
  console.log(`Total new remedies: ${totalNew}`);
  console.log(`Batch files created: ${batchPaths.length}`);
  console.log(`Batch range: ${nextBatchNum}–${nextBatchNum + batchPaths.length - 1}`);

  // Per-symptom summary
  const symCounts = {};
  for (const r of remedies) {
    for (const s of r.symptoms) {
      symCounts[s] = (symCounts[s] || 0) + 1;
    }
  }
  console.log(`\nNew remedies per symptom (top 15):`);
  Object.entries(symCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .forEach(([s, c]) => console.log(`  ${s}: ${c}`));
}

main();
