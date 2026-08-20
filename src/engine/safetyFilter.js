import { CONDITION_TO_CONTRAINDICATION_MAP, normalizeConditionValue } from '../utils/conditionMapping';

export function filterUnsafeRemedies(remedies, userContext) {
  if (!remedies?.length) return [];
  if (!userContext) {
    return remedies.map(r => ({
      ...r,
      _safetyReason: r._safetyReason || 'Safety check passed',
      _safe: true,
    }));
  }

  const { allergies, conditions, treatmentPrefs } = userContext;

  const result = [];

  for (const remedy of remedies) {
    const allergyConflict = allergies?.length ? findAllergyConflict(remedy, allergies) : null;
    const contraindicationConflict = conditions?.length ? findContraindicationConflict(remedy, conditions) : null;
    const treatmentConflict = treatmentPrefs?.length ? findTreatmentConflict(remedy, treatmentPrefs) : null;

    const isUnsafe = allergyConflict || contraindicationConflict || treatmentConflict;

    const reasons = [];
    if (allergyConflict) reasons.push(`Hidden due to allergy conflict: ${allergyConflict}`);
    if (contraindicationConflict) reasons.push(`Hidden due to contraindication: ${contraindicationConflict}`);
    if (treatmentConflict) reasons.push(`Hidden due to treatment preference: ${treatmentConflict}`);
    if (!reasons.length && userContext) {
      if (allergies?.length) reasons.push('No allergy conflicts detected');
      if (conditions?.length) reasons.push('No contraindications detected');
      if (treatmentPrefs?.length) reasons.push('Matches treatment preferences');
      if (!reasons.length) reasons.push('Safety check passed');
    }

    if (!isUnsafe) {
      result.push({
        ...remedy,
        _safe: true,
        _safetyReason: reasons.join('. '),
      });
    }
  }

  return result;
}

function findAllergyConflict(remedy, allergies) {
  const normalizedAllergies = allergies.map(a =>
    a.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim()
  ).filter(Boolean);

  const tags = (remedy.allergen_tags || []).map(t => t.toLowerCase());
  for (const allergy of normalizedAllergies) {
    if (tags.some(tag => tag === allergy || tag.includes(allergy) || allergy.includes(tag))) {
      return allergy;
    }
  }

  const ingredients = (remedy.ingredients || []).map(i =>
    i.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim()
  ).filter(Boolean);

  for (const allergy of normalizedAllergies) {
    for (const ingredient of ingredients) {
      if (ingredient.includes(allergy) || allergy.includes(ingredient)) {
        return allergy + ' (ingredient match)';
      }
    }
  }

  const title = (remedy.name || '').toLowerCase();
  for (const allergy of normalizedAllergies) {
    if (title.includes(allergy)) {
      return allergy + ' (name match)';
    }
  }

  return null;
}

function findContraindicationConflict(remedy, conditions) {
  const normalizedConditions = conditions.map(c =>
    normalizeConditionValue(c)
  ).filter(Boolean);

  const contraindications = (remedy.contraindications || []).map(c => c.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim()).filter(Boolean);

  // Check direct matches first
  for (const condition of normalizedConditions) {
    for (const ci of contraindications) {
      if (ci.includes(condition) || condition.includes(ci)) {
        return condition;
      }
    }
  }

  // Check mapped contraindications for each user condition
  for (const condition of conditions) {
    const mapped = CONDITION_TO_CONTRAINDICATION_MAP[condition];
    if (mapped) {
      for (const mappedContra of mapped) {
        const normMapped = normalizeConditionValue(mappedContra);
        for (const ci of contraindications) {
          if (ci.includes(normMapped) || normMapped.includes(ci)) {
            return condition;
          }
        }
      }
    }
  }

  return null;
}

function findTreatmentConflict(remedy, treatmentPrefs) {
  if (!treatmentPrefs?.length) return null;

  const name = (remedy.name || '').toLowerCase();
  const ingredients = (remedy.ingredients || []).map(i => i.toLowerCase());
  const category = (remedy.category || '').toLowerCase();

  // Prefer natural: filter out OTC remedies
  if (treatmentPrefs.includes('prefer_natural')) {
    if (category === 'otc' || category === 'over the counter') {
      return 'prefer natural (OTC remedy)';
    }
  }

  // Avoid medication: filter out pharmaceuticals
  if (treatmentPrefs.includes('avoid_medication')) {
    const pharmaKeywords = ['ibuprofen', 'acetaminophen', 'aspirin', 'paracetamol', 'antihistamine', 'decongestant'];
    if (pharmaKeywords.some(kw => name.includes(kw) || ingredients.some(i => i.includes(kw)))) {
      return 'avoid medication (pharmaceutical ingredient)';
    }
  }

  // Vegan: filter out all animal-derived and dairy/egg/honey products
  if (treatmentPrefs.includes('vegan_remedies')) {
    const nonVeganIngredients = ['gelatin', 'lanolin', 'collagen', 'chondroitin', 'glucosamine', 'fish oil', 'cod liver', 'shellfish', 'animal', 'lard', 'tallow', 'dairy', 'milk', 'whey', 'casein', 'lactose', 'eggs', 'egg', 'honey', 'beeswax', 'royal jelly', 'propolis'];
    if (ingredients.some(i => nonVeganIngredients.some(nv => i.includes(nv)))) {
      return 'vegan (animal-derived ingredient)';
    }
    const allergenTags = (remedy.allergen_tags || []).map(t => t.toLowerCase());
    if (allergenTags.some(t => t.includes('animal') || t.includes('shellfish') || t.includes('fish') || t.includes('dairy') || t.includes('egg'))) {
      return 'vegan (animal-derived allergen tag)';
    }
  }

  // Vegetarian only: filter out animal-derived ingredients
  if (treatmentPrefs.includes('vegetarian_remedies')) {
    const animalDerived = ['gelatin', 'lanolin', 'collagen', 'chondroitin', 'glucosamine', 'fish oil', 'cod liver', 'shellfish', 'animal', 'lard', 'tallow'];
    if (ingredients.some(i => animalDerived.some(ad => i.includes(ad)))) {
      return 'vegetarian only (animal-derived ingredient)';
    }
    const allergenTags = (remedy.allergen_tags || []).map(t => t.toLowerCase());
    if (allergenTags.some(t => t.includes('animal') || t.includes('shellfish') || t.includes('fish'))) {
      return 'vegetarian only (animal-derived allergen tag)';
    }
  }

  return null;
}

export function adjustConfidence(remedies, queryConfidence) {
  if (!remedies?.length) return [];
  if (queryConfidence == null || queryConfidence >= 60) {
    return remedies.map(r => ({
      ...r,
      _confidenceReason: r._confidenceReason || 'Strong match to known symptom',
    }));
  }

  const confidenceRatio = Math.max(queryConfidence / 60, 0.15);

  return remedies.map(remedy => ({
    ...remedy,
    _relevanceScore: Math.round(remedy._relevanceScore * confidenceRatio),
    _partialMatch: true,
    _originalQueryConfidence: queryConfidence,
    _confidenceReason: queryConfidence >= 30
      ? 'Partial match — results may be less specific'
      : 'Weak match — consider rephrasing your search',
  }));
}

export { findAllergyConflict, findContraindicationConflict };
