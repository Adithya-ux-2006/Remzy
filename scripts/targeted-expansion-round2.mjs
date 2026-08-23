#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const perSource = 10;
const timeoutMs = 15_000;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchJson(url, options = {}) {
  const response = await fetch(url, { ...options, redirect: 'follow', signal: AbortSignal.timeout(timeoutMs) });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.json();
}

const targetedInterventions = {
  elbow_pain: [
    { intervention: 'tennis elbow treatment', category: 'Lifestyle', tagline: 'Treatment for lateral epicondylitis' },
    { intervention: 'golfer elbow treatment', category: 'Lifestyle', tagline: 'Treatment for medial epicondylitis' },
    { intervention: 'elbow tendonitis exercises', category: 'Lifestyle', tagline: 'Exercises for elbow tendon recovery' },
    { intervention: 'counterforce elbow brace', category: 'Lifestyle', tagline: 'Brace for elbow pain relief' },
  ],
  period_cramps: [
    { intervention: 'naproxen menstrual cramps', category: 'OTC', tagline: 'Long-acting NSAID for period pain' },
    { intervention: 'ibuprofen menstrual cramps', category: 'OTC', tagline: 'NSAID for menstrual pain relief' },
    { intervention: 'heating pad menstrual cramps', category: 'Lifestyle', tagline: 'Heat therapy for period pain' },
    { intervention: 'exercise menstrual cramps', category: 'Lifestyle', tagline: 'Physical activity for cramp relief' },
  ],
  chills: [
    { intervention: 'fever and chills treatment', category: 'OTC', tagline: 'Treatment for fever-related chills' },
    { intervention: 'warm fluids for chills', category: 'Lifestyle', tagline: 'Hot drinks for warmth and comfort' },
    { intervention: 'blankets for chills', category: 'Lifestyle', tagline: 'Warmth for chills relief' },
    { intervention: 'acetaminophen for chills', category: 'OTC', tagline: 'Pain reliever for fever chills' },
  ],
  low_energy: [
    { intervention: 'B12 energy supplement', category: 'Supplement', tagline: 'Vitamin for energy production' },
    { intervention: 'iron energy supplement', category: 'Supplement', tagline: 'Mineral for energy support' },
    { intervention: 'rhodiola energy herb', category: 'Herbal', tagline: 'Adaptogenic herb for energy' },
    { intervention: 'coenzyme Q10 energy', category: 'Supplement', tagline: 'Cellular energy support' },
  ],
  painful_intercourse: [
    { intervention: 'vaginal lubricant painful', category: 'OTC', tagline: 'Lubricant for comfortable intercourse' },
    { intervention: 'pelvic floor therapy painful', category: 'Lifestyle', tagline: 'Physical therapy for pelvic pain' },
    { intervention: 'vaginal moisturizer painful', category: 'OTC', tagline: 'Moisturizer for vaginal comfort' },
    { intervention: 'relaxation techniques painful', category: 'Lifestyle', tagline: 'Stress reduction for pain relief' },
  ],
  cold_sore: [
    { intervention: 'acyclovir oral cold sore', category: 'Prescription', tagline: 'Antiviral for cold sore treatment' },
    { intervention: 'docosanol cream cold sore', category: 'OTC', tagline: 'OTC antiviral for cold sores' },
    { intervention: 'lysine cold sore prevention', category: 'Supplement', tagline: 'Amino acid for prevention' },
    { intervention: 'lemon balm cold sore', category: 'Herbal', tagline: 'Herbal topical for cold sores' },
  ],
  poor_circulation: [
    { intervention: 'exercise circulation improvement', category: 'Lifestyle', tagline: 'Physical activity for circulation' },
    { intervention: 'compression stockings circulation', category: 'Lifestyle', tagline: 'Graduated compression for veins' },
    { intervention: 'cayenne pepper circulation', category: 'Herbal', tagline: 'Spice for blood flow support' },
    { intervention: 'horse chestnut circulation', category: 'Herbal', tagline: 'Herbal for venous insufficiency' },
  ],
  toothache: [
    { intervention: 'ibuprofen toothache', category: 'OTC', tagline: 'NSAID for dental pain relief' },
    { intervention: 'benzocaine toothache gel', category: 'OTC', tagline: 'Numbing gel for tooth pain' },
    { intervention: 'clove oil toothache', category: 'Herbal', tagline: 'Eugenol for dental pain relief' },
    { intervention: 'salt water rinse toothache', category: 'Lifestyle', tagline: 'Antiseptic rinse for dental pain' },
  ],
  gum_pain: [
    { intervention: 'antibacterial mouthwash gum', category: 'OTC', tagline: 'Rinse for gum health' },
    { intervention: 'warm salt water gum', category: 'Lifestyle', tagline: 'Warm rinse for gum comfort' },
    { intervention: 'clove oil gum pain', category: 'Herbal', tagline: 'Numbing oil for gum pain' },
    { intervention: 'hydrogen peroxide gum', category: 'Lifestyle', tagline: 'Diluted rinse for gum inflammation' },
  ],
  minor_burn: [
    { intervention: 'aloe vera burn gel', category: 'Herbal', tagline: 'Cooling gel for burns' },
    { intervention: 'cool water burn first aid', category: 'Lifestyle', tagline: 'Immediate cooling for burns' },
    { intervention: 'silver sulfadiazine burn', category: 'OTC', tagline: 'Antimicrobial for burn care' },
    { intervention: 'honey burn wound', category: 'Herbal', tagline: 'Natural antimicrobial for burns' },
  ],
  insect_bite: [
    { intervention: 'hydrocortisone bite cream', category: 'OTC', tagline: 'Topical steroid for bite relief' },
    { intervention: 'antihistamine bite itching', category: 'OTC', tagline: 'Oral medication for bite itch' },
    { intervention: 'calamine lotion bites', category: 'OTC', tagline: 'Soothing lotion for bites' },
    { intervention: 'tea tree oil bites', category: 'Herbal', tagline: 'Antibacterial essential oil' },
  ],
  dry_skin: [
    { intervention: 'emollient moisturizer dry skin', category: 'OTC', tagline: 'Thick moisturizer for dry skin' },
    { intervention: 'hyaluronic acid skin', category: 'Supplement', tagline: 'Hydrating serum for skin' },
    { intervention: 'ceramide cream dry skin', category: 'OTC', tagline: 'Skin barrier repair cream' },
    { intervention: 'petroleum jelly dry skin', category: 'OTC', tagline: 'Occlusive for skin moisture' },
  ],
  hangover: [
    { intervention: 'electrolyte drink hangover', category: 'OTC', tagline: 'Rehydration for recovery' },
    { intervention: 'vitamin B hangover', category: 'Supplement', tagline: 'B vitamins for metabolism' },
    { intervention: 'NAC hangover supplement', category: 'Supplement', tagline: 'Amino acid for liver support' },
    { intervention: 'sleep rest hangover', category: 'Lifestyle', tagline: 'Adequate sleep for recovery' },
  ],
  hand_pain: [
    { intervention: 'wrist splint hand pain', category: 'Lifestyle', tagline: 'Support for hand and wrist' },
    { intervention: 'hand exercises pain', category: 'Lifestyle', tagline: 'Strengthening exercises for hands' },
    { intervention: 'paraffin wax hand pain', category: 'Lifestyle', tagline: 'Warm therapy for hand joints' },
    { intervention: 'ergonomic tools hand pain', category: 'Lifestyle', tagline: 'Adaptive tools for hand comfort' },
  ],
  wrist_pain: [
    { intervention: 'wrist brace support', category: 'Lifestyle', tagline: 'Supportive brace for wrist' },
    { intervention: 'carpal tunnel exercises wrist', category: 'Lifestyle', tagline: 'Exercises for nerve relief' },
    { intervention: 'ice pack wrist pain', category: 'Lifestyle', tagline: 'Cold therapy for wrist inflammation' },
    { intervention: 'ergonomic keyboard wrist', category: 'Lifestyle', tagline: 'Workspace setup for wrist comfort' },
  ],
  loss_of_appetite: [
    { intervention: 'ginger appetite stimulant', category: 'Herbal', tagline: 'Herbal for appetite improvement' },
    { intervention: 'small frequent meals appetite', category: 'Lifestyle', tagline: 'Dietary strategy for appetite' },
    { intervention: 'zinc appetite stimulant', category: 'Supplement', tagline: 'Mineral for taste and appetite' },
    { intervention: 'bitter herbs appetite', category: 'Herbal', tagline: 'Herbal bitters for digestion' },
  ],
  foot_pain: [
    { intervention: 'orthotic insoles foot pain', category: 'Lifestyle', tagline: 'Arch support for foot comfort' },
    { intervention: 'plantar fascia stretching', category: 'Lifestyle', tagline: 'Stretching for plantar fasciitis' },
    { intervention: 'night splint foot pain', category: 'Lifestyle', tagline: 'Splint for morning foot pain' },
    { intervention: 'proper footwear foot pain', category: 'Lifestyle', tagline: 'Supportive shoes for feet' },
  ],
  eye_pain: [
    { intervention: 'artificial tears eye drops', category: 'OTC', tagline: 'Lubricating drops for eye comfort' },
    { intervention: 'ketorolac eye drops', category: 'Prescription', tagline: 'NSAID for eye inflammation' },
    { intervention: 'cold compress eye pain', category: 'Lifestyle', tagline: 'Cold therapy for eye relief' },
    { intervention: 'lutein zeaxanthin eye health', category: 'Supplement', tagline: 'Antioxidants for eye support' },
  ],
  endometriosis: [
    { intervention: 'hormonal therapy endometriosis', category: 'Prescription', tagline: 'Hormones for endometriosis' },
    { intervention: 'NSAID endometriosis pain', category: 'OTC', tagline: 'Pain relief for endometriosis' },
    { intervention: 'anti-inflammatory diet endo', category: 'Lifestyle', tagline: 'Diet for endometriosis management' },
    { intervention: 'acupuncture endometriosis', category: 'Lifestyle', tagline: 'Acupuncture for pelvic pain' },
  ],
  indigestion: [
    { intervention: 'antacid indigestion relief', category: 'OTC', tagline: 'Quick relief for indigestion' },
    { intervention: 'ginger tea indigestion', category: 'Herbal', tagline: 'Soothing tea for digestion' },
    { intervention: 'probiotic gut health', category: 'Supplement', tagline: 'Beneficial bacteria for digestion' },
    { intervention: 'fennel seeds indigestion', category: 'Herbal', tagline: 'Carminative for stomach comfort' },
  ],
  stomach_ache: [
    { intervention: 'antacid stomach relief', category: 'OTC', tagline: 'Quick relief for stomach pain' },
    { intervention: 'peppermint oil stomach', category: 'Herbal', tagline: 'Enteric-coated oil for IBS' },
    { intervention: 'heating pad stomach ache', category: 'Lifestyle', tagline: 'Warmth for abdominal comfort' },
    { intervention: 'fennel tea stomach ache', category: 'Herbal', tagline: 'Carminative tea for stomach pain' },
  ],
};

async function discoverPubMed(intervention, condition) {
  const query = `(${intervention}[Title/Abstract]) AND (${condition}[Title/Abstract]) AND (systematic review[pt] OR meta-analysis[pt] OR randomized controlled trial[pt] OR clinical trial[pt] OR practice guideline[pt] OR observational study[pt] OR review[pt])`;
  const params = new URLSearchParams({ db: 'pubmed', term: query, retmax: String(perSource), retmode: 'json', sort: 'relevance' });
  const data = await fetchJson(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?${params}`);
  const ids = data.esearchresult?.idlist || [];
  if (ids.length === 0) return [];
  const summaryParams = new URLSearchParams({ db: 'pubmed', retmode: 'json', id: ids.join(',') });
  const summary = await fetchJson(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?${summaryParams}`);
  const fetchParams = new URLSearchParams({ db: 'pubmed', retmode: 'xml', id: ids.join(','), rettype: 'abstract' });
  const xmlResponse = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?${fetchParams}`, { redirect: 'follow', signal: AbortSignal.timeout(timeoutMs) });
  const xmlText = await xmlResponse.text();
  const abstracts = {};
  for (const articleMatch of xmlText.matchAll(/<PubmedArticle>([\s\S]*?)<\/PubmedArticle>/g)) {
    const articleXml = articleMatch[1];
    const pmidMatch = articleXml.match(/<PMID[^>]*>(\d+)<\/PMID>/);
    if (!pmidMatch) continue;
    const pmid = pmidMatch[1];
    const abstractParts = [];
    for (const absMatch of articleXml.matchAll(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g)) {
      abstractParts.push(absMatch[1].replace(/<[^>]+>/g, '').trim());
    }
    if (abstractParts.length > 0) abstracts[pmid] = abstractParts.join(' ');
  }
  return ids.map(id => {
    const record = summary.result?.[id];
    return {
      retrievalSource: 'PubMed', publicationId: `pmid:${id}`, pmid: id, doi: null,
      url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`, title: record?.title || null,
      journal: record?.fulljournalname || null, year: String(record?.pubdate || '').match(/\d{4}/)?.[0] || null,
      publicationTypes: record?.pubtype || [], abstract: abstracts[id] || null,
      citedByCount: null, semanticStatus: 'unassessed',
    };
  });
}

async function discoverEuropePmc(intervention, condition) {
  const query = `TITLE_ABS:"${intervention}" AND TITLE_ABS:"${condition}"`;
  const url = new URL('https://www.ebi.ac.uk/europepmc/webservices/rest/search');
  url.search = new URLSearchParams({ query, format: 'json', pageSize: String(perSource), resultType: 'core' }).toString();
  const records = (await fetchJson(url)).resultList?.result || [];
  return records.map(record => ({
    retrievalSource: 'Europe PMC', publicationId: record.pmid ? `pmid:${record.pmid}` : record.doi ? `doi:${record.doi.toLowerCase()}` : `epmc:${record.id}`,
    pmid: record.pmid || null, doi: record.doi || null,
    url: record.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${record.pmid}/` : `https://europepmc.org/article/${record.source}/${record.id}`,
    title: record.title || null, journal: record.journalTitle || null, year: record.pubYear || null,
    publicationTypes: record.pubTypeList?.pubType || [], abstract: record.abstractText || null,
    citedByCount: record.citedByCount ?? null, semanticStatus: 'unassessed',
  }));
}

async function discoverForSymptom(symptomCode, interventions) {
  const condition = symptomCode.replace(/_/g, ' ');
  const allCandidates = [];
  for (const { intervention, category, tagline } of interventions) {
    const results = await Promise.allSettled([
      discoverPubMed(intervention, condition),
      discoverEuropePmc(intervention, condition),
    ]);
    for (const result of results) {
      if (result.status === 'fulfilled') {
        for (const candidate of result.value) {
          allCandidates.push({ ...candidate, intervention, category, tagline, symptomCode });
        }
      }
    }
  }
  return allCandidates;
}

const output = resolve('reports/targeted-expansion-round2.json');
const report = { generatedAt: new Date().toISOString(), symptomCount: Object.keys(targetedInterventions).length, packets: [] };

for (const [symptomCode, interventions] of Object.entries(targetedInterventions)) {
  process.stdout.write(`Discovering ${symptomCode}...`);
  const candidates = await discoverForSymptom(symptomCode, interventions);
  await sleep(350);
  const seen = new Set();
  const deduped = candidates.filter(c => {
    const key = c.pmid || c.doi || c.url;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  report.packets.push({ symptomCode, interventions: interventions.map(i => i.intervention), candidateCount: deduped.length, candidates: deduped });
  console.log(` ${deduped.length} candidates`);
}

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, JSON.stringify(report, null, 2));

const totalCandidates = report.packets.reduce((sum, p) => sum + p.candidateCount, 0);
console.log(`\nTargeted expansion round 2: ${totalCandidates} candidates across ${report.symptomCount} symptoms.`);
