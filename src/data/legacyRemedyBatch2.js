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
const limited = (note) => ({ evidenceTier: 'limited', evidenceNote: note, researchPapers: [], researchLinks: [] });

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
    shortDescription: 'A commonly recommended screen-break habit, but direct clinical evidence for the exact 20-20-20 schedule is limited.',
    ...limited('The exact 20-20-20 rule has limited direct trial evidence. It is presented as a low-risk ergonomic break, not a proven treatment.'),
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
  rem_sr02: {
    isPurchasable: false, childSafe: true, ingredients: [], allergen_tags: [], contraindications: ['cold-induced urticaria'],
    primarySymptoms: ['skin_rash'], secondarySymptoms: ['hives'],
    shortDescription: 'A cool damp cloth can provide temporary comfort for mild itching, but it does not treat the cause of a rash.',
    ...limited('Cooling is standard comfort care, but high-quality trials of a cool compress as a stand-alone rash treatment are not available.'),
  },
  rem_bg01: {
    isPurchasable: true, childSafe: false,
    childSafetyNote: 'Medicinal peppermint products should not be given to children without clinician guidance.',
    ingredients: ['peppermint leaf'], allergen_tags: ['peppermint'], contraindications: ['peppermint allergy', 'GERD'],
    primarySymptoms: ['bloating'], secondarySymptoms: [],
    shortDescription: 'Peppermint tea is traditionally used for bloating, but clinical evidence mainly concerns enteric-coated peppermint oil rather than tea.',
    ...limited('Evidence for peppermint oil in IBS cannot be assumed to prove peppermint tea treats bloating.'),
  },
  rem_bg02: {
    isPurchasable: false, childSafe: true, ingredients: [], allergen_tags: [], contraindications: ['exercise restriction', 'severe abdominal pain'],
    primarySymptoms: ['bloating'], secondarySymptoms: [],
    shortDescription: 'A gentle post-meal walk may feel helpful, but direct evidence for treating bloating is limited.',
    ...limited('Light walking is low risk for most people, but it is not established as a clinical treatment for unexplained bloating.'),
  },
  rem_ho01: {
    name: 'Supportive Hydration After Alcohol', isPurchasable: true, childSafe: false,
    childSafetyNote: 'This content is not appropriate for children.',
    ingredients: ['water or oral rehydration drink'], allergen_tags: [], contraindications: ['fluid restriction', 'possible alcohol poisoning'],
    primarySymptoms: ['hangover'], secondarySymptoms: ['dehydration'],
    shortDescription: 'Fluids may correct dehydration but are not proven to cure a hangover or prevent alcohol poisoning.',
    ...limited('No reliable intervention cures hangover. Hydration is presented only as supportive care for possible fluid loss.'),
  },
  rem_ft01: {
    name: 'Daylight Activity Break', isPurchasable: false, childSafe: true,
    ingredients: [], allergen_tags: [], contraindications: ['exercise restriction', 'photosensitivity'],
    primarySymptoms: ['fatigue'], secondarySymptoms: ['brain_fog'],
    shortDescription: 'Daylight and light activity may improve alertness temporarily, but persistent fatigue needs evaluation.',
    ...limited('Evidence varies by population and does not establish a short daylight walk as treatment for unexplained fatigue.'),
  },
};

export function applyLegacyBatch2(remedies) {
  return remedies
    .filter((remedy) => !LEGACY_BATCH_2_EXCLUDED_IDS.has(remedy.id))
    .map((remedy) => ({ ...remedy, ...(LEGACY_BATCH_2_OVERRIDES[remedy.id] || {}) }));
}
