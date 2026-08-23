#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const perSource = 10;
const timeoutMs = 15_000;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchJson(url, options = {}) {
  const response = await fetch(url, { ...options, redirect: 'follow', signal: AbortSignal.timeout(timeoutMs) });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.json();
}

const targetedInterventions = {
  headache: [
    { intervention: 'acetaminophen headache', category: 'OTC', tagline: 'First-line analgesic for headache' },
    { intervention: 'naproxen sodium headache', category: 'OTC', tagline: 'Long-acting NSAID for headache' },
    { intervention: 'butterbur headache prevention', category: 'Herbal', tagline: 'Herbal prevention for migraines' },
    { intervention: 'coenzyme Q10 headache', category: 'Supplement', tagline: 'Supplement for headache prevention' },
  ],
  migraine: [
    { intervention: 'topiramate migraine prevention', category: 'Prescription', tagline: 'Medication for migraine prevention' },
    { intervention: 'propranolol migraine prevention', category: 'Prescription', tagline: 'Beta-blocker for migraine prevention' },
    { intervention: 'magnesium migraine prevention', category: 'Supplement', tagline: 'Mineral for migraine prevention' },
    { intervention: 'acetaminophen migraine', category: 'OTC', tagline: 'Pain reliever for migraine attacks' },
  ],
  cold: [
    { intervention: 'dextromethorphan cough', category: 'OTC', tagline: 'Cough suppressant for cold' },
    { intervention: 'phenylephrine nasal decongestant', category: 'OTC', tagline: 'Nasal decongestant for cold' },
    { intervention: 'ivy leaf extract cough', category: 'Herbal', tagline: 'Herbal expectorant for cold' },
    { intervention: 'pelargonium extract cold', category: 'Herbal', tagline: 'Herbal remedy for cold symptoms' },
  ],
  cough: [
    { intervention: 'honey cough suppression', category: 'Herbal', tagline: 'Natural cough suppression with honey' },
    { intervention: 'thyme extract cough', category: 'Herbal', tagline: 'Herbal expectorant for cough' },
    { intervention: 'guaifenesin expectorant', category: 'OTC', tagline: 'Mucus thinner for productive cough' },
    { intervention: 'elderberry cough', category: 'Herbal', tagline: 'Immune-supporting berry for cough' },
  ],
  congestion: [
    { intervention: 'oxymetazoline nasal spray', category: 'OTC', tagline: 'Topical decongestant for nasal congestion' },
    { intervention: 'ipratropium nasal spray', category: 'Prescription', tagline: 'Anticholinergic for nasal congestion' },
    { intervention: 'menthol inhalation', category: 'Herbal', tagline: 'Menthol for nasal congestion relief' },
    { intervention: 'nety pot nasal irrigation', category: 'Lifestyle', tagline: 'Nasal lavage for congestion relief' },
  ],
  sinus_pressure: [
    { intervention: 'fluticasone nasal spray', category: 'OTC', tagline: 'Corticosteroid nasal spray for sinusitis' },
    { intervention: 'mometasone nasal spray', category: 'Prescription', tagline: 'Nasal steroid for sinus pressure' },
    { intervention: 'sinus rinsing technique', category: 'Lifestyle', tagline: 'Nasal rinsing for sinus pressure' },
    { intervention: 'xylitol nasal spray', category: 'Supplement', tagline: 'Natural nasal spray for sinus health' },
  ],
  brain_fog: [
    { intervention: 'phosphatidylserine', category: 'Supplement', tagline: 'Phospholipid for cognitive function' },
    { intervention: 'bacopa monnieri', category: 'Herbal', tagline: 'Ayurvedic herb for memory and focus' },
    { intervention: 'ginkgo biloba cognitive', category: 'Herbal', tagline: 'Herbal extract for mental clarity' },
    { intervention: 'creatine cognitive function', category: 'Supplement', tagline: 'Supplement for brain energy' },
  ],
  back_pain: [
    { intervention: 'acetaminophen back pain', category: 'OTC', tagline: 'Pain reliever for back pain' },
    { intervention: 'diclofenac topical back pain', category: 'OTC', tagline: 'Topical NSAID for back pain' },
    { intervention: 'core strengthening exercises', category: 'Lifestyle', tagline: 'Exercise for back pain prevention' },
    { intervention: 'massage therapy back pain', category: 'Lifestyle', tagline: 'Massage for back pain relief' },
  ],
  neck_pain: [
    { intervention: 'acetaminophen neck pain', category: 'OTC', tagline: 'Pain reliever for neck pain' },
    { intervention: 'diclofenac topical neck', category: 'OTC', tagline: 'Topical NSAID for neck pain' },
    { intervention: 'trapezius stretching', category: 'Lifestyle', tagline: 'Stretching for neck and shoulder pain' },
    { intervention: 'ergonomic work station', category: 'Lifestyle', tagline: 'Workspace setup for neck comfort' },
  ],
  shoulder_pain: [
    { intervention: 'subacromial injection', category: 'Prescription', tagline: 'Corticosteroid injection for shoulder pain' },
    { intervention: 'rotator cuff physical therapy', category: 'Lifestyle', tagline: 'Physical therapy for shoulder recovery' },
    { intervention: 'shoulder arthroscopy', category: 'Surgical', tagline: 'Minimally invasive surgery for shoulder' },
    { intervention: 'acupuncture shoulder pain', category: 'Lifestyle', tagline: 'Acupuncture for shoulder pain relief' },
  ],
  joint_pain: [
    { intervention: 'hyaluronic acid injection', category: 'Prescription', tagline: 'Joint injection for cartilage support' },
    { intervention: 'sam-e supplementation', category: 'Supplement', tagline: 'Joint-supporting compound for pain' },
    { intervention: 'cat claw bark herbal', category: 'Herbal', tagline: 'Herbal anti-inflammatory for joints' },
    { intervention: 'aquatic exercise therapy', category: 'Lifestyle', tagline: 'Water-based exercise for joint pain' },
  ],
  muscle_pain: [
    { intervention: 'menthol topical cream', category: 'OTC', tagline: 'Cooling cream for muscle pain relief' },
    { intervention: 'capsaicin muscle pain', category: 'OTC', tagline: 'Topical analgesic for muscle soreness' },
    { intervention: 'potassium muscle cramp', category: 'Supplement', tagline: 'Mineral for muscle cramp prevention' },
    { intervention: 'stretching routine muscle', category: 'Lifestyle', tagline: 'Stretching for muscle pain prevention' },
  ],
  leg_pain: [
    { intervention: 'diosmin leg pain', category: 'Supplement', tagline: 'Flavonoid for leg vein health' },
    { intervention: 'horsetail extract leg pain', category: 'Herbal', tagline: 'Herbal remedy for leg discomfort' },
    { intervention: 'walking exercise legs', category: 'Lifestyle', tagline: 'Regular walking for leg circulation' },
    { intervention: 'calcium muscle cramp', category: 'Supplement', tagline: 'Mineral for leg cramp prevention' },
  ],
  knee_pain: [
    { intervention: 'hyaluronic acid knee injection', category: 'Prescription', tagline: 'Joint lubricant injection for knee' },
    { intervention: 'glucosamine chondroitin knee', category: 'Supplement', tagline: 'Joint supplement for knee cartilage' },
    { intervention: 'aquatic therapy knee', category: 'Lifestyle', tagline: 'Water exercise for knee rehabilitation' },
    { intervention: 'acupuncture knee pain', category: 'Lifestyle', tagline: 'Acupuncture for knee pain relief' },
  ],
  sore_throat: [
    { intervention: 'dextromethorphan sore throat', category: 'OTC', tagline: 'Cough medicine for throat irritation' },
    { intervention: 'phenol throat lozenge', category: 'OTC', tagline: 'Medicated lozenge for sore throat' },
    { intervention: 'marshmallow root throat', category: 'Herbal', tagline: 'Demulcent herb for throat coating' },
    { intervention: 'ice chips throat pain', category: 'Lifestyle', tagline: 'Cold therapy for throat pain relief' },
  ],
  period_cramps: [
    { intervention: 'tranexamic acid period', category: 'Prescription', tagline: 'Medication for heavy period flow' },
    { intervention: 'supplement for period cramps', category: 'Supplement', tagline: 'Supplement for menstrual pain relief' },
    { intervention: 'exercise for period cramps', category: 'Lifestyle', tagline: 'Physical activity for cramp relief' },
    { intervention: 'acupuncture period cramps', category: 'Lifestyle', tagline: 'Acupuncture for menstrual pain relief' },
  ],
  pms: [
    { intervention: 'SSRI for PMS', category: 'Prescription', tagline: 'Antidepressant for severe PMS symptoms' },
    { intervention: 'evening primrose oil PMS', category: 'Supplement', tagline: 'Essential fatty acid for PMS relief' },
    { intervention: 'vitamin E PMS', category: 'Supplement', tagline: 'Antioxidant for PMS symptom relief' },
    { intervention: 'yoga for PMS', category: 'Lifestyle', tagline: 'Gentle yoga for PMS symptom relief' },
  ],
  menopause: [
    { intervention: 'hormone replacement therapy', category: 'Prescription', tagline: 'Hormones for menopausal symptom relief' },
    { intervention: 'venlafaxine for hot flashes', category: 'Prescription', tagline: 'Antidepressant for hot flash reduction' },
    { intervention: 'vitamin E menopause', category: 'Supplement', tagline: 'Antioxidant for menopausal symptoms' },
    { intervention: 'acupuncture menopause', category: 'Lifestyle', tagline: 'Acupuncture for menopausal symptom relief' },
  ],
  fever: [
    { intervention: 'aspirin fever adults', category: 'OTC', tagline: 'NSAID for fever reduction in adults' },
    { intervention: 'acetaminophen children fever', category: 'OTC', tagline: 'Safe fever reducer for children' },
    { intervention: 'lukewarm compress fever', category: 'Lifestyle', tagline: 'Gentle cooling for fever comfort' },
    { intervention: 'fluid intake fever', category: 'Lifestyle', tagline: 'Hydration for fever management' },
  ],
  bloating: [
    { intervention: 'activated charcoal bloating', category: 'OTC', tagline: 'Supplement for gas and bloating' },
    { intervention: 'digestive enzyme supplement', category: 'Supplement', tagline: 'Enzymes for food breakdown' },
    { intervention: 'fiber supplement bloating', category: 'Supplement', tagline: 'Fiber for digestive health' },
    { intervention: 'yoga for bloating', category: 'Lifestyle', tagline: 'Yoga poses for digestive comfort' },
  ],
  heartburn: [
    { intervention: 'omeprazole heartburn', category: 'OTC', tagline: 'Proton pump inhibitor for heartburn' },
    { intervention: 'ranitidine heartburn', category: 'OTC', tagline: 'H2 blocker for heartburn relief' },
    { intervention: 'chewing gum after meals', category: 'Lifestyle', tagline: 'Saliva production for acid neutralization' },
    { intervention: 'aloe vera juice heartburn', category: 'Herbal', tagline: 'Soothing drink for acid reflux' },
  ],
  constipation: [
    { intervention: 'lactulose constipation', category: 'Prescription', tagline: 'Osmotic laxative for constipation' },
    { intervention: 'bisacodyl stimulant laxative', category: 'OTC', tagline: 'Stimulant laxative for constipation' },
    { intervention: 'ground flaxseed constipation', category: 'Supplement', tagline: 'Fiber source for constipation relief' },
    { intervention: 'prune juice constipation', category: 'Herbal', tagline: 'Natural laxative for constipation' },
  ],
  diarrhea: [
    { intervention: 'bismuth subsalicylate diarrhea', category: 'OTC', tagline: 'Antidiarrheal for traveler diarrhea' },
    { intervention: 'racecadotril diarrhea', category: 'Prescription', tagline: 'Antisecretory agent for diarrhea' },
    { intervention: 'probiotic diarrhea treatment', category: 'Supplement', tagline: 'Beneficial bacteria for diarrhea recovery' },
    { intervention: 'BRAT diet diarrhea', category: 'Lifestyle', tagline: 'Dietary management for diarrhea' },
  ],
  stomach_ache: [
    { intervention: 'antacid tablets stomach ache', category: 'OTC', tagline: 'Quick relief for stomach acid pain' },
    { intervention: 'dicyclomine stomach cramp', category: 'Prescription', tagline: 'Antispasmodic for stomach cramps' },
    { intervention: 'fennel tea stomach', category: 'Herbal', tagline: 'Carminative tea for stomach comfort' },
    { intervention: 'heating pad stomach', category: 'Lifestyle', tagline: 'Warmth for abdominal pain relief' },
  ],
  fatigue: [
    { intervention: 'iron supplementation fatigue', category: 'Supplement', tagline: 'Iron for fatigue related to deficiency' },
    { intervention: 'coenzyme Q10 fatigue', category: 'Supplement', tagline: 'Cellular energy support' },
    { intervention: 'regular aerobic exercise fatigue', category: 'Lifestyle', tagline: 'Physical activity for energy improvement' },
    { intervention: 'vitamin D supplementation fatigue', category: 'Supplement', tagline: 'Vitamin for energy support' },
  ],
  low_energy: [
    { intervention: 'iron supplementation energy', category: 'Supplement', tagline: 'Iron for energy support' },
    { intervention: 'B12 supplementation energy', category: 'Supplement', tagline: 'Vitamin for energy production' },
    { intervention: 'regular exercise energy', category: 'Lifestyle', tagline: 'Physical activity for energy boost' },
    { intervention: 'rhodiola rosea energy', category: 'Herbal', tagline: 'Adaptogenic herb for energy and stamina' },
  ],
  dehydration: [
    { intervention: 'oral rehydration salts', category: 'OTC', tagline: 'WHO-recommended rehydration' },
    { intervention: 'coconut water hydration', category: 'Herbal', tagline: 'Natural electrolyte drink' },
    { intervention: 'electrolyte tablets hydration', category: 'OTC', tagline: 'Dissolvable tablets for rehydration' },
    { intervention: 'water intake hydration', category: 'Lifestyle', tagline: 'Adequate daily water consumption' },
  ],
  allergies: [
    { intervention: 'fexofenadine allergies', category: 'OTC', tagline: 'Non-drowsy antihistamine for allergies' },
    { intervention: 'azelastine nasal spray', category: 'Prescription', tagline: 'Antihistamine nasal spray for allergies' },
    { intervention: 'quercetin allergies', category: 'Supplement', tagline: 'Natural antihistamine for allergies' },
    { intervention: 'nasal saline rinse allergies', category: 'Lifestyle', tagline: 'Nasal irrigation for allergy relief' },
  ],
  asthma: [
    { intervention: 'salmeterol long-acting bronchodilator', category: 'Prescription', tagline: 'Long-acting bronchodilator for asthma' },
    { intervention: 'leukotriene receptor antagonist', category: 'Prescription', tagline: 'Anti-inflammatory for asthma control' },
    { intervention: 'buteyko breathing asthma', category: 'Lifestyle', tagline: 'Breathing technique for asthma management' },
    { intervention: 'vitamin D asthma', category: 'Supplement', tagline: 'Vitamin for asthma symptom control' },
  ],
  hives: [
    { intervention: 'fexofenadine hives', category: 'OTC', tagline: 'Antihistamine for chronic hives' },
    { intervention: 'ranitidine hives', category: 'OTC', tagline: 'H2 blocker for hive relief' },
    { intervention: 'dapsone hives', category: 'Prescription', tagline: 'Medication for chronic hives' },
    { intervention: 'colloidal oatmeal bath hives', category: 'Herbal', tagline: 'Soothing bath for hive comfort' },
  ],
  allergic_reaction: [
    { intervention: 'epinephrine severe allergic', category: 'Prescription', tagline: 'Emergency treatment for anaphylaxis' },
    { intervention: 'diphenhydramine allergic', category: 'OTC', tagline: 'Antihistamine for allergic reaction' },
    { intervention: 'prednisone allergic', category: 'Prescription', tagline: 'Steroid for severe allergic reaction' },
    { intervention: 'cromolyn sodium allergic', category: 'Prescription', tagline: 'Mast cell stabilizer for allergy prevention' },
  ],
  uti: [
    { intervention: 'trimethoprim UTI', category: 'Prescription', tagline: 'Antibiotic for UTI treatment' },
    { intervention: 'nitrofurantoin UTI', category: 'Prescription', tagline: 'Antibiotic for uncomplicated UTI' },
    { intervention: 'cranberry extract UTI', category: 'Supplement', tagline: 'Natural remedy for UTI prevention' },
    { intervention: 'probiotic UTI prevention', category: 'Supplement', tagline: 'Beneficial bacteria for urinary health' },
  ],
  kidney_stone: [
    { intervention: 'nifedipine kidney stone', category: 'Prescription', tagline: 'Calcium channel blocker for stone passage' },
    { intervention: 'indomethacin kidney stone', category: 'Prescription', tagline: 'NSAID for stone pain relief' },
    { intervention: 'thiazide diuretic stone', category: 'Prescription', tagline: 'Diuretic for stone prevention' },
    { intervention: 'magnesium citrate stone', category: 'Supplement', tagline: 'Mineral for stone prevention' },
  ],
  frequent_urination: [
    { intervention: 'solifenacin frequent urination', category: 'Prescription', tagline: 'Anticholinergic for bladder control' },
    { intervention: 'mirabegron frequent urination', category: 'Prescription', tagline: 'Beta-3 agonist for overactive bladder' },
    { intervention: 'pelvic floor exercises frequency', category: 'Lifestyle', tagline: 'Kegel exercises for bladder control' },
    { intervention: 'caffeine reduction frequency', category: 'Lifestyle', tagline: 'Reducing bladder irritants' },
  ],
  urinary_incontinence: [
    { intervention: 'duloxetine incontinence', category: 'Prescription', tagline: 'SNRI for stress incontinence' },
    { intervention: 'sacral nerve stimulation', category: 'Surgical', tagline: 'Neuromodulation for incontinence' },
    { intervention: 'collagen injection incontinence', category: 'Surgical', tagline: 'Bulking agent for stress incontinence' },
    { intervention: 'absorbent products incontinence', category: 'OTC', tagline: 'Protective products for incontinence' },
  ],
  yeast_infection: [
    { intervention: 'miconazole vaginal', category: 'OTC', tagline: 'Topical antifungal for yeast infection' },
    { intervention: 'terconazole vaginal', category: 'OTC', tagline: 'Antifungal for vaginal candidiasis' },
    { intervention: 'boric acid vaginal', category: 'OTC', tagline: 'Suppository for recurrent yeast infections' },
    { intervention: 'probiotic vaginal health', category: 'Supplement', tagline: 'Beneficial bacteria for vaginal balance' },
  ],
  prostate_issues: [
    { intervention: 'tamsulosin BPH', category: 'Prescription', tagline: 'Alpha-blocker for prostate symptoms' },
    { intervention: 'dutasteride BPH', category: 'Prescription', tagline: '5-ARI for prostate enlargement' },
    { intervention: 'saw palmetto BPH', category: 'Herbal', tagline: 'Herbal remedy for prostate health' },
    { intervention: 'pygeum BPH', category: 'Herbal', tagline: 'African plum extract for prostate' },
  ],
  testicular_pain: [
    { intervention: 'ibuprofen testicular pain', category: 'OTC', tagline: 'NSAID for testicular pain relief' },
    { intervention: 'scrotal elevation testicular', category: 'Lifestyle', tagline: 'Positioning for pain relief' },
    { intervention: 'supportive underwear testicular', category: 'Lifestyle', tagline: 'Supportive garment for comfort' },
    { intervention: 'warm sitz bath testicular', category: 'Lifestyle', tagline: 'Warm water therapy for comfort' },
  ],
  eye_pain: [
    { intervention: 'artificial tears eye pain', category: 'OTC', tagline: 'Lubricating drops for eye pain' },
    { intervention: 'ketorolac ophthalmic', category: 'Prescription', tagline: 'NSAID eye drops for pain relief' },
    { intervention: 'cold compress eye pain', category: 'Lifestyle', tagline: 'Cold therapy for eye pain relief' },
    { intervention: 'lutein zeaxanthin eye', category: 'Supplement', tagline: 'Antioxidants for eye health' },
  ],
  eye_strain: [
    { intervention: 'computer glasses strain', category: 'Lifestyle', tagline: 'Prescription lenses for screen work' },
    { intervention: 'artificial tears strain', category: 'OTC', tagline: 'Eye drops for dry eyes' },
    { intervention: '20-20-20 rule eye strain', category: 'Lifestyle', tagline: 'Regular eye breaks for screens' },
    { intervention: 'screen settings adjustment', category: 'Lifestyle', tagline: 'Optimal screen settings for eyes' },
  ],
  ear_pain: [
    { intervention: 'antibiotic ear drops', category: 'OTC', tagline: 'Antibacterial drops for ear infection' },
    { intervention: 'ibuprofen ear pain', category: 'OTC', tagline: 'NSAID for ear pain relief' },
    { intervention: 'warm oil ear drops', category: 'Herbal', tagline: 'Olive oil drops for ear comfort' },
    { intervention: 'garlic oil ear drops', category: 'Herbal', tagline: 'Antibacterial herbal ear drops' },
  ],
  skin_rash: [
    { intervention: 'hydrocortisone cream rash', category: 'OTC', tagline: 'Topical steroid for rash relief' },
    { intervention: 'calamine lotion rash', category: 'OTC', tagline: 'Soothing lotion for itchy rashes' },
    { intervention: 'antihistamine oral rash', category: 'OTC', tagline: 'Oral medication for rash itching' },
    { intervention: 'colloidal oatmeal rash', category: 'Herbal', tagline: 'Natural remedy for skin irritation' },
  ],
  dry_skin: [
    { intervention: 'moisturizer cream dry skin', category: 'OTC', tagline: 'Thick moisturizer for dry skin' },
    { intervention: 'hyaluronic acid serum', category: 'Supplement', tagline: 'Hydrating serum for skin moisture' },
    { intervention: 'ceramide cream dry skin', category: 'OTC', tagline: 'Skin barrier repair cream' },
    { intervention: 'coconut oil skin', category: 'Herbal', tagline: 'Natural oil for skin hydration' },
  ],
  hangover: [
    { intervention: 'electrolyte solution hangover', category: 'OTC', tagline: 'Rehydration for hangover recovery' },
    { intervention: 'vitamin B complex hangover', category: 'Supplement', tagline: 'B vitamins for alcohol metabolism' },
    { intervention: 'N-acetyl cysteine hangover', category: 'Supplement', tagline: 'Amino acid for liver support' },
    { intervention: 'sleep rest hangover', category: 'Lifestyle', tagline: 'Adequate sleep for recovery' },
  ],
  canker_sore: [
    { intervention: 'amlexanox canker sore', category: 'OTC', tagline: 'Topical paste for mouth ulcers' },
    { intervention: 'hydrogen peroxide rinse', category: 'Lifestyle', tagline: 'Antiseptic rinse for mouth sores' },
    { intervention: 'vitamin B12 canker sore', category: 'Supplement', tagline: 'Vitamin for canker sore prevention' },
    { intervention: 'lycopene canker sore', category: 'Supplement', tagline: 'Antioxidant for oral health' },
  ],
  gum_pain: [
    { intervention: 'salt water rinse gum pain', category: 'Lifestyle', tagline: 'Simple rinse for gum discomfort' },
    { intervention: 'antibacterial mouthwash gum', category: 'OTC', tagline: 'Rinse for gum infection prevention' },
    { intervention: 'warm compress gum pain', category: 'Lifestyle', tagline: 'Heat therapy for gum relief' },
    { intervention: 'clove oil gum pain', category: 'Herbal', tagline: 'Numbing oil for gum pain' },
  ],
  cold_sore: [
    { intervention: 'acyclovir cold sore', category: 'OTC', tagline: 'Antiviral cream for cold sores' },
    { intervention: 'docosanol cold sore', category: 'OTC', tagline: 'OTC antiviral for cold sore prevention' },
    { intervention: 'lysine cold sore', category: 'Supplement', tagline: 'Amino acid for cold sore prevention' },
    { intervention: 'lemon balm cold sore', category: 'Herbal', tagline: 'Herbal topical for cold sore relief' },
  ],
  ankle_pain: [
    { intervention: 'ankle brace support', category: 'Lifestyle', tagline: 'Support for ankle stability' },
    { intervention: 'RICE ankle sprain', category: 'Lifestyle', tagline: 'Rest ice compression elevation' },
    { intervention: 'ibuprofen ankle pain', category: 'OTC', tagline: 'NSAID for ankle pain relief' },
    { intervention: 'balance training ankle', category: 'Lifestyle', tagline: 'Proprioception exercises for ankle' },
  ],
  sunburn: [
    { intervention: 'aloe vera sunburn', category: 'Herbal', tagline: 'Cooling gel for sunburn relief' },
    { intervention: 'hydrocortisone sunburn', category: 'OTC', tagline: 'Topical steroid for sunburn inflammation' },
    { intervention: 'cool compress sunburn', category: 'Lifestyle', tagline: 'Cold therapy for sunburn comfort' },
    { intervention: 'oral NSAID sunburn', category: 'OTC', tagline: 'Oral anti-inflammatory for sunburn pain' },
  ],
  teeth_grinding: [
    { intervention: 'night guard bruxism', category: 'Lifestyle', tagline: 'Dental appliance for teeth grinding' },
    { intervention: 'stress management bruxism', category: 'Lifestyle', tagline: 'Relaxation for bruxism prevention' },
    { intervention: 'jaw exercises bruxism', category: 'Lifestyle', tagline: 'Exercises for jaw relaxation' },
    { intervention: 'muscle relaxant bruxism', category: 'Prescription', tagline: 'Medication for severe bruxism' },
  ],
  poor_circulation: [
    { intervention: 'exercise circulation', category: 'Lifestyle', tagline: 'Physical activity for circulation' },
    { intervention: 'compression stockings circulation', category: 'Lifestyle', tagline: 'Graduated compression for circulation' },
    { intervention: 'cayenne pepper circulation', category: 'Herbal', tagline: 'Spice for circulation support' },
    { intervention: 'leg elevation circulation', category: 'Lifestyle', tagline: 'Positioning for circulation improvement' },
  ],
  chills: [
    { intervention: 'warm blankets chills', category: 'Lifestyle', tagline: 'Warmth for chills comfort' },
    { intervention: 'warm fluids chills', category: 'Lifestyle', tagline: 'Hot drinks for warmth' },
    { intervention: 'fever reducer chills', category: 'OTC', tagline: 'Medication for fever-related chills' },
    { intervention: 'layered clothing chills', category: 'Lifestyle', tagline: 'Dress warmly for chills prevention' },
  ],
  swollen_lymph_nodes: [
    { intervention: 'warm compress lymph nodes', category: 'Lifestyle', tagline: 'Comfort for tender lymph nodes' },
    { intervention: 'rest hydration lymph', category: 'Lifestyle', tagline: 'Rest for immune support' },
    { intervention: 'nsaid lymph nodes', category: 'OTC', tagline: 'Pain medication for lymph discomfort' },
    { intervention: 'echinacea lymph', category: 'Herbal', tagline: 'Herbal immune stimulant' },
  ],
  low_libido: [
    { intervention: 'stress management libido', category: 'Lifestyle', tagline: 'Relaxation for libido support' },
    { intervention: 'exercise libido', category: 'Lifestyle', tagline: 'Physical activity for libido improvement' },
    { intervention: 'maca root libido', category: 'Herbal', tagline: 'Herbal supplement for sexual desire' },
    { intervention: 'ashwagandha libido', category: 'Herbal', tagline: 'Adaptogenic herb for low libido' },
  ],
  erectile_difficulty: [
    { intervention: 'sildenafil erectile dysfunction', category: 'Prescription', tagline: 'PDE5 inhibitor for erectile function' },
    { intervention: 'tadalafil erectile dysfunction', category: 'Prescription', tagline: 'Long-acting PDE5 inhibitor' },
    { intervention: 'pelvic floor exercises ED', category: 'Lifestyle', tagline: 'Kegel exercises for erectile function' },
    { intervention: 'l-arginine ED', category: 'Supplement', tagline: 'Amino acid for blood flow support' },
  ],
  insect_bite: [
    { intervention: 'hydrocortisone insect bite', category: 'OTC', tagline: 'Topical steroid for bite relief' },
    { intervention: 'antihistamine insect bite', category: 'OTC', tagline: 'Oral medication for bite itching' },
    { intervention: 'calamine lotion insect bite', category: 'OTC', tagline: 'Soothing lotion for bites' },
    { intervention: 'baking soda bite paste', category: 'Herbal', tagline: 'Natural remedy for bite itch' },
  ],
  minor_burn: [
    { intervention: 'aloe vera minor burn', category: 'Herbal', tagline: 'Cooling gel for minor burns' },
    { intervention: 'cool water burn first aid', category: 'Lifestyle', tagline: 'First aid for burn cooling' },
    { intervention: 'silver sulfadiazine burn', category: 'OTC', tagline: 'Antimicrobial for burn care' },
    { intervention: 'petroleum jelly burn', category: 'OTC', tagline: 'Protective ointment for burns' },
  ],
  eczema: [
    { intervention: 'moisturizer eczema', category: 'OTC', tagline: 'Thick moisturizer for eczema relief' },
    { intervention: 'hydrocortisone eczema', category: 'OTC', tagline: 'Topical steroid for eczema flare-ups' },
    { intervention: 'colloidal oatmeal eczema', category: 'Herbal', tagline: 'Soothing bath for eczema comfort' },
    { intervention: 'ceramide cream eczema', category: 'OTC', tagline: 'Skin barrier repair for eczema' },
  ],
  ibs: [
    { intervention: 'low FODMAP diet IBS', category: 'Lifestyle', tagline: 'Dietary restriction for IBS relief' },
    { intervention: 'peppermint oil IBS', category: 'Herbal', tagline: 'Enteric-coated oil for IBS symptoms' },
    { intervention: 'probiotics IBS', category: 'Supplement', tagline: 'Beneficial bacteria for IBS management' },
    { intervention: 'psyllium fiber IBS', category: 'Supplement', tagline: 'Bulk-forming fiber for IBS-C' },
  ],
  gerd: [
    { intervention: 'pantoprazole GERD', category: 'OTC', tagline: 'Proton pump inhibitor for GERD' },
    { intervention: 'famotidine GERD', category: 'OTC', tagline: 'H2 blocker for acid reflux' },
    { intervention: 'deglycyrrhizinated licorice GERD', category: 'Herbal', tagline: 'Herbal option for reflux relief' },
    { intervention: 'elevate head GERD', category: 'Lifestyle', tagline: 'Positioning for nighttime reflux' },
  ],
  hemorrhoids: [
    { intervention: 'hydrocortisone hemorrhoids', category: 'OTC', tagline: 'Topical steroid for hemorrhoids' },
    { intervention: 'witch hazel hemorrhoids', category: 'Herbal', tagline: 'Astringent for hemorrhoid relief' },
    { intervention: 'stool softener hemorrhoids', category: 'OTC', tagline: 'Softener for straining prevention' },
    { intervention: 'sitz bath hemorrhoids', category: 'Lifestyle', tagline: 'Warm water therapy for comfort' },
  ],
  arthritis: [
    { intervention: 'celecoxib arthritis', category: 'Prescription', tagline: 'COX-2 inhibitor for arthritis pain' },
    { intervention: 'methotrexate arthritis', category: 'Prescription', tagline: 'DMARD for rheumatoid arthritis' },
    { intervention: 'fish oil omega-3 arthritis', category: 'Supplement', tagline: 'Fatty acids for joint inflammation' },
    { intervention: 'tai chi arthritis', category: 'Lifestyle', tagline: 'Gentle exercise for arthritis pain' },
  ],
  sciatica: [
    { intervention: 'gabapentin sciatica', category: 'Prescription', tagline: 'Anticonvulsant for nerve pain' },
    { intervention: 'mckenzie exercises sciatica', category: 'Lifestyle', tagline: 'Exercises for disc-related sciatica' },
    { intervention: 'nerve glides sciatica', category: 'Lifestyle', tagline: 'Mobilization exercises for sciatica' },
    { intervention: 'yoga sciatica', category: 'Lifestyle', tagline: 'Gentle yoga for sciatica relief' },
  ],
  palpitations: [
    { intervention: 'magnesium palpitations', category: 'Supplement', tagline: 'Mineral for heart rhythm support' },
    { intervention: 'deep breathing palpitations', category: 'Lifestyle', tagline: 'Breathing techniques for relief' },
    { intervention: 'caffeine reduction palpitations', category: 'Lifestyle', tagline: 'Caffeine reduction for prevention' },
    { intervention: 'coenzyme Q10 palpitations', category: 'Supplement', tagline: 'Supplement for heart health' },
  ],
  indigestion: [
    { intervention: 'ginger indigestion', category: 'Herbal', tagline: 'Herbal remedy for dyspepsia' },
    { intervention: 'antacid indigestion', category: 'OTC', tagline: 'Quick relief for indigestion' },
    { intervention: 'probiotics indigestion', category: 'Supplement', tagline: 'Beneficial bacteria for gut health' },
    { intervention: 'fennel seeds indigestion', category: 'Herbal', tagline: 'Carminative for digestive comfort' },
  ],
  hair_loss: [
    { intervention: 'minoxidil hair loss', category: 'OTC', tagline: 'Topical solution for hair regrowth' },
    { intervention: 'biotin hair loss', category: 'Supplement', tagline: 'B vitamin for hair health' },
    { intervention: 'saw palmetto hair loss', category: 'Herbal', tagline: 'Herbal remedy for hair prevention' },
    { intervention: 'iron hair loss', category: 'Supplement', tagline: 'Iron for deficiency-related hair loss' },
  ],
  restless_leg: [
    { intervention: 'iron restless leg', category: 'Supplement', tagline: 'Iron for restless leg relief' },
    { intervention: 'regular exercise restless leg', category: 'Lifestyle', tagline: 'Moderate exercise for improvement' },
    { intervention: 'magnesium restless leg', category: 'Supplement', tagline: 'Mineral for muscle relaxation' },
    { intervention: 'hot cold restless leg', category: 'Lifestyle', tagline: 'Alternating heat and ice for comfort' },
  ],
  night_sweats: [
    { intervention: 'clonidine night sweats', category: 'Prescription', tagline: 'Medication for night sweats' },
    { intervention: 'black cohosh night sweats', category: 'Herbal', tagline: 'Herbal remedy for menopausal sweats' },
    { intervention: 'breathable sleepwear', category: 'Lifestyle', tagline: 'Moisture-wicking clothing' },
    { intervention: 'bedroom temperature night sweats', category: 'Lifestyle', tagline: 'Cool sleeping environment' },
  ],
};

async function discoverPubMed(intervention, condition) {
  const query = `(${intervention}[Title/Abstract]) AND (${condition}[Title/Abstract]) AND (systematic review[pt] OR meta-analysis[pt] OR randomized controlled trial[pt] OR clinical trial[pt] OR practice guideline[pt] OR observational study[pt] OR review[pt])`;
  const params = new URLSearchParams({ db: 'pubmed', term: query, retmax: String(perSource), retmode: 'json', sort: 'relevance' });
  const data = await fetchJson(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?${params}`);
  const ids = data.esearchresult?.idlist || [];
  if (ids.length === 0) return [];
  const summaryParams = new URLSearchParams({ db: 'pubmed', retmode: 'json', id: ids.join(',') });
  const summary = await fetchJson(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?${summaryParams}`);
  const fetchParams = new URLSearchParams({ db: 'pubmed', retmode: 'xml', id: ids.join(','), rettype: 'abstract' });
  const xmlResponse = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?${fetchParams}`, { redirect: 'follow', signal: AbortSignal.timeout(timeoutMs) });
  const xmlText = await xmlResponse.text();
  const abstracts = {};
  for (const articleMatch of xmlText.matchAll(/<PubmedArticle>([\s\S]*?)<\/PubmedArticle>/g)) {
    const articleXml = articleMatch[1];
    const pmidMatch = articleXml.match(/<PMID[^>]*>(\d+)<\/PMID>/);
    if (!pmidMatch) continue;
    const pmid = pmidMatch[1];
    const abstractParts = [];
    for (const absMatch of articleXml.matchAll(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g)) {
      abstractParts.push(absMatch[1].replace(/<[^>]+>/g, '').trim());
    }
    if (abstractParts.length > 0) abstracts[pmid] = abstractParts.join(' ');
  }
  return ids.map(id => {
    const record = summary.result?.[id];
    return {
      retrievalSource: 'PubMed', publicationId: `pmid:${id}`, pmid: id, doi: null,
      url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`, title: record?.title || null,
      journal: record?.fulljournalname || null, year: String(record?.pubdate || '').match(/\d{4}/)?.[0] || null,
      publicationTypes: record?.pubtype || [], abstract: abstracts[id] || null,
      citedByCount: null, semanticStatus: 'unassessed',
    };
  });
}

async function discoverEuropePmc(intervention, condition) {
  const query = `TITLE_ABS:"${intervention}" AND TITLE_ABS:"${condition}"`;
  const url = new URL('https://www.ebi.ac.uk/europepmc/webservices/rest/search');
  url.search = new URLSearchParams({ query, format: 'json', pageSize: String(perSource), resultType: 'core' }).toString();
  const records = (await fetchJson(url)).resultList?.result || [];
  return records.map(record => ({
    retrievalSource: 'Europe PMC', publicationId: record.pmid ? `pmid:${record.pmid}` : record.doi ? `doi:${record.doi.toLowerCase()}` : `epmc:${record.id}`,
    pmid: record.pmid || null, doi: record.doi || null,
    url: record.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${record.pmid}/` : `https://europepmc.org/article/${record.source}/${record.id}`,
    title: record.title || null, journal: record.journalTitle || null, year: record.pubYear || null,
    publicationTypes: record.pubTypeList?.pubType || [], abstract: record.abstractText || null,
    citedByCount: record.citedByCount ?? null, semanticStatus: 'unassessed',
  }));
}

async function discoverForSymptom(symptomCode, interventions) {
  const condition = symptomCode.replace(/_/g, ' ');
  const allCandidates = [];
  for (const { intervention, category, tagline } of interventions) {
    const results = await Promise.allSettled([
      discoverPubMed(intervention, condition),
      discoverEuropePmc(intervention, condition),
    ]);
    for (const result of results) {
      if (result.status === 'fulfilled') {
        for (const candidate of result.value) {
          allCandidates.push({ ...candidate, intervention, category, tagline, symptomCode });
        }
      }
    }
  }
  return allCandidates;
}

const output = resolve('reports/targeted-expansion.json');
const report = { generatedAt: new Date().toISOString(), symptomCount: Object.keys(targetedInterventions).length, packets: [] };

for (const [symptomCode, interventions] of Object.entries(targetedInterventions)) {
  process.stdout.write(`Discovering ${symptomCode}...`);
  const candidates = await discoverForSymptom(symptomCode, interventions);
  await sleep(350);
  const seen = new Set();
  const deduped = candidates.filter(c => {
    const key = c.pmid || c.doi || c.url;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  report.packets.push({ symptomCode, interventions: interventions.map(i => i.intervention), candidateCount: deduped.length, candidates: deduped });
  console.log(` ${deduped.length} candidates`);
}

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, JSON.stringify(report, null, 2));

const totalCandidates = report.packets.reduce((sum, p) => sum + p.candidateCount, 0);
console.log(`\nTargeted expansion: ${totalCandidates} candidates across ${report.symptomCount} symptoms.`);
