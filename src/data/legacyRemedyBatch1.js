// First reviewed legacy batch. Search-result URLs are intentionally forbidden.
export const LEGACY_BATCH_1_EXCLUDED_IDS = new Set([
  'rem_h01', // duplicate of rem_001
  'rem_h02', // duplicate of rem_mg01
  'rem_h05', // duplicate of rem_004
  'rem_c02', // duplicate of rem_007
  'rem_n01', // duplicate of rem_030
  'rem_n02', // peppermint-tea nausea claim lacks direct clinical evidence
  'rem_n05', // duplicate of rem_dh01
  'rem_bp01', // duplicate of rem_016
]);

const paper = (title, journal, keyFinding, pmid) => ({
  title,
  journal,
  keyFinding,
  url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
});

export const LEGACY_BATCH_1_OVERRIDES = {
  rem_c01: {
    name: 'Zinc Cold-Relief Lozenges', isPurchasable: true, childSafe: false,
    childSafetyNote: 'Do not use high-dose zinc lozenges in children without clinician guidance.',
    ingredients: ['zinc acetate or zinc gluconate'], allergen_tags: [], contraindications: ['zinc allergy'],
    shortDescription: 'May shorten a cold by about two days, but certainty is low and adverse effects are common.',
    warnings: ['Follow the label for a short course.', 'Stop for significant nausea.', 'Never use intranasal zinc products.'],
    researchPapers: [paper('Zinc for prevention and treatment of the common cold', 'Cochrane Database Syst Rev', 'Low-certainty evidence suggests zinc used during a cold may shorten its duration; non-serious adverse effects may increase.', '38719213')],
  },
  rem_c05: {
    isPurchasable: true, childSafe: false,
    childSafetyNote: 'Honey must never be given to an infant younger than 12 months.',
    ingredients: ['honey', 'lemon', 'water or tea'], allergen_tags: ['honey'], contraindications: ['age under 12 months', 'honey allergy'],
    primarySymptoms: ['cough'], secondarySymptoms: ['cold'],
    shortDescription: 'Honey in a warm drink may ease nighttime cough in children older than one year and adults.',
    researchPapers: [paper('Effect of honey, dextromethorphan, and no treatment on nocturnal cough and sleep quality', 'Arch Pediatr Adolesc Med', 'In one pediatric trial, honey was rated better than no treatment for nocturnal cough frequency and combined symptoms.', '18056558')],
  },
  rem_a01: {
    name: 'L-Theanine for Stress', isPurchasable: true, childSafe: false,
    childSafetyNote: 'Evidence and dosing are insufficient for routine use in children.',
    ingredients: ['L-theanine'], allergen_tags: [], contraindications: ['low blood pressure', 'sedative use'],
    primarySymptoms: ['stress'], secondarySymptoms: ['anxiety'],
    shortDescription: 'A tea-derived amino acid with limited small-trial evidence for stress-related symptoms.',
    researchPapers: [paper('Effects of L-Theanine Administration on Stress-Related Symptoms and Cognitive Functions in Healthy Adults', 'Nutrients', 'A small four-week randomized trial reported improvements in selected stress-related measures; larger trials are needed.', '31623400')],
  },
  rem_a02: {
    isPurchasable: true, childSafe: false,
    childSafetyNote: 'Do not give ashwagandha to children without clinician guidance.',
    ingredients: ['standardized ashwagandha root extract'], allergen_tags: ['nightshade'],
    contraindications: ['pregnancy', 'thyroid disease', 'autoimmune disease', 'sedative use'],
    primarySymptoms: ['stress'], secondarySymptoms: ['anxiety'],
    shortDescription: 'A standardized root extract with modest, still-limited evidence for stress in adults.',
    researchPapers: [paper('An investigation into the stress-relieving and pharmacological actions of an ashwagandha extract', 'Medicine (Baltimore)', 'A 60-person randomized trial found improvement in some anxiety and hormonal outcomes; replication is needed.', '31517876')],
  },
  rem_a05: {
    name: 'Slow Paced Breathing', isPurchasable: false, childSafe: true,
    ingredients: [], allergen_tags: [], contraindications: ['breathing-induced dizziness'],
    primarySymptoms: ['stress'], secondarySymptoms: ['anxiety'],
    shortDescription: 'Slow, comfortable breathing can reduce arousal; strict breath holds are optional and should not cause discomfort.',
    howToUse: 'Breathe gently at a comfortable slow pace for two to five minutes. Skip breath holds. Stop if dizzy or short of breath.',
    researchPapers: [paper('How breath-control can change your life: a systematic review on psychophysiological correlates of slow breathing', 'Front Hum Neurosci', 'Slow breathing studies report autonomic and psychological changes, but methods and quality vary.', '30245619')],
  },
  rem_i01: {
    name: 'Melatonin for Sleep Timing', isPurchasable: true, childSafe: false,
    childSafetyNote: 'Pediatric melatonin should be used only with clinician guidance and secure storage.',
    ingredients: ['melatonin'], allergen_tags: [], contraindications: ['pregnancy', 'anticoagulant use', 'sedative use'],
    shortDescription: 'Melatonin has modest average effects on sleep latency and is most useful when sleep timing is disrupted.',
    researchPapers: [paper('Meta-analysis: melatonin for the treatment of primary sleep disorders', 'PLoS One', 'Across 19 studies, melatonin modestly reduced sleep latency and increased total sleep time.', '23691095')],
  },
  rem_i02: {
    isPurchasable: true, childSafe: false,
    childSafetyNote: 'Evidence is insufficient for using tart cherry juice as a pediatric sleep treatment.',
    ingredients: ['tart cherry juice'], allergen_tags: ['cherry'], contraindications: ['cherry allergy', 'diabetes'],
    shortDescription: 'Small preliminary studies suggest possible sleep benefits; the evidence remains limited.',
    researchPapers: [paper('Effect of tart cherry juice on melatonin levels and enhanced sleep quality', 'Eur J Nutr', 'A 20-person crossover trial reported increases in melatonin and selected sleep measures after seven days.', '22038497')],
  },
  rem_i05: {
    isPurchasable: false, childSafe: false,
    childSafetyNote: 'Children with persistent insomnia need assessment and an age-appropriate behavioral plan.',
    ingredients: [], allergen_tags: [], contraindications: ['untreated bipolar disorder', 'unsafe nighttime mobility'],
    primarySymptoms: ['insomnia'], secondarySymptoms: [],
    shortDescription: 'Stimulus control is a guideline-supported behavioral component of CBT-I for chronic insomnia in adults.',
    researchPapers: [paper('Behavioral and psychological treatments for chronic insomnia disorder in adults', 'J Clin Sleep Med', 'The AASM conditionally recommends stimulus control as a single-component adult insomnia therapy.', '33164742')],
  },
  rem_s01: {
    name: 'Rhodiola for Stress-Related Fatigue', isPurchasable: true, childSafe: false,
    childSafetyNote: 'Evidence and dosing are insufficient for routine pediatric use.',
    ingredients: ['standardized Rhodiola rosea extract'], allergen_tags: [], contraindications: ['bipolar disorder', 'stimulant use'],
    primarySymptoms: ['fatigue'], secondarySymptoms: ['stress'],
    shortDescription: 'Limited clinical evidence suggests possible benefit for stress-related fatigue.',
    researchPapers: [paper('A randomised, double-blind, placebo-controlled, parallel-group study of Rhodiola rosea in stress related fatigue', 'Planta Med', 'One randomized trial reported improvement in stress-related fatigue measures; broader confirmation is needed.', '19016404')],
  },
  rem_s02: {
    name: 'Lemon Balm Tea', isPurchasable: true, childSafe: false,
    childSafetyNote: 'Do not use medicinal-dose lemon balm in children without clinician guidance.',
    ingredients: ['lemon balm leaf'], allergen_tags: ['herbal'], contraindications: ['thyroid disease', 'sedative use'],
    shortDescription: 'Traditional calming tea with limited small-study evidence; it may cause drowsiness.',
    researchPapers: [paper('Attenuation of laboratory-induced stress in humans after acute administration of Melissa officinalis', 'Psychosom Med', 'A small laboratory study reported dose-dependent changes in calmness and alertness.', '15272110')],
  },
  rem_s05: {
    isPurchasable: false, childSafe: true,
    ingredients: [], allergen_tags: [], contraindications: ['unsafe outdoor conditions', 'exercise restriction'],
    primarySymptoms: ['stress'], secondarySymptoms: ['brain_fog'],
    shortDescription: 'A short outdoor walk combines light activity and nature exposure and may modestly improve mood.',
    researchPapers: [paper('What is the best dose of nature and green exercise for improving mental health?', 'Environ Sci Technol', 'A multi-study analysis found mood and self-esteem benefits from green exercise, including short sessions.', '20337470')],
  },
  rem_bp02: {
    name: 'Gentle Yoga Mobility for Back Pain', isPurchasable: false, childSafe: false,
    childSafetyNote: 'Children with persistent back pain should be assessed before starting a treatment routine.',
    ingredients: [], allergen_tags: [], contraindications: ['new neurologic symptoms', 'acute traumatic back injury'],
    shortDescription: 'A gentle yoga program may improve function in adults with chronic nonspecific low-back pain; one pose alone is not proven.',
    howToUse: 'Use a gentle, progressive yoga routine within a pain-free range. Stop for radiating pain, weakness, or numbness.',
    researchPapers: [paper('Yoga, Physical Therapy, or Education for Chronic Low Back Pain', 'Ann Intern Med', 'A 12-week manualized yoga program was noninferior to physical therapy for function and pain in adults with chronic nonspecific low-back pain.', '28631003')],
  },
};

export function applyLegacyBatch1(remedies) {
  return remedies
    .filter((remedy) => !LEGACY_BATCH_1_EXCLUDED_IDS.has(remedy.id))
    .map((remedy) => ({ ...remedy, ...(LEGACY_BATCH_1_OVERRIDES[remedy.id] || {}) }));
}
