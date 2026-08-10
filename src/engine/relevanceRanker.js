import { buildKnowledgeContext } from './knowledgeGraph';
import { getChildSafetyStatus } from '../utils/guestProfile';
import { CONDITION_TO_CONTRAINDICATION_MAP, normalizeConditionValue } from '../utils/conditionMapping';
import { computeEvidenceScore } from '../utils/evidence';

export const REMEDY_TIER = {
  DIRECT: 0,
  ASSOCIATED: 1,
  SUPPORTIVE: 2,
};

const TIER_LABELS = {
  [REMEDY_TIER.DIRECT]: 'Directly addresses this concern',
  [REMEDY_TIER.ASSOCIATED]: 'Helps manage associated symptoms',
  [REMEDY_TIER.SUPPORTIVE]: 'Provides general wellness support',
};

export function classifyRelationship(remedy, symptomId) {
  const isPrimary = remedy.primarySymptoms?.includes(symptomId);
  const isSecondary = remedy.secondarySymptoms?.includes(symptomId);
  const isAssociated = remedy.symptoms?.includes(symptomId);

  if (isPrimary) return REMEDY_TIER.DIRECT;
  if (isSecondary) return REMEDY_TIER.ASSOCIATED;
  if (isAssociated) return REMEDY_TIER.ASSOCIATED;
  return REMEDY_TIER.SUPPORTIVE;
}

function getTierReason(tier, symptomLabel) {
  if (!symptomLabel) return TIER_LABELS[tier] || 'Recommended remedy';
  switch (tier) {
    case REMEDY_TIER.DIRECT:
      return `Directly addresses ${symptomLabel}`;
    case REMEDY_TIER.ASSOCIATED:
      return `Helps manage symptoms associated with ${symptomLabel}`;
    case REMEDY_TIER.SUPPORTIVE:
      return `Supports overall wellness alongside ${symptomLabel} care`;
    default:
      return `Recommended for your health needs`;
  }
}

function computeSafetyScore(remedy) {
  let score = 100;

  const allergens = (remedy.allergen_tags || []).length;
  if (allergens > 0) score -= allergens * 5;

  const contraindications = (remedy.contraindications || []).length;
  if (contraindications > 0) score -= contraindications * 10;

  const warnings = Array.isArray(remedy.warnings) ? remedy.warnings.join(' ').length : (remedy.warnings || '').length;
  if (warnings > 50) score -= 10;

  return Math.max(score, 0);
}

function getSafetyReason(remedy, userContext) {
  const reasons = [];

  if (remedy._allergyConflict) {
    reasons.push(`Hidden due to allergy conflict: ${remedy._allergyConflict}`);
  }
  if (remedy._contraindicationConflict) {
    reasons.push(`Hidden due to contraindication: ${remedy._contraindicationConflict}`);
  }

  if (!reasons.length && userContext?.allergies?.length) {
    reasons.push('No allergy conflicts detected');
  }
  if (!reasons.length && userContext?.conditions?.length) {
    reasons.push('No contraindications detected');
  }
  if (!reasons.length) {
    reasons.push('Safety check passed');
  }

  return reasons.join('. ');
}

function getConfidenceReason(queryConfidence) {
  if (!queryConfidence || queryConfidence >= 60) {
    return 'Strong match to known symptom';
  }
  if (queryConfidence >= 30) {
    return 'Partial match — results may be less specific';
  }
  return 'Weak match — consider rephrasing your search';
}

function computeDirectScore(evidenceScore, priorityRank) {
  let score = 60;
  if (evidenceScore) score += evidenceScore * 6;
  if (priorityRank != null) score += Math.min(priorityRank, 10) * 2;
  return score;
}

function computeAssociatedScore(evidenceScore, priorityRank) {
  let score = 40;
  if (evidenceScore) score += evidenceScore * 5;
  if (priorityRank != null) score += Math.min(priorityRank, 10) * 1.5;
  return score;
}

function computeSupportiveScore(rating) {
  let score = 20;
  if (rating) score += Math.round(rating * 8);
  return score;
}

function computeUserContextPenalty(remedy, userContext) {
  delete remedy._allergyConflict;
  delete remedy._contraindicationConflict;
  delete remedy._childSafetyBlock;
  delete remedy._childSafetyConcern;
  delete remedy._childSafetyNote;
  delete remedy._treatmentConflict;

  if (!userContext) return 0;

  let penalty = 0;
  const { allergies, conditions, isChildSafe, treatmentPrefs } = userContext;

  if (allergies?.length) {
    const remedyAllergens = (remedy.allergen_tags || []).map(t => t.toLowerCase());
    for (const allergy of allergies.map(a => a.toLowerCase())) {
      if (remedyAllergens.some(t => t.includes(allergy) || allergy.includes(t))) {
        penalty += 40;
        remedy._allergyConflict = allergy;
      }
    }

    const ingredients = (remedy.ingredients || []).map(i =>
      i.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim()
    );
    for (const allergy of allergies.map(a => a.toLowerCase())) {
      for (const ingredient of ingredients) {
        if (ingredient.includes(allergy) || allergy.includes(ingredient)) {
          penalty += 40;
          remedy._allergyConflict = allergy + ' (ingredient)';
        }
      }
    }
  }

  if (conditions?.length) {
    const contraindications = (remedy.contraindications || []).map(c => c.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim()).filter(Boolean);
    
    // Check direct matches
    for (const condition of conditions.map(c => normalizeConditionValue(c)).filter(Boolean)) {
      for (const ci of contraindications) {
        if (ci.includes(condition) || condition.includes(ci)) {
          penalty += 40;
          remedy._contraindicationConflict = condition;
        }
      }
    }
    
    // Check mapped contraindications
    for (const condition of conditions) {
      const mapped = CONDITION_TO_CONTRAINDICATION_MAP[condition];
      if (mapped) {
        for (const mappedContra of mapped) {
          const normMapped = normalizeConditionValue(mappedContra);
          for (const ci of contraindications) {
            if (ci.includes(normMapped) || normMapped.includes(ci)) {
              penalty += 40;
              remedy._contraindicationConflict = condition;
              console.log('[DEBUG-RANK] MAPPED MATCH:', { condition, mappedContra: normMapped, ci });
            }
          }
        }
      }
    }
  }

  const childSafety = getChildSafetyStatus(remedy, isChildSafe);
  if (childSafety.isHardBlock) {
    penalty += 40;
    remedy._childSafetyBlock = true;
    remedy._childSafetyNote = childSafety.note;
  } else if (childSafety.hasConcern) {
    penalty += 15;
    remedy._childSafetyConcern = true;
    remedy._childSafetyNote = childSafety.note;
  }

  // Treatment preference penalties
  if (treatmentPrefs?.length) {
    const name = (remedy.name || '').toLowerCase();
    const ingredients = (remedy.ingredients || []).map(i => i.toLowerCase());

    // Avoid medication: penalize pharmaceuticals
    if (treatmentPrefs.includes('avoid_medication')) {
      const pharmaKeywords = ['ibuprofen', 'acetaminophen', 'aspirin', 'paracetamol', 'antihistamine', 'decongestant'];
      if (pharmaKeywords.some(kw => name.includes(kw) || ingredients.some(i => i.includes(kw)))) {
        penalty += 30;
        remedy._treatmentConflict = 'avoid medication (pharmaceutical ingredient)';
      }
    }

    // Vegetarian only: penalize animal-derived ingredients
    if (treatmentPrefs.includes('vegetarian_remedies')) {
      const animalDerived = ['gelatin', 'lanolin', 'collagen', 'chondroitin', 'glucosamine', 'fish oil', 'cod liver', 'shellfish', 'animal', 'lard', 'tallow'];
      if (ingredients.some(i => animalDerived.some(ad => i.includes(ad)))) {
        penalty += 25;
        remedy._treatmentConflict = 'vegetarian only (animal-derived ingredient)';
      }
      const allergenTags = (remedy.allergen_tags || []).map(t => t.toLowerCase());
      if (allergenTags.some(t => t.includes('animal') || t.includes('shellfish') || t.includes('fish'))) {
        penalty += 25;
        remedy._treatmentConflict = 'vegetarian only (animal-derived allergen tag)';
      }
    }
  }

  return penalty;
}

export function rankRemedies(remedies, concerns, symptomRemediesMap, options = {}) {
  if (!remedies?.length || !concerns?.length) return [];

  const { userContext, symptoms, queryConfidence, popularityMap = {} } = options;

  const remedyMap = {};
  for (const r of remedies) remedyMap[r.id] = r;

  const knowledgeCtx = buildKnowledgeContext(
    concerns.map(c => c.id),
    symptoms || []
  );

  const scored = [];

  for (const concern of concerns) {
    const symptomId = concern.id;
    const isPrimaryConcern = concern.isPrimary !== false;
    const knowledge = knowledgeCtx.find(k => k.id === symptomId);

    const curatedEntries = symptomRemediesMap?.[symptomId] || [];
    const processed = new Set();

    // Phase 1: Process catalogued entries (from symptom_remedies table)
    for (const entry of curatedEntries) {
      const remedy = remedyMap[entry.remedyId];
      if (!remedy || processed.has(remedy.id)) continue;
      processed.add(remedy.id);

      const tier = classifyRelationship(remedy, symptomId);
      const safetyScore = computeSafetyScore(remedy);
      const penalty = computeUserContextPenalty(remedy, userContext);
      // Never expose or rank by legacy hand-entered evidence scores. Derive the
      // value from the citations that are actually attached at runtime.
      const evidenceScore = computeEvidenceScore(remedy);

      const baseScore = tier === REMEDY_TIER.DIRECT
        ? computeDirectScore(evidenceScore, entry.priorityRank)
        : tier === REMEDY_TIER.ASSOCIATED
          ? computeAssociatedScore(evidenceScore, entry.priorityRank)
          : computeSupportiveScore(remedy.rating);

      const popularityBoost = (popularityMap[symptomId]?.[remedy.id] || 0) * 0.5;
      const score = Math.max(0, baseScore - penalty) + popularityBoost;

      scored.push({
        ...remedy,
        _matchSymptomId: symptomId,
        _matchSymptomLabel: concern.label,
        _isPrimaryConcern: isPrimaryConcern,
        _tier: tier,
        _tierLabel: TIER_LABELS[tier],
        _evidenceScore: evidenceScore,
        _priorityRank: entry.priorityRank || 0,
        _safetyScore: safetyScore,
        _relevanceScore: Math.round(score),
        _relevanceReason: getTierReason(tier, concern.label),
        _safetyReason: getSafetyReason(remedy, userContext),
        _confidenceReason: getConfidenceReason(queryConfidence),
        _primaryFor: remedy.primarySymptoms || [],
        _secondaryFor: remedy.secondarySymptoms || [],
        _supportiveFor: [],
      });
    }

    // Phase 2: Process remedies linked via primary/secondary arrays (local fallback)
    for (const remedy of remedies) {
      if (processed.has(remedy.id)) continue;

      const tier = classifyRelationship(remedy, symptomId);
      if (tier === REMEDY_TIER.SUPPORTIVE) continue;

      processed.add(remedy.id);

      const safetyScore = computeSafetyScore(remedy);
      const penalty = computeUserContextPenalty(remedy, userContext);

      let baseScore;
      const evidenceScore = computeEvidenceScore(remedy);
      if (tier === REMEDY_TIER.DIRECT) {
        baseScore = computeDirectScore(evidenceScore, 5);
      } else {
        baseScore = computeAssociatedScore(evidenceScore, 3);
      }

      const popularityBoost = (popularityMap[symptomId]?.[remedy.id] || 0) * 0.5;
      const score = Math.max(0, baseScore - penalty) + popularityBoost;

      scored.push({
        ...remedy,
        _matchSymptomId: symptomId,
        _matchSymptomLabel: concern.label,
        _isPrimaryConcern: isPrimaryConcern,
        _tier: tier,
        _tierLabel: TIER_LABELS[tier],
        _evidenceScore: evidenceScore,
        _priorityRank: 0,
        _safetyScore: safetyScore,
        _relevanceScore: Math.round(score),
        _relevanceReason: getTierReason(tier, concern.label),
        _safetyReason: getSafetyReason(remedy, userContext),
        _confidenceReason: getConfidenceReason(queryConfidence),
        _primaryFor: remedy.primarySymptoms || [],
        _secondaryFor: remedy.secondarySymptoms || [],
        _supportiveFor: [],
      });
    }

    // Phase 3: Supportive remedies from related symptoms
    if (knowledge) {
      for (const related of knowledge.relatedSymptoms) {
        const relatedEntries = symptomRemediesMap?.[related.id] || [];
        for (const entry of relatedEntries) {
          const remedy = remedyMap[entry.remedyId];
          if (!remedy || processed.has(remedy.id)) continue;
          processed.add(remedy.id);

          const safetyScore = computeSafetyScore(remedy);
          const penalty = computeUserContextPenalty(remedy, userContext);
          const baseScore = computeSupportiveScore(remedy.rating);
          const popularityBoost = (popularityMap[symptomId]?.[remedy.id] || 0) * 0.5;
          const score = Math.max(0, baseScore - penalty) + popularityBoost;

          scored.push({
            ...remedy,
            _matchSymptomId: symptomId,
            _matchSymptomLabel: concern.label,
            _isPrimaryConcern: false,
            _tier: REMEDY_TIER.SUPPORTIVE,
            _tierLabel: TIER_LABELS[REMEDY_TIER.SUPPORTIVE],
            _evidenceScore: entry.evidenceScore || 0,
            _priorityRank: entry.priorityRank || 0,
            _safetyScore: safetyScore,
            _relevanceScore: Math.round(score),
            _relevanceReason: `Supports overall wellness alongside ${concern.label} care`,
            _safetyReason: getSafetyReason(remedy, userContext),
            _confidenceReason: getConfidenceReason(queryConfidence),
            _primaryFor: remedy.primarySymptoms || [],
            _secondaryFor: remedy.secondarySymptoms || [],
            _supportiveFor: [related.id],
          });
        }
      }
    }
  }

  const deduped = dedupeRemedies(scored);

  deduped.sort((a, b) => {
    if (a._isPrimaryConcern !== b._isPrimaryConcern) {
      return a._isPrimaryConcern ? -1 : 1;
    }
    if (a._tier !== b._tier) return a._tier - b._tier;
    return b._relevanceScore - a._relevanceScore;
  });

  return deduped;
}

function dedupeRemedies(items) {
  const seen = new Map();
  for (const item of items) {
    const existing = seen.get(item.id);
    if (!existing) {
      seen.set(item.id, item);
    } else if (item._tier < existing._tier) {
      seen.set(item.id, item);
    } else if (item._tier === existing._tier && item._relevanceScore > existing._relevanceScore) {
      seen.set(item.id, item);
    } else if (item._tier === existing._tier && item._isPrimaryConcern && !existing._isPrimaryConcern) {
      seen.set(item.id, item);
    }
  }
  return Array.from(seen.values());
}
