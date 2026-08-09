const PLAIN_LANGUAGE_REPLACEMENTS = [
  [/\u00e2[\u20ac\ufffd][\u201d\u201c\u2013\u2014]/g, '-'],
  [/\u00e2[\u20ac\ufffd]\u00a6/g, '...'],
  [/[\u2014\u2013]/g, '-'],
  [/\u2026/g, '...'],
  [/\ufffd/g, '-'],
  [/\bnon-pharmacological\b/gi, 'non-medicine'],
  [/\bcontraindications\b/gi, 'reasons to avoid it'],
  [/\bcontraindication\b/gi, 'reason to avoid it'],
  [/\bmyofascial\b/gi, 'muscle and connective tissue'],
  [/\bperistalsis\b/gi, 'normal gut movement'],
  [/\bbioavailability\b/gi, 'absorption'],
  [/\bdysmenorrhea\b/gi, 'period cramps'],
  [/\bantimicrobial\b/gi, 'germ-fighting'],
  [/\banti-inflammatory\b/gi, 'swelling-calming'],
  [/\banalgesic\b/gi, 'pain-relieving'],
  [/\bbronchodilator\b/gi, 'airway-opening medicine'],
  [/\bprophylactic\b/gi, 'preventive'],
  [/\bstandardized\b/gi, 'consistent-dose'],
  [/\bstandardised\b/gi, 'consistent-dose'],
  [/\bclinician\b/gi, 'doctor or pharmacist'],
  [/\bpractitioner\b/gi, 'doctor or pharmacist'],
  [/\btopical\b/gi, 'on-skin'],
  [/\bAn oral decongestant\b/g, 'A decongestant taken by mouth'],
  [/\ban oral decongestant\b/g, 'a decongestant taken by mouth'],
  [/\bA oral decongestant\b/g, 'A decongestant taken by mouth'],
  [/\boral decongestant\b/gi, 'decongestant taken by mouth'],
  [/\boral supplement\b/gi, 'supplement taken by mouth'],
  [/\boral medication\b/gi, 'medicine taken by mouth'],
  [/\bingestion\b/gi, 'swallowing'],
  [/\badminister\b/gi, 'use'],
  [/\badministration\b/gi, 'use'],
  [/\bdiscontinue\b/gi, 'stop using'],
  [/\bconsult\b/gi, 'ask'],
  [/\bmedical provider\b/gi, 'doctor'],
  [/\bhealthcare provider\b/gi, 'doctor'],
  [/\bgastrointestinal\b/gi, 'stomach and gut'],
  [/\brespiratory\b/gi, 'breathing'],
  [/\bcardiovascular\b/gi, 'heart and blood vessel'],
  [/\bdermatological\b/gi, 'skin'],
  [/\bpediatric\b/gi, 'child'],
  [/\bcontraindicated\b/gi, 'not recommended'],
  [/\badverse reaction\b/gi, 'bad reaction'],
  [/\badverse reactions\b/gi, 'bad reactions'],
  [/\bdosage\b/gi, 'dose'],
  [/\bmodality\b/gi, 'method'],
  [/\betiology\b/gi, 'cause'],
  [/\bsymptomatic relief\b/gi, 'symptom relief'],
];

function simplifyRemedyLanguage(value) {
  if (typeof value !== 'string') return value;
  return PLAIN_LANGUAGE_REPLACEMENTS.reduce(
    (current, [pattern, replacement]) => current.replace(pattern, replacement),
    value
  ).replace(/\s+/g, ' ').trim();
}

function simplifyStringList(value) {
  return Array.isArray(value) ? value.map(simplifyRemedyLanguage) : value;
}

function normalizeWarnings(value) {
  if (!value) return value;
  const items = Array.isArray(value)
    ? value
    : (value.match(/[^.!?]+[.!?]+/g) ?? [value]);
  return items
    .map((item) => item.trim())
    .filter(Boolean)
    .map(simplifyRemedyLanguage);
}

export function getInitials(name = '') {
  const initials = name
    .split(' ')
    .map((part) => part.trim()[0])
    .filter(Boolean)
    .join('')
    .toUpperCase();

  return initials || 'U';
}

function normalizeCategory(category) {
  return category === 'Ayurveda' ? 'Natural' : category;
}

export function mapRemedy(remedy) {
  if (!remedy) return null;

  const symptomItems = remedy.remedy_symptoms || [];
  const allSymptoms = symptomItems.map((item) => item.symptom_id);
  const primarySymptoms = symptomItems
    .filter((item) => !item.match_strength || item.match_strength === 'primary')
    .map((item) => item.symptom_id);
  const secondarySymptoms = symptomItems
    .filter((item) => item.match_strength === 'secondary')
    .map((item) => item.symptom_id);

  return {
    id: remedy.id,
    name: remedy.name,
    category: normalizeCategory(remedy.category),
    symptoms: allSymptoms.length > 0 ? allSymptoms : (remedy.symptoms || []),
    primarySymptoms: primarySymptoms.length > 0 ? primarySymptoms : (allSymptoms.length > 0 ? allSymptoms : (remedy.symptoms || [])),
    secondarySymptoms: secondarySymptoms.length > 0 ? secondarySymptoms : [],
    rating: remedy.rating,
    reviewCount: remedy.review_count ?? remedy.reviewCount,
    tagline: simplifyRemedyLanguage(remedy.tagline ?? ''),
    shortDescription: simplifyRemedyLanguage(remedy.short_description ?? remedy.shortDescription),
    longDescription: simplifyRemedyLanguage(remedy.long_description ?? remedy.longDescription),
    howToUse: simplifyRemedyLanguage(remedy.how_to_use ?? remedy.howToUse),
    warnings: normalizeWarnings(remedy.warnings),
    allergen_tags: remedy.allergen_tags ?? remedy.allergenTags ?? [],
    contraindications: simplifyStringList(remedy.contraindications ?? []),
    ingredients: simplifyStringList(remedy.ingredients ?? []),
    timeToEffect: remedy.time_to_effect ?? remedy.timeToEffect,
    difficulty: remedy.difficulty,
    cost: remedy.cost,
    isFeatured: remedy.is_featured ?? remedy.isFeatured ?? false,
    isPurchasable: remedy.is_purchasable ?? remedy.isPurchasable ?? (remedy.category !== 'Lifestyle' || (remedy.ingredients ?? []).length > 0),
    childSafe: remedy.child_safe ?? remedy.childSafe,
    childSafetyNote: remedy.child_safety_note ?? remedy.childSafetyNote ?? '',
    evidenceTier: remedy.evidence_tier ?? remedy.evidenceTier,
    evidenceNote: simplifyRemedyLanguage(remedy.evidence_note ?? remedy.evidenceNote ?? ''),
    researchPapers: remedy.research_papers?.map((paper) => ({
      title: paper.title,
      journal: paper.journal,
      url: paper.url,
      keyFinding: simplifyRemedyLanguage(paper.key_findings ?? paper.key_finding ?? paper.keyFinding),
    })) || remedy.researchPapers || [],
    researchLinks: remedy.researchLinks || [],
  };
}

export function mapAppointment(appointment) {
  if (!appointment) return null;

  return {
    ...appointment,
    date: appointment.apt_date ?? appointment.date,
    time: appointment.apt_time ?? appointment.time,
  };
}
