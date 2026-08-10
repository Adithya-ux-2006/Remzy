import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { mapRemedy } from '../utils/mappers';
import { applyLegacyBatch1 } from '../data/legacyRemedyBatch1';
import { applyLegacyBatch2 } from '../data/legacyRemedyBatch2';
import { applyLegacyBatch3 } from '../data/legacyRemedyBatch3';
import { applyLegacyBatch4 } from '../data/legacyRemedyBatch4';
import { applyLegacyBatch5 } from '../data/legacyRemedyBatch5';
import { applyLegacyEvidenceTierOverlay } from '../data/legacyEvidenceTierOverlay';
import { applyMultiSourceRemedyBatch1 } from '../data/multiSourceRemedyBatch1';
import { filterEvidenceReviewedRemedies } from '../data/evidenceReview';

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
  const [{ SYMPTOMS }, { REMEDIES }, { LOCAL_REMEDIES, LOCAL_SYMPTOM_REMEDIES }] = await Promise.all([
    import('../data/symptoms'),
    import('../data/remedies'),
    import('../data/localCatalog'),
  ]);

  const allRemedies = filterEvidenceReviewedRemedies(
    applyMultiSourceRemedyBatch1([...REMEDIES, ...applyLegacyEvidenceTierOverlay(applyLegacyBatch5(applyLegacyBatch4(applyLegacyBatch3(applyLegacyBatch2(applyLegacyBatch1(LOCAL_REMEDIES))))))])
  );

  const localSymptomRemedies = buildLocalSymptomRemedies(allRemedies);

  const mergedSymptomRemedies = mergeSymptomRemedies(localSymptomRemedies, LOCAL_SYMPTOM_REMEDIES);

  return {
    symptoms: SYMPTOMS.map((s) => ({
      id: s.id,
      label: s.label,
      emoji: s.emoji,
      color: s.color,
    })),
    remedies: allRemedies.map(mapRemedy),
    symptomRemedies: mergedSymptomRemedies,
  };
}

function mergeById(primary = [], fallback = []) {
  const seen = new Set(primary.map((item) => item.id));
  return [
    ...primary,
    ...fallback.filter((item) => item?.id && !seen.has(item.id)),
  ];
}

function mergeRemedyFields(primary = [], fallback = []) {
  // Keep Supabase authoritative for existing records while retaining reviewed
  // local remedies that have not been migrated yet.
  const fallbackMapById = new Map(fallback.map(item => [item.id, item]));
  const fallbackMapByName = new Map(fallback.map(item => [item.name.toLowerCase(), item]));
  const matchedFallbackIds = new Set();
  
  const mergedPrimary = primary.map(primaryItem => {
    // Try matching by ID first
    let fallbackItem = fallbackMapById.get(primaryItem.id);
    
    // If not found by ID, try matching by name (case-insensitive) from local fallback.
    if (!fallbackItem && primaryItem.name) {
      fallbackItem = fallbackMapByName.get(primaryItem.name.toLowerCase());
    }
    
    if (!fallbackItem) return primaryItem;
    matchedFallbackIds.add(fallbackItem.id);
    
    return {
      ...fallbackItem,
      ...primaryItem,
      childSafe: fallbackItem.childSafe ?? primaryItem.childSafe,
      childSafetyNote: fallbackItem.childSafetyNote ?? primaryItem.childSafetyNote,
      evidenceTier: primaryItem.evidenceTier ?? fallbackItem.evidenceTier,
      evidenceNote: primaryItem.evidenceNote || fallbackItem.evidenceNote,
      researchPapers: primaryItem._evidenceBackendAuthoritative
        ? primaryItem.researchPapers
        : (primaryItem.researchPapers?.length ? primaryItem.researchPapers : fallbackItem.researchPapers),
      researchLinks: primaryItem._evidenceBackendAuthoritative
        ? primaryItem.researchLinks
        : (primaryItem.researchLinks?.length ? primaryItem.researchLinks : fallbackItem.researchLinks),
    };
  });

  const localOnly = fallback.filter((item) => !matchedFallbackIds.has(item.id));
  return [...mergedPrimary, ...localOnly];
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

function buildPopularityMap(rows) {
  const map = {};
  for (const row of rows || []) {
    const sid = row.symptom_id;
    if (!map[sid]) map[sid] = {};
    map[sid][row.remedy_id] = row.popularity_score || 0;
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

async function enrichWithLocalCatalog(catalog, approvedEvidenceMap = {}) {
  const local = await loadLocalCatalog();
  const remedies = filterEvidenceReviewedRemedies(mergeRemedyFields(catalog.remedies, local.remedies))
    .map((remedy) => ({
      ...remedy,
      researchPapers: approvedEvidenceMap[remedy.id] || [],
      researchLinks: [],
      evidenceBackendStatus: approvedEvidenceMap[remedy.id]?.length ? 'approved' : 'needs-review',
      _evidenceBackendAuthoritative: true,
    }));
  return {
    symptoms: mergeById(catalog.symptoms, local.symptoms),
    remedies,
    symptomRemedies: mergeSymptomRemedies(catalog.symptomRemedies, local.symptomRemedies),
  };
}

export const useCatalogStore = create((set, get) => ({
  symptoms: [],
  remedies: [],
  symptomRemedies: {},
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
        popularityMap,
        isLoading: false,
        hasLoaded: true,
      });
    } catch (error) {
      console.warn('[CATALOG] Supabase catalog unavailable, falling back to local data:', error.message || error);
      const local = await loadLocalCatalog();
      set({
        ...local,
        remedies: filterEvidenceReviewedRemedies(local.remedies).map((remedy) => ({
          ...remedy,
          researchPapers: [],
          researchLinks: [],
          evidenceBackendStatus: 'unavailable',
          _evidenceBackendAuthoritative: true,
        })),
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
