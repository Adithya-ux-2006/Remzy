#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const SCRAPINGBEE_API_KEY = process.env.SCRAPINGBEE_API_KEY || '';
const perSource = 8;
const timeoutMs = 20_000;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, redirect: 'follow', signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
    return response.json();
  } finally { clearTimeout(timer); }
}

async function fetchText(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, redirect: 'follow', signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
    return response.text();
  } finally { clearTimeout(timer); }
}

const symptoms = {
  headache: [
    { intervention: 'acetaminophen', category: 'OTC', tagline: 'First-line analgesic for headache' },
    { intervention: 'ibuprofen', category: 'OTC', tagline: 'NSAID for headache relief' },
    { intervention: 'caffeine combination', category: 'OTC', tagline: 'Caffeine-enhanced pain relief' },
    { intervention: 'peppermint oil topical', category: 'Herbal', tagline: 'Topical essential oil for tension headache' },
    { intervention: 'magnesium supplement', category: 'Supplement', tagline: 'Mineral for headache prevention' },
    { intervention: 'feverfew herbal', category: 'Herbal', tagline: 'Herbal for migraine prevention' },
    { intervention: 'butterbur extract', category: 'Herbal', tagline: 'Herbal supplement for migraine' },
    { intervention: 'riboflavin vitamin B2', category: 'Supplement', tagline: 'Vitamin for headache prevention' },
  ],
  migraine: [
    { intervention: 'sumatriptan', category: 'Prescription', tagline: 'Triptan for acute migraine' },
    { intervention: 'rizatriptan', category: 'Prescription', tagline: 'Fast-acting triptan for migraine' },
    { intervention: 'topiramate prevention', category: 'Prescription', tagline: 'Medication for migraine prevention' },
    { intervention: 'propranolol prevention', category: 'Prescription', tagline: 'Beta-blocker for migraine prevention' },
    { intervention: 'magnesium oxide', category: 'Supplement', tagline: 'Mineral for migraine prevention' },
    { intervention: 'riboflavin B2', category: 'Supplement', tagline: 'Vitamin for migraine prevention' },
    { intervention: 'coenzyme Q10', category: 'Supplement', tagline: 'Antioxidant for migraine prevention' },
    { intervention: 'butterbur petasites', category: 'Herbal', tagline: 'Herbal for migraine prophylaxis' },
  ],
  cold: [
    { intervention: 'zinc lozenges', category: 'OTC', tagline: 'Zinc for cold duration reduction' },
    { intervention: 'vitamin C', category: 'Supplement', tagline: 'Vitamin for cold prevention' },
    { intervention: 'echinacea', category: 'Herbal', tagline: 'Herbal for cold immune support' },
    { intervention: 'nasal saline', category: 'OTC', tagline: 'Saline rinse for nasal congestion' },
    { intervention: 'honey cough', category: 'Herbal', tagline: 'Natural demulcent for cough' },
    { intervention: 'elderberry extract', category: 'Herbal', tagline: 'Antiviral berry for cold symptoms' },
    { intervention: 'pelargonium extract', category: 'Herbal', tagline: 'Herbal extract for cold symptoms' },
  ],
  cough: [
    { intervention: 'dextromethorphan', category: 'OTC', tagline: 'Cough suppressant for dry cough' },
    { intervention: 'honey', category: 'Herbal', tagline: 'Natural cough remedy' },
    { intervention: 'gargle salt water', category: 'Lifestyle', tagline: 'Simple remedy for throat irritation' },
    { intervention: 'probiotics respiratory', category: 'Supplement', tagline: 'Beneficial bacteria for respiratory health' },
    { intervention: 'bromelain', category: 'Supplement', tagline: 'Enzyme for mucus clearance' },
    { intervention: 'thyme extract', category: 'Herbal', tagline: 'Herbal expectorant for cough' },
  ],
  congestion: [
    { intervention: 'pseudoephedrine', category: 'OTC', tagline: 'Decongestant for nasal congestion' },
    { intervention: 'nasal saline spray', category: 'OTC', tagline: 'Saline for nasal moisture' },
    { intervention: 'eucalyptus steam', category: 'Herbal', tagline: 'Steam inhalation for congestion' },
    { intervention: 'menthol inhalation', category: 'Herbal', tagline: 'Menthol for nasal relief' },
    { intervention: 'oxymetazoline spray', category: 'OTC', tagline: 'Topical decongestant' },
    { intervention: 'bromhexine', category: 'OTC', tagline: 'Mucolytic for thick mucus' },
  ],
  sinus_pressure: [
    { intervention: 'nasal saline irrigation', category: 'OTC', tagline: 'Saline rinse for sinus relief' },
    { intervention: 'amoxicillin sinusitis', category: 'Prescription', tagline: 'Antibiotic for bacterial sinusitis' },
    { intervention: 'fluticasone nasal', category: 'OTC', tagline: 'Corticosteroid nasal spray' },
    { intervention: 'steam inhalation', category: 'Lifestyle', tagline: 'Warm steam for sinus pressure' },
    { intervention: 'acetaminophen sinus', category: 'OTC', tagline: 'Pain reliever for sinus pain' },
  ],
  anxiety: [
    { intervention: 'cognitive behavioral therapy', category: 'Lifestyle', tagline: 'Structured therapy for anxiety' },
    { intervention: 'ashwagandha', category: 'Herbal', tagline: 'Adaptogenic herb for anxiety' },
    { intervention: 'lavender oil', category: 'Herbal', tagline: 'Aromatherapy for calm' },
    { intervention: 'l-theanine', category: 'Supplement', tagline: 'Amino acid for relaxation' },
    { intervention: 'chamomile tea', category: 'Herbal', tagline: 'Calming tea for anxiety' },
    { intervention: 'glycine supplement', category: 'Supplement', tagline: 'Amino acid for anxiety relief' },
    { intervention: 'passionflower extract', category: 'Herbal', tagline: 'Herbal for nervous tension' },
  ],
  insomnia: [
    { intervention: 'melatonin', category: 'Supplement', tagline: 'Hormone for sleep onset' },
    { intervention: 'sleep hygiene', category: 'Lifestyle', tagline: 'Behavioral strategies for sleep' },
    { intervention: 'valerian root', category: 'Herbal', tagline: 'Herbal for sleep improvement' },
    { intervention: 'CBT-I', category: 'Lifestyle', tagline: 'Structured program for insomnia' },
    { intervention: 'glycine sleep', category: 'Supplement', tagline: 'Amino acid for sleep quality' },
    { intervention: 'magnesium sleep', category: 'Supplement', tagline: 'Mineral for sleep relaxation' },
  ],
  nausea: [
    { intervention: 'ginger', category: 'Herbal', tagline: 'Herbal for nausea relief' },
    { intervention: 'ondansetron', category: 'Prescription', tagline: 'Antiemetic for nausea' },
    { intervention: 'peppermint oil', category: 'Herbal', tagline: 'Enteric-coated for nausea' },
    { intervention: 'acupressure wristbands', category: 'Lifestyle', tagline: 'Pressure point therapy for nausea' },
    { intervention: 'vitamin B6', category: 'Supplement', tagline: 'Vitamin for morning sickness' },
  ],
  stress: [
    { intervention: 'mindfulness meditation', category: 'Lifestyle', tagline: 'Mindfulness for stress reduction' },
    { intervention: 'regular exercise', category: 'Lifestyle', tagline: 'Physical activity for stress' },
    { intervention: 'rhodiola rosea', category: 'Herbal', tagline: 'Adaptogenic herb for stress' },
    { intervention: 'progressive muscle relaxation', category: 'Lifestyle', tagline: 'Relaxation technique for stress' },
    { intervention: 'magnesium stress', category: 'Supplement', tagline: 'Mineral for nervous system' },
  ],
  burnout: [
    { intervention: 'MBSR', category: 'Lifestyle', tagline: 'Mindfulness program for burnout' },
    { intervention: 'coenzyme Q10', category: 'Supplement', tagline: 'Supplement for fatigue' },
    { intervention: 'workplace boundaries', category: 'Lifestyle', tagline: 'Behavioral strategies for prevention' },
    { intervention: 'B vitamins', category: 'Supplement', tagline: 'Vitamins for energy and stress' },
    { intervention: 'regular aerobic exercise', category: 'Lifestyle', tagline: 'Exercise for burnout recovery' },
  ],
  brain_fog: [
    { intervention: 'omega-3 fatty acids', category: 'Supplement', tagline: 'Fatty acids for cognitive support' },
    { intervention: 'lion mane mushroom', category: 'Herbal', tagline: 'Medicinal mushroom for brain health' },
    { intervention: 'regular exercise', category: 'Lifestyle', tagline: 'Aerobic exercise for cognition' },
    { intervention: 'vitamin D', category: 'Supplement', tagline: 'Vitamin for cognitive support' },
    { intervention: 'curcumin', category: 'Herbal', tagline: 'Anti-inflammatory for brain health' },
    { intervention: 'bacopa monnieri', category: 'Herbal', tagline: 'Ayurvedic herb for memory' },
  ],
  back_pain: [
    { intervention: 'physical therapy', category: 'Lifestyle', tagline: 'Exercise for back pain relief' },
    { intervention: 'yoga stretching', category: 'Lifestyle', tagline: 'Yoga for back flexibility' },
    { intervention: 'TENS unit', category: 'Lifestyle', tagline: 'Electrical nerve stimulation' },
    { intervention: 'tiger balm topical', category: 'Herbal', tagline: 'Topical analgesic for back pain' },
    { intervention: 'core strengthening', category: 'Lifestyle', tagline: 'Exercise for back support' },
    { intervention: 'acupuncture', category: 'Lifestyle', tagline: 'Traditional Chinese medicine for pain' },
  ],
  neck_pain: [
    { intervention: 'cervical pillow', category: 'Lifestyle', tagline: 'Supportive pillow for neck pain' },
    { intervention: 'neck stretching', category: 'Lifestyle', tagline: 'Stretches for neck pain relief' },
    { intervention: 'cervical collar', category: 'Lifestyle', tagline: 'Supportive collar for neck' },
    { intervention: 'ibuprofen neck', category: 'OTC', tagline: 'NSAID for neck inflammation' },
    { intervention: 'hot cold therapy', category: 'Lifestyle', tagline: 'Alternating heat and ice' },
  ],
  shoulder_pain: [
    { intervention: 'rotator cuff exercises', category: 'Lifestyle', tagline: 'Targeted exercise for shoulder' },
    { intervention: 'shoulder sling', category: 'Lifestyle', tagline: 'Supportive sling for shoulder' },
    { intervention: 'NSAID topical', category: 'OTC', tagline: 'Topical anti-inflammatory' },
    { intervention: 'ice pack therapy', category: 'Lifestyle', tagline: 'Cold therapy for shoulder pain' },
    { intervention: 'physical therapy', category: 'Lifestyle', tagline: 'Rehabilitation for shoulder recovery' },
  ],
  joint_pain: [
    { intervention: 'collagen supplement', category: 'Supplement', tagline: 'Protein supplement for joints' },
    { intervention: 'turmeric curcumin', category: 'Herbal', tagline: 'Anti-inflammatory spice for joints' },
    { intervention: 'glucosamine chondroitin', category: 'Supplement', tagline: 'Joint-supporting supplements' },
    { intervention: 'resveratrol', category: 'Supplement', tagline: 'Antioxidant for joint inflammation' },
    { intervention: 'boswellia serrata', category: 'Herbal', tagline: 'Herbal anti-inflammatory' },
    { intervention: 'aquatic exercise', category: 'Lifestyle', tagline: 'Water exercise for joint pain' },
  ],
  muscle_pain: [
    { intervention: 'magnesium', category: 'Supplement', tagline: 'Mineral for muscle pain relief' },
    { intervention: 'tart cherry juice', category: 'Supplement', tagline: 'Natural remedy for soreness' },
    { intervention: 'topical menthol', category: 'OTC', tagline: 'Cooling cream for muscle pain' },
    { intervention: 'protein supplementation', category: 'Supplement', tagline: 'Protein for muscle recovery' },
    { intervention: 'compression garments', category: 'Lifestyle', tagline: 'Supportive clothing for recovery' },
    { intervention: 'stretching routine', category: 'Lifestyle', tagline: 'Stretching for pain prevention' },
  ],
  leg_pain: [
    { intervention: 'compression stockings', category: 'Lifestyle', tagline: 'Compression for leg pain' },
    { intervention: 'leg elevation', category: 'Lifestyle', tagline: 'Positioning for leg relief' },
    { intervention: 'walking exercise', category: 'Lifestyle', tagline: 'Walking for leg circulation' },
    { intervention: 'potassium supplement', category: 'Supplement', tagline: 'Mineral for cramp prevention' },
    { intervention: 'arnica gel', category: 'Herbal', tagline: 'Topical herbal for leg pain' },
  ],
  knee_pain: [
    { intervention: 'quadriceps strengthening', category: 'Lifestyle', tagline: 'Exercise for knee pain' },
    { intervention: 'knee brace support', category: 'Lifestyle', tagline: 'Brace for knee stability' },
    { intervention: 'weight management', category: 'Lifestyle', tagline: 'Weight reduction for knees' },
    { intervention: 'glucosamine', category: 'Supplement', tagline: 'Supplement for cartilage' },
    { intervention: 'tai chi', category: 'Lifestyle', tagline: 'Gentle movement for knees' },
    { intervention: 'hyaluronic acid injection', category: 'Prescription', tagline: 'Joint injection for lubrication' },
  ],
  eye_pain: [
    { intervention: 'artificial tears', category: 'OTC', tagline: 'Lubricating drops for eye pain' },
    { intervention: 'cold compress', category: 'Lifestyle', tagline: 'Cold therapy for eye relief' },
    { intervention: 'lutein supplementation', category: 'Supplement', tagline: 'Antioxidant for eye health' },
    { intervention: 'blue light glasses', category: 'Lifestyle', tagline: 'Filter for screen strain' },
    { intervention: 'eye rest breaks', category: 'Lifestyle', tagline: 'Breaks for eye strain prevention' },
  ],
  eye_strain: [
    { intervention: '20-20-20 rule', category: 'Lifestyle', tagline: 'Regular eye breaks for screens' },
    { intervention: 'computer glasses', category: 'Lifestyle', tagline: 'Lenses for screen work' },
    { intervention: 'artificial tears lubricating', category: 'OTC', tagline: 'Drops for dry eyes' },
    { intervention: 'screen brightness', category: 'Lifestyle', tagline: 'Optimal screen settings' },
    { intervention: 'blink exercises', category: 'Lifestyle', tagline: 'Conscious blinking for moisture' },
  ],
  ear_pain: [
    { intervention: 'ear drops OTC', category: 'OTC', tagline: 'Analgesic drops for ear pain' },
    { intervention: 'warm oil drops', category: 'Herbal', tagline: 'Olive oil for ear comfort' },
    { intervention: 'OTC pain relievers', category: 'OTC', tagline: 'Pain medication for earache' },
    { intervention: 'garlic oil drops', category: 'Herbal', tagline: 'Antibacterial herbal drops' },
    { intervention: 'apple cider vinegar', category: 'Herbal', tagline: 'Natural remedy for ear infections' },
  ],
  sore_throat: [
    { intervention: 'honey lemon water', category: 'Herbal', tagline: 'Soothing drink for throat' },
    { intervention: 'salt water gargle', category: 'Lifestyle', tagline: 'Simple remedy for throat irritation' },
    { intervention: 'throat lozenges', category: 'OTC', tagline: 'Medicated lozenges for throat' },
    { intervention: 'echinacea throat', category: 'Herbal', tagline: 'Herbal for throat infection' },
    { intervention: 'slippery elm', category: 'Herbal', tagline: 'Demulcent herb for throat coating' },
    { intervention: 'ice chips throat', category: 'Lifestyle', tagline: 'Cold therapy for throat pain' },
  ],
  period_cramps: [
    { intervention: 'ibuprofen cramps', category: 'OTC', tagline: 'NSAID for menstrual pain' },
    { intervention: 'heating pad cramps', category: 'Lifestyle', tagline: 'Heat therapy for cramp relief' },
    { intervention: 'ginger tea cramps', category: 'Herbal', tagline: 'Warming tea for menstrual comfort' },
    { intervention: 'magnesium cramps', category: 'Supplement', tagline: 'Mineral for muscle relaxation' },
    { intervention: 'exercise menstruation', category: 'Lifestyle', tagline: 'Light exercise for cramp relief' },
    { intervention: 'transcutaneous nerve stimulation', category: 'Lifestyle', tagline: 'TENS for menstrual pain relief' },
  ],
  pms: [
    { intervention: 'calcium supplementation', category: 'Supplement', tagline: 'Mineral for PMS relief' },
    { intervention: 'chasteberry', category: 'Herbal', tagline: 'Herbal for PMS symptoms' },
    { intervention: 'evening primrose oil', category: 'Supplement', tagline: 'Essential fatty acid for PMS' },
    { intervention: 'vitamin B6', category: 'Supplement', tagline: 'Vitamin for PMS mood support' },
    { intervention: 'SSRI for PMS', category: 'Prescription', tagline: 'Antidepressant for severe PMS' },
    { intervention: 'exercise PMS', category: 'Lifestyle', tagline: 'Physical activity for PMS relief' },
  ],
  menopause: [
    { intervention: 'black cohosh', category: 'Herbal', tagline: 'Herbal for menopausal symptoms' },
    { intervention: 'soy isoflavones', category: 'Supplement', tagline: 'Plant estrogens for menopause' },
    { intervention: 'red clover', category: 'Herbal', tagline: 'Herbal for hot flashes' },
    { intervention: 'vitamin E', category: 'Supplement', tagline: 'Antioxidant for menopause' },
    { intervention: 'dong quai', category: 'Herbal', tagline: 'Herbal for menopausal balance' },
    { intervention: 'hormone replacement', category: 'Prescription', tagline: 'Hormones for symptom relief' },
  ],
  fever: [
    { intervention: 'ibuprofen fever', category: 'OTC', tagline: 'NSAID for fever reduction' },
    { intervention: 'acetaminophen fever', category: 'OTC', tagline: 'First-line fever reducer' },
    { intervention: 'physical cooling', category: 'Lifestyle', tagline: 'External cooling for comfort' },
    { intervention: 'elderberry immune', category: 'Herbal', tagline: 'Herbal for immune support' },
    { intervention: 'oral rehydration', category: 'OTC', tagline: 'Rehydration for fluid loss' },
  ],
  skin_rash: [
    { intervention: 'hydrocortisone cream', category: 'OTC', tagline: 'Topical steroid for rash' },
    { intervention: 'calamine lotion', category: 'OTC', tagline: 'Soothing lotion for rashes' },
    { intervention: 'colloidal oatmeal bath', category: 'Herbal', tagline: 'Natural remedy for irritation' },
    { intervention: 'antihistamine oral', category: 'OTC', tagline: 'Oral medication for itching' },
    { intervention: 'aloe vera gel', category: 'Herbal', tagline: 'Cooling gel for inflammation' },
  ],
  dry_skin: [
    { intervention: 'emollient moisturizer', category: 'OTC', tagline: 'Thick moisturizer for dry skin' },
    { intervention: 'hyaluronic acid serum', category: 'Supplement', tagline: 'Hydrating serum for moisture' },
    { intervention: 'ceramide cream', category: 'OTC', tagline: 'Skin barrier repair cream' },
    { intervention: 'coconut oil topical', category: 'Herbal', tagline: 'Natural oil for hydration' },
    { intervention: 'oatmeal bath', category: 'Herbal', tagline: 'Colloidal oatmeal for soothing' },
  ],
  acne: [
    { intervention: 'benzoyl peroxide', category: 'OTC', tagline: 'Antimicrobial for acne' },
    { intervention: 'niacinamide', category: 'Supplement', tagline: 'Vitamin B3 for acne-prone skin' },
    { intervention: 'salicylic acid', category: 'OTC', tagline: 'BHA for acne treatment' },
    { intervention: 'retinoid topical', category: 'Prescription', tagline: 'Vitamin A for acne prevention' },
    { intervention: 'tea tree oil', category: 'Herbal', tagline: 'Antibacterial essential oil' },
    { intervention: 'zinc supplement', category: 'Supplement', tagline: 'Mineral for acne support' },
  ],
  bloating: [
    { intervention: 'probiotics', category: 'Supplement', tagline: 'Beneficial bacteria for gut health' },
    { intervention: 'fennel tea', category: 'Herbal', tagline: 'Carminative tea for bloating' },
    { intervention: 'digestive enzymes', category: 'Supplement', tagline: 'Enzymes for food breakdown' },
    { intervention: 'peppermint oil enteric', category: 'Herbal', tagline: 'Enteric-coated for IBS bloating' },
    { intervention: 'activated charcoal', category: 'OTC', tagline: 'Supplement for gas relief' },
  ],
  indigestion: [
    { intervention: 'ginger supplement', category: 'Herbal', tagline: 'Herbal for dyspepsia' },
    { intervention: 'antacid tablets', category: 'OTC', tagline: 'Quick relief for indigestion' },
    { intervention: 'deglycyrrhizinated licorice', category: 'Herbal', tagline: 'Herbal for digestive comfort' },
    { intervention: 'probiotic supplements', category: 'Supplement', tagline: 'Beneficial bacteria for gut' },
    { intervention: 'apple cider vinegar', category: 'Herbal', tagline: 'Natural remedy for indigestion' },
    { intervention: 'fennel seeds', category: 'Herbal', tagline: 'Chewed seeds for stomach comfort' },
  ],
  heartburn: [
    { intervention: 'calcium carbonate antacid', category: 'OTC', tagline: 'Rapid-acting antacid' },
    { intervention: 'famotidine H2 blocker', category: 'OTC', tagline: 'H2 blocker for heartburn' },
    { intervention: 'deglycyrrhizinated licorice', category: 'Herbal', tagline: 'Herbal for heartburn relief' },
    { intervention: 'ginger tea heartburn', category: 'Herbal', tagline: 'Warming tea for digestion' },
    { intervention: 'baking soda water', category: 'Lifestyle', tagline: 'Home remedy for heartburn' },
    { intervention: 'elevate head sleep', category: 'Lifestyle', tagline: 'Positioning for nighttime reflux' },
  ],
  constipation: [
    { intervention: 'polyethylene glycol', category: 'OTC', tagline: 'Osmotic laxative for constipation' },
    { intervention: 'psyllium husk', category: 'Supplement', tagline: 'Bulk-forming fiber supplement' },
    { intervention: 'senna', category: 'Herbal', tagline: 'Stimulant laxative for relief' },
    { intervention: 'prune juice', category: 'Herbal', tagline: 'Natural laxative for constipation' },
    { intervention: 'docusate sodium', category: 'OTC', tagline: 'Stool softener for gentle relief' },
    { intervention: 'ground flaxseed', category: 'Supplement', tagline: 'Fiber source for constipation' },
  ],
  diarrhea: [
    { intervention: 'loperamide', category: 'OTC', tagline: 'Anti-diarrheal for symptom control' },
    { intervention: 'oral rehydration salts', category: 'OTC', tagline: 'Rehydration for fluid loss' },
    { intervention: 'probiotics lactobacillus', category: 'Supplement', tagline: 'Beneficial bacteria for recovery' },
    { intervention: 'bismuth subsalicylate', category: 'OTC', tagline: 'Antidiarrheal for traveler diarrhea' },
    { intervention: 'BRAT diet', category: 'Lifestyle', tagline: 'Dietary management for diarrhea' },
  ],
  stomach_ache: [
    { intervention: 'peppermint oil enteric', category: 'Herbal', tagline: 'Enteric-coated for abdominal pain' },
    { intervention: 'antacid tablets', category: 'OTC', tagline: 'Quick relief for stomach acid' },
    { intervention: 'ginger tea stomach', category: 'Herbal', tagline: 'Soothing tea for discomfort' },
    { intervention: 'fennel seeds', category: 'Herbal', tagline: 'Chewed seeds for cramp relief' },
    { intervention: 'heating pad', category: 'Lifestyle', tagline: 'Warmth for abdominal pain' },
    { intervention: 'dicyclomine', category: 'Prescription', tagline: 'Antispasmodic for cramps' },
  ],
  gas: [
    { intervention: 'simethicone', category: 'OTC', tagline: 'Anti-flatulent for gas relief' },
    { intervention: 'activated charcoal', category: 'OTC', tagline: 'Supplement for intestinal gas' },
    { intervention: 'fennel tea gas', category: 'Herbal', tagline: 'Carminative tea for gas' },
    { intervention: 'digestive enzymes gas', category: 'Supplement', tagline: 'Enzymes for gas prevention' },
    { intervention: 'probiotic supplements', category: 'Supplement', tagline: 'Beneficial bacteria for gut' },
  ],
  hangover: [
    { intervention: 'electrolyte solution', category: 'OTC', tagline: 'Rehydration for hangover recovery' },
    { intervention: 'vitamin B complex', category: 'Supplement', tagline: 'B vitamins for metabolism support' },
    { intervention: 'N-acetyl cysteine', category: 'Supplement', tagline: 'Amino acid for liver support' },
    { intervention: 'ginger tea hangover', category: 'Herbal', tagline: 'Soothing tea for nausea' },
    { intervention: 'sleep rest hangover', category: 'Lifestyle', tagline: 'Adequate sleep for recovery' },
  ],
  fatigue: [
    { intervention: 'iron supplementation', category: 'Supplement', tagline: 'Iron for deficiency fatigue' },
    { intervention: 'coenzyme Q10', category: 'Supplement', tagline: 'Cellular energy support' },
    { intervention: 'regular aerobic exercise', category: 'Lifestyle', tagline: 'Exercise for energy improvement' },
    { intervention: 'vitamin D', category: 'Supplement', tagline: 'Vitamin for energy support' },
    { intervention: 'ashwagandha', category: 'Herbal', tagline: 'Adaptogenic herb for energy' },
    { intervention: 'rhodiola rosea', category: 'Herbal', tagline: 'Adaptogenic herb for stamina' },
  ],
  low_energy: [
    { intervention: 'iron supplementation energy', category: 'Supplement', tagline: 'Iron for energy support' },
    { intervention: 'B12 supplementation', category: 'Supplement', tagline: 'Vitamin for energy production' },
    { intervention: 'regular exercise energy', category: 'Lifestyle', tagline: 'Physical activity for boost' },
    { intervention: 'rhodiola rosea energy', category: 'Herbal', tagline: 'Adaptogenic herb for stamina' },
    { intervention: 'adequate sleep', category: 'Lifestyle', tagline: 'Sleep optimization for energy' },
  ],
  dehydration: [
    { intervention: 'oral rehydration solution', category: 'OTC', tagline: 'WHO-recommended rehydration' },
    { intervention: 'coconut water', category: 'Herbal', tagline: 'Natural electrolyte drink' },
    { intervention: 'electrolyte tablets', category: 'OTC', tagline: 'Dissolvable tablets for rehydration' },
    { intervention: 'water intake increase', category: 'Lifestyle', tagline: 'Adequate daily water consumption' },
    { intervention: 'watermelon hydrating', category: 'Herbal', tagline: 'Hydrating fruit for fluid' },
  ],
  allergies: [
    { intervention: 'loratadine', category: 'OTC', tagline: 'Non-drowsy antihistamine' },
    { intervention: 'nasal corticosteroid spray', category: 'OTC', tagline: 'Nasal spray for allergy control' },
    { intervention: 'cetirizine', category: 'OTC', tagline: 'Second-generation antihistamine' },
    { intervention: 'quercetin', category: 'Supplement', tagline: 'Plant flavonoid for allergy relief' },
    { intervention: 'nasal saline rinse', category: 'Lifestyle', tagline: 'Nasal irrigation for relief' },
  ],
  asthma: [
    { intervention: 'inhaled corticosteroid', category: 'Prescription', tagline: 'Controller therapy for asthma' },
    { intervention: 'omega-3 fatty acids', category: 'Supplement', tagline: 'Anti-inflammatory for asthma' },
    { intervention: 'rescue inhaler albuterol', category: 'Prescription', tagline: 'Bronchodilator for acute relief' },
    { intervention: 'breathing exercises', category: 'Lifestyle', tagline: 'Buteyko breathing for asthma' },
    { intervention: 'vitamin D supplementation', category: 'Supplement', tagline: 'Vitamin for asthma control' },
  ],
  hives: [
    { intervention: 'cetirizine hives', category: 'OTC', tagline: 'Antihistamine for hives' },
    { intervention: 'fexofenadine hives', category: 'OTC', tagline: 'Non-drowsy antihistamine' },
    { intervention: 'cold compress hives', category: 'Lifestyle', tagline: 'Cold therapy for itch relief' },
    { intervention: 'colloidal oatmeal bath', category: 'Herbal', tagline: 'Soothing bath for hives' },
    { intervention: 'quercetin supplement', category: 'Supplement', tagline: 'Natural antihistamine' },
  ],
  allergic_reaction: [
    { intervention: 'cetirizine allergic', category: 'OTC', tagline: 'Antihistamine for allergic symptoms' },
    { intervention: 'quercetin allergic', category: 'Supplement', tagline: 'Plant flavonoid for allergies' },
    { intervention: 'diphenhydramine allergic', category: 'OTC', tagline: 'Antihistamine for acute reaction' },
    { intervention: 'epinephrine auto-injector', category: 'Prescription', tagline: 'Emergency for severe reaction' },
    { intervention: 'cromolyn sodium', category: 'Prescription', tagline: 'Mast cell stabilizer for prevention' },
  ],
  uti: [
    { intervention: 'cranberry supplement', category: 'Supplement', tagline: 'Supplement for UTI prevention' },
    { intervention: 'd-mannose', category: 'Supplement', tagline: 'Simple sugar for UTI prevention' },
    { intervention: 'antibiotics prescribed', category: 'Prescription', tagline: 'Antibiotic therapy for UTI' },
    { intervention: 'probiotic lactobacillus', category: 'Supplement', tagline: 'Beneficial bacteria for UTI health' },
    { intervention: 'adequate water intake', category: 'Lifestyle', tagline: 'Increased fluids for prevention' },
  ],
  kidney_stone: [
    { intervention: 'tamsulosin', category: 'Prescription', tagline: 'Medication to pass kidney stones' },
    { intervention: 'potassium citrate', category: 'Supplement', tagline: 'Urine alkalinizer for prevention' },
    { intervention: 'increased water intake', category: 'Lifestyle', tagline: 'High fluid intake for prevention' },
    { intervention: 'citric acid supplementation', category: 'Supplement', tagline: 'Supplement for stone prevention' },
    { intervention: 'low oxalate diet', category: 'Lifestyle', tagline: 'Dietary changes for prevention' },
  ],
  frequent_urination: [
    { intervention: 'pelvic floor training', category: 'Lifestyle', tagline: 'Bladder training for frequency' },
    { intervention: 'timed voiding', category: 'Lifestyle', tagline: 'Scheduled bathroom visits' },
    { intervention: 'desmopressin', category: 'Prescription', tagline: 'Hormone for nighttime urination' },
    { intervention: 'oxybutynin', category: 'Prescription', tagline: 'Anticholinergic for bladder control' },
    { intervention: 'caffeine reduction', category: 'Lifestyle', tagline: 'Reducing bladder irritants' },
  ],
  urinary_incontinence: [
    { intervention: 'kegel exercises', category: 'Lifestyle', tagline: 'Pelvic floor strengthening' },
    { intervention: 'bladder training', category: 'Lifestyle', tagline: 'Timed voiding for control' },
    { intervention: 'timed voiding schedule', category: 'Lifestyle', tagline: 'Regular bathroom schedule' },
    { intervention: 'absorbent pads', category: 'OTC', tagline: 'Protective products for incontinence' },
    { intervention: 'pessary device', category: 'Prescription', tagline: 'Supportive device for stress incontinence' },
    { intervention: 'duloxetine', category: 'Prescription', tagline: 'SNRI for stress incontinence' },
  ],
  yeast_infection: [
    { intervention: 'fluconazole oral', category: 'Prescription', tagline: 'Oral antifungal for candidiasis' },
    { intervention: 'probiotic lactobacillus', category: 'Supplement', tagline: 'Beneficial bacteria for prevention' },
    { intervention: 'clotrimazole topical', category: 'OTC', tagline: 'Topical antifungal for infection' },
    { intervention: 'boric acid suppository', category: 'OTC', tagline: 'Vaginal suppository for infection' },
    { intervention: 'garlic supplement', category: 'Herbal', tagline: 'Antifungal supplement for prevention' },
  ],
  prostate_issues: [
    { intervention: 'saw palmetto', category: 'Herbal', tagline: 'Herbal for urinary symptoms in BPH' },
    { intervention: 'beta-sitosterol', category: 'Supplement', tagline: 'Plant sterol for prostate health' },
    { intervention: 'tamsulosin BPH', category: 'Prescription', tagline: 'Alpha-blocker for urinary symptoms' },
    { intervention: 'finasteride', category: 'Prescription', tagline: '5-ARI for BPH' },
    { intervention: 'pygeum', category: 'Herbal', tagline: 'Herbal for prostate health' },
  ],
  testicular_pain: [
    { intervention: 'scrotal support', category: 'Lifestyle', tagline: 'Supportive garment for discomfort' },
    { intervention: 'ibuprofen testicular', category: 'OTC', tagline: 'NSAID for pain relief' },
    { intervention: 'ice pack therapy', category: 'Lifestyle', tagline: 'Cold therapy for pain relief' },
    { intervention: 'scrotal elevation', category: 'Lifestyle', tagline: 'Positioning for pain relief' },
    { intervention: 'warm sitz bath', category: 'Lifestyle', tagline: 'Warm water therapy for comfort' },
  ],
  pelvic_pain: [
    { intervention: 'pelvic floor physical therapy', category: 'Lifestyle', tagline: 'Rehabilitation for pelvic pain' },
    { intervention: 'heat therapy', category: 'Lifestyle', tagline: 'Warmth for pelvic pain comfort' },
    { intervention: 'ibuprofen pelvic', category: 'OTC', tagline: 'NSAID for pelvic inflammation' },
    { intervention: 'yoga for pelvic pain', category: 'Lifestyle', tagline: 'Gentle yoga for relaxation' },
    { intervention: 'stress management', category: 'Lifestyle', tagline: 'Relaxation for chronic pelvic pain' },
  ],
  breast_pain: [
    { intervention: 'evening primrose oil', category: 'Supplement', tagline: 'Herbal supplement for mastalgia' },
    { intervention: 'supportive bra', category: 'Lifestyle', tagline: 'Proper support for pain relief' },
    { intervention: 'vitamin E supplementation', category: 'Supplement', tagline: 'Antioxidant for breast pain' },
    { intervention: 'NSAID topical', category: 'OTC', tagline: 'Topical anti-inflammatory for pain' },
    { intervention: 'hot compress', category: 'Lifestyle', tagline: 'Warmth for breast comfort' },
  ],
  endometriosis: [
    { intervention: 'laparoscopic excision surgery', category: 'Surgical', tagline: 'Surgical removal of lesions' },
    { intervention: 'pelvic floor physical therapy', category: 'Lifestyle', tagline: 'Physical therapy for endo pain' },
    { intervention: 'hormonal contraceptive therapy', category: 'Prescription', tagline: 'Hormonal management for endo' },
    { intervention: 'anti-inflammatory diet', category: 'Lifestyle', tagline: 'Dietary changes for management' },
    { intervention: 'acupuncture endometriosis', category: 'Lifestyle', tagline: 'Acupuncture for pelvic pain' },
  ],
  toothache: [
    { intervention: 'clove oil', category: 'Herbal', tagline: 'Herbal topical for toothache' },
    { intervention: 'ibuprofen toothache', category: 'OTC', tagline: 'NSAID for dental pain' },
    { intervention: 'benzocaine topical', category: 'OTC', tagline: 'Numbing gel for tooth pain' },
    { intervention: 'salt water rinse', category: 'Lifestyle', tagline: 'Simple rinse for dental pain' },
    { intervention: 'cold compress tooth', category: 'Lifestyle', tagline: 'Cold therapy for toothache' },
  ],
  canker_sore: [
    { intervention: 'amlexanox', category: 'OTC', tagline: 'Topical paste for aphthous ulcers' },
    { intervention: 'hydrogen peroxide rinse', category: 'Lifestyle', tagline: 'Antiseptic rinse for mouth sores' },
    { intervention: 'vitamin B12 canker', category: 'Supplement', tagline: 'Vitamin for canker sore prevention' },
    { intervention: 'lycopene', category: 'Supplement', tagline: 'Antioxidant for oral health' },
    { intervention: 'SLS-free toothpaste', category: 'Lifestyle', tagline: 'Gentle toothpaste for prevention' },
  ],
  gum_pain: [
    { intervention: 'salt water rinse gum', category: 'Lifestyle', tagline: 'Simple rinse for gum discomfort' },
    { intervention: 'antibacterial mouthwash', category: 'OTC', tagline: 'Rinse for gum infection prevention' },
    { intervention: 'warm compress gum', category: 'Lifestyle', tagline: 'Heat therapy for gum pain' },
    { intervention: 'clove oil gum', category: 'Herbal', tagline: 'Numbing oil for gum pain' },
    { intervention: 'tea tree oil mouthwash', category: 'Herbal', tagline: 'Antibacterial rinse for gum health' },
  ],
  bad_breath: [
    { intervention: 'chlorhexidine mouthwash', category: 'OTC', tagline: 'Antibacterial rinse for halitosis' },
    { intervention: 'tongue scraper', category: 'Lifestyle', tagline: 'Device for tongue bacteria removal' },
    { intervention: 'parsley chewing', category: 'Herbal', tagline: 'Natural breath freshener' },
    { intervention: 'probiotic lozenges', category: 'Supplement', tagline: 'Beneficial bacteria for oral health' },
    { intervention: 'green tea rinse', category: 'Herbal', tagline: 'Antimicrobial rinse for breath' },
  ],
  tmj_pain: [
    { intervention: 'occlusal splint', category: 'Lifestyle', tagline: 'Dental appliance for jaw pain' },
    { intervention: 'jaw relaxation exercises', category: 'Lifestyle', tagline: 'Exercises for TMJ relaxation' },
    { intervention: 'bite adjustment', category: 'Lifestyle', tagline: 'Dental adjustment for alignment' },
    { intervention: 'soft food diet', category: 'Lifestyle', tagline: 'Dietary modification for rest' },
    { intervention: 'NSAID topical gel', category: 'OTC', tagline: 'Topical anti-inflammatory for TMJ' },
  ],
  dry_mouth: [
    { intervention: 'xylitol', category: 'OTC', tagline: 'Sugar substitute that stimulates saliva' },
    { intervention: 'biotene', category: 'OTC', tagline: 'Commercial saliva substitute products' },
    { intervention: 'artificial saliva spray', category: 'OTC', tagline: 'Spray for dry mouth relief' },
    { intervention: 'increase water intake', category: 'Lifestyle', tagline: 'Adequate hydration for oral moisture' },
    { intervention: 'sugar-free gum', category: 'Lifestyle', tagline: 'Chewing gum for saliva stimulation' },
  ],
  cold_sore: [
    { intervention: 'acyclovir topical', category: 'OTC', tagline: 'Antiviral cream for cold sores' },
    { intervention: 'docosanol cream', category: 'OTC', tagline: 'OTC antiviral for prevention' },
    { intervention: 'lysine supplementation', category: 'Supplement', tagline: 'Amino acid for prevention' },
    { intervention: 'zinc oxide cream', category: 'OTC', tagline: 'Protective cream for healing' },
    { intervention: 'lemon balm cream', category: 'Herbal', tagline: 'Herbal topical for relief' },
  ],
  ankle_pain: [
    { intervention: 'ankle brace', category: 'Lifestyle', tagline: 'Support for ankle stability' },
    { intervention: 'RICE protocol', category: 'Lifestyle', tagline: 'Rest ice compression elevation' },
    { intervention: 'physical therapy exercises', category: 'Lifestyle', tagline: 'Exercises for ankle recovery' },
    { intervention: 'NSAID topical gel', category: 'OTC', tagline: 'Topical anti-inflammatory' },
    { intervention: 'balance training', category: 'Lifestyle', tagline: 'Proprioception exercises for stability' },
  ],
  wrist_pain: [
    { intervention: 'wrist splint', category: 'Lifestyle', tagline: 'Immobilization for pain relief' },
    { intervention: 'carpal tunnel exercises', category: 'Lifestyle', tagline: 'Exercises for nerve relief' },
    { intervention: 'NSAID topical gel', category: 'OTC', tagline: 'Topical anti-inflammatory' },
    { intervention: 'ergonomic workstation', category: 'Lifestyle', tagline: 'Workspace optimization for comfort' },
    { intervention: 'wrist stretching', category: 'Lifestyle', tagline: 'Daily stretches for flexibility' },
  ],
  hip_pain: [
    { intervention: 'gluteal strengthening', category: 'Lifestyle', tagline: 'Targeted exercise for hip pain' },
    { intervention: 'physical therapy hip', category: 'Lifestyle', tagline: 'Rehabilitation for hip recovery' },
    { intervention: 'hip brace support', category: 'Lifestyle', tagline: 'Supportive brace for stability' },
    { intervention: 'NSAID topical gel', category: 'OTC', tagline: 'Topical anti-inflammatory' },
    { intervention: 'tai chi hip', category: 'Lifestyle', tagline: 'Gentle movement for hip improvement' },
  ],
  elbow_pain: [
    { intervention: 'counterforce brace', category: 'Lifestyle', tagline: 'Brace for lateral epicondylitis' },
    { intervention: 'eccentric exercise', category: 'Lifestyle', tagline: 'Exercises for tennis elbow' },
    { intervention: 'NSAID topical gel', category: 'OTC', tagline: 'Topical anti-inflammatory' },
    { intervention: 'ice massage therapy', category: 'Lifestyle', tagline: 'Cold therapy for elbow pain' },
    { intervention: 'ergonomic mouse pad', category: 'Lifestyle', tagline: 'Supportive pad for elbow comfort' },
  ],
  foot_pain: [
    { intervention: 'custom orthotic insole', category: 'Lifestyle', tagline: 'Arch support for foot pain' },
    { intervention: 'plantar fascia stretching', category: 'Lifestyle', tagline: 'Stretches for plantar fasciitis' },
    { intervention: 'night splint', category: 'Lifestyle', tagline: 'Splint for morning foot pain' },
    { intervention: 'NSAID topical gel', category: 'OTC', tagline: 'Topical anti-inflammatory' },
    { intervention: 'proper footwear', category: 'Lifestyle', tagline: 'Supportive shoes for foot pain' },
  ],
  hand_pain: [
    { intervention: 'wrist splint hand', category: 'Lifestyle', tagline: 'Immobilization for hand pain' },
    { intervention: 'hand strengthening exercises', category: 'Lifestyle', tagline: 'Exercises for hand recovery' },
    { intervention: 'NSAID topical gel', category: 'OTC', tagline: 'Topical anti-inflammatory' },
    { intervention: 'paraffin wax bath', category: 'Lifestyle', tagline: 'Warm therapy for hand joints' },
    { intervention: 'ergonomic tool grips', category: 'Lifestyle', tagline: 'Adaptive grips for comfort' },
  ],
  eczema: [
    { intervention: 'moisturizer emollient', category: 'OTC', tagline: 'Thick moisturizer for eczema' },
    { intervention: 'hydrocortisone cream', category: 'OTC', tagline: 'Topical steroid for flare-ups' },
    { intervention: 'colloidal oatmeal bath', category: 'Herbal', tagline: 'Soothing bath for eczema' },
    { intervention: 'ceramide cream', category: 'OTC', tagline: 'Skin barrier repair for eczema' },
    { intervention: 'probiotic supplementation', category: 'Supplement', tagline: 'Beneficial bacteria for skin' },
  ],
  psoriasis: [
    { intervention: 'vitamin D analogue', category: 'Prescription', tagline: 'Topical vitamin D for psoriasis' },
    { intervention: 'salicylic acid', category: 'OTC', tagline: 'Keratolytic for scale removal' },
    { intervention: 'coal tar preparation', category: 'OTC', tagline: 'Traditional treatment for psoriasis' },
    { intervention: 'moisturizer emollient', category: 'OTC', tagline: 'Thick moisturizer for psoriasis' },
    { intervention: 'turmeric supplement', category: 'Herbal', tagline: 'Anti-inflammatory spice for psoriasis' },
  ],
  sunburn: [
    { intervention: 'aloe vera topical', category: 'Herbal', tagline: 'Cooling gel for sunburn relief' },
    { intervention: 'hydrocortisone cream', category: 'OTC', tagline: 'Topical steroid for inflammation' },
    { intervention: 'cool compress', category: 'Lifestyle', tagline: 'Cold therapy for sunburn comfort' },
    { intervention: 'oral NSAID', category: 'OTC', tagline: 'Oral anti-inflammatory for pain' },
    { intervention: 'moisturizer after sun', category: 'OTC', tagline: 'Hydrating lotion for recovery' },
  ],
  fungal_infection: [
    { intervention: 'clotrimazole', category: 'OTC', tagline: 'Topical antifungal for infections' },
    { intervention: 'terbinafine', category: 'OTC', tagline: 'Topical antifungal for nail and skin' },
    { intervention: 'tea tree oil', category: 'Herbal', tagline: 'Antifungal essential oil' },
    { intervention: 'probiotic supplementation', category: 'Supplement', tagline: 'Beneficial bacteria for prevention' },
    { intervention: 'garlic supplement', category: 'Herbal', tagline: 'Antifungal supplement for infections' },
  ],
  rosacea: [
    { intervention: 'metronidazole topical', category: 'Prescription', tagline: 'Topical antibiotic for rosacea' },
    { intervention: 'azelaic acid', category: 'Prescription', tagline: 'Topical acid for rosacea management' },
    { intervention: 'ivermectin topical', category: 'Prescription', tagline: 'Topical antiparasitic for rosacea' },
    { intervention: 'green tea extract topical', category: 'Herbal', tagline: 'Anti-inflammatory for redness' },
    { intervention: 'sunscreen daily', category: 'Lifestyle', tagline: 'UV protection for prevention' },
  ],
  sleep_apnea: [
    { intervention: 'continuous positive airway pressure', category: 'Lifestyle', tagline: 'Gold standard treatment for OSA' },
    { intervention: 'oral appliance therapy', category: 'Lifestyle', tagline: 'Dental device for mild sleep apnea' },
    { intervention: 'weight management', category: 'Lifestyle', tagline: 'Weight reduction for improvement' },
    { intervention: 'positional therapy', category: 'Lifestyle', tagline: 'Side sleeping for management' },
    { intervention: 'throat exercises', category: 'Lifestyle', tagline: 'Strengthening exercises for airway' },
  ],
  restless_leg: [
    { intervention: 'iron supplementation', category: 'Supplement', tagline: 'Iron for restless leg relief' },
    { intervention: 'regular exercise', category: 'Lifestyle', tagline: 'Moderate exercise for improvement' },
    { intervention: 'magnesium supplementation', category: 'Supplement', tagline: 'Mineral for muscle relaxation' },
    { intervention: 'hot cold compress', category: 'Lifestyle', tagline: 'Alternating heat and ice for comfort' },
    { intervention: 'leg massage', category: 'Lifestyle', tagline: 'Massage therapy for relief' },
  ],
  night_sweats: [
    { intervention: 'clonidine', category: 'Prescription', tagline: 'Medication for night sweats' },
    { intervention: 'black cohosh', category: 'Herbal', tagline: 'Herbal for menopausal sweats' },
    { intervention: 'breathable sleepwear', category: 'Lifestyle', tagline: 'Moisture-wicking clothing' },
    { intervention: 'bedroom temperature control', category: 'Lifestyle', tagline: 'Cool sleeping environment' },
    { intervention: 'vitamin E supplementation', category: 'Supplement', tagline: 'Antioxidant for menopause' },
  ],
  teeth_grinding: [
    { intervention: 'night guard', category: 'Lifestyle', tagline: 'Dental appliance for grinding' },
    { intervention: 'stress management', category: 'Lifestyle', tagline: 'Relaxation for bruxism prevention' },
    { intervention: 'jaw relaxation exercises', category: 'Lifestyle', tagline: 'Exercises for jaw relaxation' },
    { intervention: 'bite adjustment', category: 'Lifestyle', tagline: 'Dental adjustment for alignment' },
    { intervention: 'muscle relaxant', category: 'Prescription', tagline: 'Medication for severe bruxism' },
  ],
  tinnitus: [
    { intervention: 'sound therapy', category: 'Lifestyle', tagline: 'Background sound for habituation' },
    { intervention: 'hearing aid use', category: 'Lifestyle', tagline: 'Amplification for tinnitus relief' },
    { intervention: 'ginkgo biloba', category: 'Herbal', tagline: 'Herbal supplement for tinnitus' },
    { intervention: 'CBT for tinnitus', category: 'Lifestyle', tagline: 'Therapy for distress management' },
    { intervention: 'masking devices', category: 'Lifestyle', tagline: 'Sound generators for masking' },
  ],
  vertigo: [
    { intervention: 'Epley maneuver', category: 'Lifestyle', tagline: 'Repositioning maneuver for BPPV' },
    { intervention: 'meclizine', category: 'OTC', tagline: 'Antihistamine for vertigo relief' },
    { intervention: 'Brandt-Daroff exercises', category: 'Lifestyle', tagline: 'Exercises for habituation' },
    { intervention: 'vitamin D supplementation', category: 'Supplement', tagline: 'Vitamin for vestibular health' },
    { intervention: 'ginger tea vertigo', category: 'Herbal', tagline: 'Natural remedy for vertigo nausea' },
  ],
  neuropathy: [
    { intervention: 'alpha-lipoic acid', category: 'Supplement', tagline: 'Antioxidant for neuropathic pain' },
    { intervention: 'capsaicin topical cream', category: 'OTC', tagline: 'Topical cream for nerve pain' },
    { intervention: 'B vitamins complex', category: 'Supplement', tagline: 'Vitamins for nerve health' },
    { intervention: 'acupuncture', category: 'Lifestyle', tagline: 'Traditional Chinese medicine for pain' },
    { intervention: 'TENS therapy', category: 'Lifestyle', tagline: 'Electrical stimulation for pain' },
  ],
  sciatica: [
    { intervention: 'McKenzie method', category: 'Lifestyle', tagline: 'Physiotherapy approach for sciatica' },
    { intervention: 'mckenzie exercises', category: 'Lifestyle', tagline: 'Exercises for disc-related sciatica' },
    { intervention: 'nerve glides', category: 'Lifestyle', tagline: 'Mobilization exercises for sciatica' },
    { intervention: 'heat cold therapy', category: 'Lifestyle', tagline: 'Alternating heat and ice' },
    { intervention: 'yoga for sciatica', category: 'Lifestyle', tagline: 'Gentle yoga for sciatica relief' },
  ],
  palpitations: [
    { intervention: 'magnesium supplementation', category: 'Supplement', tagline: 'Mineral for heart rhythm support' },
    { intervention: 'deep breathing exercises', category: 'Lifestyle', tagline: 'Breathing techniques for relief' },
    { intervention: 'reduced caffeine intake', category: 'Lifestyle', tagline: 'Caffeine reduction for prevention' },
    { intervention: 'coenzyme Q10', category: 'Supplement', tagline: 'Supplement for heart health' },
    { intervention: 'vagal maneuver techniques', category: 'Lifestyle', tagline: 'Techniques to stop palpitations' },
  ],
  poor_circulation: [
    { intervention: 'regular aerobic exercise', category: 'Lifestyle', tagline: 'Physical activity for circulation' },
    { intervention: 'compression stockings', category: 'Lifestyle', tagline: 'Graduated compression for veins' },
    { intervention: 'cayenne pepper supplement', category: 'Herbal', tagline: 'Spice for circulation support' },
    { intervention: 'leg elevation', category: 'Lifestyle', tagline: 'Positioning for circulation improvement' },
    { intervention: 'ginger tea circulation', category: 'Herbal', tagline: 'Warming tea for circulation' },
  ],
  edema: [
    { intervention: 'leg elevation', category: 'Lifestyle', tagline: 'Positioning for edema relief' },
    { intervention: 'compression therapy', category: 'Lifestyle', tagline: 'External compression for management' },
    { intervention: 'dandelion tea', category: 'Herbal', tagline: 'Natural diuretic for fluid retention' },
    { intervention: 'reduce sodium intake', category: 'Lifestyle', tagline: 'Dietary changes for edema prevention' },
    { intervention: 'horse chestnut extract', category: 'Herbal', tagline: 'Herbal for venous insufficiency' },
  ],
  anemia: [
    { intervention: 'ferrous sulfate', category: 'Supplement', tagline: 'Standard oral iron supplementation' },
    { intervention: 'vitamin C with iron', category: 'Supplement', tagline: 'Iron absorption enhancer' },
    { intervention: 'iron-rich foods', category: 'Lifestyle', tagline: 'Dietary iron for anemia prevention' },
    { intervention: 'folate supplementation', category: 'Supplement', tagline: 'B vitamin for red blood cells' },
    { intervention: 'liver extract supplement', category: 'Supplement', tagline: 'Natural iron source for anemia' },
  ],
  arthritis: [
    { intervention: 'glucosamine', category: 'Supplement', tagline: 'Supplement for joint pain' },
    { intervention: 'turmeric curcumin', category: 'Herbal', tagline: 'Anti-inflammatory spice for arthritis' },
    { intervention: 'fish oil omega-3', category: 'Supplement', tagline: 'Fatty acids for joint inflammation' },
    { intervention: 'boswellia serrata', category: 'Herbal', tagline: 'Herbal anti-inflammatory for joints' },
    { intervention: 'physical therapy exercises', category: 'Lifestyle', tagline: 'Joint-friendly exercises' },
  ],
  ibs: [
    { intervention: 'low FODMAP diet', category: 'Lifestyle', tagline: 'Dietary restriction for IBS relief' },
    { intervention: 'peppermint oil enteric', category: 'Herbal', tagline: 'Enteric-coated for IBS symptoms' },
    { intervention: 'probiotic supplements', category: 'Supplement', tagline: 'Beneficial bacteria for IBS' },
    { intervention: 'psyllium husk fiber', category: 'Supplement', tagline: 'Bulk-forming fiber for IBS-C' },
    { intervention: 'antispasmodic medication', category: 'Prescription', tagline: 'Medication for IBS cramping' },
  ],
  hemorrhoids: [
    { intervention: 'witch hazel', category: 'Herbal', tagline: 'Astringent for hemorrhoid relief' },
    { intervention: 'stool softener', category: 'OTC', tagline: 'To reduce straining' },
    { intervention: 'hydrocortisone cream', category: 'OTC', tagline: 'Topical steroid for inflammation' },
    { intervention: 'sitz bath', category: 'Lifestyle', tagline: 'Warm water therapy for comfort' },
    { intervention: 'fiber supplementation', category: 'Supplement', tagline: 'Fiber for softer stools' },
  ],
  gerd: [
    { intervention: 'proton pump inhibitor', category: 'OTC', tagline: 'Acid suppression for reflux' },
    { intervention: 'deglycyrrhizinated licorice', category: 'Herbal', tagline: 'Demulcent for mild reflux' },
    { intervention: 'melatonin', category: 'Supplement', tagline: 'Supplement for GERD symptom relief' },
    { intervention: 'famotidine H2 blocker', category: 'OTC', tagline: 'H2 blocker for acid reflux' },
    { intervention: 'elevate head during sleep', category: 'Lifestyle', tagline: 'Positioning for nighttime reflux' },
  ],
  hair_loss: [
    { intervention: 'minoxidil topical', category: 'OTC', tagline: 'Topical solution for hair regrowth' },
    { intervention: 'biotin supplementation', category: 'Supplement', tagline: 'B vitamin for hair health' },
    { intervention: 'saw palmetto', category: 'Herbal', tagline: 'Herbal for hair loss prevention' },
    { intervention: 'iron supplementation', category: 'Supplement', tagline: 'Iron for deficiency-related loss' },
    { intervention: 'scalp massage', category: 'Lifestyle', tagline: 'Massage for scalp circulation' },
  ],
  sprain: [
    { intervention: 'RICE protocol', category: 'Lifestyle', tagline: 'Rest ice compression elevation' },
    { intervention: 'ankle brace sprain', category: 'Lifestyle', tagline: 'Supportive brace for recovery' },
    { intervention: 'ibuprofen sprain', category: 'OTC', tagline: 'NSAID for pain and inflammation' },
    { intervention: 'physical therapy', category: 'Lifestyle', tagline: 'Rehabilitation exercises for recovery' },
    { intervention: 'compression bandage', category: 'OTC', tagline: 'Elastic bandage for support' },
  ],
  insect_bite: [
    { intervention: 'hydrocortisone cream', category: 'OTC', tagline: 'Topical steroid for bite relief' },
    { intervention: 'antihistamine oral', category: 'OTC', tagline: 'Oral medication for itching' },
    { intervention: 'calamine lotion', category: 'OTC', tagline: 'Soothing lotion for bites' },
    { intervention: 'baking soda paste', category: 'Herbal', tagline: 'Natural remedy for bite itch' },
    { intervention: 'ice pack therapy', category: 'Lifestyle', tagline: 'Cold therapy for swelling' },
  ],
  minor_burn: [
    { intervention: 'aloe vera gel', category: 'Herbal', tagline: 'Cooling gel for minor burns' },
    { intervention: 'cool running water', category: 'Lifestyle', tagline: 'First aid for burn cooling' },
    { intervention: 'silver sulfadiazine', category: 'OTC', tagline: 'Antimicrobial for burn care' },
    { intervention: 'honey topical', category: 'Herbal', tagline: 'Natural antimicrobial for burns' },
    { intervention: 'petroleum jelly', category: 'OTC', tagline: 'Protective ointment for burns' },
  ],
  bruising: [
    { intervention: 'arnica montana', category: 'Herbal', tagline: 'Herbal remedy for bruising' },
    { intervention: 'vitamin K cream', category: 'Supplement', tagline: 'Topical vitamin K for bruise resolution' },
    { intervention: 'cold compress', category: 'Lifestyle', tagline: 'Cold therapy for bruise prevention' },
    { intervention: 'bromelain supplement', category: 'Supplement', tagline: 'Enzyme for bruise healing' },
    { intervention: 'pineapple extract', category: 'Herbal', tagline: 'Natural source of bromelain' },
  ],
  loss_of_appetite: [
    { intervention: 'ginger', category: 'Herbal', tagline: 'Herbal for appetite stimulation' },
    { intervention: 'small frequent meals', category: 'Lifestyle', tagline: 'Dietary strategy for appetite' },
    { intervention: 'exercise before meals', category: 'Lifestyle', tagline: 'Physical activity for stimulation' },
    { intervention: 'bitter herbs', category: 'Herbal', tagline: 'Herbal bitters for digestion' },
    { intervention: 'zinc supplementation', category: 'Supplement', tagline: 'Mineral for taste and appetite' },
  ],
  chills: [
    { intervention: 'warm blankets', category: 'Lifestyle', tagline: 'Warmth for chills comfort' },
    { intervention: 'warm fluids', category: 'Lifestyle', tagline: 'Hot drinks for warmth' },
    { intervention: 'fever reducer medication', category: 'OTC', tagline: 'Medication for fever-related chills' },
    { intervention: 'layered clothing', category: 'Lifestyle', tagline: 'Dress warmly for prevention' },
    { intervention: 'warm bath', category: 'Lifestyle', tagline: 'Warm water therapy for comfort' },
  ],
  swollen_lymph_nodes: [
    { intervention: 'warm compress', category: 'Lifestyle', tagline: 'Comfort for tender lymph nodes' },
    { intervention: 'rest and hydration', category: 'Lifestyle', tagline: 'Adequate rest for immune support' },
    { intervention: 'NSAID pain reliever', category: 'OTC', tagline: 'Pain medication for lymph discomfort' },
    { intervention: 'echinacea supplement', category: 'Herbal', tagline: 'Herbal immune stimulant' },
    { intervention: 'salt water gargle', category: 'Lifestyle', tagline: 'Soothing rinse for throat swelling' },
  ],
  low_libido: [
    { intervention: 'stress management', category: 'Lifestyle', tagline: 'Relaxation for libido support' },
    { intervention: 'regular exercise', category: 'Lifestyle', tagline: 'Physical activity for improvement' },
    { intervention: 'maca root', category: 'Herbal', tagline: 'Herbal supplement for sexual desire' },
    { intervention: 'ashwagandha', category: 'Herbal', tagline: 'Adaptogenic herb for low libido' },
    { intervention: 'vitamin D supplementation', category: 'Supplement', tagline: 'Vitamin for hormonal balance' },
  ],
  erectile_difficulty: [
    { intervention: 'pelvic floor exercises', category: 'Lifestyle', tagline: 'Kegel exercises for function' },
    { intervention: 'l-arginine supplementation', category: 'Supplement', tagline: 'Amino acid for blood flow' },
    { intervention: 'regular aerobic exercise', category: 'Lifestyle', tagline: 'Physical activity for cardiovascular' },
    { intervention: 'weight management', category: 'Lifestyle', tagline: 'Weight reduction for function' },
    { intervention: 'yohimbe supplement', category: 'Herbal', tagline: 'Herbal for erectile support' },
  ],
  vaginal_dryness: [
    { intervention: 'vaginal moisturizer', category: 'OTC', tagline: 'Moisturizer for dryness relief' },
    { intervention: 'vaginal estrogen', category: 'Prescription', tagline: 'Topical hormone for moisture' },
    { intervention: 'coconut oil lubricant', category: 'Herbal', tagline: 'Natural lubricant for comfort' },
    { intervention: 'phytoestrogen supplements', category: 'Supplement', tagline: 'Plant estrogens for vaginal health' },
    { intervention: 'hyaluronic acid gel', category: 'OTC', tagline: 'Hydrating gel for moisture' },
  ],
  painful_intercourse: [
    { intervention: 'vaginal moisturizer painful', category: 'OTC', tagline: 'Moisturizer for dryness and discomfort' },
    { intervention: 'pelvic floor physical therapy', category: 'Lifestyle', tagline: 'Rehabilitation for pelvic pain' },
    { intervention: 'lubricant use', category: 'OTC', tagline: 'Personal lubricant for comfort' },
    { intervention: 'relaxation techniques', category: 'Lifestyle', tagline: 'Stress reduction for pain relief' },
    { intervention: 'vaginal dilator therapy', category: 'Lifestyle', tagline: 'Progressive dilation for vaginismus' },
  ],
};

async function discoverPubMed(intervention, condition) {
  const query = `(${intervention}[Title/Abstract]) AND (${condition}[Title/Abstract]) AND (systematic review[pt] OR meta-analysis[pt] OR randomized controlled trial[pt] OR clinical trial[pt] OR practice guideline[pt] OR observational study[pt] OR review[pt])`;
  const params = new URLSearchParams({ db: 'pubmed', term: query, retmax: String(perSource), retmode: 'json', sort: 'relevance' });
  try {
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
  } catch { return []; }
}

async function discoverEuropePmc(intervention, condition) {
  const query = `TITLE_ABS:"${intervention}" AND TITLE_ABS:"${condition}"`;
  const url = new URL('https://www.ebi.ac.uk/europepmc/webservices/rest/search');
  url.search = new URLSearchParams({ query, format: 'json', pageSize: String(perSource), resultType: 'core' }).toString();
  try {
    const records = (await fetchJson(url)).resultList?.result || [];
    return records.map(record => ({
      retrievalSource: 'Europe PMC', publicationId: record.pmid ? `pmid:${record.pmid}` : record.doi ? `doi:${record.doi.toLowerCase()}` : `epmc:${record.id}`,
      pmid: record.pmid || null, doi: record.doi || null,
      url: record.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${record.pmid}/` : `https://europepmc.org/article/${record.source}/${record.id}`,
      title: record.title || null, journal: record.journalTitle || null, year: record.pubYear || null,
      publicationTypes: record.pubTypeList?.pubType || [], abstract: record.abstractText || null,
      citedByCount: record.citedByCount ?? null, semanticStatus: 'unassessed',
    }));
  } catch { return []; }
}

async function discoverSemanticScholar(intervention, condition) {
  const query = `${intervention} ${condition} treatment`;
  const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=${perSource}&fields=title,abstract,year,venue,externalIds,citationCount`;
  try {
    const data = await fetchJson(url);
    return (data.data || []).map(paper => {
      const pmid = paper.externalIds?.PubMed || null;
      const doi = paper.externalIds?.DOI || null;
      return {
        retrievalSource: 'Semantic Scholar', publicationId: pmid ? `pmid:${pmid}` : doi ? `doi:${doi}` : `ss:${paper.paperId}`,
        pmid, doi, url: pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` : doi ? `https://doi.org/${doi}` : `https://www.semanticscholar.org/paper/${paper.paperId}`,
        title: paper.title || null, journal: paper.venue || null, year: String(paper.year || ''),
        publicationTypes: [], abstract: paper.abstract || null,
        citedByCount: paper.citationCount ?? null, semanticStatus: 'unassessed',
      };
    });
  } catch { return []; }
}

async function discoverOpenAlex(intervention, condition) {
  const query = `${intervention} ${condition}`;
  const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&filter=publication_year:2015-2026,type:journal-article&per_page=${perSource}&sort=relevance_score:desc`;
  try {
    const data = await fetchJson(url);
    return (data.results || []).map(work => {
      const pmid = work.ids?.pmid?.replace('https://pubmed.ncbi.nlm.nih.gov/', '') || null;
      const doi = work.ids?.doi?.replace('https://doi.org/', '') || null;
      return {
        retrievalSource: 'OpenAlex', publicationId: pmid ? `pmid:${pmid}` : doi ? `doi:${doi}` : `oa:${work.id}`,
        pmid, doi, url: pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` : doi ? `https://doi.org/${doi}` : work.id,
        title: work.title || null, journal: work.primary_location?.source?.display_name || null, year: String(work.publication_year || ''),
        publicationTypes: work.type ? [work.type] : [], abstract: work.abstract_inverted_index ? Object.entries(work.abstract_inverted_index).sort((a,b) => a[1] - b[1]).map(([w]) => w).join(' ') : null,
        citedByCount: work.cited_by_count ?? null, semanticStatus: 'unassessed',
      };
    });
  } catch { return []; }
}

async function discoverCrossRef(intervention, condition) {
  const query = `${intervention} ${condition}`;
  const url = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&filter=from-pub-date:2015-01-01,type:journal-article&rows=${perSource}&sort=relevance`;
  try {
    const data = await fetchJson(url);
    return (data.message?.items || []).map(item => {
      const doi = item.DOI || null;
      return {
        retrievalSource: 'CrossRef', publicationId: doi ? `doi:${doi}` : null,
        pmid: null, doi, url: doi ? `https://doi.org/${doi}` : null,
        title: item.title?.[0] || null, journal: item['container-title']?.[0] || null,
        year: item['published-print']?.['date-parts']?.[0]?.[0] || item['published-online']?.['date-parts']?.[0]?.[0] || '',
        publicationTypes: [], abstract: item.abstract || null,
        citedByCount: item['is-referenced-by-count'] ?? null, semanticStatus: 'unassessed',
      };
    });
  } catch { return []; }
}

async function discoverClinicalTrials(intervention, condition) {
  const query = `${intervention} AND ${condition}`;
  const url = `https://clinicaltrials.gov/api/v2/studies?query.cond=${encodeURIComponent(condition)}&query.intr=${encodeURIComponent(intervention)}&pageSize=${perSource}&format=json`;
  try {
    const data = await fetchJson(url);
    return (data.studies || []).map(study => ({
      retrievalSource: 'ClinicalTrials.gov', publicationId: `ct:${study.protocolSection?.identificationModule?.nctId}`,
      pmid: null, doi: null, url: `https://clinicaltrials.gov/study/${study.protocolSection?.identificationModule?.nctId}`,
      title: study.protocolSection?.identificationModule?.briefTitle || null,
      journal: 'ClinicalTrials.gov', year: String(study.protocolSection?.statusModule?.startDateStruct?.year || ''),
      publicationTypes: ['clinical-trial'], abstract: study.protocolSection?.descriptionModule?.briefSummary || null,
      citedByCount: null, semanticStatus: 'unassessed',
    }));
  } catch { return []; }
}

async function discoverCochrane(intervention, condition) {
  const query = `${intervention} AND ${condition}`;
  const url = `https://api.cochranelibrary.com/search?type=cdfw&searchBy=6&searchText=${encodeURIComponent(query)}&pageSize=${perSource}`;
  try {
    const text = await fetchText(url);
    const entries = [...text.matchAll(/href="(\/cdsr\/\d+\.\d+\/cdsr_[^"]+)"[^>]*>([^<]+)</g)];
    return entries.slice(0, perSource).map((match, i) => ({
      retrievalSource: 'Cochrane', publicationId: `cochrane:${match[1]}`,
      pmid: null, doi: null, url: `https://www.cochranelibrary.com${match[1]}`,
      title: match[2].trim(), journal: 'Cochrane Database of Systematic Reviews', year: '',
      publicationTypes: ['systematic-review'], abstract: null,
      citedByCount: null, semanticStatus: 'unassessed',
    }));
  } catch { return []; }
}

async function discoverForSymptom(symptomCode, interventions) {
  const condition = symptomCode.replace(/_/g, ' ');
  const allCandidates = [];
  for (const { intervention, category, tagline } of interventions) {
    const results = await Promise.allSettled([
      discoverPubMed(intervention, condition),
      discoverEuropePmc(intervention, condition),
      discoverSemanticScholar(intervention, condition),
      discoverOpenAlex(intervention, condition),
      discoverCrossRef(intervention, condition),
      discoverClinicalTrials(intervention, condition),
      discoverCochrane(intervention, condition),
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

const output = resolve('reports/multi-source-expansion.json');
const report = { generatedAt: new Date().toISOString(), symptomCount: Object.keys(symptoms).length, packets: [] };

for (const [symptomCode, interventions] of Object.entries(symptoms)) {
  process.stdout.write(`Discovering ${symptomCode}...`);
  const candidates = await discoverForSymptom(symptomCode, interventions);
  await sleep(500);
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
const sourceDistribution = report.packets.flatMap(p => p.candidates).reduce((acc, c) => { acc[c.retrievalSource] = (acc[c.retrievalSource] || 0) + 1; return acc; }, {});
console.log(`\nMulti-source expansion: ${totalCandidates} candidates across ${report.symptomCount} symptoms.`);
console.log(`Source distribution: ${JSON.stringify(sourceDistribution)}`);
