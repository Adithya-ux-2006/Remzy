import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { mapRemedy } from '../utils/mappers';

function buildSymptomRemediesMap(rows) {
  const map = {};
  for (const row of rows || []) {
    const sid = row.symptom_id;
    if (!map[sid]) map[sid] = [];
    map[sid].push({
      remedyId: row.remedy_id,
      evidenceScore: row.evidence_score,
      priorityRank: row.priority_rank,
    });
  }
  return map;
}

function buildLocalSymptomRemedies(remedies = []) {
  const map = {};

  remedies.forEach((remedy, remedyIndex) => {
    const primarySet = new Set(remedy.primarySymptoms || []);
    const secondarySet = new Set(remedy.secondarySymptoms || []);
    // Broader symptom list (some remedies list additional symptoms here
    // that aren't in primarySymptoms/secondarySymptoms)
    const allSymptoms = new Set([
      ...primarySet,
      ...secondarySet,
      ...(remedy.symptoms || []),
    ]);

    for (const symptomId of allSymptoms) {
      if (!map[symptomId]) map[symptomId] = [];

      // Determine relationship strength for evidence scoring
      let evidenceScore;
      let priorityRank;
      if (primarySet.has(symptomId)) {
        evidenceScore = 8;
        priorityRank = Math.max(1, 1000 - remedyIndex);
      } else if (secondarySet.has(symptomId)) {
        evidenceScore = 4;
        priorityRank = Math.max(1, 500 - remedyIndex);
      } else {
        // Listed in symptoms array but not primary/secondary — treat as associated
        evidenceScore = 3;
        priorityRank = Math.max(1, 300 - remedyIndex);
      }

      map[symptomId].push({
        remedyId: remedy.id,
        evidenceScore,
        priorityRank,
      });
    }
  });

  return map;
}

async function loadLocalCatalog() {
  const [{ SYMPTOMS }, { LOCAL_SYMPTOM_REMEDIES }, { buildRuntimeRemedies }] = await Promise.all([
    import('../data/symptoms'),
    import('../data/localCatalog'),
    import('../data/runtimeCatalog'),
  ]);

  const allRemedies = buildRuntimeRemedies();
  const dedupedRemedies = allRemedies.filter((remedy, index, all) => all.findIndex((candidate) => candidate.id === remedy.id) === index);
  const localSymptomRemedies = buildLocalSymptomRemedies(dedupedRemedies);
  const mergedSymptomRemedies = mergeSymptomRemedies(localSymptomRemedies, LOCAL_SYMPTOM_REMEDIES);

  return {
    symptoms: SYMPTOMS.map((s) => ({
      id: s.id,
      label: s.label,
      emoji: s.emoji,
      color: s.color,
    })),
    remedies: dedupedRemedies.map(mapRemedy),
    symptomRemedies: mergedSymptomRemedies,
  };
}

async function loadLocalMappingOnly() {
  const [{ LOCAL_SYMPTOM_REMEDIES }] = await Promise.all([
    import('../data/localCatalog'),
  ]);
  return LOCAL_SYMPTOM_REMEDIES;
}

function mergeSymptomRemedies(primary = {}, fallback = {}) {
  const merged = { ...primary };

  for (const [symptomId, localItems] of Object.entries(fallback || {})) {
    const existing = merged[symptomId] || [];
    const seenRemedies = new Set(existing.map((item) => item.remedyId));
    const additions = (localItems || []).filter((item) => item?.remedyId && !seenRemedies.has(item.remedyId));
    merged[symptomId] = [...existing, ...additions];
  }

  return merged;
}

function mergeBackendSymptomMappings(primary = {}, fallback = {}) {
  const merged = { ...fallback };
  for (const [symptomId, backendItems] of Object.entries(primary || {})) {
    if (backendItems?.length) merged[symptomId] = backendItems;
  }
  return merged;
}

function buildPopularityMap(rows) {
  const map = {};
  for (const row of rows || []) {
    const sid = row.symptom_id;
    if (!map[sid]) map[sid] = {};
    map[sid][row.remedy_id] = row.popularity_score || 0;
  }
  return map;
}

function buildEnrichmentMap(rows) {
  const map = {};
  for (const row of rows || []) {
    map[row.remedy_id] = {
      clinicalTrialCount: row.clinical_trial_count || 0,
      activeTrialCount: row.active_trial_count || 0,
      fdaRecordCount: row.fda_record_count || 0,
      fdaWarningsSummary: row.fda_warnings_summary || null,
    };
  }
  return map;
}

function buildApprovedEvidenceMap(rows) {
  const map = {};
  for (const row of rows || []) {
    if (!map[row.remedy_id]) map[row.remedy_id] = [];
    map[row.remedy_id].push({
      title: row.title,
      journal: row.journal,
      year: row.publication_year,
      url: row.url,
      sourceDatabase: row.source_database,
      sourceOrganization: row.source_organization,
      evidenceType: row.evidence_type,
      verificationStatus: 'full-text-reviewed',
      keyFinding: row.review_note || row.claim_text,
      applicability: row.overall_applicability,
      certainty: row.certainty,
      recommendationStatus: row.recommendation_status,
      riskOfBias: row.risk_of_bias,
      limitations: row.limitations || [],
      nextReviewAt: row.next_review_at,
    });
  }
  return map;
}

function dedupeEvidenceSources(sources = []) {
  const seen = new Set();
  return sources.filter((source) => {
    const key = source?.url || `${source?.title || ''}__${source?.journal || ''}`;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function enrichWithLocalCatalog(catalog, approvedEvidenceMap = {}) {
  const LOCAL_SYMPTOM_REMEDIES = await loadLocalMappingOnly();
  const remedies = (catalog.remedies || []).map((remedy) => {
    const approvedSources = approvedEvidenceMap[remedy.id] || [];
    const identifiedSources = dedupeEvidenceSources([
      ...(remedy.researchPapers || []),
      ...(remedy.researchLinks || []),
    ]).map((source) => ({
      ...source,
      verificationStatus: source.verificationStatus || 'source-identified',
      claimReviewStatus: 'needs-review',
    }));
    const sources = approvedSources.length ? approvedSources : identifiedSources;
    return {
      ...remedy,
      researchPapers: sources,
      researchLinks: [],
      evidenceBackendStatus: approvedSources.length
        ? 'approved'
        : sources.length ? 'needs-review' : 'no-sources',
      _evidenceBackendAuthoritative: true,
    };
  });
  return {
    symptoms: catalog.symptoms || [],
    remedies,
    symptomRemedies: mergeBackendSymptomMappings(catalog.symptomRemedies, LOCAL_SYMPTOM_REMEDIES),
  };
}

export const useCatalogStore = create((set, get) => ({
  symptoms: [],
  remedies: [],
  symptomRemedies: {},
  enrichmentMap: {},
  popularityMap: {},
  isLoading: false,
  hasLoaded: false,
  error: null,

  fetchCatalog: async () => {
    if (get().isLoading || get().hasLoaded) return;

    set({ isLoading: true, error: null });

    try {
      const [
        { data: symptoms, error: symptomsError },
        { data: remedies, error: remediesError },
        { data: approvedEvidence, error: approvedEvidenceError },
      ] = await Promise.all([
        supabase.from('symptoms').select('*').order('label'),
        supabase
          .from('remedies')
          .select('*, remedy_symptoms(symptom_id, match_strength), research_papers(title, journal, url, key_findings)')
          .order('name'),
        supabase.from('approved_remedy_evidence').select('*'),
      ]);

      if (symptomsError) throw symptomsError;
      if (remediesError) throw remediesError;
      if (approvedEvidenceError) throw approvedEvidenceError;

      let symptomRemediesData = {};
      try {
        const { data: srRows, error: srError } = await supabase.from('remedy_symptoms').select('*');
        if (srError) {
          console.warn('[CATALOG] remedy_symptoms query failed:', srError.message || srError);
        } else if (srRows) {
          symptomRemediesData = buildSymptomRemediesMap(srRows);
        }
      } catch (srError) {
        console.warn('[CATALOG] remedy_symptoms table not available, using default ranking:', srError.message || srError);
      }

      // Load popularity data (non-blocking — failure doesn't prevent catalog load)
      let popularityMap = {};
      try {
        const { data: popRows, error: popError } = await supabase.from('remedy_popularity').select('*');
        if (!popError && popRows) {
          popularityMap = buildPopularityMap(popRows);
        }
      } catch {
        // Popularity table may not exist yet — that's fine
      }

      // Load enrichment data (non-blocking — failure doesn't prevent catalog load)
      let enrichmentMap = {};
      try {
        const { data: enrichmentRows, error: enrichmentError } = await supabase
          .from('remedy_enrichment')
          .select('remedy_id, clinical_trial_count, active_trial_count, fda_record_count, fda_warnings_summary');
        if (!enrichmentError && enrichmentRows) {
          enrichmentMap = buildEnrichmentMap(enrichmentRows);
        }
      } catch {
        // Enrichment view may not exist yet — that's fine
      }

      const hasData = (symptoms?.length > 0 || remedies?.length > 0);
      if (!hasData) throw new Error('No data returned from Supabase');

      const enriched = await enrichWithLocalCatalog({
        symptoms: (symptoms || []).map((s) => ({
          id: s.id,
          label: s.label,
          emoji: s.emoji,
          color: s.color_theme,
        })),
        remedies: (remedies || []).map(mapRemedy),
        symptomRemedies: symptomRemediesData,
      }, buildApprovedEvidenceMap(approvedEvidence));

      set({
        ...enriched,
        enrichmentMap,
        popularityMap,
        isLoading: false,
        hasLoaded: true,
      });
    } catch (error) {
      console.warn('[CATALOG] Supabase catalog unavailable, falling back to local data:', error.message || error);
      const local = await loadLocalCatalog();
      set({
        ...local,
        remedies: local.remedies.map((remedy) => {
          const sources = dedupeEvidenceSources([
            ...(remedy.researchPapers || []),
            ...(remedy.researchLinks || []),
          ]).map((source) => ({
            ...source,
            verificationStatus: source.verificationStatus || 'source-identified',
            claimReviewStatus: 'needs-review',
          }));
          return {
            ...remedy,
            researchPapers: sources,
            researchLinks: [],
            evidenceBackendStatus: sources.length ? 'needs-review' : 'no-sources',
            _evidenceBackendAuthoritative: true,
          };
        }),
        popularityMap: {},
        error,
        isLoading: false,
        hasLoaded: true,
      });
    }
  },
}));

if (import.meta.env.DEV) {
  window.__ZUSTAND_STORE__ = useCatalogStore;
}
