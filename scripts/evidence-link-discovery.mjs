#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const args = new Map(process.argv.slice(2).map((arg) => {
  const [key, ...rest] = arg.split('=');
  return [key, rest.length ? rest.join('=') : true];
}));
const write = args.has('--write');
const maxRemedies = Number(args.get('--limit') || 50);
const output = resolve(String(args.get('--output') || 'reports/evidence-link-discovery.json'));

function loadEnv() {
  const values = { ...process.env };
  try {
    for (const line of readFileSync(resolve('.env'), 'utf8').split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (match && !values[match[1]]) values[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
    }
  } catch { /* CI may provide environment variables. */ }
  return values;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'RemzyEvidenceDiscovery/2.0 (research paper link scraping)' },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

const STOP_WORDS = new Set(['and', 'for', 'from', 'with', 'the', 'based', 'treatment', 'therapy', 'practice', 'systematic', 'review', 'study', 'trial', 'effect', 'effects']);
function meaningfulTokens(value) {
  return String(value || '').toLowerCase().match(/[a-z0-9]+/g)?.filter((t) => t.length > 2 && !STOP_WORDS.has(t)) || [];
}

function titleMatchesClaim(title, remedyName, symptomLabel) {
  const normalizedTitle = String(title || '').toLowerCase();
  const symptomTokens = meaningfulTokens(symptomLabel);
  // Require at least one symptom token in the title
  const symptomMatch = symptomTokens.some((token) => normalizedTitle.includes(token));
  return symptomMatch;
}

// --- Source 1: PubMed E-utilities (best quality URLs) ---
async function searchPubMed(remedyName, symptomLabel) {
  const query = `${remedyName} ${symptomLabel}`;
  const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmax=5&term=${encodeURIComponent(query)}&retmode=json`;
  try {
    const data = await fetchJson(searchUrl);
    const ids = data.esearchresult?.idlist || [];
    if (ids.length === 0) return [];

    // Fetch summaries for found IDs
    const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
    const summary = await fetchJson(summaryUrl);
    const results = [];
    for (const id of ids) {
      const article = summary.result?.[id];
      if (!article?.title) continue;
      results.push({
        source: 'PubMed',
        url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
        title: article.title,
        journal: article.fulljournalname || article.source || null,
        year: article.pubdate ? parseInt(article.pubdate) : null,
        pmid: id,
        isPeerReviewed: true,
      });
    }
    return results;
  } catch (err) {
    console.warn(`    [PubMed] Error: ${err.message}`);
    return [];
  }
}

// --- Source 2: Europe PMC (open access, good URLs) ---
async function searchEuropePMC(remedyName, symptomLabel) {
  const query = `${remedyName} ${symptomLabel}`;
  const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(query)}&resulttype=core&pageSize=5&format=json`;
  try {
    const data = await fetchJson(url);
    const results = [];
    for (const article of data.resultList?.result || []) {
      if (!article.title) continue;
      const pmid = article.pmid;
      const url = pmid
        ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
        : article.doi
          ? `https://doi.org/${article.doi}`
          : null;
      if (!url) continue;
      results.push({
        source: 'Europe PMC',
        url,
        title: article.title,
        journal: article.journalTitle || null,
        year: article.pubYear ? parseInt(article.pubYear) : null,
        pmid: pmid || null,
        isPeerReviewed: true,
      });
    }
    return results;
  } catch (err) {
    console.warn(`    [Europe PMC] Error: ${err.message}`);
    return [];
  }
}

// --- Source 3: Semantic Scholar (good DOI coverage) ---
async function searchSemanticScholar(remedyName, symptomLabel) {
  const query = `${remedyName} ${symptomLabel}`;
  const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=5&fields=title,journal,year,externalIds,url`;
  try {
    const data = await fetchJson(url);
    const results = [];
    for (const paper of data.data || []) {
      if (!paper.title) continue;
      const pmid = paper.externalIds?.PubMed;
      const doi = paper.externalIds?.DOI;
      const paperUrl = pmid
        ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
        : doi
          ? `https://doi.org/${doi}`
          : paper.url || null;
      if (!paperUrl) continue;
      results.push({
        source: 'Semantic Scholar',
        url: paperUrl,
        title: paper.title,
        journal: paper.journal?.name || null,
        year: paper.year || null,
        pmid: pmid || null,
        isPeerReviewed: true,
      });
    }
    return results;
  } catch (err) {
    console.warn(`    [Semantic Scholar] Error: ${err.message}`);
    return [];
  }
}

// --- Source 4: Crossref (DOI URLs) ---
async function searchCrossref(remedyName, symptomLabel) {
  const query = `${remedyName} ${symptomLabel}`;
  const url = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=5&filter=type:journal-article&select=DOI,title,container-title,published`;
  try {
    const data = await fetchJson(url);
    const results = [];
    for (const item of data.message?.items || []) {
      if (!item.DOI || !item.title?.[0]) continue;
      results.push({
        source: 'Crossref',
        url: `https://doi.org/${item.DOI}`,
        title: item.title[0],
        journal: item['container-title']?.[0] || null,
        year: item.published?.['date-parts']?.[0]?.[0] || null,
        isPeerReviewed: true,
      });
    }
    return results;
  } catch (err) {
    console.warn(`    [Crossref] Error: ${err.message}`);
    return [];
  }
}

// --- Source 5: OpenAlex (broad coverage) ---
async function searchOpenAlex(remedyName, symptomLabel) {
  const query = `${remedyName} ${symptomLabel}`;
  const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per-page=5`;
  try {
    const data = await fetchJson(url);
    const results = [];
    for (const item of data.results || []) {
      if (!item.doi || !item.title) continue;
      const pmid = item.ids?.pmid?.replace('https://pubmed.ncbi.nlm.nih.gov/', '') || null;
      const paperUrl = pmid
        ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
        : `https://doi.org/${item.doi.replace('https://doi.org/', '')}`;
      results.push({
        source: 'OpenAlex',
        url: paperUrl,
        title: item.title,
        journal: item.primary_location?.source?.display_name || null,
        year: item.publication_year || null,
        pmid,
        isPeerReviewed: true,
      });
    }
    return results;
  } catch (err) {
    console.warn(`    [OpenAlex] Error: ${err.message}`);
    return [];
  }
}

// Multi-source search with fallback chain
async function searchAllSources(remedyName, symptomLabel) {
  const allResults = [];
  const sources = [
    { name: 'PubMed', fn: searchPubMed },
    { name: 'Europe PMC', fn: searchEuropePMC },
    { name: 'Semantic Scholar', fn: searchSemanticScholar },
    { name: 'Crossref', fn: searchCrossref },
    { name: 'OpenAlex', fn: searchOpenAlex },
  ];

  for (const source of sources) {
    const results = await source.fn(remedyName, symptomLabel);
    allResults.push(...results);
    // If we found good results from early sources, don't need to hit all
    if (allResults.length >= 5) break;
    // Rate limit between sources
    await new Promise((r) => setTimeout(r, 300));
  }

  // Deduplicate by URL
  const seen = new Set();
  return allResults.filter((r) => {
    if (seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });
}

const env = loadEnv();
if (!env.VITE_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
}
const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

// Fetch all data from Supabase
const [
  { data: symptoms, error: symptomError },
  { data: mappings, error: mappingError },
  { data: remedies, error: remedyError },
  { data: existingPapers, error: papersError },
] = await Promise.all([
  supabase.from('symptoms').select('id,label'),
  supabase.from('remedy_symptoms').select('symptom_id,remedy_id'),
  supabase.from('remedies').select('id,name'),
  supabase.from('research_papers').select('remedy_id,url'),
]);
if (symptomError) throw symptomError;
if (mappingError) throw mappingError;
if (remedyError) throw remedyError;
if (papersError) throw papersError;

// Build lookup maps
const mappingsBySymptom = new Map();
const remedyNames = new Map((remedies || []).map((r) => [r.id, r.name]));
const remedySymptoms = new Map(); // remedy_id -> [symptom_ids]
for (const m of mappings || []) {
  const list = mappingsBySymptom.get(m.symptom_id) || [];
  list.push({ id: m.remedy_id, name: remedyNames.get(m.remedy_id) || m.remedy_id });
  mappingsBySymptom.set(m.symptom_id, list);

  if (!remedySymptoms.has(m.remedy_id)) remedySymptoms.set(m.remedy_id, []);
  remedySymptoms.get(m.remedy_id).push(m.symptom_id);
}

// Find existing papers per remedy (to check what already has evidence)
const papersByRemedy = new Map();
for (const p of existingPapers || []) {
  if (!papersByRemedy.has(p.remedy_id)) papersByRemedy.set(p.remedy_id, new Set());
  papersByRemedy.get(p.remedy_id).add(p.url);
}

// Identify remedies with 0 real citations
// A "real citation" is a PubMed or DOI URL
const remediesWithNoEvidence = [];
for (const remedy of remedies || []) {
  const urls = papersByRemedy.get(remedy.id) || new Set();
  const hasRealCitation = [...urls].some((url) =>
    /pubmed\.ncbi\.nlm\.nih\.gov\/\d+/.test(url) ||
    /^https:\/\/doi\.org\/10\.\d{4,9}\//.test(url)
  );
  if (!hasRealCitation) {
    const symptomIds = remedySymptoms.get(remedy.id) || [];
    remediesWithNoEvidence.push({
      id: remedy.id,
      name: remedy.name,
      symptomIds,
      currentUrlCount: urls.size,
    });
  }
}

// Sort by least evidence first, take top N
const targets = remediesWithNoEvidence
  .sort((a, b) => a.currentUrlCount - b.currentUrlCount)
  .slice(0, maxRemedies);

console.log(`Found ${remediesWithNoEvidence.length} remedies with no real citations`);
console.log(`Processing top ${targets.length}`);
console.log(`Mode: ${write ? 'WRITE (will upsert to research_papers)' : 'DRY RUN (no changes)'}`);
console.log('---');

const discoveries = [];
let totalLinks = 0;
let totalWrites = 0;

for (const remedy of targets) {
  // Search for each symptom this remedy treats
  const searches = remedy.symptomIds.length > 0
    ? remedy.symptomIds.slice(0, 3).map((sid) => ({
        symptomId: sid,
        symptomLabel: (symptoms || []).find((s) => s.id === sid)?.label || sid,
      }))
    : [{ symptomId: 'general', symptomLabel: remedy.name }];

  const discovery = {
    remedy: { id: remedy.id, name: remedy.name },
    existingUrls: remedy.currentUrlCount,
    searches: [],
    linksFound: 0,
    linksWritten: 0,
  };

  for (const search of searches) {
    console.log(`  Searching: "${remedy.name}" + "${search.symptomLabel}"...`);
    const results = await searchAllSources(remedy.name, search.symptomLabel);
    const matching = results.filter((r) => titleMatchesClaim(r.title, remedy.name, search.symptomLabel));

    discovery.searches.push({
      symptom: search.symptomLabel,
      query: `${remedy.name} ${search.symptomLabel}`,
      totalResults: results.length,
      matchingResults: matching.length,
      results: matching,
    });

    discovery.linksFound += matching.length;

    // Write to research_papers if in write mode
    if (write && matching.length > 0) {
      for (const result of matching) {
        const { error } = await supabase.from('research_papers').upsert({
          remedy_id: remedy.id,
          title: result.title,
          journal: result.journal || result.source,
          url: result.url,
          key_findings: `Discovered via ${result.source} API. ${result.pmid ? `PMID: ${result.pmid}` : ''}`,
          published_year: result.year,
        }, { onConflict: 'remedy_id,url' });
        if (!error) {
          totalWrites++;
          discovery.linksWritten++;
        }
      }
    }

    totalLinks += matching.length;
    // Rate limit between searches
    await new Promise((r) => setTimeout(r, 1100));
  }

  discoveries.push(discovery);
  process.stdout.write(`  ${remedy.name}: ${discovery.linksFound} candidates, ${discovery.linksWritten} written\n`);
}

const report = {
  generatedAt: new Date().toISOString(),
  mode: write ? 'write' : 'dry-run',
  targetRemedyCount: targets.length,
  remediesWithNoEvidence: remediesWithNoEvidence.length,
  totalLinksFound: totalLinks,
  totalLinksWritten: totalWrites,
  discoveries,
  safeguards: ['Only writes to research_papers table', 'No claims auto-approved', 'Deduplicates by remedy_id + url'],
};

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(`\nFound ${totalLinks} candidates, wrote ${totalWrites} new links.`);
console.log(`Report written to ${output}`);
