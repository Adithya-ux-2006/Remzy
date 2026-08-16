#!/usr/bin/env node
/**
 * Quick discovery for symptoms that had 0 candidates in the main reports.
 * Searches PubMed for skin_rash and stomach_ache interventions.
 */

import { writeFileSync, readFileSync, appendFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const REPORT_PATH = join(ROOT, 'reports', 'targeted-supplement.json');

const TARGETS = [
  {
    symptomCode: 'skin_rash',
    interventions: [
      'hydrocortisone cream skin rash',
      'calamine lotion itching rash',
      'colloidal oatmeal eczema rash',
      'antihistamine skin rash',
      'zinc oxide skin barrier',
      'emollient moisturizer dermatitis',
      'tea tree oil skin irritation',
      'aloe vera skin soothing',
    ],
  },
  {
    symptomCode: 'stomach_ache',
    interventions: [
      'peppermint oil IBS stomach pain',
      'ginger nausea stomach discomfort',
      'antispasmodic abdominal cramps',
      'probiotic functional abdominal pain',
      'hyoscine stomach cramps',
      'dicyclomine abdominal pain',
      'fennel digestive discomfort',
      'chamomile tea stomach ache',
    ],
  },
  {
    symptomCode: 'congestion',
    interventions: [
      'nasal saline irrigation congestion',
      'ipratropium nasal congestion',
      'oxymetazoline nasal decongestant',
      'eucalyptus steam inhalation congestion',
      'guaifenesin expectorant congestion',
      'pseudoephedrine nasal congestion',
      'fluticasone nasal steroid congestion',
      'neti pot sinus congestion',
    ],
  },
  {
    symptomCode: 'nausea',
    interventions: [
      'ondansetron nausea vomiting',
      'ginger nausea pregnancy',
      'acupressure wrist nausea',
      'promethazine nausea',
      'metoclopramide nausea gastroparesis',
      'dimenhydrinate motion sickness nausea',
      'vitamin B6 pregnancy nausea',
      'isopropyl alcohol inhalation nausea',
    ],
  },
  {
    symptomCode: 'toothache',
    interventions: [
      'clove oil toothache analgesic',
      'benzocaine gel toothache topical',
      'ibuprofen dental pain',
      'salt water rinse toothache',
      'oil pulling dental pain',
      'garlic topical toothache',
      'cold compress dental swelling',
      'hydrogen peroxide rinse toothache',
    ],
  },
];

async function searchPubMed(query, maxResults = 5) {
  const base = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
  const searchUrl = `${base}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${maxResults}&retmode=json`;

  try {
    const res = await fetch(searchUrl, { signal: AbortSignal.timeout(15000) });
    const data = await res.json();
    const ids = data.esearchresult?.idlist || [];
    if (ids.length === 0) return [];

    const summaryUrl = `${base}/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
    const sumRes = await fetch(summaryUrl, { signal: AbortSignal.timeout(15000) });
    const sumData = await sumRes.json();

    return ids.map(id => {
      const doc = sumData.result?.[id] || {};
      return {
        retrievalSource: 'PubMed',
        publicationId: `pmid:${id}`,
        pmid: id,
        doi: doc.elocationid?.replace('doi: ', '') || null,
        url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
        title: doc.title || 'Untitled',
        journal: doc.fulljournalname || doc.source || null,
        year: doc.pubdate?.split(' ')[0] || null,
        publicationTypes: doc.pubtypes || [],
        citedByCount: doc.viewcount || null,
        semanticStatus: 'unassessed',
      };
    });
  } catch (e) {
    console.warn(`  PubMed search failed for "${query}": ${e.message}`);
    return [];
  }
}

async function main() {
  console.log('=== Supplemental Discovery for Low-Coverage Symptoms ===\n');

  const allPackets = [];

  for (const target of TARGETS) {
    console.log(`Searching ${target.symptomCode} (${target.interventions.length} interventions)...`);
    const candidates = [];

    for (const intervention of target.interventions) {
      const results = await searchPubMed(intervention, 5);
      for (const r of results) {
        candidates.push({
          ...r,
          intervention: intervention.split(' ').slice(0, -2).join(' '),
          category: 'OTC',
          tagline: `Evidence-informed option for ${target.symptomCode.replace(/_/g, ' ')}`,
          symptomCode: target.symptomCode,
        });
      }
      // Rate limit
      await new Promise(r => setTimeout(r, 400));
    }

    // Deduplicate by pmid
    const seen = new Set();
    const unique = candidates.filter(c => {
      if (seen.has(c.pmid)) return false;
      seen.add(c.pmid);
      return true;
    });

    console.log(`  Found ${unique.length} unique candidates`);
    allPackets.push({
      symptomCode: target.symptomCode,
      interventions: target.interventions,
      candidateCount: unique.length,
      candidates: unique,
    });
  }

  const output = {
    generatedAt: new Date().toISOString(),
    symptomCount: TARGETS.length,
    packets: allPackets,
  };

  writeFileSync(REPORT_PATH, JSON.stringify(output, null, 2), 'utf8');
  console.log(`\nWrote ${REPORT_PATH}`);
}

main();
