/**
 * Evidence Audit Script
 * 
 * Classifies every symptom-remedy pair and identifies:
 * - RESEARCH_BACKED: has a real PubMed URL in researchPapers or researchLinks
 * - UNVERIFIED: has citations but none are real PubMed URLs
 * - UNKNOWN: no citations at all
 * 
 * Also identifies zero-coverage symptoms (no research-backed remedy).
 * 
 * Run: node scripts/audit-evidence.mjs
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ---- Parse symptoms from source (ESM) ----
function parseSymptoms() {
  const code = readFileSync(resolve(ROOT, 'src/data/symptoms.js'), 'utf-8');
  const ids = [...code.matchAll(/\bid:\s*'([^']+)'/g)].map(m => m[1]);
  const labels = [...code.matchAll(/\blabel:\s*'([^']+)'/g)].map(m => m[1]);
  const emojis = [...code.matchAll(/\bemoji:\s*'([^']+)'/g)].map(m => m[1]);
  return ids.map((id, i) => ({ id, label: labels[i] || id, emoji: emojis[i] || '?' }));
}

// ---- Parse remedies from source (ESM) ----
function parseRemedies() {
  const code = readFileSync(resolve(ROOT, 'src/data/remedies.js'), 'utf-8');
  const remedies = [];
  
  // Split by remedy objects - each starts with { id: 'rem_
  const blocks = code.split(/\{[\s]*id:\s*'/).slice(1);
  
  for (const block of blocks) {
    const id = block.match(/^([^']+)'/)?.[1];
    if (!id) continue;
    
    const name = block.match(/name:\s*'([^']+)'/)?.[1] || '';
    const category = block.match(/category:\s*'([^']+)'/)?.[1] || '';
    
    // Parse symptoms array
    const symptomsMatch = block.match(/symptoms:\s*\[([^\]]*)\]/);
    const symptoms = symptomsMatch ? [...symptomsMatch[1].matchAll(/'([^']+)'/g)].map(m => m[1]) : [];
    
    // Parse primarySymptoms
    const primaryMatch = block.match(/primarySymptoms:\s*\[([^\]]*)\]/);
    const primarySymptoms = primaryMatch ? [...primaryMatch[1].matchAll(/'([^']+)'/g)].map(m => m[1]) : [];
    
    // Parse secondarySymptoms
    const secondaryMatch = block.match(/secondarySymptoms:\s*\[([^\]]*)\]/);
    const secondarySymptoms = secondaryMatch ? [...secondaryMatch[1].matchAll(/'([^']+)'/g)].map(m => m[1]) : [];
    
    // Parse researchPapers
    const papersMatch = block.match(/researchPapers:\s*\[([\s\S]*?)\]/);
    const researchPapers = [];
    if (papersMatch) {
      const paperBlocks = papersMatch[1].split(/\{[\s]*journal:/).slice(1);
      for (const pb of paperBlocks) {
        const journal = pb.match(/journal:\s*'([^']+)'/)?.[1] || '';
        const keyFinding = pb.match(/keyFinding:\s*'([^']+)'/)?.[1] || '';
        const url = pb.match(/url:\s*'([^']+)'/)?.[1] || '';
        researchPapers.push({ journal, keyFinding, url });
      }
    }
    
    // Parse researchLinks
    const linksMatch = block.match(/researchLinks:\s*\[([\s\S]*?)\]/);
    const researchLinks = [];
    if (linksMatch) {
      const linkBlocks = linksMatch[1].split(/\{[\s]*label:/).slice(1);
      for (const lb of linkBlocks) {
        const label = lb.match(/label:\s*'([^']+)'/)?.[1] || '';
        const url = lb.match(/url:\s*'([^']+)'/)?.[1] || '';
        researchLinks.push({ label, url });
      }
    }
    
    remedies.push({ id, name, category, symptoms, primarySymptoms, secondarySymptoms, researchPapers, researchLinks });
  }
  
  return remedies;
}

// ---- Classification helpers ----

function isRealPubMedUrl(url) {
  if (!url) return false;
  return /pubmed\.ncbi\.nlm\.nih\.gov\/\d+/.test(url);
}

function isRealScholarUrl(url) {
  if (!url) return false;
  if (!/scholar\.google\.com/.test(url)) return false;
  return /citations\?view_op=view_citation|scholar\?.*as_sdt=|scholar\?.*btnG=/.test(url);
}

function isRealCitation(url) {
  return isRealPubMedUrl(url) || isRealScholarUrl(url);
}

function classifyRemedyEvidence(remedy) {
  const papers = remedy.researchPapers || [];
  const links = remedy.researchLinks || [];

  const hasRealPaper = papers.some(p => isRealCitation(p.url));
  const hasRealLink = links.some(l => isRealCitation(l.url));

  if (hasRealPaper || hasRealLink) return 'RESEARCH_BACKED';

  const hasAny = papers.length > 0 || links.length > 0;
  if (hasAny) return 'UNVERIFIED';

  return 'UNKNOWN';
}

// ---- Main audit ----

function runAudit() {
  const SYMPTOMS = parseSymptoms();
  const REMEDIES = parseRemedies();

  console.log('='.repeat(80));
  console.log('EVIDENCE AUDIT REPORT');
  console.log('='.repeat(80));
  console.log();
  console.log(`Total symptoms defined: ${SYMPTOMS.length}`);
  console.log(`Total remedies defined: ${REMEDIES.length}`);
  console.log();

  // ---- Remedy classification ----
  console.log('-'.repeat(80));
  console.log('REMEDY CLASSIFICATION');
  console.log('-'.repeat(80));

  const backed = [], unverified = [], unknown = [];

  for (const remedy of REMEDIES) {
    const classification = classifyRemedyEvidence(remedy);
    const papers = remedy.researchPapers || [];
    const links = remedy.researchLinks || [];
    const totalCitations = papers.length + links.length;

    const icon = classification === 'RESEARCH_BACKED' ? '✅' : classification === 'UNVERIFIED' ? '⚠️' : '❌';
    console.log(`${icon} ${remedy.id.padEnd(8)} | ${remedy.name.padEnd(40)} | ${classification.padEnd(16)} | Citations: ${totalCitations}`);

    if (classification === 'RESEARCH_BACKED') backed.push(remedy);
    else if (classification === 'UNVERIFIED') unverified.push(remedy);
    else unknown.push(remedy);
  }

  console.log();
  console.log(`SUMMARY: ${backed.length} RESEARCH_BACKED | ${unverified.length} UNVERIFIED | ${unknown.length} UNKNOWN`);
  console.log();

  // ---- Symptom coverage ----
  console.log('-'.repeat(80));
  console.log('SYMPTOM COVERAGE TABLE');
  console.log('-'.repeat(80));
  console.log('Legend: ✅ = has research-backed remedy | ⚠️ = only unverified remedies | ❌ = no remedies at all');
  console.log();

  const symptomCoverage = [];
  const symptomIds = new Set(SYMPTOMS.map(s => s.id));

  for (const symptom of SYMPTOMS) {
    const mappedRemedies = [];

    for (const remedy of REMEDIES) {
      // Match the new catalogStore logic: primarySymptoms, secondarySymptoms,
      // AND the broader symptoms array all count as coverage
      const isPrimary = remedy.primarySymptoms.includes(symptom.id);
      const isSecondary = remedy.secondarySymptoms.includes(symptom.id);
      const isAssociated = remedy.symptoms.includes(symptom.id);
      if (isPrimary || isSecondary || isAssociated) {
        mappedRemedies.push({
          remedy,
          relationship: isPrimary ? 'primary' : isSecondary ? 'secondary' : 'associated',
          classification: classifyRemedyEvidence(remedy),
        });
      }
    }

    const backedCount = mappedRemedies.filter(r => r.classification === 'RESEARCH_BACKED').length;
    const unverifiedCount = mappedRemedies.filter(r => r.classification === 'UNVERIFIED').length;
    const unknownCount = mappedRemedies.filter(r => r.classification === 'UNKNOWN').length;
    const total = mappedRemedies.length;

    let status;
    if (total === 0) status = '❌ NO_COVERAGE';
    else if (backedCount === 0) status = '⚠️ ZERO_BACKED';
    else status = '✅ COVERED';

    symptomCoverage.push({ symptom, mappedRemedies, backedCount, unverifiedCount, unknownCount, total, status });

    const bar = '█'.repeat(backedCount) + '▓'.repeat(unverifiedCount) + '░'.repeat(unknownCount);
    console.log(`${status.split(' ')[0]} ${symptom.id.padEnd(25)} | ${bar.padEnd(15)} | Total: ${String(total).padStart(2)} | Backed: ${String(backedCount).padStart(2)} | Unverified: ${String(unverifiedCount).padStart(2)}`);
  }

  console.log();

  // ---- Zero-coverage details ----
  const zeroBacked = symptomCoverage.filter(s => s.backedCount === 0);
  const noCoverage = symptomCoverage.filter(s => s.total === 0);

  console.log('-'.repeat(80));
  console.log('ZERO-COVERAGE SYMPTOMS (no research-backed remedy available)');
  console.log('-'.repeat(80));

  for (const z of zeroBacked) {
    const remedyList = z.mappedRemedies.length > 0
      ? z.mappedRemedies.map(r => `${r.remedy.id} ${r.remedy.name} [${r.classification}]`).join('\n           ')
      : 'NO REMEDIES MAPPED';
    console.log(`\n❌ ${z.symptom.id} (${z.symptom.label})`);
    console.log(`   Remedies: ${remedyList}`);
  }

  console.log();
  console.log(`Total symptoms with NO coverage: ${noCoverage.length}`);
  console.log(`Total symptoms with only unverified remedies: ${zeroBacked.length - noCoverage.length}`);
  console.log(`Total symptoms with research-backed remedies: ${symptomCoverage.length - zeroBacked.length}`);
  console.log();

  // ---- Fake Google Scholar URLs ----
  console.log('-'.repeat(80));
  console.log('FAKE GOOGLE SCHOLAR URLs (not real study links)');
  console.log('-'.repeat(80));

  for (const remedy of REMEDIES) {
    const fakePapers = (remedy.researchPapers || []).filter(p => !isRealPubMedUrl(p.url));
    const fakeLinks = (remedy.researchLinks || []).filter(l => !isRealPubMedUrl(l.url));
    const fakes = [...fakePapers, ...fakeLinks];
    if (fakes.length > 0) {
      console.log(`\n⚠️ ${remedy.id} (${remedy.name}):`);
      for (const f of fakes) {
        console.log(`   ${f.url}`);
      }
    }
  }

  return { symptomCoverage, backed, unverified, unknown };
}

runAudit();
