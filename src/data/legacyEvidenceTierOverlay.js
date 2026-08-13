const paper = (title, journal, keyFinding, pmid) => ({ title, journal, keyFinding, url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` });

const OVERRIDES = {
  rem_sr02: {
    name: 'Cool Compress for Itchy Irritation', isPurchasable: false, childSafe: true, ingredients: [], allergen_tags: [], contraindications: ['cold-induced urticaria'],
    primarySymptoms: ['skin_rash'], secondarySymptoms: ['hives'],
    shortDescription: 'A cool damp cloth can temporarily relieve mild itching; evidence supports cooling for itch, but it does not treat the cause of a rash.',
    researchPapers: [
      paper('Effects of menthol and cold on histamine-induced itch and skin reactions in man', 'Neurosci Lett', 'Cooling the skin significantly reduced histamine-induced itch intensity, supporting cool-compress use for temporary itch relief.', '7624016'),
      paper('Cooling Relief of Acute and Chronic Itch Requires TRPM8 Channels and Neurons', 'J Invest Dermatol', 'Cooling relieves acute and chronic itch through TRPM8 cold-gated channels, explaining why cool compresses reduce itching.', '29288650'),
    ],
  },
  rem_bg01: {
    name: 'Peppermint Bloating Tea', isPurchasable: true, childSafe: false,
    childSafetyNote: 'Medicinal peppermint products should not be given to children without clinician guidance.',
    ingredients: ['peppermint leaf'], allergen_tags: ['peppermint'], contraindications: ['peppermint allergy', 'GERD'],
    primarySymptoms: ['bloating'], secondarySymptoms: [],
    shortDescription: 'Peppermint oil is well studied for IBS-related bloating; whether peppermint tea matches oil-based trial results is less certain.',
    researchPapers: [
      paper('Peppermint oil for the treatment of irritable bowel syndrome: a systematic review and meta-analysis', 'J Clin Gastroenterol', 'Meta-analysis found enteric-coated peppermint oil improved IBS symptoms; the trials tested oil capsules, not tea.', '24100754'),
      paper('Peppermint oil (Mintoil) in the treatment of irritable bowel syndrome: a prospective double blind placebo-controlled randomized trial', 'Dig Liver Dis', 'A randomized double-blind trial found enteric-coated peppermint oil reduced IBS bloating and total symptom scores; this does not validate peppermint tea.', '17420159'),
    ],
  },
  rem_ho01: {
    name: 'Supportive Hydration After Alcohol', isPurchasable: true, childSafe: false,
    childSafetyNote: 'This content is not appropriate for children.',
    ingredients: ['water or oral rehydration drink'], allergen_tags: [], contraindications: ['fluid restriction', 'possible alcohol poisoning'],
    primarySymptoms: ['hangover'], secondarySymptoms: ['dehydration'],
    shortDescription: 'Fluids may address thirst but do not cure a hangover; current evidence does not show that water reduces hangover severity.',
    researchPapers: [
      paper('Interventions for preventing or treating alcohol hangover: systematic review of randomised controlled trials', 'BMJ', 'A systematic review found no compelling evidence that any intervention, including fluid intake, prevents or treats hangover.', '16373736'),
      paper('Randomised double-blind placebo-controlled intervention study on the nutritional efficacy of a food for special medical purposes (FSMP) and a dietary supplement in reducing the symptoms of veisalgia', 'BMJ Nutr Prev Health', 'In a 214-person randomized trial, no significant dehydration occurred during hangover and water or electrolyte supplements did not improve symptoms.', '33235969'),
    ],
  },
  rem_n09: {
    name: 'Small Frequent Meals for Nausea', isPurchasable: false, childSafe: true, ingredients: [], allergen_tags: [], contraindications: ['eating disorder', 'medically prescribed meal plan'],
    primarySymptoms: ['nausea'], secondarySymptoms: [],
    shortDescription: 'Guidelines recommend frequent small meals for pregnancy-related nausea; evidence for other causes of nausea is less clear.',
    researchPapers: [
      paper('The Management of Nausea and Vomiting of Pregnancy: Synthesis of National Guidelines', 'Obstet Gynecol Surv', 'A synthesis of national guidelines on nausea and vomiting of pregnancy recommends frequent small meals for prevention.', '31634919'),
      paper('Treatments for Hyperemesis Gravidarum and Nausea and Vomiting in Pregnancy: A Systematic Review', 'JAMA', 'A systematic review of 78 studies found ginger, vitamin B6, antihistamines and metoclopramide improved pregnancy-nausea symptoms; evidence on dietary measures was limited.', '27701665'),
    ],
  },
  rem_st03: {
    name: 'Licorice Root Soothing Tea', isPurchasable: true, childSafe: false,
    childSafetyNote: 'Do not give medicinal licorice products to children without clinician guidance.',
    ingredients: ['licorice root'], allergen_tags: ['licorice'], contraindications: ['hypertension', 'heart disease', 'kidney disease', 'pregnancy'],
    primarySymptoms: ['sore_throat'], secondarySymptoms: [],
    shortDescription: 'Licorice gargles reduced post-operative sore throat in trials; this does not validate licorice tea for an ordinary sore throat.',
    researchPapers: [
      paper('A randomized, double-blind comparison of licorice versus sugar-water gargle for prevention of postoperative sore throat and postextubation coughing', 'Anesth Analg', 'Gargling with licorice halved the incidence of postoperative sore throat after intubation; evidence concerns gargling, not tea.', '23921656'),
      paper('An evaluation of the efficacy of licorice gargle for attenuating postoperative sore throat: a prospective, randomized, single-blind study', 'Anesth Analg', 'A randomized trial found licorice gargle reduced postoperative sore throat; direct evidence for licorice tea in ordinary sore throat is lacking.', '19535697'),
    ],
  },
  rem_st05: {
    name: 'Marshmallow Root Soothing Tea', isPurchasable: true, childSafe: false,
    childSafetyNote: 'Pediatric use requires clinician guidance.',
    ingredients: ['marshmallow root'], allergen_tags: ['marshmallow root'], contraindications: ['herbal allergy', 'medication absorption concerns'],
    primarySymptoms: ['sore_throat'], secondarySymptoms: [],
    shortDescription: 'Consumer surveys report marshmallow root helps throat irritation and dry cough; controlled trials for acute sore throat are lacking.',
    researchPapers: [
      paper('Marshmallow Root Extract for the Treatment of Irritative Cough: Two Surveys on Users View on Effectiveness and Tolerability', 'Complement Med Res', 'Two consumer surveys (n=822) reported marshmallow root preparations helped pharyngeal irritation and dry cough; this is survey evidence, not controlled trials.', '30064132'),
    ],
  },
  rem_es04: {
    name: 'Brief Eyes-Closed Rest', isPurchasable: false, childSafe: true, ingredients: [], allergen_tags: [], contraindications: ['eye injury', 'acute eye pain'],
    primarySymptoms: ['eye_strain'], secondarySymptoms: [],
    shortDescription: 'A yoga program that includes palming-style eye relaxation reduced visual discomfort in computer users; it does not treat underlying eye conditions.',
    howToUse: 'Close the eyes without pressing on them and breathe normally for two to five minutes.',
    researchPapers: [
      paper('Effect of yoga on self-rated visual discomfort in computer users', 'Head Face Med', 'A randomized controlled trial found a yoga practice that includes eye relaxation reduced self-rated visual discomfort in professional computer users.', '17140457'),
    ],
  },
  rem_ho06: {
    name: 'Supervised Rest After Alcohol', isPurchasable: false, childSafe: false,
    childSafetyNote: 'This content is not appropriate for children.',
    ingredients: [], allergen_tags: [], contraindications: ['possible alcohol poisoning', 'unsafe sleep environment'],
    primarySymptoms: ['hangover'], secondarySymptoms: [],
    shortDescription: 'Poor or reduced sleep is associated with more severe hangovers, but rest does not accelerate alcohol clearance or treat poisoning.',
    researchPapers: [
      paper('Total sleep time, alcohol consumption, and the duration and severity of alcohol hangover', 'Nat Sci Sleep', 'A survey of 578 students found reduced total sleep time was associated with more severe hangovers; sleep does not clear alcohol faster.', '28721110'),
      paper('The Relationship between Alcohol Hangover Severity, Sleep and Cognitive Performance; a Naturalistic Study', 'J Clin Med', 'A naturalistic study found alcohol impairs sleep and worse sleep is related to higher next-day hangover severity; observational, not a treatment trial.', '34884392'),
    ],
  },
  rem_sp03: {
    name: 'Gentle Doorway Chest Stretch', isPurchasable: false, childSafe: true, ingredients: [], allergen_tags: [], contraindications: ['acute shoulder injury', 'instability'],
    primarySymptoms: ['shoulder_pain'], secondarySymptoms: [],
    shortDescription: 'Doorway stretch improved chest-muscle length and shoulder internal rotation in athletes; evidence is for range of motion, not pain relief.',
    researchPapers: [
      paper('Acute effects of doorway stretch on the glenohumeral rotational range of motion and scapular position in high-school baseball players', 'JSES Int', 'Doorway stretch significantly increased pectoralis minor length and glenohumeral internal-rotation range acutely in baseball players; pain relief was not measured.', '34766072'),
    ],
  },
  rem_sp07: {
    name: 'Clinician-Guided Shoulder Mobility', isPurchasable: false, childSafe: false,
    childSafetyNote: 'Persistent pediatric shoulder pain requires assessment.',
    ingredients: [], allergen_tags: [], contraindications: ['dislocation', 'fracture', 'postoperative restriction'],
    primarySymptoms: ['shoulder_pain'], secondarySymptoms: [],
    shortDescription: 'Manual therapy and exercise are components of frozen-shoulder rehabilitation; benefit for general shoulder pain is not established.',
    researchPapers: [
      paper('Manual therapy and exercise for adhesive capsulitis (frozen shoulder)', 'Cochrane Database Syst Rev', 'A Cochrane review of 32 trials found manual therapy and exercise may be less effective than steroid injection in the short term for frozen shoulder; it is not established for general shoulder pain.', '25157702'),
    ],
  },
};

export function applyLegacyEvidenceTierOverlay(remedies) {
  return remedies.map((remedy) => ({ ...remedy, ...(OVERRIDES[remedy.id] || {}) }));
}
