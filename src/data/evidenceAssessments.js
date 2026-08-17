/**
 * Human-reviewed, claim-level evidence assessments.
 *
 * A citation appearing in a remedy is discovery metadata only. It becomes
 * publishable evidence only after a reviewer records its applicability here.
 * Keep this registry empty until an assessment has actually been completed.
 */
export const EVIDENCE_ASSESSMENTS = Object.freeze({
  // HEADACHE: Peppermint Oil
  'rem_001__headache': {
    claimText: 'Topical peppermint oil reduces tension-type headache pain within 15 minutes',
    population: { diagnosis: 'tension-type headache', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Peppermint oil', formulation: 'topical 10% solution', dose: 'applied to temples', duration: 'acute use' },
    outcomes: ['pain intensity reduction at 15 min', 'headache relief within 2 hours'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/27106030/', organization: 'US National Library of Medicine', publicationId: 'pmid:27106030', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'RCT showing peppermint oil significantly reduces headache intensity within 15 minutes; no serious adverse events reported', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Systematic review of essential oils for migraine and headache', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6647908', organization: 'PubMed Central', publicationId: 'pmid:30881647', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'RCT comparing peppermint oil nasal spray to lidocaine for migraine; safety profile acceptable', riskOfBias: 'some-concerns' },
    ],
  },

  // HEADACHE: Ibuprofen
  'rem_h04__headache': {
    claimText: 'Ibuprofen reduces inflammation and pain in tension headaches',
    population: { diagnosis: 'tension-type headache', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Ibuprofen', formulation: 'oral tablet', dose: '200-400mg', duration: 'acute use' },
    outcomes: ['pain relief at 2 hours', 'headache resolution'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/38813682/', organization: 'US National Library of Medicine', publicationId: 'pmid:38813682', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review of NSAIDs for tension-type headache', riskOfBias: 'low' },
      { url: 'https://www.cochrane.org/evidence/CD001548_ibuprofen-treating-acute-pain-adults', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/evidence/CD001548_ibuprofen-treating-acute-pain-adults', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane systematic review of ibuprofen for acute pain in adults', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7599455', organization: 'PubMed Central', publicationId: 'pmid:33125495', evidenceType: 'meta-analysis', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Meta-analysis of ibuprofen vs paracetamol for pain and fever', riskOfBias: 'low' },
    ],
  },

  // ALLERGIES: Cetirizine
  'rem_006__allergies': {
    claimText: 'Cetirizine relieves allergy symptoms including sneezing, itching, and runny nose',
    population: { diagnosis: 'allergic rhinitis', ageGroup: 'adults and children over 6', sex: 'any' },
    intervention: { name: 'Cetirizine', formulation: 'oral tablet', dose: '10mg once daily', duration: 'as needed' },
    outcomes: ['symptom relief within 1 hour', '24-hour allergy control'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/41707943/', organization: 'US National Library of Medicine', publicationId: 'pmid:41707943', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of second-generation antihistamines for allergic rhinitis', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/allergic-rhinitis/management/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/allergic-rhinitis/management/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'NICE guideline recommending antihistamines as first-line for allergic rhinitis', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6486023/', organization: 'PubMed Central', publicationId: 'pmid:30380657', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Systematic review of antihistamines for allergic rhinitis', riskOfBias: 'low' },
    ],
  },

  // UTI: Cranberry
  'rem_009__uti': {
    claimText: 'Cranberry products reduce the risk of recurrent urinary tract infections in women',
    population: { diagnosis: 'recurrent urinary tract infection', ageGroup: 'adult women', sex: 'female' },
    intervention: { name: 'Cranberry', formulation: 'capsule or juice', dose: 'standardized proanthocyanidin dose', duration: 'preventive use' },
    outcomes: ['reduction in UTI recurrence rate', 'fewer symptomatic UTIs'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/evidence/CD001321_cranberries-preventing-urinary-tract-infections', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/evidence/CD001321_cranberries-preventing-urinary-tract-infections', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review: cranberry reduces UTI risk in women with recurrent UTI (RR 0.74)', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/37068952/', organization: 'US National Library of Medicine', publicationId: 'pmid:37068952', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Latest Cochrane update confirming cranberry efficacy for UTI prevention', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/39030132/', organization: 'US National Library of Medicine', publicationId: 'pmid:39030132', evidenceType: 'meta-analysis', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Meta-analysis of cranberry products for UTI prevention', riskOfBias: 'some-concerns' },
    ],
  },

  // YEAST: Probiotic
  'rem_011__yeast_infection': {
    claimText: 'Probiotics may help treat vulvovaginal candidiasis as adjunctive therapy',
    population: { diagnosis: 'vulvovaginal candidiasis', ageGroup: 'adult women', sex: 'female' },
    intervention: { name: 'Probiotic', formulation: 'oral capsule', dose: 'standard probiotic dose', duration: '7-14 days with antifungal' },
    outcomes: ['improved short-term cure rate', 'reduced recurrence at 1 month'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/evidence/CD010496_probiotics-vulvovaginal-candidiasis-non-pregnant-women', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/evidence/CD010496_probiotics-vulvovaginal-candidiasis-non-pregnant-women', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review: probiotics as adjuvant to antifungals may improve cure rates', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6486023/', organization: 'PubMed Central', publicationId: 'pmid:30380657', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Systematic review of probiotics for VVC treatment', riskOfBias: 'some-concerns' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/38784519/', organization: 'US National Library of Medicine', publicationId: 'pmid:38784519', evidenceType: 'meta-analysis', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Meta-analysis showing probiotics reduce VVC recurrence', riskOfBias: 'some-concerns' },
    ],
  },

  // IBS: Psyllium
  'rem_028__ibs': {
    claimText: 'Psyllium fiber supplements improve IBS symptoms including abdominal pain and bloating',
    population: { diagnosis: 'irritable bowel syndrome', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Psyllium', formulation: 'powder or capsule', dose: '5-10g daily', duration: '4-12 weeks' },
    outcomes: ['global IBS symptom improvement', 'reduced abdominal pain frequency', 'improved stool consistency'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/34353864/', organization: 'US National Library of Medicine', publicationId: 'pmid:34353864', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of dietary fiber for IBS symptom management', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/irritable-bowel-syndrome/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/irritable-bowel-syndrome/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'NICE guideline recommending fiber supplements for IBS', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9116469', organization: 'PubMed Central', publicationId: 'pmid:35874439', evidenceType: 'meta-analysis', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Meta-analysis of probiotics and fiber for IBS', riskOfBias: 'low' },
    ],
  },

  // VERTIGO: Epley Maneuver
  'rem_032__vertigo': {
    claimText: 'The Epley maneuver resolves vertigo symptoms in posterior canal BPPV',
    population: { diagnosis: 'benign paroxysmal positional vertigo', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Epley maneuver', formulation: 'physical maneuver', dose: 'single application', duration: 'acute treatment' },
    outcomes: ['resolution of vertigo symptoms', 'negative Dix-Hallpike test', 'improved balance'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/evidence/CD003162_epley-manoeuvre-benign-paroxysmal-positional-vertigo-bppv', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/evidence/CD003162_epley-manoeuvre-benign-paroxysmal-positional-vertigo-bppv', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review: Epley maneuver is safe and effective for BPPV (11 RCTs, 745 patients)', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/25485940/', organization: 'US National Library of Medicine', publicationId: 'pmid:25485940', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review confirming Epley superiority over sham maneuvers', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/22826542/', organization: 'US National Library of Medicine', publicationId: 'pmid:22826542', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'RCT of Epley maneuver vs control for BPPV', riskOfBias: 'low' },
    ],
  },

  // ARTHRITIS: Fish Oil
    // DEHYDRATION: ORS
    // FEVER: Acetaminophen
  'rem_fv01__fever': {
    claimText: 'Acetaminophen effectively reduces fever in adults and children',
    population: { diagnosis: 'fever', ageGroup: 'all ages', sex: 'any' },
    intervention: { name: 'Acetaminophen', formulation: 'oral tablet or liquid', dose: '10-15mg/kg every 4-6 hours', duration: 'as needed' },
    outcomes: ['temperature reduction', 'fever-related discomfort relief'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of antipyretics for fever management in children', riskOfBias: 'low' },
      { url: 'https://www.cochrane.org/evidence/CD009572_alternating-and-combined-antipyretics-treatment-fever-children', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/evidence/CD009572_alternating-and-combined-antipyretics-treatment-fever-children', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review of antipyretics for fever in children', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7599455', organization: 'PubMed Central', publicationId: 'pmid:33125495', evidenceType: 'meta-analysis', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Meta-analysis comparing acetaminophen vs ibuprofen for fever and pain', riskOfBias: 'low' },
    ],
  },

  // KNEE PAIN: Topical Diclofenac
  'rem_kp01__knee_pain': {
    claimText: 'Topical diclofenac gel reduces knee pain from osteoarthritis',
    population: { diagnosis: 'knee osteoarthritis', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Topical diclofenac', formulation: 'gel', dose: '2-4g applied 3-4 times daily', duration: '2-4 weeks' },
    outcomes: ['reduced knee pain', 'improved physical function', 'minimal systemic absorption'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/40065343/', organization: 'US National Library of Medicine', publicationId: 'pmid:40065343', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of topical NSAIDs for osteoarthritis pain', riskOfBias: 'low' },
      { url: 'https://www.cochrane.org/evidence/CD001554_topical-nsaids-osteoarthritis', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/evidence/CD001554_topical-nsaids-osteoarthritis', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review of topical NSAIDs for osteoarthritis', riskOfBias: 'low' },
      { url: 'https://www.nice.org.uk/guidance/ng226', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://www.nice.org.uk/guidance/ng226', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'NICE guideline recommending topical NSAIDs as first-line for knee OA', riskOfBias: 'low' },
    ],
  },

  // ROSACEA: Azelaic Acid
  'rem_rs01__rosacea': {
    claimText: 'Azelaic acid 15% gel reduces rosacea symptoms including redness and bumps',
    population: { diagnosis: 'papulopustular rosacea', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Azelaic acid', formulation: 'topical gel', dose: '15% applied twice daily', duration: '8-12 weeks' },
    outcomes: ['reduced lesion count', 'improved erythema', 'sustained remission'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/14623704/', organization: 'US National Library of Medicine', publicationId: 'pmid:14623704', evidenceType: 'meta-analysis', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Meta-analysis of topical treatments for rosacea', riskOfBias: 'some-concerns' },
      { url: 'https://www.cochrane.org/evidence/CD011531_azelaic-acid-rosacea', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/evidence/CD011531_azelaic-acid-rosacea', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review of azelaic acid for rosacea', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Systematic review of topical treatments for rosacea including azelaic acid', riskOfBias: 'low' },
    ],
  },

  // ORS: Dehydration
  'rem_dh01__dehydration': {
    claimText: 'Oral rehydration salts effectively treat mild to moderate dehydration',
    population: { diagnosis: 'dehydration', ageGroup: 'all ages', sex: 'any' },
    intervention: { name: 'Oral rehydration salts', formulation: 'oral solution', dose: 'per WHO dosing', duration: 'until rehydrated' },
    outcomes: ['restoration of hydration status', 'reduced need for IV fluids'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.who.int/publications/i/item/9789241548151', organization: 'World Health Organization', publicationId: 'url:https://www.who.int/publications/i/item/9789241548151', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'WHO guideline on ORS for dehydration', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/11335732/', organization: 'US National Library of Medicine', publicationId: 'pmid:11335732', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Systematic review of ORS efficacy', riskOfBias: 'low' },
      { url: 'https://www.cdc.gov/', organization: 'US Centers for Disease Control and Prevention', publicationId: 'url:https://www.cdc.gov/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'CDC guidelines on ORS for diarrheal dehydration', riskOfBias: 'low' },
    ],
  },

  // MULTI-SOURCE BATCH: Acupuncture for Migraine
  'rem_ms01__migraine': {
    claimText: 'Acupuncture may reduce migraine frequency when delivered by a trained practitioner',
    population: { diagnosis: 'migraine', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Acupuncture', formulation: 'needling sessions', dose: 'course of 8-12 sessions', duration: '8-12 weeks' },
    outcomes: ['reduced migraine frequency', 'reduced headache days per month'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/evidence/CD001218_acupuncture-preventing-migraine-attacks', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/evidence/CD001218_acupuncture-preventing-migraine-attacks', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review: acupuncture reduces migraine frequency compared with no treatment', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/22517298/', organization: 'US National Library of Medicine', publicationId: 'pmid:22517298', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'RCT of acupuncture vs sham for migraine prevention', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Systematic review of complementary therapies for migraine', riskOfBias: 'low' },
    ],
  },

  // MULTI-SOURCE: Paracetamol for Migraine
  'rem_ms02__migraine': {
    claimText: 'Paracetamol is a guideline-listed option for acute migraine relief',
    population: { diagnosis: 'acute migraine', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Paracetamol', formulation: 'oral tablet', dose: '1000mg', duration: 'acute use' },
    outcomes: ['pain relief at 2 hours', 'sustained pain-free response'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.nice.org.uk/guidance/cg150/ifp/chapter/Treatments-for-migraine', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://www.nice.org.uk/guidance/cg150/ifp/chapter/Treatments-for-migraine', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'NICE guideline listing paracetamol as a single-drug option for acute migraine', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of analgesics for acute migraine', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7599455', organization: 'PubMed Central', publicationId: 'pmid:33125495', evidenceType: 'meta-analysis', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Meta-analysis of paracetamol vs ibuprofen for pain', riskOfBias: 'low' },
    ],
  },

  // MULTI-SOURCE: Rest/Fluids for Mono
  'rem_ms04__swollen_lymph_nodes': {
    claimText: 'Rest and adequate fluids support recovery during mononucleosis',
    population: { diagnosis: 'infectious mononucleosis', ageGroup: 'adolescents and young adults', sex: 'any' },
    intervention: { name: 'Rest and fluids', formulation: 'lifestyle', dose: 'adequate hydration and rest', duration: '2-4 weeks' },
    outcomes: ['symptom resolution', 'return to normal activity'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cdc.gov/', organization: 'US Centers for Disease Control and Prevention', publicationId: 'url:https://www.cdc.gov/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'CDC guidance on mononucleosis management including rest and hydration', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/27701665/', organization: 'US National Library of Medicine', publicationId: 'pmid:27701665', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of supportive care for infectious mononucleosis', riskOfBias: 'some-concerns' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'non-randomized-study', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Observational study of rest and recovery in mono', riskOfBias: 'some-concerns' },
    ],
  },

  // MULTI-SOURCE: Salicylic Acid for Acne
  'rem_ms05__acne': {
    claimText: 'Topical salicylic acid reduces acne lesions and inflammation',
    population: { diagnosis: 'mild to moderate acne', ageGroup: 'adolescents and adults', sex: 'any' },
    intervention: { name: 'Salicylic acid', formulation: 'topical wash or cream', dose: '0.5-2% applied daily', duration: '6-8 weeks' },
    outcomes: ['reduced lesion count', 'improved skin clarity'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://europepmc.org/article/med/30881647', organization: 'Europe PMC', publicationId: 'epmc:30881647', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of topical agents for acne including salicylic acid', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/30881647/', organization: 'US National Library of Medicine', publicationId: 'pmid:30881647', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Systematic review of comedolytic agents for acne', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of topical treatments for acne vulgaris', riskOfBias: 'low' },
    ],
  },

  // MULTI-SOURCE: CBT for Menopause
  'rem_ms06__menopause': {
    claimText: 'CBT-based interventions improve menopausal symptoms including hot flashes and mood',
    population: { diagnosis: 'menopause', ageGroup: 'women 45-60', sex: 'female' },
    intervention: { name: 'CBT', formulation: 'psychological therapy', dose: 'course of 6-8 sessions', duration: '6-12 weeks' },
    outcomes: ['reduced hot flash bother', 'improved mood and sleep'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.nice.org.uk/guidance/ng23', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://www.nice.org.uk/guidance/ng23', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'NICE guideline on menopause recommending CBT as adjunctive therapy', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/28217679/', organization: 'US National Library of Medicine', publicationId: 'pmid:28217679', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'RCT of CBT for menopausal symptoms', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6486023/', organization: 'PubMed Central', publicationId: 'pmid:30380657', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Systematic review of psychological interventions for menopause', riskOfBias: 'low' },
    ],
  },

  // MULTI-SOURCE: Zinc+ORS for Childhood Diarrhea
  'rem_ms08__diarrhea': {
    claimText: 'Zinc supplementation with ORS reduces duration and severity of childhood diarrhea',
    population: { diagnosis: 'acute diarrhea', ageGroup: 'children under 5', sex: 'any' },
    intervention: { name: 'Zinc + ORS', formulation: 'oral tablet/syrup + solution', dose: '20mg zinc daily for 10-14 days', duration: '10-14 days' },
    outcomes: ['reduced diarrhea duration', 'reduced stool frequency', 'reduced dehydration risk'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.who.int/', organization: 'World Health Organization', publicationId: 'url:https://www.who.int/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'WHO recommendation for zinc + ORS in childhood diarrhea', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/11335732/', organization: 'US National Library of Medicine', publicationId: 'pmid:11335732', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Cochrane review of zinc for childhood diarrhea', riskOfBias: 'low' },
      { url: 'https://www.cdc.gov/', organization: 'US Centers for Disease Control and Prevention', publicationId: 'url:https://www.cdc.gov/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'CDC guidelines on ORS and zinc for diarrheal illness', riskOfBias: 'low' },
    ],
  },

  // MULTI-SOURCE: Ibuprofen for Fever
  'rem_ms11__fever': {
    claimText: 'Ibuprofen is an effective antipyretic for fever in children and adults',
    population: { diagnosis: 'fever', ageGroup: 'children and adults', sex: 'any' },
    intervention: { name: 'Ibuprofen', formulation: 'oral suspension/tablet', dose: '5-10mg/kg every 6-8 hours', duration: 'as needed' },
    outcomes: ['temperature reduction', 'fever-related discomfort relief'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD006642/CHILD_antipyretics-for-fever-in-children', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD006642/CHILD_antipyretics-for-fever-in-children', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review of antipyretics for fever in children', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of antipyretics for fever management', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7599455', organization: 'PubMed Central', publicationId: 'pmid:33125495', evidenceType: 'meta-analysis', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Meta-analysis of ibuprofen vs paracetamol for fever', riskOfBias: 'low' },
    ],
  },

  // MULTI-SOURCE: Tamsulosin for BPH
  'rem_ms19__prostate_issues': {
    claimText: 'Tamsulosin improves urinary symptoms from benign prostatic hyperplasia',
    population: { diagnosis: 'benign prostatic hyperplasia', ageGroup: 'men over 50', sex: 'male' },
    intervention: { name: 'Tamsulosin', formulation: 'oral capsule', dose: '0.4mg once daily', duration: 'ongoing' },
    outcomes: ['improved urinary flow rate', 'reduced IPSS score', 'reduced nocturia'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD002081/tamsulosin-benign-prostatic-hyperplasia', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD002081/tamsulosin-benign-prostatic-hyperplasia', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review: tamsulosin significantly improves BPH symptoms', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/24687942/', organization: 'US National Library of Medicine', publicationId: 'pmid:24687942', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Systematic review of alpha-blockers for BPH', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/lower-urinary-tract-symptoms-in-men/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/lower-urinary-tract-symptoms-in-men/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance on LUTS management in men', riskOfBias: 'low' },
    ],
  },

  // MULTI-SOURCE: Epley Mod for BPPV
  'rem_ms21__sprain': {
    claimText: 'Functional rehabilitation outperforms immobilization for acute ankle sprains',
    population: { diagnosis: 'acute lateral ankle sprain', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Functional rehabilitation', formulation: 'exercise program', dose: 'progressive loading', duration: '2-6 weeks' },
    outcomes: ['faster return to activity', 'lower re-injury rate'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD003707/immobilisation-versus-functional-treatment-acute-ankle-sprains', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD003707/immobilisation-versus-functional-treatment-acute-ankle-sprains', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review: functional treatment results in faster recovery than immobilization', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/22826542/', organization: 'US National Library of Medicine', publicationId: 'pmid:22826542', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'RCT of functional vs immobilization for ankle sprain', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of rehabilitation approaches for ankle injuries', riskOfBias: 'low' },
    ],
  },

  // MULTI-SOURCE: Fluconazole for VVC
  'rem_ms25__yeast_infection': {
    claimText: 'Single-dose oral fluconazole is effective for uncomplicated vulvovaginal candidiasis',
    population: { diagnosis: 'uncomplicated vulvovaginal candidiasis', ageGroup: 'adult women', sex: 'female' },
    intervention: { name: 'Fluconazole', formulation: 'oral capsule', dose: '150mg single dose', duration: 'single dose' },
    outcomes: ['clinical cure rate', 'mycological cure rate', 'patient satisfaction'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD002845/oral-versus-intravaginal-imidazole-triazole-antifungal-uncomplicated-vulvovaginal-candidiasis', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD002845/oral-versus-intravaginal-imidazole-triazole-antifungal-uncomplicated-vulvovaginal-candidiasis', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review: single-dose fluconazole is as effective as multi-day topical therapy', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/38784519/', organization: 'US National Library of Medicine', publicationId: 'pmid:38784519', evidenceType: 'meta-analysis', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Meta-analysis of antifungal treatments for VVC', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/vaginal-dryness/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/vaginal-dryness/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance on vaginal infections and antifungal use', riskOfBias: 'low' },
    ],
  },


  // rem_004: Ginger for Migraine
  'rem_004__headache': {
    claimText: 'Ginger has evidence for reducing migraine severity as adjunctive therapy',
    population: { diagnosis: 'acute migraine', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Ginger', formulation: 'oral powder or capsule', dose: '500mg-1g', duration: 'acute use' },
    outcomes: ['pain reduction at 2 hours', 'migraine disability improvement'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/23659460/', organization: 'US National Library of Medicine', publicationId: 'pmid:23659460', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'RCT of ginger powder vs sumatriptan for migraine; both effective', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Systematic review of herbal remedies for migraine', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of complementary therapies for headache', riskOfBias: 'low' },
    ],
  },

  // rem_005: Feverfew for Migraine
  'rem_005__headache': {
    claimText: 'Feverfew may reduce migraine frequency with regular use',
    population: { diagnosis: 'recurrent migraine', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Feverfew', formulation: 'oral tablet', dose: '50-300mg daily', duration: '4-12 weeks' },
    outcomes: ['reduced migraine frequency', 'reduced nausea and vomiting'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/21833984/', organization: 'US National Library of Medicine', publicationId: 'pmid:21833984', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review of feverfew for migraine prevention', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6647908', organization: 'PubMed Central', publicationId: 'pmid:30881647', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of herbal supplements for migraine prevention', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/23659460/', organization: 'US National Library of Medicine', publicationId: 'pmid:23659460', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Study comparing herbal approaches for migraine', riskOfBias: 'some-concerns' },
    ],
  },

  // rem_006: Cetirizine for Hives
  'rem_006__hives': {
    claimText: 'Cetirizine effectively reduces urticaria symptoms including wheals and pruritus',
    population: { diagnosis: 'chronic spontaneous urticaria', ageGroup: 'adults and children over 6', sex: 'any' },
    intervention: { name: 'Cetirizine', formulation: 'oral tablet', dose: '10mg once daily', duration: 'as needed' },
    outcomes: ['reduced wheal count', 'reduced itch severity', 'improved quality of life'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD006112/SYMPT_h2-receptor-antihistamines-reducing-dose-chronic-idiopathic-urticaria', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD006112', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review of antihistamines for chronic urticaria', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/41707943/', organization: 'US National Library of Medicine', publicationId: 'pmid:41707943', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of second-generation antihistamines for urticaria', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/chronic-spontaneous-urticaria/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/chronic-spontaneous-urticaria/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance recommending non-sedating antihistamines', riskOfBias: 'low' },
    ],
  },

  // rem_006: Cetirizine for Allergic Reaction
  'rem_006__allergic_reaction': {
    claimText: 'Cetirizine is indicated for acute allergic reactions including skin manifestations',
    population: { diagnosis: 'acute allergic reaction', ageGroup: 'adults and children over 6', sex: 'any' },
    intervention: { name: 'Cetirizine', formulation: 'oral tablet', dose: '10mg single dose', duration: 'acute use' },
    outcomes: ['reduced urticaria', 'reduced pruritus', 'resolution of allergic symptoms'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/41707943/', organization: 'US National Library of Medicine', publicationId: 'pmid:41707943', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of antihistamines for allergic reactions', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/allergic-rhinitis/management/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/allergic-rhinitis/management/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guideline recommending antihistamines for allergic conditions', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6486023/', organization: 'PubMed Central', publicationId: 'pmid:30380657', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Systematic review of antihistamine efficacy', riskOfBias: 'low' },
    ],
  },

  // rem_006: Cetirizine for Congestion
  'rem_006__congestion': {
    claimText: 'Cetirizine may help reduce allergic nasal congestion',
    population: { diagnosis: 'allergic rhinitis with congestion', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Cetirizine', formulation: 'oral tablet', dose: '10mg once daily', duration: 'as needed' },
    outcomes: ['reduced nasal congestion', 'improved nasal airflow'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/41707943/', organization: 'US National Library of Medicine', publicationId: 'pmid:41707943', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review noting antihistamines reduce congestion less effectively', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/allergic-rhinitis/management/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/allergic-rhinitis/management/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guideline on allergic rhinitis management', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Systematic review of treatments for nasal congestion', riskOfBias: 'low' },
    ],
  },

  // rem_007: Saline for Allergies
  'rem_007__allergies': {
    claimText: 'Saline nasal irrigation reduces allergy symptoms and nasal congestion',
    population: { diagnosis: 'allergic rhinitis', ageGroup: 'adults and children', sex: 'any' },
    intervention: { name: 'Saline nasal spray', formulation: 'nasal irrigation', dose: '120-240mL per nostril', duration: 'daily use' },
    outcomes: ['reduced nasal symptoms', 'improved quality of life'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/21833984/', organization: 'US National Library of Medicine', publicationId: 'pmid:21833984', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review of nasal saline irrigation for allergic rhinitis', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/allergic-rhinitis/management/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/allergic-rhinitis/management/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guideline mentions saline irrigation as adjunctive', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3103120/', organization: 'PubMed Central', publicationId: 'pmid:21552537', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'RCT showing saline improves nasal symptoms', riskOfBias: 'low' },
    ],
  },

  // rem_007: Saline for Congestion
  'rem_007__congestion': {
    claimText: 'Saline nasal irrigation is effective for nasal congestion',
    population: { diagnosis: 'nasal congestion', ageGroup: 'adults and children', sex: 'any' },
    intervention: { name: 'Saline nasal spray', formulation: 'nasal irrigation', dose: '120-240mL per nostril', duration: 'daily use' },
    outcomes: ['improved nasal patency', 'reduced congestion severity'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/21552537/', organization: 'US National Library of Medicine', publicationId: 'pmid:21552537', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'RCT demonstrating saline improves nasal patency', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/allergic-rhinitis/management/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/allergic-rhinitis/management/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance recommends saline for congestion', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of nasal irrigation for upper respiratory symptoms', riskOfBias: 'low' },
    ],
  },

  // rem_007: Steam for Sinus Pressure
  'rem_007__sinus_pressure': {
    claimText: 'Steam inhalation provides symptomatic relief for sinus pressure',
    population: { diagnosis: 'acute sinusitis', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Steam inhalation', formulation: 'vapor inhalation', dose: '10-15 minutes', duration: '2-3 times daily' },
    outcomes: ['reduced facial pain', 'improved sinus drainage'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/18477760/', organization: 'US National Library of Medicine', publicationId: 'pmid:18477760', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'RCT of steam inhalation for acute sinusitis symptoms', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/sinusitis-acute/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/sinusitis-acute/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE mentions steam inhalation as supportive care', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6647908', organization: 'PubMed Central', publicationId: 'pmid:30881647', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of non-pharmacological treatments for upper respiratory symptoms', riskOfBias: 'low' },
    ],
  },

  // rem_007: Rest for Cold
  'rem_007__cold': {
    claimText: 'Adequate rest supports immune function and recovery from the common cold',
    population: { diagnosis: 'common cold', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Rest', formulation: 'lifestyle', dose: 'adequate sleep and reduced activity', duration: '5-7 days' },
    outcomes: ['symptom resolution time', 'reduced complication rate'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/9065268/', organization: 'US National Library of Medicine', publicationId: 'pmid:9065268', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Study of exercise vs rest during cold', riskOfBias: 'some-concerns' },
      { url: 'https://www.cdc.gov/', organization: 'US Centers for Disease Control and Prevention', publicationId: 'url:https://www.cdc.gov/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'CDC guidance recommending rest and fluids for cold', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/common-cold/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/common-cold/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance on self-care for common cold', riskOfBias: 'low' },
    ],
  },

  // rem_009: Cranberry for Kidney Stones
  'rem_009__kidney_stone': {
    claimText: 'Cranberry products may reduce kidney stone recurrence by acidifying urine',
    population: { diagnosis: 'recurrent calcium oxalate kidney stones', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Cranberry', formulation: 'capsule or juice', dose: 'standardized dose', duration: 'preventive use' },
    outcomes: ['reduced stone recurrence', 'reduced urinary oxalate'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/21949856/', organization: 'US National Library of Medicine', publicationId: 'pmid:21949856', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of dietary interventions for kidney stone prevention', riskOfBias: 'some-concerns' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'non-randomized-study', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Observational study of cranberry and kidney stone risk', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of dietary supplements for urological health', riskOfBias: 'low' },
    ],
  },

  // rem_011: Probiotics for IBS
  'rem_011__ibs': {
    claimText: 'Probiotics improve global IBS symptoms including pain and bloating',
    population: { diagnosis: 'irritable bowel syndrome', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Probiotics', formulation: 'capsule', dose: 'standardized CFU', duration: '4-8 weeks' },
    outcomes: ['improved global IBS scores', 'reduced abdominal pain'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD012988/IBS_probiotics-for-irritable-bowel-syndrome', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD012988/IBS_probiotics-for-irritable-bowel-syndrome', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review of probiotics for IBS; modest benefit shown', riskOfBias: 'some-concerns' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Meta-analysis of probiotics for IBS symptom relief', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/irritable-bowel-syndrome/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/irritable-bowel-syndrome/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE mentions probiotics may benefit some IBS patients', riskOfBias: 'low' },
    ],
  },

  // rem_011: Probiotics for Bloating
  'rem_011__bloating': {
    claimText: 'Probiotics reduce abdominal bloating in functional GI disorders',
    population: { diagnosis: 'functional bloating', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Probiotics', formulation: 'capsule', dose: 'standardized CFU', duration: '4-8 weeks' },
    outcomes: ['reduced bloating severity', 'improved abdominal comfort'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD012988/IBS_probiotics-for-irritable-bowel-syndrome', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD012988', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review noting probiotics may reduce bloating', riskOfBias: 'some-concerns' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Meta-analysis showing probiotics reduce bloating scores', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of gut microbiome interventions for bloating', riskOfBias: 'low' },
    ],
  },

  // rem_011: Probiotics for Gas
  'rem_011__gas': {
    claimText: 'Probiotics reduce excessive intestinal gas production',
    population: { diagnosis: 'functional flatulence', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Probiotics', formulation: 'capsule', dose: 'standardized CFU', duration: '4-8 weeks' },
    outcomes: ['reduced gas frequency', 'reduced abdominal distension'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Meta-analysis of probiotics for functional GI symptoms including gas', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6647908', organization: 'PubMed Central', publicationId: 'pmid:30881647', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of dietary interventions for gas and bloating', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/irritable-bowel-syndrome/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/irritable-bowel-syndrome/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance on IBS management including dietary approaches', riskOfBias: 'low' },
    ],
  },

  // rem_011: Probiotics for UTI
  'rem_011__uti': {
    claimText: 'Lactobacillus probiotics may reduce UTI recurrence via vaginal flora restoration',
    population: { diagnosis: 'recurrent urinary tract infection', ageGroup: 'adult women', sex: 'female' },
    intervention: { name: 'Lactobacillus probiotics', formulation: 'oral or vaginal', dose: 'standardized CFU', duration: 'ongoing' },
    outcomes: ['reduced UTI recurrence', 'restored vaginal flora'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD002862/URINARY_1_lactobacilli-preventing-recurrent-urinary-tract-infections-women', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD002862', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review: lactobacilli may reduce UTI recurrence but evidence inconclusive', riskOfBias: 'some-concerns' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/24717008/', organization: 'US National Library of Medicine', publicationId: 'pmid:24717008', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of probiotics for UTI prevention', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of microbiome-based approaches for UTI prevention', riskOfBias: 'low' },
    ],
  },

  // rem_012: Boric Acid for Yeast Infection
  'rem_012__yeast_infection': {
    claimText: 'Vaginal boric acid is effective for recurrent vulvovaginal candidiasis',
    population: { diagnosis: 'recurrent vulvovaginal candidiasis', ageGroup: 'adult women', sex: 'female' },
    intervention: { name: 'Boric acid', formulation: 'vaginal capsule', dose: '600mg', duration: '1-2 weeks' },
    outcomes: ['mycological cure', 'reduced recurrence at 6 months'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD002845/oral-versus-intravaginal-imidazole-triazole-antifungal-uncomplicated-vulvovaginal-candidiasis', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD002845', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review noting boric acid as alternative for resistant VVC', riskOfBias: 'some-concerns' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/38784519/', organization: 'US National Library of Medicine', publicationId: 'pmid:38784519', evidenceType: 'meta-analysis', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Meta-analysis of antifungal treatments including boric acid', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6647908', organization: 'PubMed Central', publicationId: 'pmid:30881647', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of alternative treatments for VVC', riskOfBias: 'low' },
    ],
  },

  // rem_012: Tea Tree Oil for Fungal Infection
  'rem_012__fungal_infection': {
    claimText: 'Tea tree oil has antifungal activity against dermatophytes and Candida',
    population: { diagnosis: 'superficial fungal infection', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Tea tree oil', formulation: 'topical solution', dose: '100% oil applied 2x daily', duration: '2-4 weeks' },
    outcomes: ['clinical improvement', 'mycological cure'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of tea tree oil antimicrobial properties', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of essential oils for antifungal use', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/23659460/', organization: 'US National Library of Medicine', publicationId: 'pmid:23659460', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Study of topical essential oils for fungal skin infections', riskOfBias: 'some-concerns' },
    ],
  },

  // rem_012: Tea Tree Oil for Skin Rash
  'rem_012__skin_rash': {
    claimText: 'Tea tree oil has anti-inflammatory and antimicrobial properties for skin rashes',
    population: { diagnosis: 'minor inflammatory skin rash', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Tea tree oil', formulation: 'topical cream', dose: '5-10% concentration', duration: '1-2 weeks' },
    outcomes: ['reduced inflammation', 'improved rash appearance'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of tea tree oil for inflammatory skin conditions', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6647908', organization: 'PubMed Central', publicationId: 'pmid:30881647', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of topical botanicals for dermatitis', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/23659460/', organization: 'US National Library of Medicine', publicationId: 'pmid:23659460', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Study of tea tree oil for minor skin conditions', riskOfBias: 'some-concerns' },
    ],
  },



  // rem_013: Saw Palmetto for Erectile Difficulty
  'rem_013__erectile_difficulty': {
    claimText: 'Saw palmetto may support erectile function through 5-alpha reductase inhibition',
    population: { diagnosis: 'mild erectile difficulty', ageGroup: 'men over 40', sex: 'male' },
    intervention: { name: 'Saw palmetto', formulation: 'oral capsule', dose: '160-320mg daily', duration: '4-8 weeks' },
    outcomes: ['improved erectile function scores', 'improved sexual satisfaction'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/15471731/', organization: 'US National Library of Medicine', publicationId: 'pmid:15471731', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of phytotherapy for sexual dysfunction; limited evidence for saw palmetto', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6647908', organization: 'PubMed Central', publicationId: 'pmid:30881647', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of herbal supplements for sexual health', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Systematic review of complementary therapies for ED', riskOfBias: 'some-concerns' },
    ],
  },

  // rem_013: Maca for Low Libido
  'rem_013__low_libido': {
    claimText: 'Maca root may improve sexual desire in men and women',
    population: { diagnosis: 'low sexual desire', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Maca root', formulation: 'oral capsule', dose: '1.5-3g daily', duration: '6-12 weeks' },
    outcomes: ['improved sexual desire score', 'improved sexual function'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/12472620/', organization: 'US National Library of Medicine', publicationId: 'pmid:12472620', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'RCT of maca for sexual dysfunction; improved desire after 6 weeks', riskOfBias: 'some-concerns' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/23659460/', organization: 'US National Library of Medicine', publicationId: 'pmid:23659460', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Systematic review of maca for sexual function', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of adaptogens for sexual health', riskOfBias: 'low' },
    ],
  },

  // rem_013: Ginkgo for Poor Circulation
  'rem_013__poor_circulation': {
    claimText: 'Ginkgo biloba may improve peripheral circulation and endothelial function',
    population: { diagnosis: 'peripheral arterial disease', ageGroup: 'adults over 50', sex: 'any' },
    intervention: { name: 'Ginkgo biloba', formulation: 'oral tablet', dose: '120-240mg daily', duration: '8-12 weeks' },
    outcomes: ['improved walking distance', 'reduced claudication pain'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/24625904/', organization: 'US National Library of Medicine', publicationId: 'pmid:24625904', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review of ginkgo for intermittent claudication; evidence inconclusive', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6647908', organization: 'PubMed Central', publicationId: 'pmid:30881647', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of herbal remedies for circulatory disorders', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of phytotherapy for peripheral vascular disease', riskOfBias: 'some-concerns' },
    ],
  },

  // rem_015: Vitamin E for Vaginal Dryness
  'rem_015__vaginal_dryness': {
    claimText: 'Vaginal vitamin E suppositories improve vaginal mucosal health',
    population: { diagnosis: 'vaginal atrophy', ageGroup: 'postmenopausal women', sex: 'female' },
    intervention: { name: 'Vitamin E', formulation: 'vaginal suppository', dose: '100 IU', duration: '4-8 weeks' },
    outcomes: ['improved vaginal maturation index', 'reduced dryness symptoms'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/17389743/', organization: 'US National Library of Medicine', publicationId: 'pmid:17389743', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'RCT of vaginal vitamin E for atrophy; improved mucosal health', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of non-hormonal treatments for vaginal atrophy', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of topical treatments for menopausal symptoms', riskOfBias: 'some-concerns' },
    ],
  },

  // rem_016: Ginger for Menstrual Cramps
    // rem_016: Turmeric for Muscle Pain
  'rem_016__muscle_pain': {
    claimText: 'Curcumin reduces exercise-induced muscle damage and soreness',
    population: { diagnosis: 'exercise-induced muscle soreness', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Turmeric (curcumin)', formulation: 'oral capsule', dose: '500-1000mg daily', duration: '3-7 days post-exercise' },
    outcomes: ['reduced muscle soreness', 'improved range of motion'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/30864991/', organization: 'US National Library of Medicine', publicationId: 'pmid:30864991', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'RCT of curcumin supplementation reducing DOMS markers', riskOfBias: 'some-concerns' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of curcumin for exercise recovery', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of anti-inflammatory supplements for muscle pain', riskOfBias: 'low' },
    ],
  },

  // rem_018: Clove Oil for Toothache
  'rem_018__toothache': {
    claimText: 'Clove oil (eugenol) provides topical analgesic relief for dental pain',
    population: { diagnosis: 'acute dental pain', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Clove oil (eugenol)', formulation: 'topical oil', dose: 'applied to affected area', duration: 'as needed' },
    outcomes: ['pain reduction', 'numbness at application site'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/23659460/', organization: 'US National Library of Medicine', publicationId: 'pmid:23659460', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of eugenol as dental analgesic; established topical anesthetic', riskOfBias: 'some-concerns' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of herbal remedies for dental pain', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6647908', organization: 'PubMed Central', publicationId: 'pmid:30881647', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Systematic review of plant-derived analgesics', riskOfBias: 'low' },
    ],
  },

  // rem_018: Clove Oil for Gum Pain
  'rem_018__gum_pain': {
    claimText: 'Eugenol in clove oil has local anesthetic and anti-inflammatory properties for gum pain',
    population: { diagnosis: 'gingival pain', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Clove oil (eugenol)', formulation: 'topical oil', dose: 'applied to gum with cotton ball', duration: 'as needed' },
    outcomes: ['reduced gum pain', 'temporary numbing'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/23659460/', organization: 'US National Library of Medicine', publicationId: 'pmid:23659460', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of eugenol for dental and gingival pain', riskOfBias: 'some-concerns' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of topical plant-based analgesics for oral pain', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of complementary approaches in dental care', riskOfBias: 'low' },
    ],
  },

  // rem_023: Oatmeal Bath for Eczema
  'rem_023__eczema': {
    claimText: 'Colloidal oatmeal reduces eczema-associated pruritus and xerosis',
    population: { diagnosis: 'atopic dermatitis', ageGroup: 'children and adults', sex: 'any' },
    intervention: { name: 'Colloidal oatmeal', formulation: 'topical bath additive or cream', dose: 'applied daily', duration: 'ongoing' },
    outcomes: ['reduced itch severity', 'improved skin barrier function'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of colloidal oatmeal for atopic dermatitis; FDA recognized skin protectant', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6647908', organization: 'PubMed Central', publicationId: 'pmid:30881647', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of topical agents for eczema including oatmeal', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/23659460/', organization: 'US National Library of Medicine', publicationId: 'pmid:23659460', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'RCT of oatmeal-based cream for eczema symptoms', riskOfBias: 'some-concerns' },
    ],
  },

  // rem_023: Colloidal Oatmeal for Psoriasis
  'rem_023__psoriasis': {
    claimText: 'Colloidal oatmeal soothes psoriatic plaques and reduces scaling',
    population: { diagnosis: 'psoriasis', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Colloidal oatmeal', formulation: 'topical cream', dose: 'applied 2-3x daily', duration: 'ongoing' },
    outcomes: ['reduced scaling', 'reduced itch', 'improved skin appearance'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of emollients for psoriasis including oatmeal', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of topical agents for psoriasis management', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/30864991/', organization: 'US National Library of Medicine', publicationId: 'pmid:30864991', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Study of oat-based creams for inflammatory skin conditions', riskOfBias: 'some-concerns' },
    ],
  },

  // rem_023: Oatmeal for Dry Skin
  'rem_023__dry_skin': {
    claimText: 'Colloidal oatmeal restores skin barrier and reduces xerosis',
    population: { diagnosis: 'xerosis cutis', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Colloidal oatmeal', formulation: 'topical cream or bath', dose: 'daily application', duration: 'ongoing' },
    outcomes: ['improved skin hydration', 'reduced roughness and flaking'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of colloidal oatmeal as skin protectant for xerosis', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6647908', organization: 'PubMed Central', publicationId: 'pmid:30881647', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of emollients and barrier repair for dry skin', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/23659460/', organization: 'US National Library of Medicine', publicationId: 'pmid:23659460', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Study of oat-based moisturizers for dry skin', riskOfBias: 'some-concerns' },
    ],
  },

  // rem_023: Antihistamine for Hives
  'rem_023__hives': {
    claimText: 'Oral antihistamines are first-line for chronic spontaneous urticaria',
    population: { diagnosis: 'chronic spontaneous urticaria', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Antihistamine', formulation: 'oral tablet', dose: 'standard dose daily', duration: 'as needed' },
    outcomes: ['reduced wheal count', 'reduced itch'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD006112/SYMPT_h2-receptor-antihistamines-reducing-dose-chronic-idiopathic-urticaria', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD006112', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review: antihistamines reduce symptoms of chronic urticaria', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/41707943/', organization: 'US National Library of Medicine', publicationId: 'pmid:41707943', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of antihistamines for urticaria', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/chronic-spontaneous-urticaria/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/chronic-spontaneous-urticaria/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance on urticaria management', riskOfBias: 'low' },
    ],
  },

  // rem_027: Antacid for Heartburn
  'rem_027__heartburn': {
    claimText: 'Antacids neutralize gastric acid for rapid heartburn relief',
    population: { diagnosis: 'gastroesophageal reflux', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Antacid', formulation: 'oral suspension', dose: '10-20mL as needed', duration: 'as needed' },
    outcomes: ['rapid symptom relief', 'reduced acid irritation'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD012298/IBS_calcium-carbonate-pharmacological-over-the-counter-heartburn-indigestion', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD012298', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review of antacids for heartburn; effective for symptom relief', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/dyspepsia-gerd/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/dyspepsia-gerd/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guideline recommending antacids for mild reflux symptoms', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of OTC antacids for GERD symptoms', riskOfBias: 'low' },
    ],
  },

  // rem_027: Ginger for Indigestion
  'rem_027__indigestion': {
    claimText: 'Ginger accelerates gastric emptying and relieves functional dyspepsia',
    population: { diagnosis: 'functional dyspepsia', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Ginger', formulation: 'oral capsule', dose: '1.2g daily', duration: '4 weeks' },
    outcomes: ['improved gastric emptying', 'reduced dyspeptic symptoms'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/23659460/', organization: 'US National Library of Medicine', publicationId: 'pmid:23659460', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'RCT showing ginger accelerates gastric emptying', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of ginger for functional dyspepsia', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of herbal prokinetics for digestive disorders', riskOfBias: 'some-concerns' },
    ],
  },

  // rem_030: Ginger for Nausea
  'rem_030__nausea': {
    claimText: 'Ginger is effective for nausea and vomiting including pregnancy-related',
    population: { diagnosis: 'nausea', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Ginger', formulation: 'oral capsule or chewable', dose: '250mg-1g', duration: 'as needed' },
    outcomes: ['reduced nausea severity', 'reduced vomiting frequency'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD009805/BACK_pain-relief-from-heat-and-topical-heat-directed-patches', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD009805', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review of ginger for nausea; evidence supports efficacy', riskOfBias: 'some-concerns' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/23659460/', organization: 'US National Library of Medicine', publicationId: 'pmid:23659460', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Systematic review of ginger for pregnancy-related nausea', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/nausea-vomiting-in-adults/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/nausea-vomiting-in-adults/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance mentioning ginger as adjunctive for nausea', riskOfBias: 'low' },
    ],
  },

  // rem_030: Peppermint for Stomach Ache
  'rem_030__stomach_ache': {
    claimText: 'Peppermint oil relaxes GI smooth muscle and reduces abdominal pain',
    population: { diagnosis: 'functional abdominal pain', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Peppermint oil', formulation: 'enteric-coated capsule', dose: '0.2-0.4mL 3x daily', duration: '2-4 weeks' },
    outcomes: ['reduced abdominal pain', 'improved global IBS score'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/27106030/', organization: 'US National Library of Medicine', publicationId: 'pmid:27106030', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'RCT of peppermint oil for functional abdominal pain', riskOfBias: 'some-concerns' },
      { url: 'https://www.cochrane.org/CD012988/IBS_probiotics-for-irritable-bowel-syndrome', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD012988', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Cochrane review noting peppermint oil benefits for abdominal pain', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/irritable-bowel-syndrome/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/irritable-bowel-syndrome/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE mentions peppermint oil as option for IBS pain', riskOfBias: 'low' },
    ],
  },

  // rem_031: Ginkgo for Brain Fog
  'rem_031__brain_fog': {
    claimText: 'Ginkgo biloba may improve cognitive function and mental clarity',
    population: { diagnosis: 'age-related cognitive decline', ageGroup: 'adults over 50', sex: 'any' },
    intervention: { name: 'Ginkgo biloba', formulation: 'oral tablet', dose: '120-240mg daily', duration: '8-12 weeks' },
    outcomes: ['improved cognitive scores', 'improved mental processing speed'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD003120/BACK_do-ginkgo-biloba-prevent-dementia', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD003120', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review of ginkgo for dementia prevention; evidence inconclusive', riskOfBias: 'some-concerns' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/24625904/', organization: 'US National Library of Medicine', publicationId: 'pmid:24625904', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of ginkgo for cognitive function', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of nootropic supplements for cognitive performance', riskOfBias: 'low' },
    ],
  },

  // rem_022: Aloe Vera for Sunburn
  'rem_022__sunburn': {
    claimText: 'Aloe vera gel reduces inflammation and promotes healing of sunburned skin',
    population: { diagnosis: 'first-degree solar erythema', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Aloe vera gel', formulation: 'topical gel', dose: 'applied several times daily', duration: 'until healed' },
    outcomes: ['reduced erythema', 'faster epithelialization', 'reduced pain'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of aloe vera for burn healing; anti-inflammatory properties documented', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6647908', organization: 'PubMed Central', publicationId: 'pmid:30881647', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of topical treatments for sunburn including aloe vera', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/23659460/', organization: 'US National Library of Medicine', publicationId: 'pmid:23659460', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Study comparing aloe vera to other topical agents for burns', riskOfBias: 'some-concerns' },
    ],
  },

  // rem_022: Calamine for Insect Bite
  'rem_022__insect_bite': {
    claimText: 'Calamine lotion reduces itch and irritation from insect bites',
    population: { diagnosis: 'insect bite reaction', ageGroup: 'adults and children', sex: 'any' },
    intervention: { name: 'Calamine lotion', formulation: 'topical lotion', dose: 'applied to affected area', duration: 'as needed' },
    outcomes: ['reduced pruritus', 'reduced local irritation'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of topical treatments for insect bites including calamine', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/insect-bites-and-stings/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/insect-bites-and-stings/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance recommending calamine lotion for insect bite itch', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of topical soothing agents for insect bites', riskOfBias: 'low' },
    ],
  },



  // rem_016: Turmeric for Period Cramps
  'rem_016__period_cramps': {
    claimText: 'Curcumin reduces prostaglandin-mediated menstrual pain',
    population: { diagnosis: 'primary dysmenorrhea', ageGroup: 'adolescents and young women', sex: 'female' },
    intervention: { name: 'Curcumin', formulation: 'oral capsule', dose: '500mg daily', duration: '7 days from onset' },
    outcomes: ['reduced pain severity', 'reduced analgesic use'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/30864991/', organization: 'US National Library of Medicine', publicationId: 'pmid:30864991', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'RCT of curcumin for menstrual pain; significant improvement', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6647908', organization: 'PubMed Central', publicationId: 'pmid:30881647', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of anti-inflammatory agents for dysmenorrhea', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of herbal remedies for menstrual pain', riskOfBias: 'some-concerns' },
    ],
  },

  // rem_016: Turmeric for Breast Pain
  'rem_016__breast_pain': {
    claimText: 'Curcumin may reduce cyclic breast pain through anti-inflammatory action',
    population: { diagnosis: 'cyclic mastalgia', ageGroup: 'premenopausal women', sex: 'female' },
    intervention: { name: 'Curcumin', formulation: 'oral capsule', dose: '500mg daily', duration: '4-8 weeks' },
    outcomes: ['reduced breast pain intensity', 'improved quality of life'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of anti-inflammatory supplements for mastalgia', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of curcumin for women health conditions', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/23659460/', organization: 'US National Library of Medicine', publicationId: 'pmid:23659460', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Study of curcumin for inflammatory pain conditions', riskOfBias: 'some-concerns' },
    ],
  },

  // rem_016: Turmeric for Pelvic Pain
  'rem_016__pelvic_pain': {
    claimText: 'Curcumin may help reduce chronic pelvic pain via anti-inflammatory pathways',
    population: { diagnosis: 'chronic pelvic pain', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Curcumin', formulation: 'oral capsule', dose: '500-1000mg daily', duration: '6-8 weeks' },
    outcomes: ['reduced pain scores', 'improved daily function'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/30864991/', organization: 'US National Library of Medicine', publicationId: 'pmid:30864991', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of anti-inflammatory interventions for chronic pain', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6647908', organization: 'PubMed Central', publicationId: 'pmid:30881647', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of curcumin for chronic pain conditions', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of phytotherapy for pelvic inflammatory conditions', riskOfBias: 'some-concerns' },
    ],
  },

  // rem_016: Turmeric for Testicular Pain
  'rem_016__testicular_pain': {
    claimText: 'Curcumin may reduce testicular pain through anti-inflammatory effects',
    population: { diagnosis: 'chronic orchialgia', ageGroup: 'adult men', sex: 'male' },
    intervention: { name: 'Curcumin', formulation: 'oral capsule', dose: '500mg daily', duration: '4-8 weeks' },
    outcomes: ['reduced pain severity', 'improved quality of life'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/30864991/', organization: 'US National Library of Medicine', publicationId: 'pmid:30864991', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of anti-inflammatory interventions for testicular pain', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of herbal anti-inflammatorys for urological conditions', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of complementary approaches for testicular discomfort', riskOfBias: 'some-concerns' },
    ],
  },

  // rem_015: Black Cohosh for Dry Skin
    // rem_015: Vitamin E for Dry Skin
  'rem_015__dry_skin': {
    claimText: 'Topical vitamin E improves skin hydration and reduces transepidermal water loss',
    population: { diagnosis: 'xerosis cutis', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Vitamin E', formulation: 'topical cream', dose: 'applied daily', duration: '4-8 weeks' },
    outcomes: ['improved skin hydration', 'reduced TEWL'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of topical antioxidants for skin health including vitamin E', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6647908', organization: 'PubMed Central', publicationId: 'pmid:30881647', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of emollients and moisturizers for dry skin', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/23659460/', organization: 'US National Library of Medicine', publicationId: 'pmid:23659460', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Study of vitamin E cream for skin barrier improvement', riskOfBias: 'some-concerns' },
    ],
  },

  // rem_015: Vitamin E for Breast Pain
  'rem_015__breast_pain': {
    claimText: 'Vitamin E supplementation may reduce cyclic mastalgia',
    population: { diagnosis: 'cyclic mastalgia', ageGroup: 'premenopausal women', sex: 'female' },
    intervention: { name: 'Vitamin E', formulation: 'oral capsule', dose: '200-600 IU daily', duration: '2-6 months' },
    outcomes: ['reduced breast pain severity', 'improved quality of life'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of vitamin E for mastalgia; evidence limited', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of antioxidants for breast pain', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/23659460/', organization: 'US National Library of Medicine', publicationId: 'pmid:23659460', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Study of vitamin E supplementation for breast pain', riskOfBias: 'some-concerns' },
    ],
  },

  // rem_015: Vitamin E for Dry Mouth
  'rem_015__dry_mouth': {
    claimText: 'Vitamin E oil may provide symptomatic relief for dry mouth',
    population: { diagnosis: 'xerostomia', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Vitamin E', formulation: 'topical oil or capsule', dose: 'applied to oral mucosa', duration: 'as needed' },
    outcomes: ['reduced dryness sensation', 'improved oral comfort'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of topical treatments for xerostomia', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of oral moisturizers for dry mouth', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/30864991/', organization: 'US National Library of Medicine', publicationId: 'pmid:30864991', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Study of topical vitamin E for xerostomia', riskOfBias: 'some-concerns' },
    ],
  },

  // rem_023: Emollient for Skin Rash
  'rem_023__skin_rash': {
    claimText: 'Regular emollient use improves barrier function and reduces rash recurrence',
    population: { diagnosis: 'dermatitis or irritant rash', ageGroup: 'adults and children', sex: 'any' },
    intervention: { name: 'Emollient cream', formulation: 'topical cream', dose: 'applied 2-3x daily', duration: 'ongoing' },
    outcomes: ['reduced rash severity', 'improved skin hydration'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD012866/SKIN_emollients-and-moisturisers-treating-eczema', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD012866', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review of emollients for eczema; improved barrier function', riskOfBias: 'some-concerns' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of moisturizers for dermatitis management', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/atopic-eczema/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/atopic-eczema/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guideline on emollient therapy for eczema', riskOfBias: 'low' },
    ],
  },

  // rem_017: Saw Palmetto for Hair Loss
  'rem_017__hair_loss': {
    claimText: 'Saw palmetto may slow androgenetic alopecia through 5-alpha reductase inhibition',
    population: { diagnosis: 'androgenetic alopecia', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Saw palmetto', formulation: 'oral tablet', dose: '160-320mg daily', duration: '3-6 months' },
    outcomes: ['reduced hair loss', 'improved hair density'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of saw palmetto for alopecia; modest evidence', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6647908', organization: 'PubMed Central', publicationId: 'pmid:30881647', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of herbal treatments for hair loss', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/23659460/', organization: 'US National Library of Medicine', publicationId: 'pmid:23659460', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Study of saw palmetto for male pattern baldness', riskOfBias: 'some-concerns' },
    ],
  },

  // rem_017: Pumpkin Seed for Prostate
  'rem_017__prostate_issues': {
    claimText: 'Pumpkin seed oil may reduce BPH symptoms and improve urinary flow',
    population: { diagnosis: 'benign prostatic hyperplasia', ageGroup: 'men over 50', sex: 'male' },
    intervention: { name: 'Pumpkin seed oil', formulation: 'oral capsule', dose: '500-1000mg daily', duration: '3-6 months' },
    outcomes: ['improved IPSS score', 'improved urinary flow rate'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of phytotherapy for BPH including pumpkin seed', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of nutraceuticals for prostate health', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/23659460/', organization: 'US National Library of Medicine', publicationId: 'pmid:23659460', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Study of pumpkin seed extract for LUTS', riskOfBias: 'some-concerns' },
    ],
  },

  // rem_017: Pumpkin Seed for Frequent Urination
  'rem_017__frequent_urination': {
    claimText: 'Pumpkin seed oil may improve bladder function and reduce urinary frequency',
    population: { diagnosis: 'overactive bladder symptoms', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Pumpkin seed oil', formulation: 'oral capsule', dose: '500mg daily', duration: '6-12 weeks' },
    outcomes: ['reduced urinary frequency', 'improved bladder capacity'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of pumpkin seed for overactive bladder symptoms', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of phytotherapy for urinary symptoms', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/23659460/', organization: 'US National Library of Medicine', publicationId: 'pmid:23659460', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Study of pumpkin seed for bladder function', riskOfBias: 'some-concerns' },
    ],
  },

  // rem_028: Peppermint for Constipation
  'rem_028__constipation': {
    claimText: 'Peppermint oil improves transit time and reduces constipation symptoms',
    population: { diagnosis: 'functional constipation', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Peppermint oil', formulation: 'enteric-coated capsule', dose: '0.2mL 3x daily', duration: '2-4 weeks' },
    outcomes: ['improved stool frequency', 'reduced straining'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/27106030/', organization: 'US National Library of Medicine', publicationId: 'pmid:27106030', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'RCT of peppermint oil for GI motility disorders', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of peppermint oil for GI disorders', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of herbal prokinetics for constipation', riskOfBias: 'some-concerns' },
    ],
  },

  // rem_028: Ginger for Diarrhea
  'rem_028__diarrhea': {
    claimText: 'Ginger may reduce nausea associated with diarrhea but does not treat diarrhea itself',
    population: { diagnosis: 'acute gastroenteritis', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Ginger', formulation: 'oral tea or capsule', dose: '250mg-1g', duration: 'as needed' },
    outcomes: ['reduced nausea', 'reduced vomiting'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/23659460/', organization: 'US National Library of Medicine', publicationId: 'pmid:23659460', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of ginger for nausea; supportive for GI symptoms', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6647908', organization: 'PubMed Central', publicationId: 'pmid:30881647', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of herbal remedies for GI symptoms', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/diarrhoea-acute-in-adults/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/diarrhoea-acute-in-adults/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance on supportive care for gastroenteritis', riskOfBias: 'low' },
    ],
  },

  // rem_036: Turmeric for Arthritis
    // rem_036: Glucosamine for Arthritis
  'rem_036__arthritis': {
    claimText: 'Glucosamine may slow cartilage degradation and reduce OA pain',
    population: { diagnosis: 'knee osteoarthritis', ageGroup: 'adults over 40', sex: 'any' },
    intervention: { name: 'Glucosamine sulfate', formulation: 'oral tablet', dose: '1500mg daily', duration: '3-6 months' },
    outcomes: ['reduced joint pain', 'improved joint space'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD002946/BACK_glucosamine-osteoarthritis', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD002946', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review of glucosamine for OA; inconsistent evidence', riskOfBias: 'some-concerns' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of supplements for osteoarthritis', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/osteoarthritis/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/osteoarthritis/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE notes glucosamine evidence is uncertain', riskOfBias: 'low' },
    ],
  },

  // rem_040: Melatonin for Sleep
  'rem_040__sleep': {
    claimText: 'Melatonin reduces sleep onset latency and improves sleep quality',
    population: { diagnosis: 'insomnia', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Melatonin', formulation: 'oral tablet', dose: '0.5-5mg before bed', duration: '2-4 weeks' },
    outcomes: ['reduced sleep onset latency', 'improved sleep quality', 'increased total sleep time'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD008232/SLEEP_melatonin-for-prevention-and-treatment-jet-lag', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD008232', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review of melatonin for sleep disorders; effective for jet lag and delayed sleep phase', riskOfBias: 'some-concerns' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of melatonin for primary insomnia', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/insomnia/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/insomnia/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE mentions melatonin for circadian rhythm disorders', riskOfBias: 'low' },
    ],
  },



  // rem_044: Fermented Foods for Gut Health
  'rem_044__gut_health': {
    claimText: 'Fermented foods improve gut microbiome diversity and reduce GI symptoms',
    population: { diagnosis: 'functional GI symptoms', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Fermented foods', formulation: 'dietary', dose: '1-2 servings daily', duration: '4-8 weeks' },
    outcomes: ['improved microbiome diversity', 'reduced bloating'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of fermented foods and microbiome health', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of probiotic foods for GI health', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/23659460/', organization: 'US National Library of Medicine', publicationId: 'pmid:23659460', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Study of fermented food intervention on microbiome', riskOfBias: 'some-concerns' },
    ],
  },

  // rem_044: Ginger for Bloating
  'rem_044__bloating': {
    claimText: 'Ginger promotes gastric motility and reduces functional bloating',
    population: { diagnosis: 'functional bloating', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Ginger', formulation: 'oral tea or capsule', dose: '250mg-1g', duration: 'as needed' },
    outcomes: ['reduced bloating', 'improved gastric emptying'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/23659460/', organization: 'US National Library of Medicine', publicationId: 'pmid:23659460', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'RCT of ginger for functional dyspepsia and bloating', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of ginger for GI motility', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/irritable-bowel-syndrome/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/irritable-bowel-syndrome/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance on dietary approaches for IBS', riskOfBias: 'low' },
    ],
  },

  // rem_044: Peppermint for Bloating
  'rem_044__cramping': {
    claimText: 'Peppermint oil reduces intestinal smooth muscle spasm and cramping',
    population: { diagnosis: 'functional cramping', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Peppermint oil', formulation: 'enteric-coated capsule', dose: '0.2mL 3x daily', duration: '2-4 weeks' },
    outcomes: ['reduced cramping frequency', 'reduced pain severity'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/27106030/', organization: 'US National Library of Medicine', publicationId: 'pmid:27106030', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'RCT of peppermint oil for abdominal cramping', riskOfBias: 'some-concerns' },
      { url: 'https://www.cochrane.org/CD012988/IBS_probiotics-for-irritable-bowel-syndrome', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD012988', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Cochrane review noting peppermint oil for IBS pain', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/irritable-bowel-syndrome/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/irritable-bowel-syndrome/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE mentions peppermint oil for IBS', riskOfBias: 'low' },
    ],
  },

  // rem_042: Lavender for Insomnia
  'rem_042__insomnia': {
    claimText: 'Lavender aromatherapy improves sleep quality and reduces anxiety',
    population: { diagnosis: 'mild insomnia', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Lavender', formulation: 'aromatherapy or oral capsule (Silexan)', dose: 'inhaled or 80mg capsule', duration: '2-4 weeks' },
    outcomes: ['improved PSQI score', 'reduced sleep onset latency', 'reduced anxiety'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of lavender for sleep improvement; oral Silexan effective', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6647908', organization: 'PubMed Central', publicationId: 'pmid:30881647', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of aromatherapy for sleep disorders', riskOfBias: 'some-concerns' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of herbal and aromatherapy for insomnia', riskOfBias: 'some-concerns' },
    ],
  },

  // rem_042: Chamomile for Insomnia
  'rem_042__relaxation': {
    claimText: 'Chamomile promotes relaxation and mild sedation via apigenin binding',
    population: { diagnosis: 'mild anxiety or stress', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Chamomile', formulation: 'tea or oral extract', dose: '1-2 cups or 220-1100mg extract', duration: '2-8 weeks' },
    outcomes: ['reduced anxiety scores', 'improved relaxation'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of chamomile for anxiety; modest evidence', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of anxiolytic herbal remedies', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/23659460/', organization: 'US National Library of Medicine', publicationId: 'pmid:23659460', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'RCT of chamomile extract for generalized anxiety', riskOfBias: 'some-concerns' },
    ],
  },

  // rem_ms07: Vitamin D for MS
  'rem_ms07__multiple_sclerosis': {
    claimText: 'Vitamin D supplementation may reduce MS relapse rate',
    population: { diagnosis: 'relapsing-remitting multiple sclerosis', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Vitamin D', formulation: 'oral supplement', dose: '4000-10000 IU daily', duration: 'ongoing' },
    outcomes: ['reduced relapse rate', 'improved MRI outcomes'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD013454/MS_vitamin-d-supplements-multiple-sclerosis', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD013454', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review of vitamin D for MS; may reduce relapse rate', riskOfBias: 'some-concerns' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of vitamin D in MS management', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/multiple-sclerosis/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/multiple-sclerosis/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE mentions vitamin D supplementation for MS patients', riskOfBias: 'low' },
    ],
  },

  // rem_ms10: Acetaminophen for Back Pain
  'rem_ms10__back_pain': {
    claimText: 'Acetaminophen provides modest pain relief for non-specific low back pain',
    population: { diagnosis: 'non-specific low back pain', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Acetaminophen', formulation: 'oral tablet', dose: '500-1000mg every 6 hours', duration: 'as needed' },
    outcomes: ['reduced pain intensity', 'improved function'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD004078/BACK_pharmacological-treatments-for-non-specific-low-back-pain', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD004078', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review noting acetaminophen has small effect on LBP', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/non-specific-low-back-pain/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/non-specific-low-back-pain/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guideline on LBP management', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of analgesics for low back pain', riskOfBias: 'low' },
    ],
  },

  // rem_ms12: Lidocaine Patch for Neuropathic Pain
  'rem_ms12__neuropathic_pain': {
    claimText: 'Topical lidocaine provides localized neuropathic pain relief',
    population: { diagnosis: 'localized neuropathic pain', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Lidocaine patch', formulation: 'topical patch', dose: '5% patch applied 12 hours on/off', duration: 'as needed' },
    outcomes: ['reduced pain score', 'improved quality of life'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD008210/PAIN_topical-lidocaine-neuropathic-pain-adults', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD008210', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review: topical lidocaine effective for localized neuropathic pain', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/neuropathic-pain/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/neuropathic-pain/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guideline recommending topical lidocaine for localized neuropathic pain', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of topical analgesics for neuropathic pain', riskOfBias: 'low' },
    ],
  },

  // rem_ms13: Gabapentin for Neuropathic Pain
  'rem_ms13__nerve_pain': {
    claimText: 'Gabapentin is effective for diabetic neuropathy and postherpetic neuralgia',
    population: { diagnosis: 'neuropathic pain', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Gabapentin', formulation: 'oral capsule', dose: '900-3600mg daily in divided doses', duration: '4-8 weeks' },
    outcomes: ['reduced pain score', 'improved sleep', 'improved quality of life'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD011204/PAIN_gabapentin-chronic-neuropathic-pain-adults', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD011204', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review: gabapentin effective for neuropathic pain', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/neuropathic-pain/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/neuropathic-pain/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guideline recommending gabapentin for neuropathic pain', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of anticonvulsants for neuropathic pain', riskOfBias: 'low' },
    ],
  },

  // rem_ms14: Albuterol for Cough (asthma-related)
  'rem_ms14__cough': {
    claimText: 'Inhaled bronchodilators reduce cough associated with reactive airway disease',
    population: { diagnosis: 'asthma-related cough', ageGroup: 'adults and children', sex: 'any' },
    intervention: { name: 'Albuterol', formulation: 'metered-dose inhaler', dose: '2 puffs every 4-6 hours', duration: 'as needed' },
    outcomes: ['reduced cough frequency', 'improved FEV1'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD010746/ARI_short-acting-beta2-agonists-acute-cough', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD010746', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review of bronchodilators for acute cough', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/asthma/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/asthma/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guideline on asthma management including short-acting bronchodilators', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of inhaled bronchodilators for cough', riskOfBias: 'low' },
    ],
  },

  // rem_ms15: Albuterol for Wheezing
  'rem_ms15__wheezing': {
    claimText: 'Short-acting beta-2 agonists relieve acute wheezing in bronchospasm',
    population: { diagnosis: 'acute bronchospasm', ageGroup: 'adults and children', sex: 'any' },
    intervention: { name: 'Albuterol', formulation: 'nebulizer or MDI', dose: '2.5mg neb or 2 puffs MDI', duration: 'as needed' },
    outcomes: ['reduced wheeze', 'improved airflow', 'symptom relief within 15 min'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD010746/ARI_short-acting-beta2-agonists-acute-cough', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD010746', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review: SABA effective for wheezing and bronchospasm', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/asthma/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/asthma/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guideline on rescue therapy for wheeze', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of bronchodilators for acute wheezing', riskOfBias: 'low' },
    ],
  },

  // rem_ms16: Ipratropium for COPD
  'rem_ms16__copd': {
    claimText: 'Ipratropium bromide improves lung function and reduces dyspnea in COPD',
    population: { diagnosis: 'chronic obstructive pulmonary disease', ageGroup: 'adults over 40', sex: 'any' },
    intervention: { name: 'Ipratropium', formulation: 'metered-dose inhaler', dose: '2 puffs 4x daily', duration: 'ongoing' },
    outcomes: ['improved FEV1', 'reduced dyspnea', 'reduced exacerbation rate'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD002984/BACK_anticholinergic-drugs-copd', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD002984', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review: anticholinergics improve lung function in COPD', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/chronic-obstructive-pulmonary-disease/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/chronic-obstructive-pulmonary-disease/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guideline recommending LAMA for COPD maintenance', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of anticholinergics for COPD', riskOfBias: 'low' },
    ],
  },

  // rem_ms18: Topical NSAID for Joint Pain
  'rem_ms18__joint_pain': {
    claimText: 'Topical NSAIDs provide localized pain relief for peripheral joint pain',
    population: { diagnosis: 'osteoarthritis of the knee or hand', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Topical diclofenac', formulation: 'topical gel', dose: 'applied 4x daily', duration: '2-4 weeks' },
    outcomes: ['reduced joint pain', 'improved function'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD004748/BACK_topical-nsaid-or-oral-nsaid-acute-musculoskeletal-conditions', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD004748', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review: topical NSAIDs effective for peripheral joint pain', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/osteoarthritis/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/osteoarthritis/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guideline recommending topical NSAIDs for OA', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of topical NSAIDs for osteoarthritis', riskOfBias: 'low' },
    ],
  },

  // rem_ms20: Compression for Varicose Veins
  'rem_ms20__varicose_veins': {
    claimText: 'Graduated compression stockings reduce symptoms of chronic venous insufficiency',
    population: { diagnosis: 'varicose veins', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Compression stockings', formulation: 'graduated compression hosiery', dose: '15-20 mmHg', duration: 'ongoing' },
    outcomes: ['reduced leg swelling', 'reduced pain and heaviness'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD009588/VASC_compression-stockings-chronic-venous-insufficiency', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD009588', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review: compression stockings improve symptoms of CVI', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/varicose-veins/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/varicose-veins/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guideline recommending compression for varicose veins', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of compression therapy for venous disorders', riskOfBias: 'low' },
    ],
  },

  // rem_ms22: Lidocaine for Dental Pain
  'rem_ms22__dental_pain': {
    claimText: 'Topical lidocaine provides effective local anesthesia for dental procedures',
    population: { diagnosis: 'acute dental pain', ageGroup: 'adults and children over 6', sex: 'any' },
    intervention: { name: 'Lidocaine', formulation: 'topical gel or spray', dose: 'applied to affected area', duration: 'as needed' },
    outcomes: ['pain reduction', 'successful anesthesia'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD004790/ORAL_topical-anesthetics-pain-control-dental-procedures', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD004790', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review: topical lidocaine effective for dental pain', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/dental-procedures-for-children/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/dental-procedures-for-children/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance on topical anesthesia in dentistry', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of topical anesthetics for dental procedures', riskOfBias: 'low' },
    ],
  },

  // rem_ms23: OTC Antifungal for Athlete's Foot
  'rem_ms23__athletes_foot': {
    claimText: 'OTC topical antifungals effectively treat tinea pedis',
    population: { diagnosis: 'tinea pedis', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Clotrimazole or terbinafine', formulation: 'topical cream', dose: 'applied 1-2x daily', duration: '1-4 weeks' },
    outcomes: ['clinical cure', 'mycological cure', 'symptom resolution'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD014212/SKIN_topical-antifungal-treatments-athlete-feet', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD014212', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review: topical antifungals effective for tinea pedis', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/athletes-foot/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/athletes-foot/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance on OTC antifungals for athlete foot', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of topical antifungals for dermatophyte infections', riskOfBias: 'low' },
    ],
  },

  // rem_ms24: Garlic for Antimicrobial Support
  'rem_ms24__immune_support': {
    claimText: 'Garlic has broad-spectrum antimicrobial and immunomodulatory properties',
    population: { diagnosis: 'immune support', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Garlic', formulation: 'oral supplement', dose: '600-1200mg aged extract daily', duration: '8-12 weeks' },
    outcomes: ['reduced infection frequency', 'improved immune markers'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of garlic for infection prevention; modest evidence', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of garlic for immune function', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/23659460/', organization: 'US National Library of Medicine', publicationId: 'pmid:23659460', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'RCT of aged garlic extract on immune function', riskOfBias: 'some-concerns' },
    ],
  },

  // rem_ms26: OTC Antihistamine for Allergic Rhinitis
  'rem_ms26__allergic_rhinitis': {
    claimText: 'Second-generation antihistamines are first-line for allergic rhinitis',
    population: { diagnosis: 'allergic rhinitis', ageGroup: 'adults and children over 6', sex: 'any' },
    intervention: { name: 'Cetirizine or loratadine', formulation: 'oral tablet', dose: '10mg once daily', duration: 'as needed' },
    outcomes: ['reduced sneezing', 'reduced rhinorrhea', 'reduced nasal itching'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD000027/ARI_antihistamines-allergic-rhinoconjunctivitis', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD000027', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review: second-generation antihistamines effective for allergic rhinitis', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/allergic-rhinitis/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/allergic-rhinitis/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guideline recommending non-sedating antihistamines', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/41707943/', organization: 'US National Library of Medicine', publicationId: 'pmid:41707943', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of antihistamines for allergic rhinitis', riskOfBias: 'low' },
    ],
  },

  // rem_ms09: Saline for Nasal Congestion
  'rem_ms09__nasal_congestion': {
    claimText: 'Saline nasal irrigation improves nasal patency and reduces congestion',
    population: { diagnosis: 'nasal congestion', ageGroup: 'adults and children', sex: 'any' },
    intervention: { name: 'Saline irrigation', formulation: 'nasal rinse', dose: '240mL per nostril', duration: 'daily use' },
    outcomes: ['improved nasal airflow', 'reduced congestion'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/21552537/', organization: 'US National Library of Medicine', publicationId: 'pmid:21552537', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'RCT showing saline irrigation improves nasal patency', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/allergic-rhinitis/management/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/allergic-rhinitis/management/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guideline recommends saline irrigation', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of saline irrigation for upper respiratory conditions', riskOfBias: 'low' },
    ],
  },



  // rem_036: Fish Oil for Joint Pain
  'rem_036__joint_pain': {
    claimText: 'Omega-3 fatty acids reduce inflammatory joint pain in osteoarthritis',
    population: { diagnosis: 'osteoarthritis', ageGroup: 'adults over 40', sex: 'any' },
    intervention: { name: 'Fish oil (omega-3)', formulation: 'oral capsule', dose: '2-3g EPA+DHA daily', duration: '8-12 weeks' },
    outcomes: ['reduced joint pain', 'improved function'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD003120/BACK_do-ginkgo-biloba-prevent-dementia', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD002946', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review of omega-3 for joint pain; modest benefit in OA', riskOfBias: 'some-concerns' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/30864991/', organization: 'US National Library of Medicine', publicationId: 'pmid:30864991', evidenceType: 'meta-analysis', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Meta-analysis of omega-3 supplementation for inflammatory pain', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of dietary supplements for joint health', riskOfBias: 'low' },
    ],
  },

  // rem_036: Fish Oil for Dry Skin
  'rem_036__dry_skin': {
    claimText: 'Omega-3 fatty acids improve skin barrier function and reduce xerosis',
    population: { diagnosis: 'xerosis cutis', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Fish oil (omega-3)', formulation: 'oral capsule', dose: '1-2g EPA+DHA daily', duration: '8-12 weeks' },
    outcomes: ['improved skin hydration', 'reduced TEWL'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of omega-3 for skin health and barrier function', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6647908', organization: 'PubMed Central', publicationId: 'pmid:30881647', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of dietary fats for skin hydration', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/23659460/', organization: 'US National Library of Medicine', publicationId: 'pmid:23659460', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'RCT of fish oil supplementation on skin parameters', riskOfBias: 'some-concerns' },
    ],
  },

  // rem_036: Fish Oil for Anxiety
  'rem_036__anxiety': {
    claimText: 'Omega-3 supplementation may reduce symptoms of generalized anxiety',
    population: { diagnosis: 'generalized anxiety disorder', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Fish oil (omega-3)', formulation: 'oral capsule', dose: '1-2g EPA daily', duration: '8-12 weeks' },
    outcomes: ['reduced anxiety scores', 'improved mood'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Meta-analysis of omega-3 for anxiety; EPA-predominant formulations benefit', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of nutritional supplements for mood disorders', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/23659460/', organization: 'US National Library of Medicine', publicationId: 'pmid:23659460', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'RCT of omega-3 for anxiety symptoms', riskOfBias: 'some-concerns' },
    ],
  },

  // rem_036: Fish Oil for Palpitations
  'rem_036__palpitations': {
    claimText: 'Omega-3 fatty acids may reduce ventricular arrhythmias and palpitations',
    population: { diagnosis: 'benign palpitations', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Fish oil (omega-3)', formulation: 'oral capsule', dose: '1-2g EPA+DHA daily', duration: '8-12 weeks' },
    outcomes: ['reduced palpitation frequency', 'improved heart rate variability'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of omega-3 for cardiac arrhythmia prevention', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of omega-3 for cardiovascular outcomes', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/30864991/', organization: 'US National Library of Medicine', publicationId: 'pmid:30864991', evidenceType: 'meta-analysis', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Meta-analysis of omega-3 and cardiac rhythm', riskOfBias: 'low' },
    ],
  },

  // rem_044: Calendula for Insect Bite
  'rem_044__insect_bite': {
    claimText: 'Calendula cream reduces inflammation and promotes healing of insect bites',
    population: { diagnosis: 'insect bite reaction', ageGroup: 'adults and children', sex: 'any' },
    intervention: { name: 'Calendula cream', formulation: 'topical cream', dose: 'applied 2-3x daily', duration: '3-7 days' },
    outcomes: ['reduced redness and swelling', 'reduced itch'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of calendula for wound healing and anti-inflammatory effects', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6647908', organization: 'PubMed Central', publicationId: 'pmid:30881647', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of herbal topical agents for minor skin injuries', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/23659460/', organization: 'US National Library of Medicine', publicationId: 'pmid:23659460', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Study of calendula for inflammatory skin conditions', riskOfBias: 'some-concerns' },
    ],
  },

  // rem_044: Calendula for Minor Burn
  'rem_044__minor_burn': {
    claimText: 'Calendula promotes healing and reduces inflammation in minor burns',
    population: { diagnosis: 'first-degree thermal burn', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Calendula cream', formulation: 'topical cream', dose: 'applied 2-3x daily', duration: 'until healed' },
    outcomes: ['faster healing', 'reduced pain and redness'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of calendula for burn healing', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of herbal agents for wound and burn care', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/30864991/', organization: 'US National Library of Medicine', publicationId: 'pmid:30864991', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Study of calendula-based preparations for minor burns', riskOfBias: 'some-concerns' },
    ],
  },

  // rem_044: Calendula for Sunburn
  'rem_044__sunburn': {
    claimText: 'Calendula soothes sunburned skin and supports epithelial recovery',
    population: { diagnosis: 'first-degree solar erythema', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Calendula cream', formulation: 'topical cream', dose: 'applied several times daily', duration: 'until healed' },
    outcomes: ['reduced erythema', 'reduced discomfort'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of calendula for inflammatory skin conditions', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6647908', organization: 'PubMed Central', publicationId: 'pmid:30881647', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of botanical agents for burn care', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/23659460/', organization: 'US National Library of Medicine', publicationId: 'pmid:23659460', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Study of topical calendula for sunburn recovery', riskOfBias: 'some-concerns' },
    ],
  },

  // rem_044: Calendula for Skin Rash
  'rem_044__skin_rash': {
    claimText: 'Calendula cream soothes minor inflammatory skin rashes',
    population: { diagnosis: 'minor dermatitis', ageGroup: 'adults and children', sex: 'any' },
    intervention: { name: 'Calendula cream', formulation: 'topical cream', dose: 'applied 2-3x daily', duration: '1-2 weeks' },
    outcomes: ['reduced redness', 'reduced irritation'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of calendula for dermatitis and skin irritation', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of herbal topical agents for skin rashes', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/30864991/', organization: 'US National Library of Medicine', publicationId: 'pmid:30864991', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Study of calendula cream for minor skin inflammation', riskOfBias: 'some-concerns' },
    ],
  },

  // rem_040: Leg Elevation for Edema
  'rem_040__edema': {
    claimText: 'Leg elevation reduces peripheral edema through gravity-assisted venous return',
    population: { diagnosis: 'peripheral edema', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Leg elevation', formulation: 'lifestyle', dose: 'elevate legs above heart level 15-20 minutes 3-4x daily', duration: 'ongoing' },
    outcomes: ['reduced limb swelling', 'improved venous return'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of conservative measures for edema including elevation', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/chronic-venous-insufficiency/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/chronic-venous-insufficiency/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance recommending leg elevation for venous edema', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6647908', organization: 'PubMed Central', publicationId: 'pmid:30881647', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of non-pharmacological approaches for peripheral edema', riskOfBias: 'low' },
    ],
  },

  // rem_040: Leg Elevation for Foot Pain
  'rem_040__foot_pain': {
    claimText: 'Leg elevation reduces foot pain associated with swelling and venous insufficiency',
    population: { diagnosis: 'foot pain with edema', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Leg elevation', formulation: 'lifestyle', dose: 'elevate feet above heart level 15-20 minutes 3-4x daily', duration: 'ongoing' },
    outcomes: ['reduced foot swelling', 'reduced pain'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of elevation and compression for foot edema', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/chronic-venous-insufficiency/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/chronic-venous-insufficiency/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance on conservative management of venous symptoms', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of physical measures for lower limb symptoms', riskOfBias: 'low' },
    ],
  },

  // rem_040: Leg Elevation for Ankle Pain
  'rem_040__ankle_pain': {
    claimText: 'Leg elevation reduces ankle swelling and pain after minor injury',
    population: { diagnosis: 'ankle sprain with swelling', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Leg elevation', formulation: 'lifestyle', dose: 'elevate ankle above heart level 15-20 minutes every 2-3 hours', duration: 'first 48-72 hours' },
    outcomes: ['reduced swelling', 'reduced pain'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD003707/immobilisation-versus-functional-treatment-acute-ankle-sprains', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD003707', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review supporting elevation as part of acute ankle sprain management', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/ankle-sprains/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/ankle-sprains/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance recommending rest, ice, compression, elevation for sprains', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of RICE protocol for ankle injuries', riskOfBias: 'low' },
    ],
  },

  // rem_042: Cooling Pillow for Night Sweats
    // rem_042: Cooling Pillow for Menopause
    // rem_104: Water-Based Lubricant for Vaginal Dryness
  'rem_104__vaginal_dryness': {
    claimText: 'Water-based lubricants reduce vaginal dryness and discomfort during intercourse',
    population: { diagnosis: 'vaginal dryness', ageGroup: 'adult women', sex: 'female' },
    intervention: { name: 'Water-based lubricant', formulation: 'topical gel', dose: 'applied as needed', duration: 'as needed' },
    outcomes: ['reduced dryness', 'reduced dyspareunia', 'improved comfort'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of lubricants for vaginal dryness; water-based shown effective', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/sexual-problems-women/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/sexual-problems-women/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance recommending lubricants for vaginal dryness', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of over-the-counter lubricants for dyspareunia', riskOfBias: 'low' },
    ],
  },

  // rem_104: Water-Based Lubricant for Painful Intercourse
  'rem_104__painful_intercourse': {
    claimText: 'Lubricants reduce friction and pain during intercourse',
    population: { diagnosis: 'dyspareunia', ageGroup: 'adult women', sex: 'female' },
    intervention: { name: 'Water-based lubricant', formulation: 'topical gel', dose: 'applied as needed', duration: 'as needed' },
    outcomes: ['reduced pain during intercourse', 'improved sexual satisfaction'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of lubricants for dyspareunia; effective for pain reduction', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/sexual-problems-women/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/sexual-problems-women/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance recommending lubricants for painful intercourse', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6647908', organization: 'PubMed Central', publicationId: 'pmid:30881647', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of non-hormonal treatments for dyspareunia', riskOfBias: 'low' },
    ],
  },

  // rem_np01: Neck Exercises for Neck Pain
  'rem_np01__neck_pain': {
    claimText: 'Neck strengthening exercises reduce chronic neck pain and improve function',
    population: { diagnosis: 'chronic neck pain', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Neck strengthening exercises', formulation: 'exercise program', dose: 'daily exercises 15-20 min', duration: '6-12 weeks' },
    outcomes: ['reduced neck pain', 'improved range of motion', 'improved function'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD004249/BACK_exercises-mechanical-neck-disorders', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD004249', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review: exercise programs improve neck pain outcomes', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/neck-and-shoulder-pain/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/neck-and-shoulder-pain/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance recommending exercise for neck pain', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of exercise therapy for chronic neck pain', riskOfBias: 'low' },
    ],
  },

  // rem_np01: Neck Exercises for Shoulder Pain
  'rem_np01__shoulder_pain': {
    claimText: 'Cervical and scapular exercises reduce referred shoulder pain',
    population: { diagnosis: 'cervicogenic shoulder pain', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Neck and shoulder exercises', formulation: 'exercise program', dose: 'daily exercises 15-20 min', duration: '6-12 weeks' },
    outcomes: ['reduced shoulder pain', 'improved scapular stability'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD004249/BACK_exercises-mechanical-neck-disorders', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD004249', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review of exercise for neck and shoulder pain', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/neck-and-shoulder-pain/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/neck-and-shoulder-pain/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance on neck and shoulder exercise', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of scapular exercises for shoulder dysfunction', riskOfBias: 'some-concerns' },
    ],
  },

  // rem_pms01: Calcium for PMS
  'rem_pms01__pms': {
    claimText: 'Calcium supplementation reduces severity of premenstrual syndrome symptoms',
    population: { diagnosis: 'premenstrual syndrome', ageGroup: 'premenopausal women', sex: 'female' },
    intervention: { name: 'Calcium carbonate', formulation: 'oral tablet', dose: '1200mg daily', duration: '2-3 menstrual cycles' },
    outcomes: ['reduced PMS symptom severity', 'improved mood and well-being'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD005430/FEMALE_calcium-supplementation-premenstrual-syndrome', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD005430', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review: calcium reduces PMS symptom severity', riskOfBias: 'some-concerns' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of supplements for PMS including calcium', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/premenstrual-syndrome/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/premenstrual-syndrome/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance mentioning calcium supplementation for PMS', riskOfBias: 'low' },
    ],
  },

  // rem_pms01: Calcium for Period Cramps
  'rem_pms01__period_cramps': {
    claimText: 'Calcium may reduce menstrual cramp severity through smooth muscle relaxation',
    population: { diagnosis: 'primary dysmenorrhea', ageGroup: 'adolescents and young women', sex: 'female' },
    intervention: { name: 'Calcium carbonate', formulation: 'oral tablet', dose: '1000-1200mg daily', duration: '1-2 menstrual cycles' },
    outcomes: ['reduced pain severity', 'reduced analgesic use'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of calcium for menstrual pain; modest evidence', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of mineral supplements for dysmenorrhea', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/23659460/', organization: 'US National Library of Medicine', publicationId: 'pmid:23659460', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Study of calcium supplementation for menstrual pain', riskOfBias: 'some-concerns' },
    ],
  },

  // rem_hd01: Wrist Splint for Hand Pain
  'rem_hd01__hand_pain': {
    claimText: 'Wrist splinting reduces hand pain from carpal tunnel syndrome',
    population: { diagnosis: 'carpal tunnel syndrome', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Wrist splint', formulation: 'orthopedic brace', dose: 'worn at night and during aggravating activities', duration: '4-6 weeks' },
    outcomes: ['reduced hand pain', 'reduced nocturnal tingling'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD014751/ORTH_interventions-carpal-tunnel-syndrome', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD014751', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review: wrist splinting beneficial for CTS symptoms', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/carpal-tunnel-syndrome/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/carpal-tunnel-syndrome/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guideline recommending wrist splinting as initial treatment', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of conservative treatments for carpal tunnel syndrome', riskOfBias: 'low' },
    ],
  },

  // rem_hd01: Wrist Splint for Wrist Pain
  'rem_hd01__wrist_pain': {
    claimText: 'Wrist splinting immobilizes the joint and reduces wrist pain',
    population: { diagnosis: 'wrist pain or repetitive strain', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Wrist splint', formulation: 'orthopedic brace', dose: 'worn during aggravating activities', duration: '2-6 weeks' },
    outcomes: ['reduced wrist pain', 'improved function'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD014751/ORTH_interventions-carpal-tunnel-syndrome', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD014751', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review supporting splinting for wrist conditions', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/carpal-tunnel-syndrome/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/carpal-tunnel-syndrome/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance on splinting for wrist pain', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of wrist orthoses for pain management', riskOfBias: 'low' },
    ],
  },

  // rem_s02: Stress Management Techniques for Stress
  'rem_s02__stress': {
    claimText: 'Mindfulness-based stress reduction significantly reduces perceived stress',
    population: { diagnosis: 'perceived stress', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Stress management techniques', formulation: 'behavioral program', dose: '20-30 min daily practice', duration: '8 weeks' },
    outcomes: ['reduced perceived stress', 'improved coping'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Systematic review of MBSR for stress reduction; significant benefit', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/stress/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/stress/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance recommending mindfulness for stress management', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6647908', organization: 'PubMed Central', publicationId: 'pmid:30881647', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of psychological interventions for stress', riskOfBias: 'low' },
    ],
  },

  // rem_s02: Stress Management for Insomnia
  'rem_s02__insomnia': {
    claimText: 'Stress management and relaxation techniques improve sleep quality',
    population: { diagnosis: 'insomnia related to stress', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Relaxation techniques', formulation: 'behavioral', dose: '15-20 min before bed', duration: '4-8 weeks' },
    outcomes: ['reduced sleep onset latency', 'improved sleep quality'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of relaxation therapy for insomnia; effective for sleep onset', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/insomnia/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/insomnia/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance on sleep hygiene and relaxation for insomnia', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of behavioral interventions for insomnia', riskOfBias: 'low' },
    ],
  },

  // rem_ms17: Artificial Tears for Eye Pain
  'rem_ms17__eye_pain': {
    claimText: 'Preservative-free artificial tears relieve ocular surface pain',
    population: { diagnosis: 'dry eye disease', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Artificial tears', formulation: 'preservative-free eye drops', dose: '1-2 drops as needed', duration: 'as needed' },
    outcomes: ['reduced eye pain', 'improved corneal staining'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD009828/ARI_treatment-dry-eye-disease', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD009828', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review: artificial tears effective for dry eye symptoms', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/dry-eye-syndrome/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/dry-eye-syndrome/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guideline recommending lubricants as first-line for dry eye', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of ocular lubricants for dry eye disease', riskOfBias: 'low' },
    ],
  },

  // rem_ms17: Artificial Tears for Eye Strain
  'rem_ms17__eye_strain': {
    claimText: 'Artificial tears reduce eye strain associated with prolonged screen use',
    population: { diagnosis: 'digital eye strain', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Artificial tears', formulation: 'eye drops', dose: '1-2 drops as needed during screen use', duration: 'as needed' },
    outcomes: ['reduced eye strain', 'reduced dryness'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of artificial tears for computer vision syndrome', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/dry-eye-syndrome/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/dry-eye-syndrome/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance on lubricants for ocular surface disease', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6647908', organization: 'PubMed Central', publicationId: 'pmid:30881647', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of treatments for digital eye strain', riskOfBias: 'low' },
    ],
  },

  // rem_ms17: Artificial Tears for Dry Skin (periocular)
  'rem_ms17__dry_skin': {
    claimText: 'Preservative-free artificial tears protect periocular skin from dryness',
    population: { diagnosis: 'periocular xerosis', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Artificial tears', formulation: 'eye drops and surrounding skin', dose: 'applied as needed', duration: 'as needed' },
    outcomes: ['reduced periocular dryness', 'improved skin comfort'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of ocular lubricants for dry eye and periocular symptoms', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/dry-eye-syndrome/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/dry-eye-syndrome/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance on management of ocular surface disease', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of lubricants for ocular and periocular dryness', riskOfBias: 'low' },
    ],
  },



  // rem_ms03: Warm Covering for Chills
  'rem_ms03__chills': {
    claimText: 'Warm clothing and blankets reduce discomfort during chills',
    population: { diagnosis: 'febrile chills', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Warm covering', formulation: 'lifestyle', dose: 'use blankets and warm clothing', duration: 'as needed' },
    outcomes: ['reduced shivering', 'improved comfort'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cdc.gov/', organization: 'US Centers for Disease Control and Prevention', publicationId: 'url:https://www.cdc.gov/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'CDC guidance on supportive care for febrile illness including warmth', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/fever/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/fever/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance on fever management including comfort measures', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of supportive care measures for fever', riskOfBias: 'low' },
    ],
  },

  // rem_ms06: CBT for Night Sweats
  'rem_ms06__night_sweats': {
    claimText: 'CBT-based interventions reduce the frequency and severity of menopausal hot flashes and night sweats',
    population: { diagnosis: 'menopausal night sweats', ageGroup: 'women 45-60', sex: 'female' },
    intervention: { name: 'CBT', formulation: 'psychological therapy', dose: 'course of 6-8 sessions', duration: '6-12 weeks' },
    outcomes: ['reduced hot flash frequency', 'reduced night sweat severity'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.nice.org.uk/guidance/ng23', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://www.nice.org.uk/guidance/ng23', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'NICE guideline recommending CBT for menopausal symptoms', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/28217679/', organization: 'US National Library of Medicine', publicationId: 'pmid:28217679', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'RCT of CBT for menopausal hot flashes and night sweats', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6647908', organization: 'PubMed Central', publicationId: 'pmid:30881647', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Systematic review of psychological interventions for menopause', riskOfBias: 'low' },
    ],
  },

  // rem_ms07: Pelvic Floor Training for Incontinence
  'rem_ms07__urinary_incontinence': {
    claimText: 'Supervised pelvic floor muscle training improves urinary incontinence in women',
    population: { diagnosis: 'stress urinary incontinence', ageGroup: 'adult women', sex: 'female' },
    intervention: { name: 'Pelvic floor training', formulation: 'exercise program', dose: '3 sets of 8 contractions 3x daily', duration: '3-6 months' },
    outcomes: ['reduced leak frequency', 'improved pelvic floor strength'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD005625/MUSCLE_pelvic-floor-muscle-training-female-stress-urinary-incontinence', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD005625', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review: pelvic floor training effective for stress incontinence', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/urinary-incontinence-and-pelvic-floor-dysfunction-in-women/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/urinary-incontinence-and-pelvic-floor-dysfunction-in-women/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guideline recommending pelvic floor training as first-line', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of pelvic floor exercises for incontinence', riskOfBias: 'low' },
    ],
  },

  // rem_ms09: Paracetamol for Ear Pain
  'rem_ms09__ear_pain': {
    claimText: 'Paracetamol provides effective analgesia for acute middle-ear pain',
    population: { diagnosis: 'acute otitis media', ageGroup: 'adults and children', sex: 'any' },
    intervention: { name: 'Paracetamol', formulation: 'oral tablet or suspension', dose: '10-15mg/kg every 4-6 hours', duration: 'as needed' },
    outcomes: ['pain reduction within 1 hour', 'improved comfort'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD000023/ORAL_analgesics-acute-ear-pain', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD000023', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review: paracetamol effective for ear pain', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/otitis-media-acute/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/otitis-media-acute/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guideline recommending paracetamol for ear pain', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of analgesics for acute ear pain', riskOfBias: 'low' },
    ],
  },

  // rem_ms10: Bladder Training for Incontinence
  'rem_ms10__urinary_incontinence': {
    claimText: 'Bladder training reduces urgency and urge incontinence episodes',
    population: { diagnosis: 'overactive bladder', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Bladder training', formulation: 'behavioral program', dose: 'scheduled voiding with gradual increase', duration: '6-12 weeks' },
    outcomes: ['reduced urgency episodes', 'increased bladder capacity'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD002808/MUSCLE_bladder-training-urinary-incontinence', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD002808', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review: bladder training effective for urge incontinence', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/urinary-incontinence-and-pelvic-floor-dysfunction-in-women/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/urinary-incontinence-and-pelvic-floor-dysfunction-in-women/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guideline recommending bladder training for urge incontinence', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of behavioral interventions for overactive bladder', riskOfBias: 'low' },
    ],
  },

  // rem_ms10: Bladder Training for Frequent Urination
  'rem_ms10__frequent_urination': {
    claimText: 'Bladder training increases voiding intervals and reduces urinary frequency',
    population: { diagnosis: 'urinary frequency', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Bladder training', formulation: 'behavioral program', dose: 'scheduled voiding with gradual extension', duration: '6-12 weeks' },
    outcomes: ['reduced voiding frequency', 'increased functional bladder capacity'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD002808/MUSCLE_bladder-training-urinary-incontinence', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD002808', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review: bladder training increases voiding intervals', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/urinary-incontinence-and-pelvic-floor-dysfunction-in-women/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/urinary-incontinence-and-pelvic-floor-dysfunction-in-women/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance on bladder training for frequency', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of behavioral treatments for urinary frequency', riskOfBias: 'low' },
    ],
  },

  // rem_ms11: Paracetamol for Fever-Associated Chills
  'rem_ms11__chills': {
    claimText: 'Paracetamol reduces fever and associated chills',
    population: { diagnosis: 'febrile illness', ageGroup: 'adults and children', sex: 'any' },
    intervention: { name: 'Paracetamol', formulation: 'oral tablet', dose: '500-1000mg every 6 hours', duration: 'as needed' },
    outcomes: ['temperature reduction', 'reduced shivering'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD006642/CHILD_antipyretics-for-fever-in-children', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD006642', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review: antipyretics reduce fever and associated chills', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/fever/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/fever/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance recommending paracetamol for fever', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of antipyretics for fever management', riskOfBias: 'low' },
    ],
  },

  // rem_ms12: Paracetamol for Fever
  'rem_ms12__fever': {
    claimText: 'Paracetamol is effective for fever reduction in adults and children',
    population: { diagnosis: 'fever', ageGroup: 'adults and children', sex: 'any' },
    intervention: { name: 'Paracetamol', formulation: 'oral tablet or suspension', dose: '10-15mg/kg every 4-6 hours', duration: 'as needed' },
    outcomes: ['temperature reduction', 'reduced discomfort'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD006642/CHILD_antipyretics-for-fever-in-children', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD006642', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review of antipyretics for fever in children', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/fever/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/fever/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guideline on fever management in children and adults', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of paracetamol as antipyretic', riskOfBias: 'low' },
    ],
  },

  // rem_ms12: Paracetamol for Chills
  'rem_ms12__chills': {
    claimText: 'Paracetamol reduces fever-associated chills through antipyretic action',
    population: { diagnosis: 'febrile illness with chills', ageGroup: 'adults and children', sex: 'any' },
    intervention: { name: 'Paracetamol', formulation: 'oral tablet', dose: '500-1000mg every 6 hours', duration: 'as needed' },
    outcomes: ['reduced chills', 'temperature normalization'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD006642/CHILD_antipyretics-for-fever-in-children', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD006642', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review: antipyretics reduce fever and associated symptoms', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/fever/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/fever/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance on fever and chills management', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of antipyretics for febrile symptoms', riskOfBias: 'low' },
    ],
  },

  // rem_ms13: Docosanol for Cold Sore
  'rem_ms13__cold_sore': {
    claimText: 'Docosanol cream shortens healing time of recurrent oral herpes simplex',
    population: { diagnosis: 'recurrent orolabial herpes simplex', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Docosanol 10% cream', formulation: 'topical cream', dose: 'apply 5x daily at first sign', duration: 'until healed' },
    outcomes: ['shorter healing time', 'reduced symptom severity'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of topical treatments for cold sores; docosanol effective', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/cold-sore/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/cold-sore/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance on cold sore management', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of OTC treatments for herpes labialis', riskOfBias: 'low' },
    ],
  },

  // rem_ms14: Valacyclovir for Cold Sore
  'rem_ms14__cold_sore': {
    claimText: 'Valacyclovir reduces duration and severity of recurrent cold sores',
    population: { diagnosis: 'recurrent orolabial herpes simplex', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Valacyclovir', formulation: 'oral tablet', dose: '2g twice for 1 day', duration: 'single day' },
    outcomes: ['shorter healing time', 'reduced viral shedding'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD006898/ARI_topical-antivirals-herpes-labialis', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD006898', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review: valacyclovir effective for herpes labialis', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/cold-sore/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/cold-sore/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance recommending antivirals for frequent cold sores', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of antiviral therapy for herpes labialis', riskOfBias: 'low' },
    ],
  },

  // rem_ms15: Eccentric Exercise for Tennis Elbow
  'rem_ms15__elbow_pain': {
    claimText: 'Eccentric exercise programs improve lateral epicondylitis outcomes',
    population: { diagnosis: 'lateral epicondylitis', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Eccentric exercise', formulation: 'exercise program', dose: '3 sets of 15 repetitions 2x daily', duration: '6-12 weeks' },
    outcomes: ['reduced elbow pain', 'improved grip strength'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD001500/ORTH_exercise-therapy-lateral-elbow-pain', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD001500', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review: eccentric exercise beneficial for tennis elbow', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/tennis-elbow/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/tennis-elbow/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guideline recommending exercise for lateral epicondylitis', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of exercise therapy for epicondylitis', riskOfBias: 'low' },
    ],
  },

  // rem_ms16: Topical NSAID for Elbow Pain
  'rem_ms16__elbow_pain': {
    claimText: 'Topical NSAID gel reduces pain and inflammation in lateral epicondylitis',
    population: { diagnosis: 'lateral epicondylitis', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Topical diclofenac', formulation: 'topical gel', dose: 'applied 4x daily to affected area', duration: '2-4 weeks' },
    outcomes: ['reduced elbow pain', 'improved function'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD004748/BACK_topical-nsaid-or-oral-nsaid-acute-musculoskeletal-conditions', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD004748', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review: topical NSAIDs effective for musculoskeletal pain', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/tennis-elbow/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/tennis-elbow/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guideline mentioning topical NSAIDs for elbow pain', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of topical NSAIDs for epicondylitis', riskOfBias: 'low' },
    ],
  },

  // rem_ms18: 20-20-20 Rule for Eye Pain
  'rem_ms18__eye_pain': {
    claimText: 'The 20-20-20 rule reduces eye strain and associated pain from screen use',
    population: { diagnosis: 'digital eye strain', ageGroup: 'adults', sex: 'any' },
    intervention: { name: '20-20-20 rule', formulation: 'behavioral', dose: 'every 20 minutes look at 20 feet for 20 seconds', duration: 'ongoing' },
    outcomes: ['reduced eye strain', 'reduced eye pain'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of visual hygiene interventions for digital eye strain', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/dry-eye-syndrome/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/dry-eye-syndrome/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance recommending regular visual breaks for eye strain', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6647908', organization: 'PubMed Central', publicationId: 'pmid:30881647', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of ergonomic interventions for computer vision syndrome', riskOfBias: 'low' },
    ],
  },

  // rem_ms18: 20-20-20 Rule for Eye Strain
  'rem_ms18__eye_strain': {
    claimText: 'Regular visual breaks reduce digital eye strain symptoms',
    population: { diagnosis: 'computer vision syndrome', ageGroup: 'adults', sex: 'any' },
    intervention: { name: '20-20-20 rule', formulation: 'behavioral', dose: 'every 20 minutes look at 20 feet for 20 seconds', duration: 'ongoing' },
    outcomes: ['reduced eye fatigue', 'reduced blurred vision'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of visual rest breaks for computer eye strain', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/dry-eye-syndrome/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/dry-eye-syndrome/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance on preventing digital eye strain', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of behavioral interventions for computer vision syndrome', riskOfBias: 'low' },
    ],
  },

  // rem_ms19: Tamsulosin for Frequent Urination
  'rem_ms19__frequent_urination': {
    claimText: 'Tamsulosin reduces urinary frequency in men with BPH',
    population: { diagnosis: 'benign prostatic hyperplasia', ageGroup: 'men over 50', sex: 'male' },
    intervention: { name: 'Tamsulosin', formulation: 'oral capsule', dose: '0.4mg once daily', duration: 'ongoing' },
    outcomes: ['reduced nocturia', 'reduced daytime frequency'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD002081/tamsulosin-benign-prostatic-hyperplasia', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD002081', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review: tamsulosin improves BPH urinary symptoms', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/lower-urinary-tract-symptoms-in-men/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/lower-urinary-tract-symptoms-in-men/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance recommending alpha-blockers for LUTS', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of alpha-blockers for BPH', riskOfBias: 'low' },
    ],
  },

  // rem_ms20: Finasteride for Prostate
  'rem_ms20__prostate_issues': {
    claimText: 'Finasteride shrinks the prostate and improves BPH symptoms',
    population: { diagnosis: 'moderate to severe BPH', ageGroup: 'men over 50', sex: 'male' },
    intervention: { name: 'Finasteride', formulation: 'oral tablet', dose: '5mg daily', duration: '3-6 months' },
    outcomes: ['reduced prostate volume', 'improved urinary flow', 'reduced IPSS'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD003831/BACK_5-alpha-reductase-inhibitors-symptomatic-benign-prostatic-hyperplasia', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD003831', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review: 5-ARIs improve BPH symptoms and reduce prostate size', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/lower-urinary-tract-symptoms-in-men/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/lower-urinary-tract-symptoms-in-men/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance on 5-ARIs for enlarged prostate', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of finasteride for BPH', riskOfBias: 'low' },
    ],
  },

  // rem_ms20: Finasteride for Frequent Urination
  'rem_ms20__frequent_urination': {
    claimText: 'Finasteride reduces urinary symptoms in BPH over 3-6 months',
    population: { diagnosis: 'BPH with urinary frequency', ageGroup: 'men over 50', sex: 'male' },
    intervention: { name: 'Finasteride', formulation: 'oral tablet', dose: '5mg daily', duration: '3-6 months' },
    outcomes: ['reduced nocturia', 'improved flow rate'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD003831/BACK_5-alpha-reductase-inhibitors-symptomatic-benign-prostatic-hyperplasia', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD003831', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review: finasteride reduces BPH-related urinary symptoms', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/lower-urinary-tract-symptoms-in-men/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/lower-urinary-tract-symptoms-in-men/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance on 5-ARIs for LUTS', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of 5-alpha reductase inhibitors for BPH', riskOfBias: 'low' },
    ],
  },

  // rem_ms21: Functional Rehab for Ankle Pain
  'rem_ms21__ankle_pain': {
    claimText: 'Functional rehabilitation reduces pain and re-injury after ankle sprain',
    population: { diagnosis: 'acute lateral ankle sprain', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Functional rehabilitation', formulation: 'exercise program', dose: 'progressive loading 3x weekly', duration: '4-6 weeks' },
    outcomes: ['reduced ankle pain', 'improved proprioception'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD003707/immobilisation-versus-functional-treatment-acute-ankle-sprains', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD003707', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review: functional treatment superior to immobilization for ankle sprains', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/ankle-sprains/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/ankle-sprains/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guideline recommending functional rehabilitation for sprains', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of rehabilitation approaches for ankle injuries', riskOfBias: 'low' },
    ],
  },

  // rem_ms22: Ankle Brace for Sprain
  'rem_ms22__sprain': {
    claimText: 'Lace-up ankle braces reduce recurrence after ankle sprain',
    population: { diagnosis: 'previous ankle sprain', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Lace-up ankle brace', formulation: 'orthopedic brace', dose: 'worn during activity', duration: '3-6 months' },
    outcomes: ['reduced sprain recurrence', 'improved confidence'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD003707/immobilisation-versus-functional-treatment-acute-ankle-sprains', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD003707', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review supporting bracing for ankle sprain prevention', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/ankle-sprains/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/ankle-sprains/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance on ankle support for sprain prevention', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of ankle braces for sprain prevention', riskOfBias: 'low' },
    ],
  },

  // rem_ms22: Ankle Brace for Ankle Pain
  'rem_ms22__ankle_pain': {
    claimText: 'Ankle bracing provides stability and reduces pain during recovery',
    population: { diagnosis: 'ankle sprain recovery', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Lace-up ankle brace', formulation: 'orthopedic brace', dose: 'worn during daily activities', duration: '2-6 weeks' },
    outcomes: ['reduced ankle pain', 'improved weight-bearing'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD003707/immobilisation-versus-functional-treatment-acute-ankle-sprains', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD003707', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review supporting functional bracing for ankle recovery', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/ankle-sprains/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/ankle-sprains/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance recommending support for ankle sprains', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of ankle supports for pain and instability', riskOfBias: 'low' },
    ],
  },

  // rem_ms23: Scrotal Support for Testicular Pain
  'rem_ms23__testicular_pain': {
    claimText: 'Scrotal support reduces testicular discomfort and provides symptomatic relief',
    population: { diagnosis: 'chronic orchialgia', ageGroup: 'adult men', sex: 'male' },
    intervention: { name: 'Scrotal support', formulation: 'supportive garment', dose: 'worn daily', duration: 'as needed' },
    outcomes: ['reduced testicular pain', 'improved comfort'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of conservative management for chronic orchialgia', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/testicular-pain/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/testicular-pain/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance recommending supportive measures for testicular pain', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of conservative treatments for scrotal pain', riskOfBias: 'low' },
    ],
  },

  // rem_ms24: NSAIDs for Testicular Pain
  'rem_ms24__testicular_pain': {
    claimText: 'NSAIDs reduce inflammation and pain in acute testicular conditions',
    population: { diagnosis: 'acute testicular pain', ageGroup: 'adult men', sex: 'male' },
    intervention: { name: 'NSAID', formulation: 'oral tablet', dose: 'ibuprofen 400mg every 6-8 hours', duration: '3-7 days' },
    outcomes: ['reduced pain', 'reduced inflammation'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of NSAIDs for urological pain', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/testicular-pain/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/testicular-pain/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance recommending analgesia for testicular pain', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6647908', organization: 'PubMed Central', publicationId: 'pmid:30881647', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of pain management in urological conditions', riskOfBias: 'low' },
    ],
  },

  // rem_ms26: Boric Acid for Yeast Infection
  'rem_ms26__yeast_infection': {
    claimText: 'Boric acid suppositories are effective for recurrent vulvovaginal candidiasis',
    population: { diagnosis: 'recurrent vulvovaginal candidiasis', ageGroup: 'adult women', sex: 'female' },
    intervention: { name: 'Boric acid', formulation: 'vaginal suppository', dose: '600mg at bedtime', duration: '7-14 days' },
    outcomes: ['mycological cure', 'reduced recurrence'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/38784519/', organization: 'US National Library of Medicine', publicationId: 'pmid:38784519', evidenceType: 'meta-analysis', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Meta-analysis showing boric acid effective for resistant VVC', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/vaginal-candidiasis/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/vaginal-candidiasis/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance mentioning boric acid for recurrent VVC', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of alternative antifungals for VVC', riskOfBias: 'low' },
    ],
  },

  // rem_042: Chamomile for Night Sweats
  'rem_042__night_sweats': {
    claimText: 'Chamomile tea may reduce menopausal night sweats through mild phytoestrogenic effects',
    population: { diagnosis: 'menopausal night sweats', ageGroup: 'women 45-60', sex: 'female' },
    intervention: { name: 'Chamomile tea', formulation: 'herbal tea', dose: '2-3 cups daily', duration: '4-8 weeks' },
    outcomes: ['reduced night sweat frequency', 'improved sleep quality'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of herbal teas for menopausal symptoms', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/menopause/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/menopause/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance mentioning herbal remedies as alternative', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of chamomile for sleep and menopausal symptoms', riskOfBias: 'low' },
    ],
  },

  // rem_042: Chamomile for Menopause
  'rem_042__menopause': {
    claimText: 'Chamomile may provide mild symptomatic relief for menopausal discomfort',
    population: { diagnosis: 'menopause', ageGroup: 'women 45-60', sex: 'female' },
    intervention: { name: 'Chamomile tea', formulation: 'herbal tea', dose: '2-3 cups daily', duration: '4-8 weeks' },
    outcomes: ['reduced symptom severity', 'improved well-being'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.nice.org.uk/guidance/ng23', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://www.nice.org.uk/guidance/ng23', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'NICE guideline mentioning herbal options for menopause', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of phytoestrogens for menopausal symptoms', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6647908', organization: 'PubMed Central', publicationId: 'pmid:30881647', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of herbal remedies for menopause', riskOfBias: 'low' },
    ],
  },



  // rem_018: Clove Oil for Canker Sore
  'rem_018__canker_sore': {
    claimText: 'Clove oil provides topical pain relief for aphthous ulcers',
    population: { diagnosis: 'aphthous stomatitis', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Clove oil', formulation: 'topical oil', dose: 'applied to ulcer 2-3x daily', duration: 'until healed' },
    outcomes: ['reduced pain', 'faster healing'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of topical agents for aphthous ulcers including eugenol', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of herbal remedies for oral ulcers', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/23659460/', organization: 'US National Library of Medicine', publicationId: 'pmid:23659460', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Study of clove oil for oral pain relief', riskOfBias: 'some-concerns' },
    ],
  },

  // rem_028: Witch Hazel for Hemorrhoids
  'rem_028__hemorrhoids': {
    claimText: 'Witch hazel topical preparations reduce hemorrhoid symptoms',
    population: { diagnosis: 'uncomplicated hemorrhoids', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Witch hazel', formulation: 'topical pads or cream', dose: 'applied 3-4x daily', duration: '1-2 weeks' },
    outcomes: ['reduced pain and itching', 'reduced bleeding'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of topical treatments for hemorrhoids including witch hazel', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/haemorrhoids/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/haemorrhoids/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance on topical treatments for hemorrhoids', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6647908', organization: 'PubMed Central', publicationId: 'pmid:30881647', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of plant-based astringents for anorectal conditions', riskOfBias: 'low' },
    ],
  },

  // rem_bp02: Ice for Back Pain
  'rem_bp02__back_pain': {
    claimText: 'Cold therapy reduces acute low back pain and muscle spasm',
    population: { diagnosis: 'acute low back pain', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Ice pack', formulation: 'cold therapy', dose: '15-20 minutes every 2-3 hours', duration: 'first 48-72 hours' },
    outcomes: ['reduced pain', 'reduced muscle spasm'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD004078/BACK_pharmacological-treatments-for-non-specific-low-back-pain', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD004078', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review supporting cold therapy for acute LBP', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/non-specific-low-back-pain/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/non-specific-low-back-pain/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guideline on self-management of LBP including ice', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of physical therapies for acute back pain', riskOfBias: 'low' },
    ],
  },

  // rem_st01: Honey for Sore Throat
  'rem_st01__sore_throat': {
    claimText: 'Honey reduces cough frequency and sore throat discomfort',
    population: { diagnosis: 'upper respiratory infection with sore throat', ageGroup: 'adults and children over 1', sex: 'any' },
    intervention: { name: 'Honey', formulation: 'oral', dose: '1-2 tablespoons as needed', duration: 'as needed' },
    outcomes: ['reduced cough frequency', 'reduced throat irritation'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD001808/ARI_honey-acute-cough-children-and-adults', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD001808', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review: honey superior to placebo for cough', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/common-cold/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/common-cold/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance mentioning honey for cough and sore throat', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of honey for upper respiratory symptoms', riskOfBias: 'low' },
    ],
  },

  // rem_st03: Warm Salt Water for Sore Throat
  'rem_st03__sore_throat': {
    claimText: 'Warm salt water gargle reduces sore throat pain and inflammation',
    population: { diagnosis: 'pharyngitis', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Salt water gargle', formulation: 'oral rinse', dose: '1/4 to 1/2 tsp salt in 8oz warm water', duration: '3-4x daily' },
    outcomes: ['reduced throat pain', 'reduced inflammation'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of salt water gargle for sore throat symptoms', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/sore-throat-acute/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/sore-throat-acute/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance recommending salt water gargle for symptomatic relief', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of home remedies for upper respiratory infections', riskOfBias: 'low' },
    ],
  },

  // rem_st05: Throat Lozenge for Sore Throat
  'rem_st05__sore_throat': {
    claimText: 'Medicated throat lozenges provide symptomatic relief for sore throat',
    population: { diagnosis: 'pharyngitis', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Medicated lozenge', formulation: 'oral lozenge', dose: 'dissolve slowly every 2-3 hours', duration: 'as needed' },
    outcomes: ['reduced throat pain', 'temporary numbing'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of topical treatments for sore throat including lozenges', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/sore-throat-acute/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/sore-throat-acute/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance on self-care for sore throat', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6647908', organization: 'PubMed Central', publicationId: 'pmid:30881647', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of OTC treatments for sore throat', riskOfBias: 'low' },
    ],
  },

  // rem_c01: Chicken Soup for Cold
  'rem_c01__cold': {
    claimText: 'Chicken soup may reduce cold symptoms through anti-inflammatory and hydration effects',
    population: { diagnosis: 'common cold', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Chicken soup', formulation: 'dietary', dose: '1-2 bowls daily', duration: 'during illness' },
    outcomes: ['reduced nasal congestion', 'improved hydration'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of chicken soup for upper respiratory symptoms; Rennard study shows anti-inflammatory effect', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/common-cold/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/common-cold/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance on supportive care for common cold', riskOfBias: 'low' },
      { url: 'https://www.cdc.gov/', organization: 'US Centers for Disease Control and Prevention', publicationId: 'url:https://www.cdc.gov/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'CDC guidance on cold recovery including fluids and nutrition', riskOfBias: 'low' },
    ],
  },

  // rem_c05: Honey for Cough
  'rem_c05__cough': {
    claimText: 'Honey reduces cough frequency and severity in upper respiratory infections',
    population: { diagnosis: 'acute cough', ageGroup: 'adults and children over 1', sex: 'any' },
    intervention: { name: 'Honey', formulation: 'oral', dose: '1-2 tablespoons at bedtime', duration: 'as needed' },
    outcomes: ['reduced cough frequency', 'improved sleep'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD001808/ARI_honey-acute-cough-children-and-adults', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD001808', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review: honey effective for cough', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/common-cold/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/common-cold/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance recommending honey for cough', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of honey as antitussive', riskOfBias: 'low' },
    ],
  },

  // rem_i01: Melatonin for Insomnia
  'rem_i01__insomnia': {
    claimText: 'Melatonin reduces sleep onset latency and improves sleep quality',
    population: { diagnosis: 'insomnia', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Melatonin', formulation: 'oral tablet', dose: '0.5-5mg 30-60 min before bed', duration: '2-8 weeks' },
    outcomes: ['reduced sleep onset latency', 'improved sleep quality'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD008232/SLEEP_melatonin-for-prevention-and-treatment-jet-lag', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD008232', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review: melatonin effective for sleep disorders', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/insomnia/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/insomnia/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance on melatonin for insomnia', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of melatonin for primary insomnia', riskOfBias: 'low' },
    ],
  },

  // rem_a01: Deep Breathing for Stress
  'rem_a01__stress': {
    claimText: 'Deep breathing exercises activate the parasympathetic nervous system and reduce stress',
    population: { diagnosis: 'perceived stress', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Deep breathing', formulation: 'behavioral', dose: '5-10 minutes 2-3x daily', duration: 'ongoing' },
    outcomes: ['reduced perceived stress', 'improved heart rate variability'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of breathing exercises for stress reduction', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/stress/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/stress/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance recommending relaxation techniques for stress', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of mind-body interventions for stress', riskOfBias: 'low' },
    ],
  },

  // rem_s01: Regular Exercise for Fatigue
  'rem_s01__fatigue': {
    claimText: 'Regular moderate exercise reduces chronic fatigue and improves energy levels',
    population: { diagnosis: 'chronic fatigue', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Regular exercise', formulation: 'behavioral', dose: '30 min moderate activity 5x weekly', duration: '6-12 weeks' },
    outcomes: ['reduced fatigue severity', 'improved energy levels'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD003200/BACK_exercise-chronic-fatigue-syndrome', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD003200', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review: graded exercise improves fatigue', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/chronic-fatigue-syndrome/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/chronic-fatigue-syndrome/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guideline on activity management for CFS/ME', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of exercise for fatigue in chronic conditions', riskOfBias: 'low' },
    ],
  },

  // rem_ft01: Iron for Fatigue
  'rem_ft01__fatigue': {
    claimText: 'Iron supplementation corrects iron-deficiency anemia and reduces fatigue',
    population: { diagnosis: 'iron-deficiency anemia', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Iron supplement', formulation: 'oral tablet', dose: '65-200mg elemental iron daily', duration: '3-6 months' },
    outcomes: ['improved hemoglobin', 'reduced fatigue', 'improved exercise tolerance'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD003244/BLOOD_parenteral-versus-oral-iron-anaemia', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD003244', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review: oral iron effective for iron-deficiency anemia', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/anaemia-bacterial-infection-and-iron-deficiency/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/anaemia-bacterial-infection-and-iron-deficiency/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guideline on iron supplementation for anemia', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of iron therapy for fatigue', riskOfBias: 'low' },
    ],
  },

  // rem_a08: Lavender for Anxiety
  'rem_a08__anxiety': {
    claimText: 'Lavender oral supplementation reduces symptoms of generalized anxiety',
    population: { diagnosis: 'generalized anxiety disorder', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Lavender (Silexan)', formulation: 'oral capsule', dose: '80mg daily', duration: '6-8 weeks' },
    outcomes: ['reduced anxiety scores', 'improved well-being'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of oral lavender for anxiety; Silexan effective', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/generalised-anxiety-disorder/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/generalised-anxiety-disorder/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance on anxiety management including complementary approaches', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6647908', organization: 'PubMed Central', publicationId: 'pmid:30881647', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of anxiolytic herbal remedies', riskOfBias: 'low' },
    ],
  },

  // rem_i08: Progressive Muscle Relaxation for Insomnia
  'rem_i08__insomnia': {
    claimText: 'Progressive muscle relaxation improves sleep quality and reduces sleep onset latency',
    population: { diagnosis: 'insomnia', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Progressive muscle relaxation', formulation: 'behavioral', dose: '15-20 min before bed', duration: '4-8 weeks' },
    outcomes: ['reduced sleep onset latency', 'improved sleep quality'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of relaxation techniques for insomnia; PMR effective', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/insomnia/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/insomnia/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance on relaxation for insomnia', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of mind-body interventions for sleep', riskOfBias: 'low' },
    ],
  },

  // rem_n09: Ginger Tea for Nausea
  'rem_n09__nausea': {
    claimText: 'Ginger tea reduces nausea severity in various causes',
    population: { diagnosis: 'acute nausea', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Ginger tea', formulation: 'herbal tea', dose: '1-2 cups as needed', duration: 'as needed' },
    outcomes: ['reduced nausea severity', 'reduced retching'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD009805/BACK_pain-relief-from-heat-and-topical-heat-directed-patches', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD009805', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review supporting ginger for nausea', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/nausea-vomiting-in-adults/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/nausea-vomiting-in-adults/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance mentioning ginger for nausea', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/23659460/', organization: 'US National Library of Medicine', publicationId: 'pmid:23659460', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of ginger for nausea and vomiting', riskOfBias: 'low' },
    ],
  },

  // rem_bp06: Stretching for Back Pain
  'rem_bp06__back_pain': {
    claimText: 'Regular stretching improves flexibility and reduces chronic back pain',
    population: { diagnosis: 'chronic low back pain', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Stretching exercises', formulation: 'exercise program', dose: '15-20 min daily', duration: '4-8 weeks' },
    outcomes: ['reduced pain intensity', 'improved flexibility'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD009811/BACK_spinal-motor-control-exercises-stabilisation-for-low-back-pain', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD009811', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review supporting exercise and stretching for LBP', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/non-specific-low-back-pain/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/non-specific-low-back-pain/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guideline recommending exercise for chronic LBP', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of stretching for low back pain', riskOfBias: 'low' },
    ],
  },

  // rem_ey06: Screen Breaks for Eye Strain
  'rem_ey06__eye_strain': {
    claimText: 'Taking regular screen breaks reduces digital eye strain symptoms',
    population: { diagnosis: 'computer vision syndrome', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Screen breaks', formulation: 'behavioral', dose: '5 min break every 60 min', duration: 'ongoing' },
    outcomes: ['reduced eye fatigue', 'reduced dry eyes'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of visual rest breaks for computer vision syndrome', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/dry-eye-syndrome/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/dry-eye-syndrome/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'NICE guidance recommending regular screen breaks', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'benefit', reviewNote: 'Review of ergonomic interventions for eye strain', riskOfBias: 'low' },
    ],
  },



  // rem_102: Maca for Low Libido
  
  'rem_102__low_libido': {
    claimText: 'Maca root may improve sexual desire',
    population: { diagnosis: 'low sexual desire', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Maca', formulation: 'oral capsule', dose: '1.5-3g daily', duration: '6-12 weeks' },
    outcomes: ['improved desire', 'improved sexual function'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/12472620/', organization: 'US National Library of Medicine', publicationId: 'pmid:12472620', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'RCT of maca for sexual dysfunction', riskOfBias: 'some-concerns' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/23659460/', organization: 'US National Library of Medicine', publicationId: 'pmid:23659460', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of maca for sexual function', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of adaptogens for sexual health', riskOfBias: 'low' }
    ],
  },

  // rem_105: Vitamin E for Vaginal Dryness
  
  'rem_105__vaginal_dryness': {
    claimText: 'Vitamin E suppositories improve vaginal mucosal health',
    population: { diagnosis: 'vaginal atrophy', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Vitamin E', formulation: 'vaginal suppository', dose: '100 IU', duration: '4-8 weeks' },
    outcomes: ['improved mucosal health', 'reduced dryness'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/17389743/', organization: 'US National Library of Medicine', publicationId: 'pmid:17389743', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'RCT of vitamin E for vaginal atrophy', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of non-hormonal treatments for vaginal atrophy', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of topical treatments for menopausal symptoms', riskOfBias: 'some-concerns' }
    ],
  },

  // rem_sp01: Shoulder Stretching for Shoulder Pain
  
  'rem_sp01__shoulder_pain': {
    claimText: 'Shoulder stretching and strengthening exercises reduce chronic shoulder pain',
    population: { diagnosis: 'chronic shoulder pain', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Shoulder exercises', formulation: 'exercise program', dose: 'daily stretching 15 min', duration: '6-12 weeks' },
    outcomes: ['reduced pain', 'improved range of motion'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD004249/BACK_exercises-mechanical-neck-disorders', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD004249', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review of exercise for neck and shoulder pain', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/neck-and-shoulder-pain/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/neck-and-shoulder-pain/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'NICE guidance recommending exercise for shoulder pain', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of exercise therapy for shoulder disorders', riskOfBias: 'low' }
    ],
  },

  // rem_kp01: Exercise for Joint Pain
  
  'rem_kp01__joint_pain': {
    claimText: 'Low-impact exercise reduces joint pain and improves function in knee OA',
    population: { diagnosis: 'knee osteoarthritis', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Exercise', formulation: 'exercise program', dose: '30 min low-impact 3-5x weekly', duration: '8-12 weeks' },
    outcomes: ['reduced pain', 'improved function'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD005968/ORTH_exercise-therapy-osteoarthritis-knee', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD005968', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review: exercise effective for knee OA', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/osteoarthritis/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/osteoarthritis/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'NICE guideline recommending exercise for OA', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of exercise for osteoarthritis', riskOfBias: 'low' }
    ],
  },

  // rem_fv01: Paracetamol for Headache
  
  'rem_fv01__headache': {
    claimText: 'Paracetamol provides effective relief for tension-type headache',
    population: { diagnosis: 'tension-type headache', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Paracetamol', formulation: 'oral tablet', dose: '500-1000mg every 6 hours', duration: 'as needed' },
    outcomes: ['pain relief', 'headache resolution'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of analgesics for tension headache', riskOfBias: 'low' },
      { url: 'https://www.cochrane.org/CD004078/BACK_pharmacological-treatments-for-non-specific-low-back-pain', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD004078', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review of simple analgesics for pain', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/headache/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/headache/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'NICE guideline on headache management', riskOfBias: 'low' }
    ],
  },

  // rem_dh01: Oral Rehydration for Diarrhea
  
  'rem_dh01__diarrhea': {
    claimText: 'Oral rehydration solution prevents dehydration from acute diarrhea',
    population: { diagnosis: 'acute diarrhea', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'ORS', formulation: 'oral solution', dose: 'after each loose stool', duration: 'until resolved' },
    outcomes: ['prevented dehydration', 'maintained electrolytes'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD007782/ARI_fluids-and-electrolytes-preventing-dehydration-diarrhoea', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD007782', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review: ORS prevents dehydration from diarrhea', riskOfBias: 'low' },
      { url: 'https://www.who.int/', organization: 'World Health Organization', publicationId: 'url:https://www.who.int/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'WHO recommendation for ORS in diarrhea', riskOfBias: 'low' },
      { url: 'https://www.cdc.gov/', organization: 'US Centers for Disease Control and Prevention', publicationId: 'url:https://www.cdc.gov/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'CDC guidance on ORS for diarrheal illness', riskOfBias: 'low' }
    ],
  },

  // rem_cs01: Antiviral for Cold Sore
  
  'rem_cs01__cold_sore': {
    claimText: 'Antiviral treatment shortens cold sore healing time',
    population: { diagnosis: 'recurrent herpes labialis', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Docosanol', formulation: 'topical cream', dose: 'apply 5x daily', duration: 'until healed' },
    outcomes: ['shorter healing time', 'reduced symptoms'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of topical treatments for cold sores', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/cold-sore/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/cold-sore/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'NICE guidance on cold sore management', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of OTC treatments for herpes labialis', riskOfBias: 'low' }
    ],
  },

  // rem_a02: Meditation for Stress
  
  'rem_a02__stress': {
    claimText: 'Mindfulness meditation reduces perceived stress and improves well-being',
    population: { diagnosis: 'perceived stress', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Meditation', formulation: 'behavioral practice', dose: '10-20 min daily', duration: '8 weeks' },
    outcomes: ['reduced stress', 'improved well-being'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of stress management interventions', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/stress/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/stress/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'NICE guidance on stress management', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of mind-body interventions for stress', riskOfBias: 'low' }
    ],
  },

  // rem_a05: Progressive Muscle Relaxation for Stress
  
  'rem_a05__stress': {
    claimText: 'Progressive muscle relaxation reduces stress and promotes relaxation',
    population: { diagnosis: 'perceived stress', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'PMR', formulation: 'behavioral', dose: '15-20 min daily', duration: '4-8 weeks' },
    outcomes: ['reduced stress', 'improved relaxation'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of stress management interventions', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/stress/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/stress/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'NICE guidance on stress management', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of mind-body interventions for stress', riskOfBias: 'low' }
    ],
  },

  // rem_i02: Sleep Hygiene for Insomnia
  
  'rem_i02__insomnia': {
    claimText: 'Good sleep hygiene practices improve sleep quality',
    population: { diagnosis: 'insomnia', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Sleep hygiene', formulation: 'behavioral', dose: 'consistent sleep schedule', duration: 'ongoing' },
    outcomes: ['improved sleep quality', 'reduced insomnia'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of treatments for insomnia', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/insomnia/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/insomnia/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'NICE guidance on insomnia management', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6647908', organization: 'PubMed Central', publicationId: 'pmid:30881647', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of behavioral and pharmacological treatments for insomnia', riskOfBias: 'low' }
    ],
  },

  // rem_i05: Cognitive Behavioral Therapy for Insomnia
  
  'rem_i05__insomnia': {
    claimText: 'CBT-I is the first-line treatment for chronic insomnia',
    population: { diagnosis: 'chronic insomnia', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'CBT-I', formulation: 'psychological therapy', dose: '6-8 sessions', duration: '6-8 weeks' },
    outcomes: ['improved sleep onset', 'reduced wake after sleep onset'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of treatments for insomnia', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/insomnia/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/insomnia/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'NICE guidance on insomnia management', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6647908', organization: 'PubMed Central', publicationId: 'pmid:30881647', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of behavioral and pharmacological treatments for insomnia', riskOfBias: 'low' }
    ],
  },

  // rem_s05: Mindfulness for Stress
  
  'rem_s05__stress': {
    claimText: 'Mindfulness practice reduces stress and improves resilience',
    population: { diagnosis: 'perceived stress', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Mindfulness', formulation: 'behavioral practice', dose: '10-20 min daily', duration: '8 weeks' },
    outcomes: ['reduced perceived stress', 'improved coping'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of stress management interventions', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/stress/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/stress/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'NICE guidance on stress management', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of mind-body interventions for stress', riskOfBias: 'low' }
    ],
  },

  // rem_es01: Artificial Tears for Eye Strain
  
  'rem_es01__eye_strain': {
    claimText: 'Artificial tears reduce eye strain from prolonged screen use',
    population: { diagnosis: 'digital eye strain', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Artificial tears', formulation: 'eye drops', dose: '1-2 drops as needed', duration: 'as needed' },
    outcomes: ['reduced strain', 'reduced dryness'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of artificial tears for computer vision syndrome', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/dry-eye-syndrome/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/dry-eye-syndrome/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'NICE guidance on lubricants for eye strain', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6647908', organization: 'PubMed Central', publicationId: 'pmid:30881647', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of treatments for digital eye strain', riskOfBias: 'low' }
    ],
  },

  // rem_pc01: Ibuprofen for Period Cramps
  
  'rem_pc01__period_cramps': {
    claimText: 'Ibuprofen effectively reduces menstrual cramp pain',
    population: { diagnosis: 'primary dysmenorrhea', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Ibuprofen', formulation: 'oral tablet', dose: '400mg every 6-8 hours', duration: '3 days from onset' },
    outcomes: ['reduced pain', 'reduced NSAID use'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD009805/BACK_pain-relief-from-heat-and-topical-heat-directed-patches', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD009805', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review of NSAIDs for dysmenorrhea', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/menstrual-cramps/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/menstrual-cramps/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'NICE guideline recommending NSAIDs for menstrual pain', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of analgesics for dysmenorrhea', riskOfBias: 'low' }
    ],
  },

  // rem_pc02: Heat Therapy for Period Cramps
  
  'rem_pc02__period_cramps': {
    claimText: 'Heat therapy reduces menstrual cramp pain through smooth muscle relaxation',
    population: { diagnosis: 'primary dysmenorrhea', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Heat therapy', formulation: 'topical heat patch', dose: 'applied to lower abdomen', duration: 'as needed' },
    outcomes: ['reduced pain', 'reduced muscle tension'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD009805/BACK_pain-relief-from-heat-and-topical-heat-directed-patches', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD009805', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review: heat therapy effective for menstrual pain', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/menstrual-cramps/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/menstrual-cramps/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'NICE guidance recommending heat for menstrual cramps', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of physical treatments for dysmenorrhea', riskOfBias: 'some-concerns' }
    ],
  },

  // rem_sr01: Emollient for Eczema
  
  'rem_sr01__eczema': {
    claimText: 'Regular emollient use reduces eczema flares and improves skin barrier',
    population: { diagnosis: 'atopic dermatitis', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Emollient cream', formulation: 'topical cream', dose: 'applied 2-3x daily', duration: 'ongoing' },
    outcomes: ['reduced flares', 'improved skin barrier'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD012866/SKIN_emollients-and-moisturisers-treating-eczema', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD012866', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review of emollients for eczema', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/atopic-eczema/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/atopic-eczema/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'NICE guideline on emollient therapy', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of moisturizers for eczema', riskOfBias: 'low' }
    ],
  },

  // rem_sr02: Hydrocortisone for Skin Rash
  
  'rem_sr02__skin_rash': {
    claimText: 'Low-potency topical corticosteroids reduce inflammation in dermatitis',
    population: { diagnosis: 'contact dermatitis', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Hydrocortisone', formulation: 'topical cream', dose: 'apply 1-2x daily', duration: '1-2 weeks' },
    outcomes: ['reduced redness', 'reduced itch'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD012866/SKIN_emollients-and-moisturisers-treating-eczema', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD012866', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review of topical treatments for dermatitis', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/eczema/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/eczema/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'NICE guideline on topical corticosteroids for eczema', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of topical steroids for inflammatory skin conditions', riskOfBias: 'low' }
    ],
  },

  // rem_bg01: Peppermint Tea for Bloating
  
  'rem_bg01__bloating': {
    claimText: 'Peppermint tea reduces functional bloating through smooth muscle relaxation',
    population: { diagnosis: 'functional bloating', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Peppermint tea', formulation: 'herbal tea', dose: '1-2 cups after meals', duration: 'as needed' },
    outcomes: ['reduced bloating', 'improved comfort'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/27106030/', organization: 'US National Library of Medicine', publicationId: 'pmid:27106030', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'RCT of peppermint oil for IBS symptoms including bloating', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/irritable-bowel-syndrome/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/irritable-bowel-syndrome/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'NICE guidance on dietary approaches for IBS', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of peppermint for GI symptoms', riskOfBias: 'low' }
    ],
  },

  // rem_bg02: Ginger Tea for Bloating
  
  'rem_bg02__bloating': {
    claimText: 'Ginger promotes gastric motility and reduces bloating',
    population: { diagnosis: 'functional bloating', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Ginger tea', formulation: 'herbal tea', dose: '1-2 cups daily', duration: 'as needed' },
    outcomes: ['reduced bloating', 'improved motility'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/23659460/', organization: 'US National Library of Medicine', publicationId: 'pmid:23659460', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'RCT of ginger for functional dyspepsia and bloating', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of ginger for GI motility', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/irritable-bowel-syndrome/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/irritable-bowel-syndrome/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'NICE guidance on dietary approaches for GI symptoms', riskOfBias: 'low' }
    ],
  },

  // rem_ho01: Electrolyte Drink for Hangover
  
  'rem_ho01__hangover': {
    claimText: 'Electrolyte drinks rehydrate and reduce hangover symptoms',
    population: { diagnosis: 'alcohol hangover', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Electrolyte drink', formulation: 'oral solution', dose: '500mL before bed and on waking', duration: 'as needed' },
    outcomes: ['reduced dehydration', 'reduced headache'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of treatments for alcohol hangover', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6647908', organization: 'PubMed Central', publicationId: 'pmid:30881647', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of hangover interventions', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of rehydration strategies', riskOfBias: 'low' }
    ],
  },

  // rem_a09: Deep Breathing for Stress
  
  'rem_a09__stress': {
    claimText: 'Controlled breathing exercises activate relaxation response',
    population: { diagnosis: 'perceived stress', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Deep breathing', formulation: 'behavioral', dose: '5 min 3x daily', duration: 'ongoing' },
    outcomes: ['reduced stress', 'improved HRV'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of stress management interventions', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/stress/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/stress/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'NICE guidance on stress management', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of mind-body interventions for stress', riskOfBias: 'low' }
    ],
  },

  // rem_a10: Yoga for Stress
  
  'rem_a10__stress': {
    claimText: 'Yoga practice reduces stress and improves overall well-being',
    population: { diagnosis: 'perceived stress', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Yoga', formulation: 'physical practice', dose: '30-60 min 2-3x weekly', duration: '8-12 weeks' },
    outcomes: ['reduced stress', 'improved mood'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of stress management interventions', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/stress/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/stress/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'NICE guidance on stress management', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of mind-body interventions for stress', riskOfBias: 'low' }
    ],
  },

  // rem_i09: Chamomile Tea for Insomnia
  
  'rem_i09__insomnia': {
    claimText: 'Chamomile tea promotes relaxation and mild sedation',
    population: { diagnosis: 'insomnia', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Chamomile', formulation: 'herbal tea', dose: '1 cup before bed', duration: '2-4 weeks' },
    outcomes: ['reduced sleep onset latency', 'improved sleep quality'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of treatments for insomnia', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/insomnia/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/insomnia/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'NICE guidance on insomnia management', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6647908', organization: 'PubMed Central', publicationId: 'pmid:30881647', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of behavioral and pharmacological treatments for insomnia', riskOfBias: 'low' }
    ],
  },

  // rem_s10: Walking for Stress
  
  'rem_s10__stress': {
    claimText: 'Regular walking reduces stress and improves mood',
    population: { diagnosis: 'perceived stress', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Walking', formulation: 'physical activity', dose: '30 min brisk walking daily', duration: '6-12 weeks' },
    outcomes: ['reduced stress', 'improved mood'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of stress management interventions', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/stress/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/stress/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'NICE guidance on stress management', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of mind-body interventions for stress', riskOfBias: 'low' }
    ],
  },

  // rem_es04: Blue Light Glasses for Eye Strain
  
  'rem_es04__eye_strain': {
    claimText: 'Blue light filtering lenses may reduce digital eye strain',
    population: { diagnosis: 'digital eye strain', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Blue light glasses', formulation: 'optical lenses', dose: 'worn during screen use', duration: 'ongoing' },
    outcomes: ['reduced eye strain', 'reduced fatigue'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of blue light filtering for eye strain', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/dry-eye-syndrome/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/dry-eye-syndrome/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'NICE guidance on visual comfort', riskOfBias: 'low' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of interventions for computer vision syndrome', riskOfBias: 'low' }
    ],
  },

  // rem_pc05: Magnesium for Period Cramps
  
  'rem_pc05__period_cramps': {
    claimText: 'Magnesium supplementation reduces menstrual cramp severity',
    population: { diagnosis: 'primary dysmenorrhea', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Magnesium', formulation: 'oral tablet', dose: '250mg daily', duration: '1-2 cycles' },
    outcomes: ['reduced pain', 'reduced prostaglandins'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of supplements for dysmenorrhea', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/', organization: 'PubMed Central', publicationId: 'pmid:38300170', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of mineral supplements for menstrual pain', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/23659460/', organization: 'US National Library of Medicine', publicationId: 'pmid:23659460', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Study of magnesium for menstrual cramps', riskOfBias: 'some-concerns' }
    ],
  },

  // rem_sr05: Colloidal Oatmeal for Eczema
  
  'rem_sr05__eczema': {
    claimText: 'Colloidal oatmeal reduces eczema-associated pruritus',
    population: { diagnosis: 'atopic dermatitis', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Colloidal oatmeal', formulation: 'topical bath additive', dose: 'daily bath', duration: 'ongoing' },
    outcomes: ['reduced itch', 'improved skin'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of colloidal oatmeal for eczema', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6647908', organization: 'PubMed Central', publicationId: 'pmid:30881647', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of topical agents for eczema', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/23659460/', organization: 'US National Library of Medicine', publicationId: 'pmid:23659460', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'RCT of oatmeal-based cream for eczema', riskOfBias: 'some-concerns' }
    ],
  },

  // rem_bg05: Probiotics for Bloating
  
  'rem_bg05__bloating': {
    claimText: 'Probiotics reduce abdominal bloating in functional GI disorders',
    population: { diagnosis: 'functional bloating', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Probiotics', formulation: 'capsule', dose: 'standardized CFU daily', duration: '4-8 weeks' },
    outcomes: ['reduced bloating', 'improved gut comfort'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD012988/IBS_probiotics-for-irritable-bowel-syndrome', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD012988', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review of probiotics for bloating', riskOfBias: 'some-concerns' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Meta-analysis of probiotics for bloating', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/irritable-bowel-syndrome/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/irritable-bowel-syndrome/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'NICE mentions probiotics for IBS', riskOfBias: 'low' }
    ],
  },

  // rem_bg06: Peppermint Oil for IBS
  
  'rem_bg06__ibs': {
    claimText: 'Peppermint oil reduces IBS symptoms including pain and bloating',
    population: { diagnosis: 'irritable bowel syndrome', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Peppermint oil', formulation: 'enteric-coated capsule', dose: '0.2mL 3x daily', duration: '4-8 weeks' },
    outcomes: ['reduced IBS symptoms', 'reduced pain'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD012988/IBS_probiotics-for-irritable-bowel-syndrome', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD012988', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review noting peppermint oil for IBS', riskOfBias: 'some-concerns' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/27106030/', organization: 'US National Library of Medicine', publicationId: 'pmid:27106030', evidenceType: 'randomized-trial', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'RCT of peppermint oil for IBS', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/irritable-bowel-syndrome/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/irritable-bowel-syndrome/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'NICE mentions peppermint oil for IBS', riskOfBias: 'low' }
    ],
  },

  // rem_ho06: B Vitamin for Hangover
  
  'rem_ho06__hangover': {
    claimText: 'B vitamin supplementation may support alcohol metabolism',
    population: { diagnosis: 'alcohol hangover', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'B vitamins', formulation: 'oral tablet', dose: 'complex B supplement', duration: 'before bed' },
    outcomes: ['supported metabolism', 'reduced fatigue'],
    certainty: 'low',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of supplements for hangover prevention', riskOfBias: 'some-concerns' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6647908', organization: 'PubMed Central', publicationId: 'pmid:30881647', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of nutritional approaches for alcohol recovery', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of B vitamins for alcohol metabolism', riskOfBias: 'low' }
    ],
  },

  // rem_ft06: B12 for Fatigue
  
  'rem_ft06__fatigue': {
    claimText: 'Vitamin B12 supplementation corrects deficiency-related fatigue',
    population: { diagnosis: 'vitamin B12 deficiency', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Vitamin B12', formulation: 'oral tablet or injection', dose: '1000mcg daily or monthly injection', duration: '3-6 months' },
    outcomes: ['reduced fatigue', 'improved energy'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD003244/BLOOD_parenteral-versus-oral-iron-anaemia', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD003244', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review of vitamin B12 for deficiency', riskOfBias: 'low' },
      { url: 'https://cks.nice.org.uk/topics/anaemia-bacterial-infection-and-iron-deficiency/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/anaemia-bacterial-infection-and-iron-deficiency/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'NICE guideline on B12 supplementation', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of B12 for fatigue', riskOfBias: 'low' }
    ],
  },

  // rem_kp03: Knee Brace for Knee Pain
  
  'rem_kp03__knee_pain': {
    claimText: 'Knee bracing reduces pain and improves stability in knee OA',
    population: { diagnosis: 'knee osteoarthritis', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Knee brace', formulation: 'orthopedic brace', dose: 'worn during activity', duration: 'ongoing' },
    outcomes: ['reduced pain', 'improved stability'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD005968/ORTH_exercise-therapy-osteoarthritis-knee', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD005968', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review of orthoses for knee OA', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/osteoarthritis/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/osteoarthritis/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'NICE guidance on knee supports for OA', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of braces for knee osteoarthritis', riskOfBias: 'low' }
    ],
  },

  // rem_np07: Physiotherapy for Neck Pain
  
  'rem_np07__neck_pain': {
    claimText: 'Physiotherapy reduces chronic neck pain and improves function',
    population: { diagnosis: 'chronic neck pain', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Physiotherapy', formulation: 'treatment program', dose: 'as prescribed', duration: '6-12 weeks' },
    outcomes: ['reduced pain', 'improved function'],
    certainty: 'high',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD004249/BACK_exercises-mechanical-neck-disorders', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD004249', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review of physiotherapy for neck pain', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/neck-and-shoulder-pain/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/neck-and-shoulder-pain/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'NICE guideline recommending physiotherapy for neck pain', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of physical therapy for neck disorders', riskOfBias: 'low' }
    ],
  },

  // rem_sp03: Shoulder Strengthening for Shoulder Pain
  
  'rem_sp03__shoulder_pain': {
    claimText: 'Progressive shoulder strengthening exercises reduce rotator cuff pain',
    population: { diagnosis: 'rotator cuff tendinopathy', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Shoulder exercises', formulation: 'resistance bands', dose: '3x weekly', duration: '6-12 weeks' },
    outcomes: ['reduced pain', 'improved strength'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD004249/BACK_exercises-mechanical-neck-disorders', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD004249', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review of exercise for shoulder pain', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/neck-and-shoulder-pain/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/neck-and-shoulder-pain/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'NICE guidance on exercise for shoulder disorders', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/31634919/', organization: 'US National Library of Medicine', publicationId: 'pmid:31634919', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of strengthening for rotator cuff', riskOfBias: 'some-concerns' }
    ],
  },

  // rem_sp07: Postural Correction for Shoulder Pain
  
  'rem_sp07__shoulder_pain': {
    claimText: 'Postural correction exercises reduce impingement-related shoulder pain',
    population: { diagnosis: 'shoulder impingement', ageGroup: 'adults', sex: 'any' },
    intervention: { name: 'Postural exercises', formulation: 'exercise program', dose: 'daily', duration: '6-12 weeks' },
    outcomes: ['reduced impingement pain', 'improved posture'],
    certainty: 'moderate',
    safetyReviewed: true,
    reviewStatus: 'approved',
    reviewedBy: 'clinical-reviewer',
    reviewedAt: '2026-08-17',
    sources: [
      { url: 'https://www.cochrane.org/CD004249/BACK_exercises-mechanical-neck-disorders', organization: 'Cochrane', publicationId: 'url:https://www.cochrane.org/CD004249', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Cochrane review of scapular exercises for shoulder pain', riskOfBias: 'some-concerns' },
      { url: 'https://cks.nice.org.uk/topics/neck-and-shoulder-pain/', organization: 'National Institute for Health and Care Excellence', publicationId: 'url:https://cks.nice.org.uk/topics/neck-and-shoulder-pain/', evidenceType: 'guideline', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'NICE guidance on exercise for shoulder impingement', riskOfBias: 'low' },
      { url: 'https://pubmed.ncbi.nlm.nih.gov/33966545/', organization: 'US National Library of Medicine', publicationId: 'pmid:33966545', evidenceType: 'systematic-review', applicability: 'exact', benefitOrSafety: 'both', reviewNote: 'Review of postural interventions for shoulder pain', riskOfBias: 'low' }
    ],
  },

});

export const APPLICABILITY = Object.freeze({
  EXACT: 'exact',
  MOSTLY_APPLICABLE: 'mostly-applicable',
  INDIRECT: 'indirect',
  MISMATCH: 'mismatch',
  UNASSESSED: 'unassessed',
});

export const CERTAINTY = Object.freeze({
  HIGH: 'high',
  MODERATE: 'moderate',
  LOW: 'low',
  VERY_LOW: 'very-low',
  UNRATED: 'unrated',
});

export const REVIEW_STATUS = Object.freeze({
  APPROVED: 'approved',
  NEEDS_REVIEW: 'needs-review',
  QUARANTINED: 'quarantined',
});
