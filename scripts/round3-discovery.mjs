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
  brain_fog: [
    { intervention: 'cognitive training exercises', category: 'Lifestyle', tagline: 'Mental exercises for brain fog relief' },
    { intervention: 'omega-3 brain health', category: 'Supplement', tagline: 'Fatty acids for cognitive function' },
    { intervention: 'meditation for focus', category: 'Lifestyle', tagline: 'Mindfulness for mental clarity' },
    { intervention: 'vitamin B12 supplementation', category: 'Supplement', tagline: 'A vitamin for cognitive support' },
  ],
  eye_pain: [
    { intervention: 'dry eye treatment', category: 'OTC', tagline: 'Treatment for dry eye related pain' },
    { intervention: 'uveitis management', category: 'Prescription', tagline: 'Treatment for eye inflammation' },
    { intervention: 'glaucoma management', category: 'Prescription', tagline: 'Treatment for elevated eye pressure' },
  ],
  eye_strain: [
    { intervention: 'digital eye strain', category: 'Lifestyle', tagline: 'Management of computer vision syndrome' },
    { intervention: 'computer vision syndrome', category: 'Lifestyle', tagline: 'Treatment for screen-related eye strain' },
    { intervention: 'asthenopia treatment', category: 'Lifestyle', tagline: 'Treatment for eye fatigue' },
  ],
  ear_pain: [
    { intervention: 'otitis media', category: 'OTC', tagline: 'Treatment for middle ear infection' },
    { intervention: 'earache pain relief', category: 'OTC', tagline: 'Pain management for earache' },
    { intervention: 'ear infection treatment', category: 'OTC', tagline: 'Treatment for bacterial ear infection' },
  ],
  period_cramps: [
    { intervention: 'dysmenorrhea treatment', category: 'OTC', tagline: 'Treatment for painful menstruation' },
    { intervention: 'menstrual cramp relief', category: 'OTC', tagline: 'Pain management for period cramps' },
    { intervention: 'menstrual pain management', category: 'Lifestyle', tagline: 'Non-pharmaceutical pain relief' },
    { intervention: 'primary dysmenorrhea', category: 'OTC', tagline: 'Treatment for menstrual pain' },
  ],
  skin_rash: [
    { intervention: 'contact dermatitis treatment', category: 'OTC', tagline: 'Treatment for allergic skin reactions' },
    { intervention: 'rash treatment topical', category: 'OTC', tagline: 'Topical treatment for skin rashes' },
    { intervention: 'skin irritation relief', category: 'OTC', tagline: 'Relief for irritated skin' },
    { intervention: 'dermatitis management', category: 'OTC', tagline: 'Management of inflammatory skin conditions' },
  ],
  dry_skin: [
    { intervention: 'xerosis cutis treatment', category: 'OTC', tagline: 'Treatment for dry skin condition' },
    { intervention: 'skin moisturizing therapy', category: 'OTC', tagline: 'Moisturizing treatment for dry skin' },
    { intervention: 'keratosis treatment', category: 'OTC', tagline: 'Treatment for rough dry skin' },
  ],
  stomach_ache: [
    { intervention: 'functional abdominal pain', category: 'Lifestyle', tagline: 'Management of functional stomach pain' },
    { intervention: 'abdominal cramping relief', category: 'OTC', tagline: 'Relief for stomach cramps' },
    { intervention: 'gastric pain management', category: 'Lifestyle', tagline: 'Dietary management for stomach pain' },
  ],
  hangover: [
    { intervention: 'hangover prevention strategies', category: 'Lifestyle', tagline: 'Prevention strategies for hangover' },
    { intervention: 'alcohol recovery treatment', category: 'Lifestyle', tagline: 'Recovery treatment after alcohol consumption' },
    { intervention: 'hangover symptom relief', category: 'OTC', tagline: 'Symptom relief for hangover' },
    { intervention: 'alcohol detoxification support', category: 'Supplement', tagline: 'Support for alcohol metabolism' },
  ],
  canker_sore: [
    { intervention: 'aphthous ulcer treatment', category: 'OTC', tagline: 'Treatment for mouth ulcers' },
    { intervention: 'recurrent mouth ulcer', category: 'OTC', tagline: 'Management of recurring mouth sores' },
    { intervention: 'oral ulcer pain relief', category: 'OTC', tagline: 'Pain relief for mouth ulcers' },
  ],
  gum_pain: [
    { intervention: 'periodontitis treatment', category: 'OTC', tagline: 'Treatment for gum disease' },
    { intervention: 'gingivitis treatment', category: 'OTC', tagline: 'Treatment for gum inflammation' },
    { intervention: 'gum disease management', category: 'OTC', tagline: 'Management of periodontal disease' },
  ],
  cold_sore: [
    { intervention: 'herpes labialis treatment', category: 'OTC', tagline: 'Treatment for cold sores' },
    { intervention: 'oral herpes management', category: 'OTC', tagline: 'Management of oral herpes outbreaks' },
    { intervention: 'cold sore prevention', category: 'OTC', tagline: 'Prevention strategies for cold sores' },
  ],
  ankle_pain: [
    { intervention: 'ankle sprain recovery', category: 'Lifestyle', tagline: 'Recovery treatment for ankle sprains' },
    { intervention: 'lateral ankle pain', category: 'Lifestyle', tagline: 'Treatment for outer ankle pain' },
    { intervention: 'ankle tendinopathy', category: 'Lifestyle', tagline: 'Treatment for ankle tendon pain' },
  ],
  sunburn: [
    { intervention: 'sunburn treatment topical', category: 'OTC', tagline: 'Topical treatment for sunburn' },
    { intervention: 'UV burn treatment', category: 'OTC', tagline: 'Treatment for UV radiation burns' },
    { intervention: 'sunburn pain relief', category: 'OTC', tagline: 'Pain relief for sunburn' },
    { intervention: 'sunburn skin care', category: 'OTC', tagline: 'Skin care for sunburn recovery' },
  ],
  teeth_grinding: [
    { intervention: 'bruxism treatment', category: 'Lifestyle', tagline: 'Treatment for teeth grinding' },
    { intervention: 'nocturnal bruxism', category: 'Lifestyle', tagline: 'Nighttime teeth grinding treatment' },
    { intervention: 'dental grinding management', category: 'Lifestyle', tagline: 'Management of dental grinding' },
  ],
  poor_circulation: [
    { intervention: 'peripheral vascular disease', category: 'Lifestyle', tagline: 'Treatment for poor circulation' },
    { intervention: 'circulatory improvement', category: 'Lifestyle', tagline: 'Improving blood circulation' },
    { intervention: 'blood flow enhancement', category: 'Lifestyle', tagline: 'Enhancing blood flow naturally' },
  ],
  chills: [
    { intervention: 'chills treatment', category: 'Lifestyle', tagline: 'Treatment for chills without fever' },
    { intervention: 'cold sensation management', category: 'Lifestyle', tagline: 'Management of abnormal cold sensation' },
    { intervention: 'rigor treatment', category: 'Lifestyle', tagline: 'Treatment for shivering and chills' },
  ],
  swollen_lymph_nodes: [
    { intervention: 'lymphadenopathy treatment', category: 'Lifestyle', tagline: 'Treatment for swollen lymph nodes' },
    { intervention: 'reactive lymph node swelling', category: 'Lifestyle', tagline: 'Management of reactive lymphadenopathy' },
    { intervention: 'glandular swelling treatment', category: 'Lifestyle', tagline: 'Treatment for swollen glands' },
  ],
  low_libido: [
    { intervention: 'sexual desire disorder', category: 'Lifestyle', tagline: 'Management of low sexual desire' },
    { intervention: 'libido enhancement', category: 'Lifestyle', tagline: 'Strategies for libido improvement' },
    { intervention: 'hyposexual desire treatment', category: 'Lifestyle', tagline: 'Treatment for reduced sexual desire' },
  ],
  erectile_difficulty: [
    { intervention: 'erectile dysfunction treatment', category: 'Prescription', tagline: 'Treatment for erectile dysfunction' },
    { intervention: 'male sexual dysfunction', category: 'Prescription', tagline: 'Management of male sexual dysfunction' },
    { intervention: 'ED natural remedies', category: 'Lifestyle', tagline: 'Natural remedies for erectile function' },
  ],
  insect_bite: [
    { intervention: 'insect bite treatment', category: 'OTC', tagline: 'Treatment for insect bites' },
    { intervention: 'mosquito bite relief', category: 'OTC', tagline: 'Relief for mosquito bites' },
    { intervention: 'bug bite treatment', category: 'OTC', tagline: 'Treatment for bug bites and stings' },
  ],
  minor_burn: [
    { intervention: 'first degree burn treatment', category: 'OTC', tagline: 'Treatment for first degree burns' },
    { intervention: 'thermal burn first aid', category: 'OTC', tagline: 'First aid for thermal burns' },
    { intervention: 'burn wound care', category: 'OTC', tagline: 'Wound care for minor burns' },
  ],
  yeast_infection: [
    { intervention: 'candidiasis treatment', category: 'OTC', tagline: 'Treatment for yeast infections' },
    { intervention: 'vaginal candidiasis', category: 'OTC', tagline: 'Treatment for vaginal yeast infection' },
    { intervention: 'antifungal treatment', category: 'OTC', tagline: 'Antifungal treatment for candidiasis' },
  ],
  prostate_issues: [
    { intervention: 'benign prostatic hyperplasia', category: 'Prescription', tagline: 'Treatment for enlarged prostate' },
    { intervention: 'prostatitis treatment', category: 'Prescription', tagline: 'Treatment for prostate inflammation' },
    { intervention: 'prostate health management', category: 'Lifestyle', tagline: 'Management of prostate health' },
  ],
  testicular_pain: [
    { intervention: 'testicular pain relief', category: 'Lifestyle', tagline: 'Relief for testicular discomfort' },
    { intervention: 'scrotal pain management', category: 'Lifestyle', tagline: 'Management of scrotal pain' },
    { intervention: 'orchitis treatment', category: 'Lifestyle', tagline: 'Treatment for testicular inflammation' },
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
