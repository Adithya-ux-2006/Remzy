const ADDITIONAL_EVIDENCE = {
  // HEADACHE
  rem_001: [
    { label: 'Essential Oils for Migraine – Systematic Review', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10822728/' },
  ],
  rem_h04: [
    { label: 'Cochrane: Ibuprofen for acute pain', url: 'https://www.cochrane.org/evidence/CD001548_ibuprofen-treating-acute-pain-adults' },
  ],
  rem_004: [
    { label: 'NICE: Headache – self-care', url: 'https://cks.nice.org.uk/topics/headache-self-care/' },
  ],
  rem_005: [
    { label: 'Cochrane: Feverfew for migraine prevention', url: 'https://www.cochrane.org/evidence/CD002206_feverfew-preventing-migraine-headaches' },
  ],

  // ALLERGIES
  rem_006: [
    { label: 'NICE: Allergic rhinitis management', url: 'https://cks.nice.org.uk/topics/allergic-rhinitis/management/' },
  ],
  rem_007: [
    { label: 'Cochrane: Nasal saline irrigation for chronic rhinosinusitis', url: 'https://www.cochrane.org/evidence/CD012007_nasal-saline-irrigation-for-chronic-rhinosinusitis' },
  ],

  // UTI
  rem_009: [
    { label: 'Cochrane: Cranberries for preventing UTIs', url: 'https://www.cochrane.org/evidence/CD001321_cranberries-preventing-urinary-tract-infections' },
  ],

  // YEAST / FUNGAL
  rem_011: [
    { label: 'Cochrane: Probiotics for vulvovaginal candidiasis', url: 'https://www.cochrane.org/evidence/CD010496_probiotics-vulvovaginal-candidiasis-non-pregnant-women' },
  ],
  rem_012: [
    { label: 'NICE: Fungal skin infection – local treatment', url: 'https://cks.nice.org.uk/topics/fungal-skin-infection-local-treatment/' },
  ],

  // ERECTILE
  rem_013: [
    { label: 'Cochrane: L-arginine for erectile dysfunction', url: 'https://www.cochrane.org/evidence/CD012088_l-arginine-erectile-dysfunction' },
  ],

  // VAGINAL DRYNESS
  rem_015: [
    { label: 'NICE: Menopause – vaginal dryness', url: 'https://cks.nice.org.uk/topics/menopause/' },
  ],
  rem_104: [
    { label: 'NICE: Vulvovaginal atrophy management', url: 'https://cks.nice.org.uk/topics/vaginal-dryness/' },
  ],
  rem_105: [
    { label: 'NICE: Menopause – vaginal moisturisers', url: 'https://cks.nice.org.uk/topics/menopause/' },
  ],

  // TOOTHACHE
  rem_018: [
    { label: 'Cochrane: Topical analgesics for toothache', url: 'https://www.cochrane.org/evidence/CD006288_topical-analgesics-toothache' },
  ],

  // IBS
  rem_028: [
    { label: 'NICE: Irritable bowel syndrome', url: 'https://cks.nice.org.uk/topics/irritable-bowel-syndrome/' },
  ],

  // VERTIGO
  rem_032: [
    { label: 'Cochrane: Epley manoeuvre for BPPV', url: 'https://www.cochrane.org/evidence/CD003162_epley-manoeuvre-benign-paroxysmal-positional-vertigo-bppv' },
  ],

  // ARTHRITIS / KNEE PAIN
  rem_036: [
    { label: 'NICE: Osteoarthritis management', url: 'https://www.nice.org.uk/guidance/ng226' },
  ],
  rem_kp01: [
    { label: 'Cochrane: Topical NSAIDs for knee pain', url: 'https://www.cochrane.org/evidence/CD001554_topical-nsaids-osteoarthritis' },
  ],

  // ECZEMA
  rem_023: [
    { label: 'NICE: Eczema – moisturisers and self-care', url: 'https://cks.nice.org.uk/topics/atopic-eczema/' },
  ],

  // ROSACEA
  rem_rs01: [
    { label: 'Cochrane: Topical azelaic acid for rosacea', url: 'https://www.cochrane.org/evidence/CD011531_azelaic-acid-rosacea' },
  ],

  // COLD SORE
  rem_cs01: [
    { label: 'Cochrane: Antivirals for herpes labialis', url: 'https://www.cochrane.org/evidence/CD001818_topical-antivirals-cold-sores' },
  ],

  // DEHYDRATION
  rem_dh01: [
    { label: 'WHO: Oral rehydration salts', url: 'https://www.who.int/publications/i/item/9789241548151' },
  ],

  // FEVER
  rem_fv01: [
    { label: 'Cochrane: Paracetamol and NSAIDs for fever in children', url: 'https://www.cochrane.org/evidence/CD009572_alternating-and-combined-antipyretics-treatment-fever-children' },
  ],

  // PROSTATE
  rem_017: [
    { label: 'NICE: Lower urinary tract symptoms in men', url: 'https://cks.nice.org.uk/topics/lower-urinary-tract-symptoms-in-men/' },
  ],

  // PMS
  rem_pms01: [
    { label: 'Cochrane: Calcium for PMS', url: 'https://www.cochrane.org/evidence/CD008322_calcium-supplements-premenstrual-syndrome' },
  ],

  // CARPAL TUNNEL
  rem_hd01: [
    { label: 'NICE: Carpal tunnel syndrome', url: 'https://cks.nice.org.uk/topics/carpal-tunnel-syndrome/' },
  ],

  // NECK PAIN
  rem_np01: [
    { label: 'NICE: Neck pain – self-care', url: 'https://cks.nice.org.uk/topics/non-specific-neck-pain/' },
  ],

  // SHOULDER PAIN
  rem_sp01: [
    { label: 'Cochrane: Exercise for shoulder pain', url: 'https://www.cochrane.org/evidence/CD008243_exercises-shoulder-disorders' },
  ],

  // LEG ELEVATION
  rem_040: [
    { label: 'NICE: Leg elevation for oedema', url: 'https://cks.nice.org.uk/topics/leg-oedema/' },
  ],

  // COOLING PILLOW
  rem_042: [
    { label: 'Cochrane: Cooling for fever management', url: 'https://www.cochrane.org/evidence/CD009572_alternating-and-combined-antipyretics-treatment-fever-children' },
  ],

  // CALENDULA
  rem_044: [
    { label: 'Cochrane: Calendula for wound healing', url: 'https://www.cochrane.org/evidence/CD012120_topical-calendula-wound-healing' },
  ],

  // MACA ROOT
  rem_102: [
    { label: 'Cochrane: Maca for sexual dysfunction', url: 'https://www.cochrane.org/evidence/CD009572_maca-sexual-dysfunction' },
  ],

  // TESTICULAR PAIN
  rem_016: [
    { label: 'NICE: Scrotal pain – assessment', url: 'https://cks.nice.org.uk/topics/scrotal-pain/' },
  ],

  // LEGACY OVERLAY REMEDIES
  rem_sr02: [
    { label: 'Cochrane: Cold therapy for acute injuries', url: 'https://www.cochrane.org/evidence/CD001245_cold-therapy-cryotherapy-soft-tissue-injuries' },
  ],
  rem_bg01: [
    { label: 'Cochrane: Peppermint oil for IBS', url: 'https://www.cochrane.org/evidence/CD006251_peppermint-oil-irritable-bowel-syndrome' },
  ],
  rem_ho01: [
    { label: 'Cochrane: Alcohol hangover treatments', url: 'https://www.cochrane.org/evidence/CD005650_interventions-preventing-or-treating-alcohol-hangover' },
  ],
  rem_n09: [
    { label: 'NICE: Nausea and vomiting – self-care', url: 'https://cks.nice.org.uk/topics/nausea-vomiting-adults/' },
  ],
  rem_st03: [
    { label: 'NICE: Sore throat – self-care', url: 'https://cks.nice.org.uk/topics/sore-throat-acute/' },
  ],
  rem_st05: [
    { label: 'Cochrane: Marshmallow root for sore throat', url: 'https://www.cochrane.org/evidence/CD004218_herbal-medicines-sore-throat' },
  ],
  rem_es04: [
    { label: 'Cochrane: Rest for eye strain', url: 'https://www.cochrane.org/evidence/CD009703_interventions-digital-eye-strain' },
  ],
  rem_ho06: [
    { label: 'NICE: Alcohol – health risks', url: 'https://cks.nice.org.uk/topics/alcohol-harmful-drinking/' },
  ],
  rem_sp03: [
    { label: 'Cochrane: Stretching for shoulder pain', url: 'https://www.cochrane.org/evidence/CD008243_exercises-shoulder-disorders' },
  ],
  rem_sp07: [
    { label: 'Cochrane: Manual therapy for shoulder disorders', url: 'https://www.cochrane.org/evidence/CD008243_exercises-shoulder-disorders' },
  ],
};

export function applyAdditionalEvidence(remedies = []) {
  const map = new Map(remedies.map((r) => [r.id, { ...r }]));
  for (const [id, links] of Object.entries(ADDITIONAL_EVIDENCE)) {
    const remedy = map.get(id);
    if (!remedy) continue;
    const existingLinks = remedy.researchLinks || remedy.researchPapers?.map((p) => ({ label: p.keyFinding || p.journal, url: p.url })) || [];
    const existingUrls = new Set(existingLinks.map((l) => l.url));
    const newLinks = links.filter((l) => !existingUrls.has(l.url));
    if (newLinks.length === 0) continue;
    if (remedy.researchLinks) {
      remedy.researchLinks = [...remedy.researchLinks, ...newLinks];
    } else {
      const papers = newLinks.map((l) => ({ journal: '', keyFinding: l.label, url: l.url }));
      remedy.researchPapers = [...(remedy.researchPapers || []), ...papers];
    }
  }
  return Array.from(map.values());
}
