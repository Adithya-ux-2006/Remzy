/**
 * Evidence Guardrail Validation Script
 * 
 * Validates that all remedies in the local data files have proper evidence citations.
 * Accepts PubMed URLs (pubmed.ncbi.nlm.nih.gov/<ID>) and Google Scholar citations.
 * Run as part of CI/pre-commit to prevent unverified remedies from being added.
 * 
 * Exit code 1 if any remedy lacks a valid citation.
 * 
 * Run: node scripts/validate-evidence-guardrail.mjs
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function parseRemedies() {
  const code = readFileSync(resolve(ROOT, 'src/data/remedies.js'), 'utf-8');
  const remedies = [];
  const blocks = code.split(/\{[\s]*id:\s*'/).slice(1);

  for (const block of blocks) {
    const id = block.match(/^([^']+)'/)?.[1];
    if (!id) continue;
    const name = block.match(/name:\s*'([^']+)'/)?.[1] || '';

    const papersMatch = block.match(/researchPapers:\s*\[([\s\S]*?)\]/);
    const researchPapers = [];
    if (papersMatch) {
      const paperBlocks = papersMatch[1].split(/\{[\s]*journal:/).slice(1);
      for (const pb of paperBlocks) {
        const url = pb.match(/url:\s*'([^']+)'/)?.[1] || '';
        researchPapers.push({ url });
      }
    }

    const linksMatch = block.match(/researchLinks:\s*\[([\s\S]*?)\]/);
    const researchLinks = [];
    if (linksMatch) {
      const linkBlocks = linksMatch[1].split(/\{[\s]*label:/).slice(1);
      for (const lb of linkBlocks) {
        const url = lb.match(/url:\s*'([^']+)'/)?.[1] || '';
        researchLinks.push({ url });
      }
    }

    remedies.push({ id, name, researchPapers, researchLinks });
  }
  return remedies;
}

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

function validate() {
  const remedies = parseRemedies();
  let failures = 0;

  console.log('Evidence Guardrail Validation');
  console.log('='.repeat(50));
  console.log(`Checking ${remedies.length} remedies...\n`);

  for (const remedy of remedies) {
    const hasRealPaper = remedy.researchPapers.some(p => isRealCitation(p.url));
    const hasRealLink = remedy.researchLinks.some(l => isRealCitation(l.url));

    if (!hasRealPaper && !hasRealLink) {
      console.error(`FAIL: ${remedy.id} (${remedy.name}) - No valid citation`);
      failures++;
    }
  }

  console.log();
  if (failures > 0) {
    console.error(`${failures} remedy(ies) failed validation.`);
    console.error('Each remedy must have at least one valid citation:');
    console.error('  - PubMed: pubmed.ncbi.nlm.nih.gov/<numeric-id>');
    console.error('  - Google Scholar: scholar.google.com with citation or paper parameters');
    process.exit(1);
  } else {
    console.log('All remedies have valid citations. Guardrail passed.');
  }
}

validate();
