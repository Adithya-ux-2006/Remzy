export const LEGACY_BATCH_3_EXCLUDED_IDS = new Set([
  'rem_h09','rem_h10','rem_c06','rem_c07','rem_c08','rem_c09','rem_c10','rem_a06','rem_a07',
  'rem_i06','rem_i07','rem_i10','rem_n06','rem_n07','rem_n10','rem_s06','rem_s07','rem_s08','rem_s09',
]);
const paper = (title, journal, keyFinding, pmid) => ({ title, journal, keyFinding, url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` });
export const LEGACY_BATCH_3_OVERRIDES = {
  rem_a08: {
    isPurchasable: true, childSafe: false, childSafetyNote: 'Keep essential oils away from children and do not use as a pediatric anxiety treatment without guidance.',
    ingredients: ['lavender essential oil'], allergen_tags: ['lavender'], contraindications: ['lavender allergy', 'asthma triggered by fragrance'],
    primarySymptoms: ['anxiety'], secondarySymptoms: ['stress'],
    shortDescription: 'Lavender aromatherapy may reduce short-term anxiety, but studies are heterogeneous and many have risk of bias.',
    researchPapers: [paper('Effects of lavender on anxiety: A systematic review and meta-analysis', 'Phytomedicine', 'Evidence suggested an inhaled-lavender effect, but heterogeneity and study bias limit certainty.', '31655395')],
  },
  rem_a09: {
    isPurchasable: false, childSafe: false, childSafetyNote: 'Children should use age-appropriate relaxation recordings with adult supervision.',
    ingredients: [], allergen_tags: [], contraindications: ['trauma-triggered dissociation'],
    primarySymptoms: ['stress'], secondarySymptoms: ['anxiety'],
    shortDescription: 'A meta-analysis found improvements in stress and anxiety, but low study quality and varied protocols limit certainty.',
    researchPapers: [paper('Effects of Yoga Nidra on Stress, Anxiety, and Depression: A Systematic Review and Meta-Analysis', 'Ann N Y Acad Sci', 'The review found benefits for stress and anxiety, while warning that low methodological quality may inflate the effects.', '41327816')],
  },
  rem_a10: {
    isPurchasable: false, childSafe: true, ingredients: [], allergen_tags: [], contraindications: ['writing-triggered acute distress'],
    primarySymptoms: ['stress'], secondarySymptoms: ['anxiety'],
    shortDescription: 'Journaling has a small average adjunctive benefit in mental-health trials, with substantial variation between studies.',
    researchPapers: [paper('Efficacy of journaling in the management of mental illness: a systematic review and meta-analysis', 'Fam Med Community Health', 'Twenty randomized trials suggested a small-to-moderate adjunctive benefit, with high heterogeneity between studies.', '35304431')],
  },
  rem_i08: {
    isPurchasable: true, childSafe: false, childSafetyNote: 'Never use for infants; children require an appropriately sized product and professional safety guidance.',
    ingredients: ['weighted blanket'], allergen_tags: [], contraindications: ['respiratory impairment', 'limited mobility', 'claustrophobia'],
    shortDescription: 'Evidence for insomnia is limited and population-specific; weighted blankets are unsafe for infants and some disabled users.',
    researchPapers: [paper('Weighted Blanket Use: A Systematic Review', 'Am J Occup Ther', 'The review found sparse evidence and insufficient support for weighted blankets as an insomnia treatment.', '32204779')],
  },
  rem_i09: {
    isPurchasable: false, childSafe: true, ingredients: [], allergen_tags: [], contraindications: [],
    shortDescription: 'Sleep hygiene can support a broader insomnia plan, but guidelines advise against using it as the only treatment for chronic insomnia.',
    researchPapers: [paper('Behavioral and psychological treatments for chronic insomnia disorder in adults: an American Academy of Sleep Medicine clinical practice guideline', 'J Clin Sleep Med', 'The guideline recommends CBT-I and advises against sleep hygiene as a single-component therapy for chronic insomnia.', '33164742')],
  },
};
export function applyLegacyBatch3(remedies) {
  return remedies.filter((r) => !LEGACY_BATCH_3_EXCLUDED_IDS.has(r.id)).map((r) => ({ ...r, ...(LEGACY_BATCH_3_OVERRIDES[r.id] || {}) }));
}
