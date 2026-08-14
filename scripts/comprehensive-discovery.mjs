#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const SCRAPINGBEE_API_KEY = process.env.SCRAPINGBEE_API_KEY || '';
const SCHOLAR_QUOTA = { total: 250, used: 0 };
const perSource = 5;
const timeoutMs = 15_000;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchJson(url, options = {}) {
  const response = await fetch(url, { ...options, redirect: 'follow', signal: AbortSignal.timeout(timeoutMs) });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.json();
}

const interventionsBySymptom = {
  gerd: [
    { intervention: 'proton pump inhibitor', category: 'OTC', tagline: 'Acid suppression for reflux symptoms' },
    { intervention: 'deglycyrrhizinated licorice', category: 'Herbal', tagline: 'A demulcent herbal option for mild reflux' },
    { intervention: 'melatonin', category: 'Supplement', tagline: 'A supplement studied for GERD symptom relief' },
  ],
  allergic_reaction: [
    { intervention: 'cetirizine', category: 'OTC', tagline: 'A second-generation antihistamine for allergic symptoms' },
    { intervention: 'quercetin', category: 'Supplement', tagline: 'A plant flavonoid studied for antihistamine effects' },
  ],
  anemia: [
    { intervention: 'ferrous sulfate', category: 'Supplement', tagline: 'Standard oral iron supplementation' },
    { intervention: 'vitamin C with iron', category: 'Supplement', tagline: 'Iron absorption enhancer' },
  ],
  asthma: [
    { intervention: 'inhaled corticosteroid', category: 'Prescription', tagline: 'First-line controller therapy for persistent asthma' },
    { intervention: 'omega-3 fatty acids asthma', category: 'Supplement', tagline: 'Anti-inflammatory supplement studied in asthma' },
  ],
  bruising: [
    { intervention: 'arnica montana', category: 'Herbal', tagline: 'A topical herbal remedy for bruising' },
    { intervention: 'vitamin K cream', category: 'Supplement', tagline: 'Topical vitamin K for bruise resolution' },
  ],
  burnout: [
    { intervention: 'mindfulness-based stress reduction', category: 'Lifestyle', tagline: 'A structured program for stress and burnout' },
    { intervention: 'coenzyme Q10', category: 'Supplement', tagline: 'A supplement studied for fatigue and burnout' },
  ],
  dry_mouth: [
    { intervention: 'xylitol', category: 'OTC', tagline: 'A sugar substitute that stimulates saliva' },
    { intervention: 'biotene', category: 'OTC', tagline: 'Commercial saliva substitute products' },
  ],
  elbow_pain: [
    { intervention: 'counterforce brace', category: 'Lifestyle', tagline: 'A brace for lateral epicondylitis pain relief' },
  ],
  endometriosis: [
    { intervention: 'laparoscopic excision surgery', category: 'Surgical', tagline: 'Surgical removal of endometriosis lesions' },
    { intervention: 'pelvic floor physical therapy', category: 'Lifestyle', tagline: 'Physical therapy for endometriosis-related pain' },
  ],
  eye_pain: [
    { intervention: 'artificial tears', category: 'OTC', tagline: 'Lubricating eye drops for dry-eye-related pain' },
  ],
  fever: [
    { intervention: 'ibuprofen', category: 'OTC', tagline: 'An NSAID for fever reduction' },
    { intervention: 'physical cooling measures', category: 'Lifestyle', tagline: 'External cooling for comfort during fever' },
  ],
  foot_pain: [
    { intervention: 'custom orthotic insole', category: 'Lifestyle', tagline: 'Arch support for foot pain relief' },
  ],
  gas: [
    { intervention: 'simethicone', category: 'OTC', tagline: 'An anti-flatulent for gas relief' },
    { intervention: 'activated charcoal', category: 'OTC', tagline: 'A supplement studied for intestinal gas' },
  ],
  hand_pain: [
    { intervention: 'wrist splint', category: 'Lifestyle', tagline: 'Immobilization for hand and wrist pain' },
  ],
  heartburn: [
    { intervention: 'calcium carbonate antacid', category: 'OTC', tagline: 'A rapid-acting antacid for heartburn' },
  ],
  hip_pain: [
    { intervention: 'gluteal strengthening exercises', category: 'Lifestyle', tagline: 'Targeted exercise for hip pain' },
  ],
  tmj_pain: [
    { intervention: 'occlusal splint', category: 'Lifestyle', tagline: 'A dental appliance for jaw pain relief' },
  ],
  kidney_stone: [
    { intervention: 'tamsulosin', category: 'Prescription', tagline: 'A medication to pass kidney stones' },
    { intervention: 'potassium citrate', category: 'Supplement', tagline: 'A urine alkalinizer for stone prevention' },
  ],
  leg_pain: [
    { intervention: 'compression stockings', category: 'Lifestyle', tagline: 'Graduated compression for leg pain and swelling' },
  ],
  loss_of_appetite: [
    { intervention: 'ginger', category: 'Herbal', tagline: 'An herbal remedy that may stimulate appetite' },
  ],
  muscle_pain: [
    { intervention: 'magnesium', category: 'Supplement', tagline: 'A mineral studied for muscle pain relief' },
  ],
  neuropathy: [
    { intervention: 'alpha-lipoic acid', category: 'Supplement', tagline: 'An antioxidant studied for neuropathic pain' },
  ],
  pms: [
    { intervention: 'calcium supplementation', category: 'Supplement', tagline: 'A mineral supplement for PMS symptom relief' },
    { intervention: 'chasteberry', category: 'Herbal', tagline: 'An herbal remedy for PMS symptoms' },
  ],
  psoriasis: [
    { intervention: 'vitamin D analogue', category: 'Prescription', tagline: 'Topical vitamin D for plaque psoriasis' },
  ],
  rosacea: [
    { intervention: 'metronidazole topical', category: 'Prescription', tagline: 'A topical antibiotic for rosacea' },
  ],
  sciatica: [
    { intervention: ' McKenzie method', category: 'Lifestyle', tagline: 'A physiotherapy approach for sciatica' },
  ],
  sinus_pressure: [
    { intervention: 'nasal saline irrigation', category: 'OTC', tagline: 'Saline rinse for sinus congestion relief' },
  ],
  sleep_apnea: [
    { intervention: 'continuous positive airway pressure', category: 'Lifestyle', tagline: 'Gold standard treatment for obstructive sleep apnea' },
  ],
  sprain: [
    { intervention: 'RICE protocol', category: 'Lifestyle', tagline: 'Rest, Ice, Compression, Elevation for sprains' },
  ],
  stomach_ache: [
    { intervention: 'peppermint oil', category: 'Herbal', tagline: 'An enteric-coated oil for abdominal pain' },
  ],
  swollen_lymph_nodes: [
    { intervention: 'warm compress', category: 'Lifestyle', tagline: 'A comfort measure for tender lymph nodes' },
  ],
  teeth_grinding: [
    { intervention: 'night guard', category: 'Lifestyle', tagline: 'A dental appliance for teeth grinding' },
  ],
  testicular_pain: [
    { intervention: 'scrotal support', category: 'Lifestyle', tagline: 'Supportive garment for testicular discomfort' },
  ],
  toothache: [
    { intervention: 'clove oil', category: 'Herbal', tagline: 'An herbal topical for toothache relief' },
  ],
  acne: [
    { intervention: 'benzoyl peroxide', category: 'OTC', tagline: 'A topical antimicrobial for acne' },
    { intervention: 'niacinamide', category: 'Supplement', tagline: 'A vitamin B3 derivative for acne-prone skin' },
  ],
  allergies: [
    { intervention: 'loratadine', category: 'OTC', tagline: 'A non-drowsy antihistamine for allergies' },
    { intervention: 'nasal corticosteroid spray', category: 'OTC', tagline: 'A nasal spray for allergy symptom control' },
  ],
  ankle_pain: [
    { intervention: 'ankle brace', category: 'Lifestyle', tagline: 'External support for ankle stability and pain' },
  ],
  arthritis: [
    { intervention: 'glucosamine', category: 'Supplement', tagline: 'A supplement studied for joint pain in arthritis' },
    { intervention: 'turmeric curcumin', category: 'Herbal', tagline: 'An anti-inflammatory spice studied in arthritis' },
  ],
  bad_breath: [
    { intervention: 'chlorhexidine mouthwash', category: 'OTC', tagline: 'An antibacterial rinse for halitosis' },
  ],
  breast_pain: [
    { intervention: 'evening primrose oil', category: 'Supplement', tagline: 'An herbal supplement for mastalgia' },
  ],
  canker_sore: [
    { intervention: 'amlexanox', category: 'OTC', tagline: 'A topical paste for aphthous ulcers' },
  ],
  constipation: [
    { intervention: 'polyethylene glycol', category: 'OTC', tagline: 'An osmotic laxative for constipation' },
    { intervention: 'psyllium husk', category: 'Supplement', tagline: 'A bulk-forming fiber supplement' },
  ],
  dehydration: [
    { intervention: 'oral rehydration solution', category: 'OTC', tagline: 'WHO-recommended rehydration salts' },
  ],
  ear_pain: [
    { intervention: 'over-the-counter ear drops', category: 'OTC', tagline: 'Analgesic ear drops for ear pain' },
  ],
  edema: [
    { intervention: 'leg elevation', category: 'Lifestyle', tagline: 'Positioning for dependent edema relief' },
    { intervention: 'compression therapy', category: 'Lifestyle', tagline: 'External compression for edema management' },
  ],
  erectile_difficulty: [
    { intervention: 'pelvic floor exercises', category: 'Lifestyle', tagline: 'Kegel exercises for erectile function' },
  ],
  frequent_urination: [
    { intervention: 'pelvic floor training', category: 'Lifestyle', tagline: 'Bladder training for urinary frequency' },
  ],
  fungal_infection: [
    { intervention: 'clotrimazole', category: 'OTC', tagline: 'A topical antifungal for skin infections' },
  ],
  gum_pain: [
    { intervention: 'salt water rinse', category: 'Lifestyle', tagline: 'A simple rinse for gum discomfort' },
  ],
  palpitations: [
    { intervention: 'magnesium supplementation', category: 'Supplement', tagline: 'A mineral for heart rhythm support' },
  ],
  hemorrhoids: [
    { intervention: 'witch hazel', category: 'Herbal', tagline: 'A topical astringent for hemorrhoid relief' },
    { intervention: 'stool softener', category: 'OTC', tagline: 'To reduce straining during bowel movements' },
  ],
  indigestion: [
    { intervention: 'ginger supplement', category: 'Herbal', tagline: 'An herbal remedy for dyspepsia' },
  ],
  joint_pain: [
    { intervention: 'collagen supplementation', category: 'Supplement', tagline: 'A structural protein supplement for joints' },
  ],
  knee_pain: [
    { intervention: 'quadriceps strengthening', category: 'Lifestyle', tagline: 'Targeted exercise for knee pain' },
  ],
  menopause: [
    { intervention: 'black cohosh', category: 'Herbal', tagline: 'An herbal remedy for menopausal symptoms' },
    { intervention: 'soy isoflavones', category: 'Supplement', tagline: 'Plant estrogens studied for menopause' },
  ],
  minor_burn: [
    { intervention: 'aloe vera gel', category: 'Herbal', tagline: 'A topical gel for minor burn comfort' },
  ],
  neck_pain: [
    { intervention: 'cervical pillow', category: 'Lifestyle', tagline: 'Supportive pillow for neck pain relief' },
  ],
  night_sweats: [
    { intervention: 'clonidine', category: 'Prescription', tagline: 'A medication studied for night sweats' },
  ],
  painful_intercourse: [
    { intervention: 'vaginal moisturizer', category: 'OTC', tagline: 'A moisturizer for vaginal dryness and discomfort' },
  ],
  prostate_issues: [
    { intervention: 'saw palmetto', category: 'Herbal', tagline: 'An herbal remedy for urinary symptoms in BPH' },
  ],
  sunburn: [
    { intervention: 'aloe vera topical', category: 'Herbal', tagline: 'A cooling gel for sunburn relief' },
  ],
  tinnitus: [
    { intervention: 'sound therapy', category: 'Lifestyle', tagline: 'Background sound for tinnitus habituation' },
  ],
  vertigo: [
    { intervention: 'Epley maneuver', category: 'Lifestyle', tagline: 'A repositioning maneuver for BPPV' },
  ],
  wrist_pain: [
    { intervention: 'wrist splint', category: 'Lifestyle', tagline: 'Immobilization for wrist pain relief' },
  ],
  yeast_infection: [
    { intervention: 'fluconazole oral', category: 'Prescription', tagline: 'An oral antifungal for vaginal candidiasis' },
    { intervention: 'probiotic lactobacillus', category: 'Supplement', tagline: 'Beneficial bacteria for yeast infection prevention' },
  ],
};

async function discoverPubMed(intervention, condition) {
  const query = `(${intervention}[Title/Abstract]) AND (${condition}[Title/Abstract]) AND (systematic review[pt] OR meta-analysis[pt] OR randomized controlled trial[pt] OR clinical trial[pt] OR practice guideline[pt])`;
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
  const query = `TITLE_ABS:"${intervention}" AND TITLE_ABS:"${condition}" AND (PUB_TYPE:"systematic review" OR PUB_TYPE:"meta-analysis" OR PUB_TYPE:"randomized controlled trial" OR PUB_TYPE:"practice guideline")`;
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
  const query = `${intervention} ${condition} clinical trial OR systematic review OR meta-analysis`;
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

const output = resolve('reports/comprehensive-discovery.json');
const report = { generatedAt: new Date().toISOString(), symptomCount: Object.keys(interventionsBySymptom).length, packets: [] };

for (const [symptomCode, interventions] of Object.entries(interventionsBySymptom)) {
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
console.log(`\nComprehensive discovery: ${totalCandidates} candidates across ${report.symptomCount} symptoms.`);
console.log(`Google Scholar quota used: ${SCHOLAR_QUOTA.used}/${SCHOLAR_QUOTA.total}`);
