#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const SCRAPINGBEE_API_KEY = process.env.SCRAPINGBEE_API_KEY || '';
const SCHOLAR_QUOTA = { total: 250, used: 0 };
const perSource = 10;
const timeoutMs = 15_000;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchJson(url, options = {}) {
  const response = await fetch(url, { ...options, redirect: 'follow', signal: AbortSignal.timeout(timeoutMs) });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.json();
}

const stubbornSymptoms = {
  hip_pain: [
    { intervention: 'hip pain', category: 'Lifestyle', tagline: 'Management options for hip pain' },
    { intervention: 'trochanteric bursitis', category: 'Lifestyle', tagline: 'Treatment for outer hip pain' },
    { intervention: 'hip arthritis', category: 'Lifestyle', tagline: 'Non-surgical management of hip arthritis' },
  ],
  sinus_pressure: [
    { intervention: 'sinusitis', category: 'OTC', tagline: 'Treatment for acute and chronic sinusitis' },
    { intervention: 'sinus drainage', category: 'Lifestyle', tagline: 'Techniques for sinus drainage' },
    { intervention: 'nasal irrigation', category: 'OTC', tagline: 'Saline irrigation for sinus relief' },
  ],
  stomach_ache: [
    { intervention: 'functional abdominal pain', category: 'Lifestyle', tagline: 'Management of functional stomach pain' },
    { intervention: 'irritable bowel syndrome', category: 'Lifestyle', tagline: 'Dietary management for IBS-related pain' },
    { intervention: 'abdominal cramping', category: 'OTC', tagline: 'Relief for stomach cramps' },
  ],
  swollen_lymph_nodes: [
    { intervention: 'lymph node swelling', category: 'Lifestyle', tagline: 'Care for swollen lymph nodes' },
    { intervention: 'reactive lymphadenopathy', category: 'Lifestyle', tagline: 'Management of reactive node enlargement' },
  ],
  teeth_grinding: [
    { intervention: 'temporomandibular disorder', category: 'Lifestyle', tagline: 'Treatment for jaw pain and grinding' },
    { intervention: 'occlusal splint bruxism', category: 'Lifestyle', tagline: 'Dental appliance for teeth grinding' },
    { intervention: 'myofascial pain temporomandibular', category: 'Lifestyle', tagline: 'Physical therapy for jaw pain' },
  ],
  ankle_pain: [
    { intervention: 'ankle pain', category: 'Lifestyle', tagline: 'Management of ankle pain' },
    { intervention: 'lateral ankle sprain', category: 'Lifestyle', tagline: 'Treatment for common ankle sprains' },
    { intervention: 'Achilles tendinopathy', category: 'Lifestyle', tagline: 'Exercise-based treatment for Achilles pain' },
  ],
  canker_sore: [
    { intervention: 'recurrent aphthous stomatitis', category: 'OTC', tagline: 'Treatment for recurring mouth ulcers' },
    { intervention: 'oral ulcer', category: 'OTC', tagline: 'Management of painful oral ulcers' },
    { intervention: 'mouth sore', category: 'OTC', tagline: 'Relief for painful mouth sores' },
  ],
  ear_pain: [
    { intervention: 'ear pain', category: 'OTC', tagline: 'Treatment options for earache' },
    { intervention: 'otitis externa', category: 'OTC', tagline: 'Treatment for swimmer\'s ear' },
    { intervention: 'eustachian tube dysfunction', category: 'Lifestyle', tagline: 'Management of middle ear pressure' },
  ],
  erectile_difficulty: [
    { intervention: 'erectile dysfunction', category: 'Prescription', tagline: 'Medical treatment for erectile dysfunction' },
    { intervention: 'vascular erectile dysfunction', category: 'Lifestyle', tagline: 'Lifestyle changes for erectile function' },
  ],
  frequent_urination: [
    { intervention: 'urinary frequency', category: 'Lifestyle', tagline: 'Management of frequent urination' },
    { intervention: 'nocturia', category: 'Lifestyle', tagline: 'Treatment for nighttime urination' },
    { intervention: 'urinary tract infection', category: 'OTC', tagline: 'Treatment for UTI-related frequency' },
  ],
  gum_pain: [
    { intervention: 'periodontitis', category: 'OTC', tagline: 'Treatment for gum disease' },
    { intervention: 'gingival inflammation', category: 'OTC', tagline: 'Management of gum inflammation' },
  ],
  minor_burn: [
    { intervention: 'thermal burn', category: 'OTC', tagline: 'First aid for heat burns' },
    { intervention: 'scald burn', category: 'OTC', tagline: 'Treatment for hot liquid burns' },
  ],
  prostate_issues: [
    { intervention: 'lower urinary tract symptoms', category: 'Prescription', tagline: 'Treatment for prostate-related urinary symptoms' },
    { intervention: 'chronic prostatitis', category: 'Prescription', tagline: 'Management of chronic prostate inflammation' },
  ],
};

async function discoverPubMed(intervention, condition) {
  const query = `(${intervention}[Title/Abstract]) AND (${condition}[Title/Abstract]) AND (systematic review[pt] OR meta-analysis[pt] OR randomized controlled trial[pt] OR clinical trial[pt] OR practice guideline[pt] OR observational study[pt] OR case series[pt] OR review[pt])`;
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

async function discoverGoogleScholar(intervention, condition) {
  if (!SCRAPINGBEE_API_KEY || SCRAPINGBEE_API_KEY.length < 10) return [];
  if (SCHOLAR_QUOTA.used >= SCHOLAR_QUOTA.total) return [];
  const query = `${intervention} ${condition} treatment review`;
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

const output = resolve('reports/round3-discovery.json');
const report = { generatedAt: new Date().toISOString(), round: 3, symptomCount: Object.keys(stubbornSymptoms).length, packets: [] };

for (const [symptomCode, interventions] of Object.entries(stubbornSymptoms)) {
  process.stdout.write(`Round 3 discovering ${symptomCode}...`);
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
console.log(`\nRound 3 discovery: ${totalCandidates} candidates across ${report.symptomCount} symptoms.`);
console.log(`Google Scholar quota used: ${SCHOLAR_QUOTA.used}/${SCHOLAR_QUOTA.total}`);
