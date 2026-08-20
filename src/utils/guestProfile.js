const GUEST_PROFILE_KEY = 'clotsolid_guest_profile';

import { CONDITION_TO_CONTRAINDICATION_MAP, normalizeConditionValue } from './conditionMapping';

export function getGuestProfile() {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(GUEST_PROFILE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : {};
  } catch {
    return {};
  }
}

export function saveGuestProfile(profile) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(profile));
}

export function getGuestAllergies() {
  return getGuestProfile().known_allergies ?? [];
}

function normalizeIngredient(ingredient) {
  return ingredient.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
}

export function remedyMatchesAllergies(remedy, allergies = []) {
  if (!remedy || !allergies.length) return false;

  const normalizedAllergies = allergies.map((a) => a.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim()).filter(Boolean);

  const tags = (remedy.allergen_tags || []).map((t) => t.toLowerCase());
  for (const allergy of normalizedAllergies) {
    if (tags.some((tag) => tag === allergy || tag.includes(allergy) || allergy.includes(tag))) {
      return true;
    }
  }

  const ingredients = (remedy.ingredients || []).map(normalizeIngredient).filter(Boolean);
  for (const allergy of normalizedAllergies) {
    for (const ingredient of ingredients) {
      if (ingredient.includes(allergy) || allergy.includes(ingredient)) return true;
    }
  }

  const title = (remedy.name || '').toLowerCase();
  for (const allergy of normalizedAllergies) {
    if (title.includes(allergy)) return true;
  }

  return false;
}

export function remedyHasContraindication(remedy, conditions = []) {
  if (!remedy || !conditions?.length) return false;

  const normalizedConditions = conditions.map((c) => normalizeConditionValue(c)).filter(Boolean);
  const contraindications = (remedy.contraindications || []).map((c) => c.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim()).filter(Boolean);

  // Check direct matches first
  for (const condition of normalizedConditions) {
    for (const ci of contraindications) {
      if (ci.includes(condition) || condition.includes(ci)) {
        return true;
      }
    }
  }

  // Check mapped contraindications for each user condition
  for (const condition of conditions) {
    const mapped = CONDITION_TO_CONTRAINDICATION_MAP[condition];
    if (mapped) {
      for (const mappedContra of mapped) {
        const normMapped = mappedContra.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
        for (const ci of contraindications) {
          if (ci.includes(normMapped) || normMapped.includes(ci)) {
            return true;
          }
        }
      }
    }
  }

  return false;
}

export function getGuestConditions() {
  return getGuestProfile().common_conditions ?? [];
}

export function isRemedySafeForUser(remedy, { allergies, conditions, isChildSafe, treatmentPrefs }) {
  if (remedyMatchesAllergies(remedy, allergies)) return false;
  if (remedyHasContraindication(remedy, conditions)) return false;
  if (getChildSafetyStatus(remedy, isChildSafe).isHardBlock) return false;
  if (treatmentPrefs?.length && remedyHasTreatmentConflict(remedy, treatmentPrefs)) return false;
  return true;
}

function remedyHasTreatmentConflict(remedy, treatmentPrefs) {
  if (!treatmentPrefs?.length || !remedy) return false;

  const name = (remedy.name || '').toLowerCase();
  const ingredients = (remedy.ingredients || []).map(i => i.toLowerCase());
  const category = (remedy.category || '').toLowerCase();

  if (treatmentPrefs.includes('prefer_natural')) {
    if (category === 'otc' || category === 'over the counter') return true;
  }

  if (treatmentPrefs.includes('avoid_medication')) {
    const pharmaKeywords = ['ibuprofen', 'acetaminophen', 'aspirin', 'paracetamol', 'antihistamine', 'decongestant'];
    if (pharmaKeywords.some(kw => name.includes(kw) || ingredients.some(i => i.includes(kw)))) return true;
  }

  if (treatmentPrefs.includes('vegan_remedies')) {
    const nonVeganIngredients = ['gelatin', 'lanolin', 'collagen', 'chondroitin', 'glucosamine', 'fish oil', 'cod liver', 'shellfish', 'animal', 'lard', 'tallow', 'dairy', 'milk', 'whey', 'casein', 'lactose', 'eggs', 'egg', 'honey', 'beeswax', 'royal jelly', 'propolis'];
    if (ingredients.some(i => nonVeganIngredients.some(nv => i.includes(nv)))) return true;
    const allergenTags = (remedy.allergen_tags || []).map(t => t.toLowerCase());
    if (allergenTags.some(t => t.includes('animal') || t.includes('shellfish') || t.includes('fish') || t.includes('dairy') || t.includes('egg'))) return true;
  }

  if (treatmentPrefs.includes('vegetarian_remedies')) {
    const animalDerived = ['gelatin', 'lanolin', 'collagen', 'chondroitin', 'glucosamine', 'fish oil', 'cod liver', 'shellfish', 'animal', 'lard', 'tallow'];
    if (ingredients.some(i => animalDerived.some(ad => i.includes(ad)))) return true;
    const allergenTags = (remedy.allergen_tags || []).map(t => t.toLowerCase());
    if (allergenTags.some(t => t.includes('animal') || t.includes('shellfish') || t.includes('fish'))) return true;
  }

  return false;
}

export function getChildSafetyStatus(remedy, isChildSafe) {
  if (!isChildSafe) {
    return { hasConcern: false, isHardBlock: false, note: '' };
  }

  if (remedy?.childSafe === false || remedy?.child_safe === false) {
    return {
      hasConcern: true,
      isHardBlock: true,
      note: remedy.childSafetyNote || remedy.child_safety_note || 'Not recommended for children or teens without clinician guidance.',
    };
  }

  if (remedy?.childSafe === true || remedy?.child_safe === true) {
    return {
      hasConcern: false,
      isHardBlock: false,
      note: remedy.childSafetyNote || remedy.child_safety_note || '',
    };
  }

  return {
    hasConcern: true,
    isHardBlock: false,
    note: 'Child safety has not been reviewed for this remedy. Check with a clinician before use.',
  };
}
