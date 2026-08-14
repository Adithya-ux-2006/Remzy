#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const SCRAPINGBEE_API_KEY = process.env.SCRAPINGBEE_API_KEY || '';
const SCHOLAR_QUOTA = { total: 250, used: 0 };
const perSource = 8;
const timeoutMs = 15_000;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchJson(url, options = {}) {
  const response = await fetch(url, { ...options, redirect: 'follow', signal: AbortSignal.timeout(timeoutMs) });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.json();
}

const broaderInterventions = {
  endometriosis: [
    { intervention: 'endometriosis pain management', category: 'Lifestyle', tagline: 'Pain management strategies for endometriosis' },
    { intervention: 'hormonal therapy endometriosis', category: 'Prescription', tagline: 'Hormonal suppression for endometriosis' },
  ],
  eye_pain: [
    { intervention: 'eye pain treatment', category: 'OTC', tagline: 'Treatment options for ocular pain' },
    { intervention: 'ocular lubricant', category: 'OTC', tagline: 'Lubricating drops for eye discomfort' },
  ],
  foot_pain: [
    { intervention: 'plantar fasciitis treatment', category: 'Lifestyle', tagline: 'Treatment for plantar heel pain' },
    { intervention: 'foot orthotic', category: 'Lifestyle', tagline: 'Orthotic support for foot pain' },
  ],
  heartburn: [
    { intervention: 'heartburn treatment', category: 'OTC', tagline: 'Treatment options for heartburn relief' },
    { intervention: 'H2 receptor antagonist', category: 'OTC', tagline: 'Acid reducer for heartburn' },
  ],
  hip_pain: [
    { intervention: 'hip pain exercise therapy', category: 'Lifestyle', tagline: 'Exercise-based treatment for hip pain' },
    { intervention: 'hip osteoarthritis treatment', category: 'Lifestyle', tagline: 'Management of hip osteoarthritis' },
  ],
  sinus_pressure: [
    { intervention: 'sinusitis treatment', category: 'OTC', tagline: 'Treatment for sinus congestion and pressure' },
    { intervention: 'intranasal corticosteroid', category: 'OTC', tagline: 'Nasal spray for sinus pressure relief' },
  ],
  stomach_ache: [
    { intervention: 'abdominal pain treatment', category: 'OTC', tagline: 'Treatment options for stomach pain' },
    { intervention: 'antispasmodic', category: 'OTC', tagline: 'Muscle relaxant for abdominal cramps' },
  ],
  swollen_lymph_nodes: [
    { intervention: 'lymphadenopathy management', category: 'Lifestyle', tagline: 'Management of swollen lymph nodes' },
  ],
  teeth_grinding: [
    { intervention: 'bruxism treatment', category: 'Lifestyle', tagline: 'Treatment for teeth grinding' },
    { intervention: 'botulinum toxin bruxism', category: 'Prescription', tagline: 'Botox for severe teeth grinding' },
  ],
  testicular_pain: [
    { intervention: 'testicular pain management', category: 'Lifestyle', tagline: 'Management of scrotal pain' },
    { intervention: 'chronic orchialgia treatment', category: 'Prescription', tagline: 'Treatment for chronic testicular pain' },
  ],
  toothache: [
    { intervention: 'toothache pain relief', category: 'OTC', tagline: 'Pain management for dental pain' },
    { intervention: 'dental emergency management', category: 'OTC', tagline: 'Emergency care for toothache' },
  ],
  ankle_pain: [
    { intervention: 'ankle sprain treatment', category: 'Lifestyle', tagline: 'Treatment for ankle sprains' },
    { intervention: 'ankle rehabilitation exercise', category: 'Lifestyle', tagline: 'Rehabilitation exercises for ankle pain' },
  ],
  bad_breath: [
    { intervention: 'halitosis treatment', category: 'OTC', tagline: 'Treatment for chronic bad breath' },
    { intervention: 'tongue cleaning', category: 'Lifestyle', tagline: 'Oral hygiene for halitosis reduction' },
  ],
  canker_sore: [
    { intervention: 'aphthous ulcer treatment', category: 'OTC', tagline: 'Treatment for mouth ulcers' },
    { intervention: 'canker sore rinse', category: 'OTC', tagline: 'Antimicrobial rinse for canker sores' },
  ],
  ear_pain: [
    { intervention: 'otitis media treatment', category: 'OTC', tagline: 'Treatment for middle ear infection pain' },
    { intervention: 'earache home remedy', category: 'Lifestyle', tagline: 'Comfort measures for ear pain' },
  ],
  erectile_difficulty: [
    { intervention: 'erectile dysfunction exercise', category: 'Lifestyle', tagline: 'Physical therapy for erectile function' },
    { intervention: 'L-arginine erectile dysfunction', category: 'Supplement', tagline: 'Amino acid supplement for erectile function' },
  ],
  frequent_urination: [
    { intervention: 'overactive bladder treatment', category: 'Prescription', tagline: 'Treatment for urinary frequency' },
    { intervention: 'bladder training', category: 'Lifestyle', tagline: 'Behavioral therapy for urinary frequency' },
  ],
  gum_pain: [
    { intervention: 'gingivitis treatment', category: 'OTC', tagline: 'Treatment for gum inflammation' },
    { intervention: 'periodontal disease management', category: 'OTC', tagline: 'Management of gum disease' },
  ],
  hand_pain: [
    { intervention: 'carpal tunnel treatment', category: 'Lifestyle', tagline: 'Treatment for carpal tunnel syndrome' },
    { intervention: 'hand exercise therapy', category: 'Lifestyle', tagline: 'Therapeutic exercises for hand pain' },
  ],
  joint_pain: [
    { intervention: 'joint pain physical therapy', category: 'Lifestyle', tagline: 'Physical therapy for joint pain' },
    { intervention: 'hyaluronic acid injection', category: 'Prescription', tagline: 'Joint injection for pain relief' },
  ],
  minor_burn: [
    { intervention: 'burn wound care', category: 'OTC', tagline: 'First aid treatment for minor burns' },
    { intervention: 'silver sulfadiazine', category: 'Prescription', tagline: 'Topical antimicrobial for burns' },
  ],
  neck_pain: [
    { intervention: 'cervicalgia treatment', category: 'Lifestyle', tagline: 'Treatment for neck pain' },
    { intervention: 'cervical traction', category: 'Lifestyle', tagline: 'Mechanical traction for neck pain' },
  ],
  night_sweats: [
    { intervention: 'night sweats management', category: 'Lifestyle', tagline: 'Management of nocturnal sweating' },
    { intervention: 'clonidine night sweats', category: 'Prescription', tagline: 'Medication for severe night sweats' },
  ],
  painful_intercourse: [
    { intervention: 'dyspareunia treatment', category: 'Prescription', tagline: 'Treatment for painful intercourse' },
    { intervention: 'vaginal estrogen', category: 'Prescription', tagline: 'Topical estrogen for vaginal dryness' },
  ],
  prostate_issues: [
    { intervention: 'benign prostatic hyperplasia treatment', category: 'Prescription', tagline: 'Treatment for enlarged prostate' },
    { intervention: 'alpha blocker BPH', category: 'Prescription', tagline: 'Medication to relax prostate muscles' },
  ],
  sunburn: [
    { intervention: 'sunburn treatment', category: 'OTC', tagline: 'Treatment for UV-damaged skin' },
    { intervention: 'after-sun lotion', category: 'OTC', tagline: 'Cooling lotion for sunburn relief' },
  ],
};

async function discoverPubMed(intervention, condition) {
  const query = `(${intervention}[Title/Abstract]) AND (${condition}[Title/Abstract]) AND (systematic review[pt] OR meta-analysis[pt] OR randomized controlled trial[pt] OR clinical trial[pt] OR practice guideline[pt] OR observational study[pt])`;
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
  const query = `TITLE_ABS:"${intervention}" AND TITLE_ABS:"${condition}" AND (PUB_TYPE:"systematic review" OR PUB_TYPE:"meta-analysis" OR PUB_TYPE:"randomized controlled trial" OR PUB_TYPE:"practice guideline" OR PUB_TYPE:"clinical trial")`;
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

async function discoverGoogleScholar(intervention, condition) {
  if (!SCRAPINGBEE_API_KEY || SCRAPINGBEE_API_KEY.length < 10) return [];
  if (SCHOLAR_QUOTA.used >= SCHOLAR_QUOTA.total) return [];
  const query = `${intervention} ${condition} treatment clinical trial`;
  const url = new URL('https://app.scrapingbee.com/api/v1/');
  url.search = new URLSearchParams({ api_key: SCRAPINGBEE_API_KEY, search: 'google_scholar', q: query, country_code: 'us', language: 'en', as_ylo: '2015' }).toString();
  try {
    const response = await fetchJson(url.toString());
    SCHOLAR_QUOTA.used++;
    return (response.organic_results || []).slice(0, perSource).map(result => {
      const pmidMatch = result.snippet?.match(/PMID:\s*(\d+)/i) || result.link?.match(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)/);
      const pmid = pmidMatch?.[1] || null;
      const doiMatch = result.snippet?.match(/doi[:\s]+(10\.\d{4,}\/\S+)/i) || result.link?.match(/doi\.org\/(10\.\d{4,}\/\S+)/);
      return {
        retrievalSource: 'Google Scholar', publicationId: pmid ? `pmid:${pmid}` : doiMatch?.[1] ? `doi:${doiMatch[1]}` : `scholar:${result.position}`,
        pmid, doi: doiMatch?.[1] || null, url: pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` : result.link || null,
        title: result.title || null, journal: result.publication_info?.split?.(',')[0] || null,
        year: result.publication_info?.match?.(/\d{4}/)?.[0] || null, publicationTypes: [], abstract: null,
        citedByCount: result.cited_by?.value ?? null, semanticStatus: 'unassessed',
      };
    });
  } catch { return []; }
}

async function discoverForSymptom(symptomCode, interventions) {
  const condition = symptomCode.replace(/_/g, ' ');
  const allCandidates = [];
  for (const { intervention, category, tagline } of interventions) {
    const results = await Promise.allSettled([
      discoverPubMed(intervention, condition),
      discoverEuropePmc(intervention, condition),
      discoverGoogleScholar(intervention, condition),
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

const output = resolve('reports/round2-discovery.json');
const report = { generatedAt: new Date().toISOString(), round: 2, symptomCount: Object.keys(broaderInterventions).length, packets: [] };

for (const [symptomCode, interventions] of Object.entries(broaderInterventions)) {
  process.stdout.write(`Round 2 discovering ${symptomCode}...`);
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
console.log(`\nRound 2 discovery: ${totalCandidates} candidates across ${report.symptomCount} symptoms.`);
console.log(`Google Scholar quota used: ${SCHOLAR_QUOTA.used}/${SCHOLAR_QUOTA.total}`);
