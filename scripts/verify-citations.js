#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { REMEDIES } from '../src/data/remedies.js';
import { LOCAL_REMEDIES } from '../src/data/localCatalog.js';
import { applyLegacyBatch1 } from '../src/data/legacyRemedyBatch1.js';
import { applyLegacyBatch2 } from '../src/data/legacyRemedyBatch2.js';
import { applyLegacyBatch3 } from '../src/data/legacyRemedyBatch3.js';
import { applyLegacyBatch4 } from '../src/data/legacyRemedyBatch4.js';
import { applyLegacyBatch5 } from '../src/data/legacyRemedyBatch5.js';

const args = new Map(process.argv.slice(2).map((arg) => {
  const [key, ...rest] = arg.replace(/^--/, '').split('=');
  return [key, rest.length ? rest.join('=') : true];
}));
const scope = args.get('scope') || 'runtime';
const skipHttp = args.has('no-http');
const timeoutMs = Number(args.get('timeout-ms') || 15000);
const delayMs = Number(args.get('delay-ms') || 350);
const output = args.get('output');

const forbidden = [
  [/^#$/i, 'placeholder URL'],
  [/\b(?:google\.)?com\/search(?:[/?]|$)/i, 'Google search results URL'],
  [/scholar\.google\.[^/]+\/scholar(?:[/?]|$)/i, 'Google Scholar search/results URL'],
  [/pubmed\.ncbi\.nlm\.nih\.gov\/(?:\?.*\bterm=|search(?:[/?]|$))/i, 'PubMed search URL'],
  [/webofscience\.com\/wos\/woscc\/(?:basic-search|search|summary)/i, 'Web of Science search URL'],
  [/[?&](?:q|query|term|as_q)=/i, 'search-query parameter'],
  [/(?:placeholder|example\.com|your-?url)/i, 'placeholder URL'],
];

function citationsOf(remedy) {
  const entries = [];
  for (const [field, values] of [['researchPapers', remedy.researchPapers], ['researchLinks', remedy.researchLinks]]) {
    for (const [index, value] of (Array.isArray(values) ? values : []).entries()) {
      entries.push({ field, index, url: value?.url, title: value?.title || value?.journal || value?.label || '' });
    }
  }
  if (remedy.googleScholarUrl) entries.push({ field: 'googleScholarUrl', index: 0, url: remedy.googleScholarUrl, title: '' });
  return entries;
}

function shapeError(rawUrl) {
  if (typeof rawUrl !== 'string' || !rawUrl.trim()) return 'missing URL';
  const url = rawUrl.trim();
  if (!/^https:\/\//i.test(url)) return 'URL must use HTTPS';
  for (const [pattern, reason] of forbidden) if (pattern.test(url)) return reason;
  if (/pubmed\.ncbi\.nlm\.nih\.gov/i.test(url) && !/^https:\/\/pubmed\.ncbi\.nlm\.nih\.gov\/\d+\/?$/i.test(url)) return 'PubMed URL is not a specific PMID';
  if (/doi\.org/i.test(url) && !/^https:\/\/doi\.org\/10\.\d{4,9}\/\S+$/i.test(url)) return 'DOI URL is not a specific DOI';
  if (/webofscience\.com/i.test(url) && !/\/wos\/woscc\/full-record\/[^/?#]+/i.test(url)) return 'Web of Science URL is not a full record';
  return null;
}

function genericDestination(rawUrl) {
  const url = new URL(rawUrl);
  if (forbidden.some(([pattern]) => pattern.test(rawUrl))) return true;
  const path = url.pathname.replace(/\/+$/, '');
  return path === '' || (/pubmed\.ncbi\.nlm\.nih\.gov$/i.test(url.hostname) && !/^\/\d+$/.test(path));
}

async function fetchChecked(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { redirect: 'follow', signal: controller.signal, headers: { 'user-agent': 'MedyRem-CitationGate/2.0 (+citation verification)' } });
    if (!response.ok) return `HTTP ${response.status}`;
    if (genericDestination(response.url)) return `redirected to generic/search page: ${response.url}`;
    return null;
  } catch (error) {
    return error.name === 'AbortError' ? `timeout after ${timeoutMs}ms` : `request failed: ${error.message}`;
  } finally { clearTimeout(timer); }
}

let remedies = scope === 'primary'
  ? REMEDIES.map((remedy) => ({ ...remedy, _source: 'primary' }))
  : [...REMEDIES.map((remedy) => ({ ...remedy, _source: 'primary' })), ...applyLegacyBatch5(applyLegacyBatch4(applyLegacyBatch3(applyLegacyBatch2(applyLegacyBatch1(LOCAL_REMEDIES))))).map((remedy) => ({ ...remedy, _source: 'localCatalog' }))]
    .filter((remedy, index, all) => all.findIndex((candidate) => candidate.id === remedy.id) === index);
if (args.get('ids')) {
  const ids = new Set(String(args.get('ids')).split(',').filter(Boolean));
  remedies = remedies.filter((remedy) => ids.has(remedy.id));
}

const details = [];
for (const remedy of remedies) {
  const citations = citationsOf(remedy);
  if (!citations.length) {
    const isLimited = remedy.evidenceTier === 'limited' && typeof remedy.evidenceNote === 'string' && remedy.evidenceNote.trim();
    details.push({ remedyId: remedy.id, remedyName: remedy.name, source: remedy._source, status: isLimited ? 'LIMITED' : 'FAIL', reason: isLimited ? remedy.evidenceNote : 'no citation (not explicitly labelled limited evidence)' });
    continue;
  }
  for (const citation of citations) {
    let reason = shapeError(citation.url);
    if (!reason && !skipHttp) reason = await fetchChecked(citation.url);
    details.push({ remedyId: remedy.id, remedyName: remedy.name, source: remedy._source, ...citation, status: reason ? 'FAIL' : 'PASS', reason: reason || null });
    if (!skipHttp) await new Promise((done) => setTimeout(done, delayMs));
  }
}

const report = {
  generatedAt: new Date().toISOString(), scope, httpVerified: !skipHttp,
  remedies: remedies.length, citations: details.filter((item) => item.url).length,
  passed: details.filter((item) => item.status === 'PASS').length,
  limited: details.filter((item) => item.status === 'LIMITED').length,
  failed: details.filter((item) => item.status === 'FAIL').length,
  details,
};
console.log(`Citation gate (${scope}): ${report.passed} cited, ${report.limited} limited-evidence, ${report.failed} failed across ${report.remedies} remedies.`);
for (const item of details) console.log(`${item.status}\t${item.remedyId}\t${item.url || '-'}\t${item.reason || 'verified'}`);
if (output) writeFileSync(resolve(String(output)), JSON.stringify(report, null, 2));
process.exitCode = report.failed ? 1 : 0;
