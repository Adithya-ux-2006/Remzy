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
  const [{ SYMPTOMS }, { REMEDIES }, { LOCAL_REMEDIES, LOCAL_SYMPTOM_REMEDIES }] = await Promise.all([
    import('../data/symptoms'),
    import('../data/remedies'),
    import('../data/localCatalog'),
  ]);

  const allRemedies = [...REMEDIES, ...LOCAL_REMEDIES];

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

import { SUPABASE_REMEDY_GOOGLE_SCHOLAR_MAP } from '../utils/supabaseRemedyGoogleScholarMap';

function mergeRemedyFields(primary = [], fallback = []) {
  // Merge specific fields from fallback (local) into primary (Supabase) remedies
  const fallbackMapById = new Map(fallback.map(item => [item.id, item]));
  const fallbackMapByName = new Map(fallback.map(item => [item.name.toLowerCase(), item]));
  
  return primary.map(primaryItem => {
    // Try matching by ID first
    let fallbackItem = fallbackMapById.get(primaryItem.id);
    
    // Try Supabase-specific name mapping FIRST (before local fallback by name)
    // This ensures Supabase-specific fields like googleScholarUrl take precedence
    if (primaryItem.name) {
      const supabaseMap = SUPABASE_REMEDY_GOOGLE_SCHOLAR_MAP[primaryItem.name];
      if (supabaseMap) {
        console.log('[CATALOG] Matched Supabase remedy:', primaryItem.name, '-> googleScholarUrl:', supabaseMap.googleScholarUrl);
        fallbackItem = supabaseMap;
      }
    }
    
    // If not found by Supabase mapping, try matching by name (case-insensitive) from local fallback
    if (!fallbackItem && primaryItem.name) {
      fallbackItem = fallbackMapByName.get(primaryItem.name.toLowerCase());
    }
    
    if (!fallbackItem) return primaryItem;
    
    // Merge specific fields from local data that may not be in Supabase
    const merged = {
      ...primaryItem,
      googleScholarUrl: fallbackItem.googleScholarUrl ?? primaryItem.googleScholarUrl,
      childSafe: fallbackItem.childSafe ?? primaryItem.childSafe,
      childSafetyNote: fallbackItem.childSafetyNote ?? primaryItem.childSafetyNote,
    };
    
    if (primaryItem.name === 'Aloe Vera Gel') {
      console.log('[CATALOG] Merged Aloe Vera Gel:', {
        primaryGoogleScholarUrl: primaryItem.googleScholarUrl,
        fallbackGoogleScholarUrl: fallbackItem?.googleScholarUrl,
        mergedGoogleScholarUrl: merged.googleScholarUrl,
      });
    }
    
    return merged;
  });
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

async function enrichWithLocalCatalog(catalog) {
  const local = await loadLocalCatalog();
  return {
    symptoms: mergeById(catalog.symptoms, local.symptoms),
    remedies: mergeRemedyFields(catalog.remedies, local.remedies),
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
      ] = await Promise.all([
        supabase.from('symptoms').select('*').order('label'),
        supabase
          .from('remedies')
          .select('*, remedy_symptoms(symptom_id, match_strength), research_papers(title, journal, url, key_findings)')
          .order('name'),
      ]);

      if (symptomsError) throw symptomsError;
      if (remediesError) throw remediesError;

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
      });

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
