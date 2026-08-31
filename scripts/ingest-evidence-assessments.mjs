#!/usr/bin/env node
// One-time backfill: propagate the human-reviewed assessments in
// src/data/evidenceAssessments.js into the Supabase evidence read model
// (evidence_claims / evidence_publications / evidence_claim_publications) so the
// approved_remedy_evidence view is populated.
//
// Guardrails:
//   - Only entries already marked reviewStatus: 'approved' are written.
//   - No field is invented. Anything that cannot be mapped from the assessment
//     registry is flagged and skipped (or set to the column's declared default,
//     which means "no data").
//   - Publication titles/journals/years are only taken from authentic sources:
//     the in-repo GENERATED_EVIDENCE_METADATA registry, NCBI eutils (PMID),
//     Crossref (Cochrane DOI), or the live page title of NICE guidance pages.
//     URLs with no authentic title (CKS is geo-blocked, WHO/CDC pages are
//     JS-rendered) are flagged and their claim simply links fewer publications.
//   - All ids are deterministic (claim keys, UUIDv5 from a canonical identity)
//     and every insert is an upsert, so re-running converges.
//
// Usage:
//   node scripts/ingest-evidence-assessments.mjs                    plan + report, no writes
//   node scripts/ingest-evidence-assessments.mjs --emit-sql out.sql standalone idempotent SQL
//   SUPABASE_SERVICE_ROLE_KEY=... node scripts/ingest-evidence-assessments.mjs --apply
//   node scripts/ingest-evidence-assessments.mjs --offline          offline: cached resolutions only
//   node scripts/ingest-evidence-assessments.mjs --refresh          re-fetch all resolution metadata

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { EVIDENCE_ASSESSMENTS } from '../src/data/evidenceAssessments.js';
import { GENERATED_EVIDENCE_METADATA } from '../src/data/generatedEvidenceMetadata.js';
import { createClient } from '@supabase/supabase-js';

const argv = process.argv.slice(2);
const APPLY = argv.includes('--apply');
const OFFLINE = argv.includes('--offline');
const REFRESH = argv.includes('--refresh');
const emitSql = argv.includes('--emit-sql') ? argv[argv.indexOf('--emit-sql') + 1] : null;

// ---------------------------------------------------------------------------
// Env / credentials
// ---------------------------------------------------------------------------

function loadEnv(path) {
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

const env = { ...process.env, ...loadEnv('.env.local') };
const SUPABASE_URL = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const ANON_KEY = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !ANON_KEY) {
  console.error('SUPABASE_URL / ANON_KEY missing (expected in .env.local)');
  process.exit(1);
}
if (APPLY && !SERVICE_KEY) {
  console.error('--apply requires SUPABASE_SERVICE_ROLE_KEY (not present in .env.local or env)');
  process.exit(1);
}
const anon = createClient(SUPABASE_URL, ANON_KEY);
const admin = SERVICE_KEY ? createClient(SUPABASE_URL, SERVICE_KEY) : null;

// ---------------------------------------------------------------------------
// Deterministic UUIDv5 (DNS namespace) so publication ids are stable per source
// ---------------------------------------------------------------------------

const NS = Buffer.from('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'hex');
function uuid5(name) {
  const h = createHash('sha1').update(NS).update(String(name)).digest();
  h[6] = (h[6] & 0x0f) | 0x50;
  h[8] = (h[8] & 0x3f) | 0x80;
  const b = h.subarray(0, 16).toString('hex');
  return `${b.slice(0, 8)}-${b.slice(8, 12)}-${b.slice(12, 16)}-${b.slice(16, 20)}-${b.slice(20, 32)}`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Politeness pacer: never hit public APIs (NCBI/Crossref) more often than ~3/s.
let _lastReq = 0;
async function paced() {
  const since = Date.now() - _lastReq;
  if (since < 350) await sleep(350 - since);
  _lastReq = Date.now();
}

async function fetchJson(url, { timeout = 15000 } = {}) {
  await paced();
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeout);
  try {
    const res = await fetch(url, { signal: ctl.signal, headers: { 'User-Agent': 'Remzy-evidence-backfill/1.0 (mailto:admin@remzy.test)' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await race(() => res.json(), timeout);
  } finally {
    clearTimeout(t);
  }
}

async function fetchText(url) {
  await paced();
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 15000);
  try {
    const res = await fetch(url, {
      signal: ctl.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36' },
      redirect: 'follow',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await race(() => res.text(), 15000);
  } finally {
    clearTimeout(t);
  }
}

function race(fn, timeout) {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new Error('fetch timed out')), timeout);
    fn().then((v) => { clearTimeout(id); resolve(v); }, (e) => { clearTimeout(id); reject(e); });
  });
}

const canonicalUrl = (u) => (u || '').trim().replace(/\/+$/, '');
const decodeHtml = (s) =>
  s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;|&#39;/g, "'").replace(/&nbsp;/g, ' ');

const extractPmid = (src) => {
  if (/^pmid:(\d+)$/.test(src.publicationId || '')) return src.publicationId.match(/^pmid:(\d+)$/)[1];
  if (/^epmc:(\d+)$/.test(src.publicationId || '')) return src.publicationId.match(/^epmc:(\d+)$/)[1];
  const du = canonicalUrl(src.url || '').replace(/^https?:/i, '');
  const m = du.match(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)\/?$/);
  return m ? m[1] : null;
};

const extractCochraneCd = (url) => {
  const m = (canonicalUrl(url) || '').match(/cochrane\.org\/(?:evidence\/)?CD(\d{5,7})/i);
  return m ? `CD${m[1]}` : null;
};

const extractNiceGuidance = (url) => {
  const m = (canonicalUrl(url) || '').match(/nice\.org\.uk\/guidance\/([a-z]{1,3}\d{3})/i);
  return m ? m[1].toLowerCase() : null;
};

// ---------------------------------------------------------------------------
// Publication metadata resolution (authentic sources only)
// ---------------------------------------------------------------------------

const RESOLVED_CACHE = 'reports/evidence-backfill-resolved.json';
const RESOLUTION_PRIORITY = { 'generated-metadata': 4, crossref: 3, pubmed: 3, 'page-title': 2 };

function loadResolutionCache() {
  if (!REFRESH && existsSync(RESOLVED_CACHE)) {
    try {
      return new Map(Object.entries(JSON.parse(readFileSync(RESOLVED_CACHE, 'utf8'))));
    } catch {
      /* fall through to empty */
    }
  }
  return new Map();
}

function resolveFromGeneratedMeta(url) {
  const e = GENERATED_EVIDENCE_METADATA && GENERATED_EVIDENCE_METADATA[url];
  if (!e) return null;
  const year = Number(e.year);
  return {
    title: e.title,
    journal: e.journal || null,
    publication_year: Number.isInteger(year) && year >= 1800 && year <= 2200 ? year : null,
    source_database: e.sourceDatabase || null,
    source_organization: e.sourceOrganization || null,
    resolvedFrom: 'generated-metadata',
  };
}

async function resolveFromPubMed(pmid) {
  const j = await fetchJson(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pmid}&retmode=json`);
  const rows = j.result && j.result.uids;
  if (!rows || !rows[0]) return null;
  const r = j.result[rows[0]];
  const y = parseInt((r.pubdate || r.epubdate || '').slice(0, 4), 10);
  return {
    title: r.title,
    journal: r.fulljournalname || r.source || null,
    publication_year: Number.isInteger(y) && y >= 1800 && y <= 2200 ? y : null,
    pmid,
    source_database: 'PubMed',
    resolvedFrom: 'pubmed',
  };
}

async function resolveFromCrossref(cd) {
  const doi = `10.1002/14651858.${cd}`.toLowerCase();
  const j = await fetchJson(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
  const m = j.message;
  if (!m) return null;
  const y = m.issued && m.issued['date-parts'] && m.issued['date-parts'][0] && m.issued['date-parts'][0][0];
  const year = Number(y);
  return {
    title: (m.title && m.title[0]) || null,
    journal: (m['container-title'] && m['container-title'][0]) || null,
    publication_year: Number.isInteger(year) && year >= 1800 && year <= 2200 ? year : null,
    doi: (m.DOI || doi).toLowerCase(),
    source_database: 'Cochrane Library',
    resolvedFrom: 'crossref',
  };
}

async function resolveFromPageTitle(url, niceId) {
  const html = await fetchText(url);
  const m = html.match(/<title[^>]*>([^<]{5,200})<\/title>/i);
  if (!m) return null;
  let t = decodeHtml(m[1]).replace(/\s+/g, ' ').trim();
  t = t.replace(/\s*\|\s*Guidance\s*(\|\s*NICE)?$/i, '').replace(/\s*\|\s*NICE$/i, '').replace(/^Overview\s*\|\s*/i, '');
  if (!t || t.length < 5 || /^404|page not found/i.test(t)) return null;
  return { title: t, journal: null, publication_year: null, guideline_id: niceId, source_database: 'NICE', resolvedFrom: 'page-title' };
}

async function resolveSource(src, offline) {
  const url = canonicalUrl(src.url || '');
  const fromMeta = resolveFromGeneratedMeta(url);
  if (fromMeta) return fromMeta;
  if (offline) return null;

  const pmid = extractPmid(src);
  const cd = extractCochraneCd(url);
  const niceId = extractNiceGuidance(url);
  if (!pmid && !cd && !niceId) {
    return { __error: 'unsupported source host (CKS geo-blocked / WHO / CDC / unknown); no authentic title endpoint' };
  }

  const plan = async () => {
    if (pmid) return resolveFromPubMed(pmid);
    if (cd) return resolveFromCrossref(cd);
    return resolveFromPageTitle(url, niceId);
  };

  let lastErr = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt) await sleep(1500 * attempt);
    try {
      const r = await plan();
      if (r) return r;
    } catch (e) {
      lastErr = e;
    }
  }
  return { __error: lastErr ? `fetch failed (${lastErr.message})` : 'resolver returned no title' };
}

// ---------------------------------------------------------------------------
// ENUM validators (validate what comes from the registry; default otherwise)
// ---------------------------------------------------------------------------

const EV_TYPES = new Set(['guideline', 'systematic-review', 'meta-analysis', 'randomized-trial', 'non-randomized-study', 'safety-guidance', 'traditional-literature', 'other']);
const CERTAINTY = new Set(['high', 'moderate', 'low', 'very-low', 'unrated']);
const RISK = new Set(['low', 'some-concerns', 'high', 'critical', 'not-applicable', 'unassessed']);
const BENEFIT = new Set(['benefit', 'safety', 'both']);
const APPLICABILITY = new Set(['exact', 'mostly-applicable', 'indirect', 'mismatch', 'unassessed']);

const pick = (v, set, fallback, flags, target, key) => {
  if (v !== undefined && v !== null && set.has(v)) return v;
  if (v !== undefined && v !== null) flags.push({ target, field: key, reason: `'${v}' is not a valid enum value; left at '${fallback}'` });
  return fallback;
};

// ---------------------------------------------------------------------------
// Build the payloads
// ---------------------------------------------------------------------------

async function buildPayload() {
  let fk;
  try {
    const [r, s] = await Promise.all([anon.from('remedies').select('id'), anon.from('symptoms').select('id')]);
    if (r.error) throw new Error(r.error.message);
    if (s.error) throw new Error(s.error.message);
    fk = { remedies: new Set((r.data || []).map((x) => x.id)), symptoms: new Set((s.data || []).map((x) => x.id)) };
  } catch (e) {
    console.warn(`[warn] could not read remedies/symptoms from Supabase (${e.message}); assuming all ids valid`);
    fk = null;
  }

  const flags = [];
  const claims = [];
  const links = [];
  const blocked = [];
  const unlinkable = [{ url: null, reason: null }];
  unlinkable.length = 0;

  // 1) Resolve every distinct source URL to one publication (deduped by identity).
  const cache = loadResolutionCache();
  const distinct = new Map();
  for (const k of Object.keys(EVIDENCE_ASSESSMENTS)) {
    for (const s of EVIDENCE_ASSESSMENTS[k].sources || []) distinct.set(canonicalUrl(s.url || ''), s);
  }

  const pubsByIdentity = new Map();
  const unresolved = new Map(); // url -> reason

  let n = 0;
  for (const [url, src] of distinct) {
    n++;
    if (n % 10 === 0) console.log(`[resolving] ${n}/${distinct.size}…`);
    const pmid = extractPmid(src);
    const cd = extractCochraneCd(url);
    const identity = pmid ? `pmid:${pmid}` : cd ? `doi:10.1002/14651858.${cd}` : `url:${url}`;

    const cached = cache.get(identity);
    const meta = cached
      ? {
          title: cached.title,
          journal: cached.journal,
          publication_year: cached.publication_year,
          doi: cached.doi,
          pmid: cached.pmid,
          guideline_id: cached.guideline_id,
          source_database: cached.source_database,
          resolvedFrom: cached.metadata && cached.metadata.resolvedTitleSource,
        }
      : await resolveSource(src, OFFLINE);

    if (!meta || !meta.title) {
      const detail = !meta ? 'unsupported' : meta.__error ? `fetch failed (${meta.__error})` : `${meta.resolvedFrom || 'no-title-source'} resolved empty`;
      const reason = OFFLINE ? 'no cached resolution (offline)' : `no authentic title available (${detail}; CKS geo-blocked, WHO/CDC JS-rendered, or unknown)`;
      if (!unresolved.has(url)) unresolved.set(url, reason);
      continue;
    }

    const cand = {
      id: uuid5(identity),
      canonical_key: identity,
      pmid: meta.pmid || pmid || null,
      doi: meta.doi || null,
      guideline_id: meta.guideline_id || null,
      title: meta.title,
      journal: meta.journal || null,
      publication_year: meta.publication_year ?? null,
      canonical_url: url,
      source_database: meta.source_database || null,
      source_organization: src.organization || null,
      publisher: null,
      evidence_type: pick(src.evidenceType, EV_TYPES, 'other', flags, url, 'evidenceType'),
      verification_status: 'metadata-verified',
      metadata: { resolvedTitleSource: meta.resolvedFrom || 'cache', provenance: 'evidence-assessments-backfill' },
    };

    const prior = pubsByIdentity.get(identity);
    if (!prior || RESOLUTION_PRIORITY[meta.resolvedFrom] > (RESOLUTION_PRIORITY[prior.metadata.resolvedTitleSource] || 0)) {
      pubsByIdentity.set(identity, cand);
    }
  }

  // 2) Build claims + links.
  for (const k of Object.keys(EVIDENCE_ASSESSMENTS)) {
    const [remedyId, symptomId] = k.split('__');
    const a = EVIDENCE_ASSESSMENTS[k];

    if (a.reviewStatus !== 'approved') {
      flags.push({ target: k, field: 'reviewStatus', reason: `'${a.reviewStatus}' is not 'approved'; skipped` });
      continue;
    }

    const remedyOk = !fk || fk.remedies.has(remedyId);
    const symptomOk = !fk || fk.symptoms.has(symptomId);
    if (!remedyOk || !symptomOk) {
      blocked.push({
        claimId: k,
        remedyId,
        symptomId,
        missing: [!remedyOk ? `remedy '${remedyId}'` : null, !symptomOk ? `symptom '${symptomId}'` : null].filter(Boolean),
      });
      continue;
    }

    const claim = {
      id: k,
      remedy_id: remedyId,
      symptom_id: symptomId,
      claim_text: a.claimText,
      population: JSON.stringify(a.population || {}),
      intervention: JSON.stringify(a.intervention || {}),
      comparators: '[]',
      outcomes: JSON.stringify(Array.isArray(a.outcomes) ? a.outcomes : [a.outcomes].filter(Boolean)),
      certainty: pick(a.certainty, CERTAINTY, 'unrated', flags, k, 'certainty'),
      recommendation_status: 'pending-review',
      review_status: 'approved',
      safety_reviewed: !!a.safetyReviewed,
      reviewed_by: null,
      second_reviewer: null,
      reviewed_at: a.reviewedAt || null,
      approved_at: a.reviewedAt || null,
      next_review_at: null,
      limitations: '{}',
    };
    flags.push(
      { target: k, field: 'recommendation_status', reason: 'not recorded in registry; left at schema default pending-review (needs human decision)' },
      { target: k, field: 'reviewed_by / second_reviewer', reason: 'registry stores a reviewer label, not a users.uuid; left NULL' },
      { target: k, field: 'approved_at', reason: 'derived from reviewedAt (registry records approval at review date); NULL when reviewedAt missing' },
      { target: k, field: 'comparators / limitations / next_review_at', reason: 'not recorded in registry; left at defaults/NULL' },
      { target: k, field: 'effect_summary', reason: 'not recorded in registry; left at {}' }
    );
    if (!a.reviewedAt) flags.push({ target: k, field: 'approved_at', reason: 'reviewedAt missing — claim written but will NOT surface in approved_remedy_evidence' });

    claims.push(claim);

    const sweepLinks = [];
    for (const s of a.sources || []) {
      const url = canonicalUrl(s.url || '');
      const pmid = extractPmid(s);
      const cd = extractCochraneCd(url);
      const identity = pmid ? `pmid:${pmid}` : cd ? `doi:10.1002/14651858.${cd}` : `url:${url}`;
      const pub = pubsByIdentity.get(identity);
      if (!pub) {
        unlinkable.push({ claimId: k, url, reason: unresolved.get(url) || 'publication could not be linked' });
        continue;
      }
      sweepLinks.push({
        claim_id: k,
        publication_id: pub.id,
        population_match: 'unassessed',
        intervention_match: 'unassessed',
        outcome_match: 'unassessed',
        overall_applicability: pick(s.applicability, APPLICABILITY, 'unassessed', flags, url, 'applicability'),
        benefit_or_safety: pick(s.benefitOrSafety, BENEFIT, 'benefit', flags, url, 'benefitOrSafety'),
        risk_of_bias_tool: null,
        risk_of_bias: pick(s.riskOfBias, RISK, 'unassessed', flags, url, 'riskOfBias'),
        review_note: s.reviewNote || null,
        effect_summary: '{}',
        included: true,
      });
    }
    flags.push({ target: k, field: 'evidence_claim_publications.included=true', reason: 'derived: sources of an approved claim are the reviewed evidence set' });
    links.push(...sweepLinks);
  }

  const linkedClaims = new Set(links.map((l) => l.claim_id));
  const surfacing = claims.filter((c) => linkedClaims.has(c.id) && c.approved_at);

  return {
    claims,
    links,
    pubs: [...pubsByIdentity.values()],
    blocked,
    unlinkable,
    flags,
    surfacing: surfacing.map((c) => c.id),
    fkUnknown: !fk,
  };
}

// ---------------------------------------------------------------------------
// SQL emission (standalone idempotent script for the Supabase SQL editor)
// ---------------------------------------------------------------------------

const q = (s) => String(s ?? '').replace(/'/g, "''");

function jsonb(v) {
  try {
    JSON.parse(v);
    return `'${q(v)}'::jsonb`;
  } catch {
    return "'{}'::jsonb";
  }
}

function buildSql(payload) {
  const rows = [];
  for (const p of payload.pubs) {
    rows.push(`insert into public.evidence_publications (id, canonical_key, pmid, doi, guideline_id, title, journal, publication_year, canonical_url, source_database, source_organization, evidence_type, verification_status, metadata) values ('${p.id}', '${q(p.canonical_key)}', ${p.pmid ? `'${q(p.pmid)}'` : 'null'}, ${p.doi ? `'${q(p.doi)}'` : 'null'}, ${p.guideline_id ? `'${q(p.guideline_id)}'` : 'null'}, '${q(p.title)}', ${p.journal ? `'${q(p.journal)}'` : 'null'}, ${p.publication_year ?? 'null'}, '${q(p.canonical_url)}', ${p.source_database ? `'${q(p.source_database)}'` : 'null'}, '${q(p.source_organization)}', '${q(p.evidence_type)}', 'metadata-verified', '${q(JSON.stringify(p.metadata))}'::jsonb) on conflict (id) do update set title = excluded.title, journal = excluded.journal, publication_year = excluded.publication_year, pmid = coalesce(publications.pmid, excluded.pmid), doi = coalesce(publications.doi, excluded.doi), verification_status = 'metadata-verified';`);
  }
  for (const c of payload.claims) {
    rows.push(`insert into public.evidence_claims (id, remedy_id, symptom_id, claim_text, population, intervention, outcomes, certainty, safety_reviewed, reviewed_at, approved_at, review_status) values ('${q(c.id)}', '${q(c.remedy_id)}', '${q(c.symptom_id)}', '${q(c.claim_text)}', ${jsonb(c.population)}, ${jsonb(c.intervention)}, ${jsonb(c.outcomes)}, '${q(c.certainty)}', ${c.safety_reviewed}, ${c.reviewed_at ? `'${c.reviewed_at}'` : 'null'}, ${c.approved_at ? `'${c.approved_at}'` : 'null'}, 'approved') on conflict (id) do update set claim_text = excluded.claim_text, population = excluded.population, intervention = excluded.intervention, outcomes = excluded.outcomes, certainty = excluded.certainty, safety_reviewed = excluded.safety_reviewed, reviewed_at = excluded.reviewed_at, approved_at = excluded.approved_at, review_status = 'approved';`);
  }
  for (const l of payload.links) {
    rows.push(`insert into public.evidence_claim_publications (claim_id, publication_id, population_match, intervention_match, outcome_match, overall_applicability, benefit_or_safety, risk_of_bias, review_note, included) values ('${q(l.claim_id)}', '${l.publication_id}', 'unassessed', 'unassessed', 'unassessed', '${q(l.overall_applicability)}', '${q(l.benefit_or_safety)}', '${q(l.risk_of_bias)}', ${l.review_note ? `'${q(l.review_note)}'` : 'null'}, true) on conflict (claim_id, publication_id) do update set overall_applicability = excluded.overall_applicability, benefit_or_safety = excluded.benefit_or_safety, risk_of_bias = excluded.risk_of_bias, review_note = excluded.review_note, included = true;`);
  }
  return `begin;\n${rows.join('\n')}\ncommit;`;
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

function printReport(payload) {
  const linkCountByClaim = new Map();
  for (const l of payload.links) linkCountByClaim.set(l.claim_id, (linkCountByClaim.get(l.claim_id) || 0) + 1);
  const zeroLink = payload.claims.filter((c) => !linkCountByClaim.has(c.id));

  console.log('\n================ EVIDENCE BACKFILL REPORT ================\n');
  console.log(`registry claims (approved):          ${payload.claims.length + payload.blocked.length}`);
  console.log(`  → claims written:                  ${payload.claims.length}`);
  console.log(`  → FK-blocked (no remedy/symptom):  ${payload.blocked.length}`);
  console.log(`publications ingested:               ${payload.pubs.length}`);
  console.log(`claim→publication links:             ${payload.links.length}`);
  console.log(`claims surfacing in view:            ${payload.surfacing.length}`);
  console.log(`  → written claims with 0 links:     ${zeroLink.length}`);
  if (payload.fkUnknown) console.log('  (remedy/symptom sets could not be read from Supabase; FK checks skipped)');

  if (payload.blocked.length) {
    console.log('\n--- FK-blocked claims (skipped; align the catalog or re-key after creating rows) ---');
    for (const b of payload.blocked.slice(0, 40)) console.log(`  ${b.claimId}  missing: ${b.missing.join(', ')}`);
    if (payload.blocked.length > 40) console.log(`  … +${payload.blocked.length - 40} more`);
  }

  if (payload.unlinkable.length) {
    console.log('\n--- Source URLs without authentic publication metadata (claim still approved; no link) ---');
    const byReason = new Map();
    for (const u of payload.unlinkable) byReason.set(u.reason, (byReason.get(u.reason) || 0) + 1);
    for (const [reason, cnt] of byReason) console.log(`  ${cnt}×  ${reason}`);
    const sample = [...new Set(payload.unlinkable.map((u) => u.url))].slice(0, 12);
    for (const u of sample) console.log(`      e.g. ${u}`);
  }

  console.log('\n--- Unmapped / derived fields (flagged per guardrails, not fabricated) ---');
  const grouped = new Map();
  for (const f of payload.flags) {
    const key = f.field || 'general';
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(f);
  }
  for (const [field, list] of grouped) {
    const reasons = new Set(list.map((x) => x.reason));
    console.log(`  ${field}: ${list.length}×  [${[...reasons].join('; ')}]`);
  }

  console.log('\n--- IDEMPOTENCY ---');
  console.log('  deterministic ids (claim keys; UUIDv5 of pmid/doi/url) + upserts ⇒ re-running converges');
  console.log('  evidence_reviews is NOT written: reviewer_id (NOT NULL, refs users) has no real user uuid.\n');
  console.log('=============================================================');
}

// ---------------------------------------------------------------------------
// Modes
// ---------------------------------------------------------------------------

async function apply(payload) {
  const batch = async (rows, table, onConflict) => {
    for (let b = 0; b * 200 < rows.length; b++) {
      const slice = rows.slice(b * 200, b * 200 + 200);
      const { error } = await admin.from(table).upsert(slice, { onConflict, ignoreDuplicates: false });
      if (error) throw new Error(`${table}: ${error.message}`);
    }
  };
  await batch(payload.pubs, 'evidence_publications', 'id');
  await batch(payload.claims, 'evidence_claims', 'id');
  await batch(payload.links, 'evidence_claim_publications', 'claim_id,publication_id');

  const { count, error } = await anon.from('approved_remedy_evidence').select('*', { count: 'exact', head: true });
  if (error) console.warn(`[warn] post-write view check failed: ${error.message}`);
  console.log(`\n[apply] write complete. approved_remedy_evidence rows visible to anon: ${count ?? '?'}`);
}

async function main() {
  const payload = await buildPayload();

  mkdirSync('reports', { recursive: true });
  writeFileSync('reports/evidence-backfill-plan.json', JSON.stringify(payload, null, 2));
  if (!OFFLINE) {
    const cache = {};
    for (const p of payload.pubs) cache[p.canonical_key] = { ...p, canonical_url: undefined };
    // strip bulky/unneeded fields from the resolution cache
    for (const k of Object.keys(cache)) {
      delete cache[k].canonical_url;
      delete cache[k].source_organization;
      delete cache[k].evidence_type;
      delete cache[k].verification_status;
    }
    writeFileSync(RESOLVED_CACHE, JSON.stringify(cache, null, 2));
  }

  printReport(payload);

  if (emitSql) {
    writeFileSync(emitSql, buildSql(payload));
    console.log(`SQL written to ${emitSql} (run in Supabase SQL editor as postgres/service-role)`);
  }

  if (APPLY) {
    if (!admin) {
      console.error('--apply requires SUPABASE_SERVICE_ROLE_KEY');
      process.exit(1);
    }
    await apply(payload);
  } else if (!emitSql) {
    console.log('\nNo writes performed (plan mode). To ingest:');
    console.log('  1) SUPABASE_SERVICE_ROLE_KEY=... node scripts/ingest-evidence-assessments.mjs --apply');
    console.log('  2) or: node scripts/ingest-evidence-assessments.mjs --emit-sql backfill.sql   then run backfill.sql in the Supabase SQL editor');
    console.log('\nPrevention (so future approved reviews are not stranded):');
    console.log('  - Record publication title/journal/year/DOI + a reviewer users.uuid in the assessment registry');
    console.log('  - Wire a recurring registry→DB sync (e.g. extend content:sync-evidence or add a seed script)');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});