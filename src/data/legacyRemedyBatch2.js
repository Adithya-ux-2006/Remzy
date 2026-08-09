export const LEGACY_BATCH_2_EXCLUDED_IDS = new Set([
  'rem_bp03', // curcumin evidence was not specific to back pain
  'rem_st02', // duplicates the reviewed honey remedy
  'rem_es02', // duplicates rem_106
  'rem_fv02', // cooling may add discomfort and is not a fever treatment
  'rem_ep02', // jaw/neck explanation was guessed rather than diagnosed
  'rem_ho02', // no direct evidence for this hangover combination
  'rem_ft02', // generic snack advice is not a fatigue treatment
  'rem_lp01', // broad leg-pain mapping could mask urgent causes
  'rem_h06', // caffeine/L-theanine evidence does not support headache claim
  'rem_h08', // Bacopa evidence does not support headache claim
]);

const paper = (title, journal, keyFinding, pmid) => ({ title, journal, keyFinding, url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` });

export const LEGACY_BATCH_2_OVERRIDES = {
  rem_st01: {
    isPurchasable: false, childSafe: false,
    childSafetyNote: 'Children who cannot reliably gargle and spit should not use this technique.',
    ingredients: ['salt', 'warm water'], allergen_tags: [], contraindications: ['difficulty swallowing', 'sodium restriction'],
    primarySymptoms: ['sore_throat'], secondarySymptoms: ['cold'],
    shortDescription: 'Gargling may provide temporary throat comfort; evidence for preventing respiratory infections comes from one trial.',
    researchPapers: [paper('Prevention of upper respiratory tract infections by gargling', 'Am J Prev Med', 'One randomized trial found fewer upper respiratory infections with plain-water gargling; this does not establish salt water as a cure.', '16242593')],
  },
  rem_es01: {
    isPurchasable: false, childSafe: true, ingredients: [], allergen_tags: [], contraindications: [],
    primarySymptoms: ['eye_strain'], secondarySymptoms: [],
    shortDescription: 'Break reminders using the 20-20-20 rule reduced digital-eye-strain and dry-eye symptoms in a small intervention study.',
    researchPapers: [paper('The effects of breaks on digital eye strain, dry eye and binocular vision: Testing the 20-20-20 rule', 'Cont Lens Anterior Eye', 'In 29 symptomatic computer users, two weeks of 20-20-20 reminders reduced digital-eye-strain and dry-eye symptoms, without improving most objective eye measures.', '35963776')],
  },
  rem_pc01: {
    isPurchasable: true, childSafe: false,
    childSafetyNote: 'Adolescents with severe or recurrent menstrual pain should be assessed; use heat only with supervision and skin protection.',
    ingredients: [], allergen_tags: [], contraindications: ['reduced skin sensation', 'broken skin'],
    shortDescription: 'Heat can reduce primary menstrual pain, although earlier evidence was based on relatively few small trials.',
    researchPapers: [paper('Heat therapy for primary dysmenorrhea: a systematic review and meta-analysis', 'Sci Rep', 'Six randomized trials provided suggestive evidence that heat reduces primary dysmenorrhea pain.', '30389956')],
  },
  rem_pc02: {
    isPurchasable: true, childSafe: false,
    childSafetyNote: 'Medicinal-dose ginger for adolescents should be discussed with a clinician.',
    ingredients: ['ginger'], allergen_tags: ['ginger'], contraindications: ['ginger allergy', 'anticoagulant use', 'reflux'],
    primarySymptoms: ['period_cramps'], secondarySymptoms: ['nausea'],
    shortDescription: 'Ginger may reduce primary menstrual pain, but included trials were small and varied.',
    researchPapers: [paper('Efficacy of Ginger for Alleviating the Symptoms of Primary Dysmenorrhea', 'Pain Med', 'A systematic review of randomized trials found ginger more effective than placebo for primary dysmenorrhea pain.', '26177393')],
  },
  rem_sr01: {
    name: 'Colloidal Oatmeal for Mild Eczema', isPurchasable: true, childSafe: true,
    ingredients: ['colloidal oatmeal'], allergen_tags: ['oat'], contraindications: ['oat allergy'],
    primarySymptoms: ['eczema'], secondarySymptoms: ['skin_rash'],
    shortDescription: 'A colloidal-oat product may improve mild-to-moderate eczema symptoms; it is not appropriate for an unexplained severe rash.',
    researchPapers: [paper('Effects of Colloidal Oatmeal Topical Atopic Dermatitis Cream on Skin Microbiome and Skin Barrier Properties', 'J Drugs Dermatol', 'A randomized study found improvements in eczema severity and skin-barrier measures with a 1% colloidal-oat cream.', '32484623')],
  },
  rem_bg02: {
    isPurchasable: false, childSafe: true, ingredients: [], allergen_tags: [], contraindications: ['exercise restriction', 'severe abdominal pain'],
    primarySymptoms: ['bloating'], secondarySymptoms: [],
    shortDescription: 'A randomized trial found that a 10-to-15-minute walk after meals improved functional bloating symptoms over four weeks.',
    researchPapers: [paper('The effect of a short-term physical activity after meals on gastrointestinal symptoms in individuals with functional abdominal bloating', 'Middle East J Dig Dis', 'A randomized trial found post-meal walking improved bloating and related gastrointestinal symptoms over four weeks.', '33868611')],
  },
  rem_ft01: {
    name: 'Light Walking Activity Break', isPurchasable: false, childSafe: true,
    ingredients: [], allergen_tags: [], contraindications: ['exercise restriction'],
    primarySymptoms: ['fatigue'], secondarySymptoms: ['brain_fog'],
    shortDescription: 'Brief light-intensity walking breaks reduced short-term fatigue in a small randomized crossover study of sedentary adults.',
    researchPapers: [paper('Acute effects of breaking up prolonged sitting on fatigue and cognition: a pilot study', 'BMJ Open', 'Three-minute light walking breaks every 30 minutes reduced self-reported fatigue versus uninterrupted sitting in a small crossover trial.', '26920441')],
  },
};

export function applyLegacyBatch2(remedies) {
  return remedies
    .filter((remedy) => !LEGACY_BATCH_2_EXCLUDED_IDS.has(remedy.id))
    .map((remedy) => ({ ...remedy, ...(LEGACY_BATCH_2_OVERRIDES[remedy.id] || {}) }));
}
