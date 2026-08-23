#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const SCRAPINGBEE_API_KEY = process.env.SCRAPINGBEE_API_KEY || '';
const SCHOLAR_QUOTA = { total: 250, used: 0 };
const perSource = 10;
const timeoutMs = 15_000;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchJson(url, options = {}) {
  const response = await fetch(url, { ...options, redirect: 'follow', signal: AbortSignal.timeout(timeoutMs) });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.json();
}

const interventionsBySymptom = {
  headache: [
    { intervention: 'acetaminophen', category: 'OTC', tagline: 'A first-line analgesic for headache relief' },
    { intervention: 'ibuprofen', category: 'OTC', tagline: 'An NSAID for tension and migraine headaches' },
    { intervention: 'caffeine combination analgesic', category: 'OTC', tagline: 'Caffeine-enhanced pain relief for headaches' },
    { intervention: 'peppermint oil topical', category: 'Herbal', tagline: 'A topical essential oil for tension headache' },
    { intervention: 'magnesium supplementation', category: 'Supplement', tagline: 'A mineral studied for headache prevention' },
  ],
  migraine: [
    { intervention: 'sumatriptan', category: 'Prescription', tagline: 'A triptan for acute migraine treatment' },
    { intervention: 'riboflavin', category: 'Supplement', tagline: 'A vitamin studied for migraine prevention' },
    { intervention: 'feverfew', category: 'Herbal', tagline: 'An herbal remedy for migraine prevention' },
    { intervention: 'butterbur extract', category: 'Herbal', tagline: 'A herbal supplement for migraine prophylaxis' },
    { intervention: 'magnesium oxide', category: 'Supplement', tagline: 'A mineral supplement for migraine prevention' },
  ],
  cold: [
    { intervention: 'zinc lozenges', category: 'OTC', tagline: 'Zinc supplements studied for cold duration' },
    { intervention: 'vitamin C supplementation', category: 'Supplement', tagline: 'A vitamin studied for cold prevention' },
    { intervention: 'echinacea', category: 'Herbal', tagline: 'An herbal remedy for cold symptoms' },
    { intervention: 'nasal saline irrigation', category: 'OTC', tagline: 'Saline rinse for nasal congestion relief' },
    { intervention: 'honey for cough', category: 'Herbal', tagline: 'A natural demulcent for cold-related cough' },
  ],
  cough: [
    { intervention: 'dextromethorphan', category: 'OTC', tagline: 'A cough suppressant for dry cough' },
    { intervention: 'honey', category: 'Herbal', tagline: 'A natural cough remedy for nighttime relief' },
    { intervention: 'gargle salt water', category: 'Lifestyle', tagline: 'A simple remedy for throat irritation cough' },
    { intervention: 'probiotics', category: 'Supplement', tagline: 'Beneficial bacteria studied for respiratory infections' },
    { intervention: 'bromelain', category: 'Supplement', tagline: 'An enzyme studied for mucus clearance' },
  ],
  congestion: [
    { intervention: 'pseudoephedrine', category: 'OTC', tagline: 'A decongestant for nasal congestion' },
    { intervention: 'nasal saline spray', category: 'OTC', tagline: 'Saline spray for nasal moisture and clearance' },
    { intervention: 'eucalyptus oil steam', category: 'Herbal', tagline: 'Steam inhalation with essential oils' },
    { intervention: 'neti pot irrigation', category: 'Lifestyle', tagline: 'Nasal lavage for sinus congestion relief' },
    { intervention: 'bromhexine', category: 'OTC', tagline: 'A mucolytic for thick mucus relief' },
  ],
  sinus_pressure: [
    { intervention: 'nasal saline irrigation', category: 'OTC', tagline: 'Saline rinse for sinus congestion relief' },
    { intervention: 'amoxicillin', category: 'Prescription', tagline: 'An antibiotic for bacterial sinusitis' },
    { intervention: 'nasal corticosteroid spray', category: 'OTC', tagline: 'A nasal spray for sinus inflammation' },
    { intervention: 'steam inhalation', category: 'Lifestyle', tagline: 'Warm steam for sinus pressure relief' },
    { intervention: 'acetaminophen', category: 'OTC', tagline: 'An analgesic for sinus pain relief' },
  ],
  anxiety: [
    { intervention: 'cognitive behavioral therapy', category: 'Lifestyle', tagline: 'A structured therapy for anxiety management' },
    { intervention: 'ashwagandha', category: 'Herbal', tagline: 'An adaptogenic herb for stress and anxiety' },
    { intervention: 'lavender essential oil', category: 'Herbal', tagline: 'An aromatherapy remedy for calm' },
    { intervention: 'l-theanine', category: 'Supplement', tagline: 'An amino acid for relaxation without drowsiness' },
    { intervention: 'chamomile tea', category: 'Herbal', tagline: 'A calming herbal tea for anxiety relief' },
  ],
  insomnia: [
    { intervention: 'melatonin', category: 'Supplement', tagline: 'A hormone for sleep onset regulation' },
    { intervention: 'sleep hygiene education', category: 'Lifestyle', tagline: 'Behavioral strategies for better sleep' },
    { intervention: 'valerian root', category: 'Herbal', tagline: 'An herbal remedy for sleep improvement' },
    { intervention: 'cognitive behavioral therapy for insomnia', category: 'Lifestyle', tagline: 'A structured program for chronic insomnia' },
    { intervention: 'glycine', category: 'Supplement', tagline: 'An amino acid studied for sleep quality' },
  ],
  nausea: [
    { intervention: 'ginger', category: 'Herbal', tagline: 'An herbal remedy for nausea and vomiting' },
    { intervention: 'ondansetron', category: 'Prescription', tagline: 'An antiemetic for nausea relief' },
    { intervention: 'peppermint oil', category: 'Herbal', tagline: 'An enteric-coated oil for nausea comfort' },
    { intervention: 'acupressure wristbands', category: 'Lifestyle', tagline: 'Pressure point therapy for nausea' },
    { intervention: 'vitamin B6 supplementation', category: 'Supplement', tagline: 'A vitamin studied for morning sickness' },
  ],
  stress: [
    { intervention: 'mindfulness meditation', category: 'Lifestyle', tagline: 'A mindfulness practice for stress reduction' },
    { intervention: 'exercise regular', category: 'Lifestyle', tagline: 'Regular physical activity for stress management' },
    { intervention: 'rhodiola rosea', category: 'Herbal', tagline: 'An adaptogenic herb for stress resilience' },
    { intervention: 'progressive muscle relaxation', category: 'Lifestyle', tagline: 'A relaxation technique for stress relief' },
    { intervention: 'magnesium supplementation', category: 'Supplement', tagline: 'A mineral for nervous system support' },
  ],
  burnout: [
    { intervention: 'mindfulness-based stress reduction', category: 'Lifestyle', tagline: 'A structured program for stress and burnout' },
    { intervention: 'coenzyme Q10', category: 'Supplement', tagline: 'A supplement studied for fatigue and burnout' },
    { intervention: 'workplace boundary setting', category: 'Lifestyle', tagline: 'Behavioral strategies for burnout prevention' },
    { intervention: 'b vitamins supplementation', category: 'Supplement', tagline: 'B vitamins for energy and stress support' },
    { intervention: 'regular aerobic exercise', category: 'Lifestyle', tagline: 'Physical activity for burnout recovery' },
  ],
  brain_fog: [
    { intervention: 'omega-3 fatty acids', category: 'Supplement', tagline: 'Essential fatty acids for cognitive support' },
    { intervention: 'lion mane mushroom', category: 'Herbal', tagline: 'A medicinal mushroom for brain health' },
    { intervention: 'regular physical exercise', category: 'Lifestyle', tagline: 'Aerobic exercise for cognitive function' },
    { intervention: 'vitamin D supplementation', category: 'Supplement', tagline: 'A vitamin for cognitive support' },
    { intervention: 'curcumin', category: 'Herbal', tagline: 'An anti-inflammatory compound for brain health' },
  ],
  back_pain: [
    { intervention: 'narcotic analgesic', category: 'Prescription', tagline: 'A pain reliever for severe back pain' },
    { intervention: 'physical therapy exercises', category: 'Lifestyle', tagline: 'Targeted exercise for back pain relief' },
    { intervention: 'yoga stretching', category: 'Lifestyle', tagline: 'Yoga for back flexibility and pain relief' },
    { intervention: 'tENS unit therapy', category: 'Lifestyle', tagline: 'Electrical nerve stimulation for back pain' },
    { intervention: 'tiger balm topical', category: 'Herbal', tagline: 'A topical analgesic for back pain relief' },
  ],
  neck_pain: [
    { intervention: 'cervical pillow', category: 'Lifestyle', tagline: 'Supportive pillow for neck pain relief' },
    { intervention: 'neck stretching exercises', category: 'Lifestyle', tagline: 'Targeted stretches for neck pain relief' },
    { intervention: 'cervical collar', category: 'Lifestyle', tagline: 'Supportive collar for neck pain management' },
    { intervention: 'ibuprofen', category: 'OTC', tagline: 'An NSAID for neck inflammation relief' },
    { intervention: 'hot cold therapy', category: 'Lifestyle', tagline: 'Alternating heat and ice for neck comfort' },
  ],
  shoulder_pain: [
    { intervention: 'rotator cuff strengthening', category: 'Lifestyle', tagline: 'Targeted exercise for shoulder pain' },
    { intervention: 'shoulder sling', category: 'Lifestyle', tagline: 'Supportive sling for shoulder rest' },
    { intervention: 'nsaid topical gel', category: 'OTC', tagline: 'Topical anti-inflammatory for shoulder pain' },
    { intervention: 'ice pack therapy', category: 'Lifestyle', tagline: 'Cold therapy for acute shoulder pain' },
    { intervention: 'physical therapy', category: 'Lifestyle', tagline: 'Rehabilitation exercises for shoulder recovery' },
  ],
  joint_pain: [
    { intervention: 'collagen supplementation', category: 'Supplement', tagline: 'A structural protein supplement for joints' },
    { intervention: 'turmeric curcumin', category: 'Herbal', tagline: 'An anti-inflammatory spice for joint pain' },
    { intervention: 'glucosamine chondroitin', category: 'Supplement', tagline: 'Joint-supporting supplements for cartilage' },
    { intervention: 'resveratrol', category: 'Supplement', tagline: 'An antioxidant for joint inflammation' },
    { intervention: 'boswellia serrata', category: 'Herbal', tagline: 'An herbal anti-inflammatory for joints' },
  ],
  muscle_pain: [
    { intervention: 'magnesium', category: 'Supplement', tagline: 'A mineral studied for muscle pain relief' },
    { intervention: 'tart cherry juice', category: 'Supplement', tagline: 'A natural remedy for muscle soreness' },
    { intervention: 'topical menthol cream', category: 'OTC', tagline: 'A cooling cream for muscle pain relief' },
    { intervention: 'protein supplementation', category: 'Supplement', tagline: 'Protein for muscle recovery and repair' },
    { intervention: 'compression garments', category: 'Lifestyle', tagline: 'Supportive clothing for muscle recovery' },
  ],
  leg_pain: [
    { intervention: 'compression stockings', category: 'Lifestyle', tagline: 'Graduated compression for leg pain and swelling' },
    { intervention: 'leg elevation', category: 'Lifestyle', tagline: 'Positioning for leg pain relief' },
    { intervention: 'walking exercise', category: 'Lifestyle', tagline: 'Regular walking for leg circulation' },
    { intervention: 'potassium supplementation', category: 'Supplement', tagline: 'A mineral for muscle cramp prevention' },
    { intervention: 'arnica gel topical', category: 'Herbal', tagline: 'A topical herbal remedy for leg pain' },
  ],
  knee_pain: [
    { intervention: 'quadriceps strengthening', category: 'Lifestyle', tagline: 'Targeted exercise for knee pain' },
    { intervention: 'knee brace support', category: 'Lifestyle', tagline: 'Supportive brace for knee stability' },
    { intervention: 'weight management', category: 'Lifestyle', tagline: 'Weight reduction for knee joint relief' },
    { intervention: 'glucosamine supplementation', category: 'Supplement', tagline: 'A supplement for knee cartilage support' },
    { intervention: 'tai chi exercise', category: 'Lifestyle', tagline: 'Gentle movement for knee pain improvement' },
  ],
  eye_pain: [
    { intervention: 'artificial tears', category: 'OTC', tagline: 'Lubricating eye drops for dry-eye-related pain' },
    { intervention: 'cold compress', category: 'Lifestyle', tagline: 'Cold therapy for eye pain relief' },
    { intervention: 'lutein supplementation', category: 'Supplement', tagline: 'An antioxidant for eye health support' },
    { intervention: 'blue light filtering glasses', category: 'Lifestyle', tagline: 'Eye protection for screen-related strain' },
    { intervention: 'eye rest breaks', category: 'Lifestyle', tagline: 'Regular breaks for eye strain prevention' },
  ],
  eye_strain: [
    { intervention: '20-20-20 rule', category: 'Lifestyle', tagline: 'Regular eye breaks for screen strain' },
    { intervention: 'computer glasses', category: 'Lifestyle', tagline: 'Prescription lenses for screen work' },
    { intervention: 'artificial tears lubricating', category: 'OTC', tagline: 'Eye drops for dry eyes from screen use' },
    { intervention: 'screen brightness adjustment', category: 'Lifestyle', tagline: 'Optimal screen settings for eye comfort' },
    { intervention: 'blink exercises', category: 'Lifestyle', tagline: 'Conscious blinking for eye moisture' },
  ],
  ear_pain: [
    { intervention: 'over-the-counter ear drops', category: 'OTC', tagline: 'Analgesic ear drops for ear pain' },
    { intervention: 'warm oil ear drops', category: 'Herbal', tagline: 'Olive oil drops for ear comfort' },
    { intervention: 'otc pain relievers', category: 'OTC', tagline: 'Pain medication for earache relief' },
    { intervention: 'garlic oil drops', category: 'Herbal', tagline: 'Antibacterial herbal ear drops' },
    { intervention: 'apple cider vinegar ear rinse', category: 'Herbal', tagline: 'A natural remedy for ear infections' },
  ],
  sore_throat: [
    { intervention: 'honey lemon water', category: 'Herbal', tagline: 'A soothing drink for sore throat relief' },
    { intervention: 'salt water gargle', category: 'Lifestyle', tagline: 'A simple remedy for throat irritation' },
    { intervention: 'throat lozenges', category: 'OTC', tagline: 'Medicated lozenges for throat comfort' },
    { intervention: 'echinacea', category: 'Herbal', tagline: 'An herbal remedy for throat infection' },
    { intervention: 'slippery elm', category: 'Herbal', tagline: 'A demulcent herb for throat coating' },
  ],
  period_cramps: [
    { intervention: 'ibuprofen', category: 'OTC', tagline: 'An NSAID for menstrual pain relief' },
    { intervention: 'heating pad therapy', category: 'Lifestyle', tagline: 'Heat therapy for cramp relief' },
    { intervention: 'ginger tea', category: 'Herbal', tagline: 'A warming tea for menstrual comfort' },
    { intervention: 'magnesium supplementation', category: 'Supplement', tagline: 'A mineral for muscle relaxation' },
    { intervention: 'exercise during menstruation', category: 'Lifestyle', tagline: 'Light exercise for cramp relief' },
  ],
  pms: [
    { intervention: 'calcium supplementation', category: 'Supplement', tagline: 'A mineral supplement for PMS symptom relief' },
    { intervention: 'chasteberry', category: 'Herbal', tagline: 'An herbal remedy for PMS symptoms' },
    { intervention: 'evening primrose oil', category: 'Supplement', tagline: 'An herbal supplement for PMS symptoms' },
    { intervention: 'vitamin B6 supplementation', category: 'Supplement', tagline: 'A vitamin for PMS mood support' },
    { intervention: 'diosmin supplementation', category: 'Supplement', tagline: 'A flavonoid for PMS symptom management' },
  ],
  menopause: [
    { intervention: 'black cohosh', category: 'Herbal', tagline: 'An herbal remedy for menopausal symptoms' },
    { intervention: 'soy isoflavones', category: 'Supplement', tagline: 'Plant estrogens studied for menopause' },
    { intervention: 'red clover', category: 'Herbal', tagline: 'An herbal remedy for hot flashes' },
    { intervention: 'vitamin E supplementation', category: 'Supplement', tagline: 'An antioxidant for menopausal symptoms' },
    { intervention: 'dong quai', category: 'Herbal', tagline: 'An herbal remedy for menopausal balance' },
  ],
  fever: [
    { intervention: 'ibuprofen', category: 'OTC', tagline: 'An NSAID for fever reduction' },
    { intervention: 'acetaminophen', category: 'OTC', tagline: 'A first-line fever reducer for adults and children' },
    { intervention: 'physical cooling measures', category: 'Lifestyle', tagline: 'External cooling for comfort during fever' },
    { intervention: 'elderberry extract', category: 'Herbal', tagline: 'An herbal remedy for immune support' },
    { intervention: 'oral rehydration solution', category: 'OTC', tagline: 'Rehydration for fever-related fluid loss' },
  ],
  skin_rash: [
    { intervention: 'hydrocortisone cream', category: 'OTC', tagline: 'A topical steroid for rash relief' },
    { intervention: 'calamine lotion', category: 'OTC', tagline: 'A soothing lotion for itchy rashes' },
    { intervention: 'colloidal oatmeal bath', category: 'Herbal', tagline: 'A natural remedy for skin irritation' },
    { intervention: 'antihistamine oral', category: 'OTC', tagline: 'Oral medication for rash-related itching' },
    { intervention: 'aloe vera gel', category: 'Herbal', tagline: 'A cooling gel for skin inflammation' },
  ],
  dry_skin: [
    { intervention: 'moisturizer emollient', category: 'OTC', tagline: 'A thick moisturizer for dry skin relief' },
    { intervention: 'hyaluronic acid serum', category: 'Supplement', tagline: 'A hydrating serum for skin moisture' },
    { intervention: 'ceramide cream', category: 'OTC', tagline: 'A skin barrier repair cream' },
    { intervention: 'coconut oil topical', category: 'Herbal', tagline: 'A natural oil for skin hydration' },
    { intervention: 'oatmeal bath soak', category: 'Herbal', tagline: 'Colloidal oatmeal for skin soothing' },
  ],
  acne: [
    { intervention: 'benzoyl peroxide', category: 'OTC', tagline: 'A topical antimicrobial for acne' },
    { intervention: 'niacinamide', category: 'Supplement', tagline: 'A vitamin B3 derivative for acne-prone skin' },
    { intervention: 'salicylic acid', category: 'OTC', tagline: 'A beta hydroxy acid for acne treatment' },
    { intervention: 'retinoid topical', category: 'Prescription', tagline: 'A vitamin A derivative for acne prevention' },
    { intervention: 'tea tree oil', category: 'Herbal', tagline: 'An antibacterial essential oil for acne' },
  ],
  bloating: [
    { intervention: 'probiotics', category: 'Supplement', tagline: 'Beneficial bacteria for digestive health' },
    { intervention: 'fennel tea', category: 'Herbal', tagline: 'A carminative tea for bloating relief' },
    { intervention: 'digestive enzymes', category: 'Supplement', tagline: 'Enzymes for food breakdown and gas relief' },
    { intervention: 'peppermint oil enteric', category: 'Herbal', tagline: 'An enteric-coated oil for IBS bloating' },
    { intervention: 'activated charcoal', category: 'OTC', tagline: 'A supplement for gas and bloating relief' },
  ],
  indigestion: [
    { intervention: 'ginger supplement', category: 'Herbal', tagline: 'An herbal remedy for dyspepsia' },
    { intervention: 'antacid tablets', category: 'OTC', tagline: 'Quick-relief tablets for indigestion' },
    { intervention: 'deglycyrrhizinated licorice', category: 'Herbal', tagline: 'A herbal option for digestive comfort' },
    { intervention: 'probiotic supplements', category: 'Supplement', tagline: 'Beneficial bacteria for gut health' },
    { intervention: 'apple cider vinegar dilute', category: 'Herbal', tagline: 'A natural remedy for indigestion' },
  ],
  heartburn: [
    { intervention: 'calcium carbonate antacid', category: 'OTC', tagline: 'A rapid-acting antacid for heartburn' },
    { intervention: 'famotidine', category: 'OTC', tagline: 'An H2 blocker for heartburn relief' },
    { intervention: 'deglycyrrhizinated licorice', category: 'Herbal', tagline: 'A herbal option for heartburn relief' },
    { intervention: 'ginger tea', category: 'Herbal', tagline: 'A warming tea for digestive comfort' },
    { intervention: 'baking soda water', category: 'Lifestyle', tagline: 'A home remedy for occasional heartburn' },
  ],
  constipation: [
    { intervention: 'polyethylene glycol', category: 'OTC', tagline: 'An osmotic laxative for constipation' },
    { intervention: 'psyllium husk', category: 'Supplement', tagline: 'A bulk-forming fiber supplement' },
    { intervention: 'senna', category: 'Herbal', tagline: 'A stimulant laxative for short-term relief' },
    { intervention: 'prune juice', category: 'Herbal', tagline: 'A natural laxative for constipation' },
    { intervention: 'docusate sodium', category: 'OTC', tagline: 'A stool softener for gentle relief' },
  ],
  diarrhea: [
    { intervention: 'loperamide', category: 'OTC', tagline: 'An anti-diarrheal medication for symptom control' },
    { intervention: 'oral rehydration solution', category: 'OTC', tagline: 'Rehydration for fluid loss prevention' },
    { intervention: 'probiotics lactobacillus', category: 'Supplement', tagline: 'Beneficial bacteria for diarrhea recovery' },
    { intervention: 'bismuth subsalicylate', category: 'OTC', tagline: 'An antidiarrheal for traveler diarrhea' },
    { intervention: 'BRAT diet', category: 'Lifestyle', tagline: 'Bananas rice applesauce toast for recovery' },
  ],
  stomach_ache: [
    { intervention: 'peppermint oil', category: 'Herbal', tagline: 'An enteric-coated oil for abdominal pain' },
    { intervention: 'antacid tablets', category: 'OTC', tagline: 'Quick relief for stomach acid pain' },
    { intervention: 'ginger tea', category: 'Herbal', tagline: 'A soothing tea for stomach discomfort' },
    { intervention: 'fennel seeds', category: 'Herbal', tagline: 'Chewed seeds for stomach cramp relief' },
    { intervention: 'heating pad', category: 'Lifestyle', tagline: 'Warmth for abdominal pain comfort' },
  ],
  gas: [
    { intervention: 'simethicone', category: 'OTC', tagline: 'An anti-flatulent for gas relief' },
    { intervention: 'activated charcoal', category: 'OTC', tagline: 'A supplement studied for intestinal gas' },
    { intervention: 'fennel tea', category: 'Herbal', tagline: 'A carminative tea for gas relief' },
    { intervention: 'digestive enzymes', category: 'Supplement', tagline: 'Enzymes for food breakdown and gas prevention' },
    { intervention: 'probiotic supplements', category: 'Supplement', tagline: 'Beneficial bacteria for gut health' },
  ],
  hangover: [
    { intervention: 'electrolyte solution', category: 'OTC', tagline: 'Rehydration for hangover recovery' },
    { intervention: 'vitamin B complex', category: 'Supplement', tagline: 'B vitamins for alcohol metabolism support' },
    { intervention: 'N-acetyl cysteine', category: 'Supplement', tagline: 'An amino acid for liver support' },
    { intervention: 'ginger tea', category: 'Herbal', tagline: 'A soothing tea for hangover nausea' },
    { intervention: 'sleep rest', category: 'Lifestyle', tagline: 'Adequate sleep for hangover recovery' },
  ],
  fatigue: [
    { intervention: 'iron supplementation', category: 'Supplement', tagline: 'Iron for fatigue related to deficiency' },
    { intervention: 'coenzyme Q10', category: 'Supplement', tagline: 'A supplement for cellular energy production' },
    { intervention: 'regular aerobic exercise', category: 'Lifestyle', tagline: 'Physical activity for energy improvement' },
    { intervention: 'vitamin D supplementation', category: 'Supplement', tagline: 'A vitamin for energy and fatigue support' },
    { intervention: 'ashwagandha', category: 'Herbal', tagline: 'An adaptogenic herb for energy and stamina' },
  ],
  low_energy: [
    { intervention: 'iron supplementation', category: 'Supplement', tagline: 'Iron for energy support' },
    { intervention: 'B12 supplementation', category: 'Supplement', tagline: 'A vitamin for energy production' },
    { intervention: 'regular exercise', category: 'Lifestyle', tagline: 'Physical activity for energy boost' },
    { intervention: 'rhodiola rosea', category: 'Herbal', tagline: 'An adaptogenic herb for energy and stamina' },
    { intervention: 'adequate sleep hygiene', category: 'Lifestyle', tagline: 'Sleep optimization for energy levels' },
  ],
  dehydration: [
    { intervention: 'oral rehydration solution', category: 'OTC', tagline: 'WHO-recommended rehydration salts' },
    { intervention: 'coconut water', category: 'Herbal', tagline: 'A natural electrolyte drink' },
    { intervention: 'electrolyte tablets', category: 'OTC', tagline: 'Dissolvable tablets for rehydration' },
    { intervention: 'water intake increase', category: 'Lifestyle', tagline: 'Adequate daily water consumption' },
    { intervention: 'watermelon', category: 'Herbal', tagline: 'A hydrating fruit for fluid replenishment' },
  ],
  allergies: [
    { intervention: 'loratadine', category: 'OTC', tagline: 'A non-drowsy antihistamine for allergies' },
    { intervention: 'nasal corticosteroid spray', category: 'OTC', tagline: 'A nasal spray for allergy symptom control' },
    { intervention: 'cetirizine', category: 'OTC', tagline: 'A second-generation antihistamine for allergies' },
    { intervention: 'quercetin', category: 'Supplement', tagline: 'A plant flavonoid for natural allergy relief' },
    { intervention: 'nasal saline rinse', category: 'Lifestyle', tagline: 'Nasal irrigation for allergy symptom relief' },
  ],
  asthma: [
    { intervention: 'inhaled corticosteroid', category: 'Prescription', tagline: 'First-line controller therapy for persistent asthma' },
    { intervention: 'omega-3 fatty acids asthma', category: 'Supplement', tagline: 'Anti-inflammatory supplement studied in asthma' },
    { intervention: 'rescue inhaler albuterol', category: 'Prescription', tagline: 'A bronchodilator for acute asthma relief' },
    { intervention: 'breathing exercises', category: 'Lifestyle', tagline: 'Buteyko breathing for asthma management' },
    { intervention: 'vitamin D supplementation', category: 'Supplement', tagline: 'A vitamin for asthma symptom control' },
  ],
  hives: [
    { intervention: 'cetirizine', category: 'OTC', tagline: 'An antihistamine for hives relief' },
    { intervention: 'fexofenadine', category: 'OTC', tagline: 'A non-drowsy antihistamine for hives' },
    { intervention: 'cold compress', category: 'Lifestyle', tagline: 'Cold therapy for hives itch relief' },
    { intervention: 'colloidal oatmeal bath', category: 'Herbal', tagline: 'A soothing bath for hives comfort' },
    { intervention: 'quercetin supplement', category: 'Supplement', tagline: 'A natural antihistamine for hives' },
  ],
  allergic_reaction: [
    { intervention: 'cetirizine', category: 'OTC', tagline: 'A second-generation antihistamine for allergic symptoms' },
    { intervention: 'quercetin', category: 'Supplement', tagline: 'A plant flavonoid studied for antihistamine effects' },
    { intervention: 'diphenhydramine', category: 'OTC', tagline: 'An antihistamine for acute allergic reaction' },
    { intervention: 'epinephrine auto-injector', category: 'Prescription', tagline: 'Emergency treatment for severe allergic reaction' },
    { intervention: 'cromolyn sodium', category: 'Prescription', tagline: 'A mast cell stabilizer for allergy prevention' },
  ],
  uti: [
    { intervention: 'cranberry supplement', category: 'Supplement', tagline: 'A supplement studied for UTI prevention' },
    { intervention: 'd-mannose', category: 'Supplement', tagline: 'A simple sugar for UTI prevention' },
    { intervention: 'antibiotics prescribed', category: 'Prescription', tagline: 'Antibiotic therapy for bacterial UTI' },
    { intervention: 'probiotic lactobacillus', category: 'Supplement', tagline: 'Beneficial bacteria for urinary tract health' },
    { intervention: 'adequate water intake', category: 'Lifestyle', tagline: 'Increased fluids for UTI prevention' },
  ],
  kidney_stone: [
    { intervention: 'tamsulosin', category: 'Prescription', tagline: 'A medication to pass kidney stones' },
    { intervention: 'potassium citrate', category: 'Supplement', tagline: 'A urine alkalinizer for stone prevention' },
    { intervention: 'increased water intake', category: 'Lifestyle', tagline: 'High fluid intake for stone prevention' },
    { intervention: 'citric acid supplementation', category: 'Supplement', tagline: 'A supplement for stone prevention' },
    { intervention: 'low oxalate diet', category: 'Lifestyle', tagline: 'Dietary changes for stone prevention' },
  ],
  frequent_urination: [
    { intervention: 'pelvic floor training', category: 'Lifestyle', tagline: 'Bladder training for urinary frequency' },
    { intervention: 'timed voiding', category: 'Lifestyle', tagline: 'Scheduled bathroom visits for bladder control' },
    { intervention: 'desmopressin', category: 'Prescription', tagline: 'A hormone for nighttime urination' },
    { intervention: 'oxybutynin', category: 'Prescription', tagline: 'An anticholinergic for bladder control' },
    { intervention: 'caffeine reduction', category: 'Lifestyle', tagline: 'Reducing bladder irritants for comfort' },
  ],
  urinary_incontinence: [
    { intervention: 'kegel exercises', category: 'Lifestyle', tagline: 'Pelvic floor strengthening for continence' },
    { intervention: 'bladder training', category: 'Lifestyle', tagline: 'Timed voiding for bladder control' },
    { intervention: 'timed voiding schedule', category: 'Lifestyle', tagline: 'Regular bathroom schedule for continence' },
    { intervention: 'absorbent pads', category: 'OTC', tagline: 'Protective products for incontinence management' },
    { intervention: 'pessary device', category: 'Prescription', tagline: 'A supportive device for stress incontinence' },
  ],
  yeast_infection: [
    { intervention: 'fluconazole oral', category: 'Prescription', tagline: 'An oral antifungal for vaginal candidiasis' },
    { intervention: 'probiotic lactobacillus', category: 'Supplement', tagline: 'Beneficial bacteria for yeast infection prevention' },
    { intervention: 'clotrimazole topical', category: 'OTC', tagline: 'A topical antifungal for yeast infection' },
    { intervention: 'boric acid suppository', category: 'OTC', tagline: 'A vaginal suppository for yeast infection' },
    { intervention: 'garlic supplement', category: 'Herbal', tagline: 'An herbal antifungal for yeast prevention' },
  ],
  prostate_issues: [
    { intervention: 'saw palmetto', category: 'Herbal', tagline: 'An herbal remedy for urinary symptoms in BPH' },
    { intervention: 'beta-sitosterol', category: 'Supplement', tagline: 'A plant sterol for prostate health' },
    { intervention: 'tamsulosin', category: 'Prescription', tagline: 'An alpha-blocker for urinary symptoms' },
    { intervention: 'finasteride', category: 'Prescription', tagline: 'A 5-alpha reductase inhibitor for BPH' },
    { intervention: 'pygeum', category: 'Herbal', tagline: 'An herbal remedy for prostate health' },
  ],
  testicular_pain: [
    { intervention: 'scrotal support', category: 'Lifestyle', tagline: 'Supportive garment for testicular discomfort' },
    { intervention: 'ibuprofen', category: 'OTC', tagline: 'An NSAID for testicular pain relief' },
    { intervention: 'ice pack therapy', category: 'Lifestyle', tagline: 'Cold therapy for testicular pain relief' },
    { intervention: 'scrotal elevation', category: 'Lifestyle', tagline: 'Positioning for pain relief' },
    { intervention: 'warm sitz bath', category: 'Lifestyle', tagline: 'Warm water therapy for comfort' },
  ],
  pelvic_pain: [
    { intervention: 'pelvic floor physical therapy', category: 'Lifestyle', tagline: 'Rehabilitation for pelvic pain relief' },
    { intervention: 'heat therapy', category: 'Lifestyle', tagline: 'Warmth for pelvic pain comfort' },
    { intervention: 'ibuprofen', category: 'OTC', tagline: 'An NSAID for pelvic inflammation relief' },
    { intervention: 'yoga for pelvic pain', category: 'Lifestyle', tagline: 'Gentle yoga for pelvic relaxation' },
    { intervention: 'stress management', category: 'Lifestyle', tagline: 'Relaxation techniques for chronic pelvic pain' },
  ],
  breast_pain: [
    { intervention: 'evening primrose oil', category: 'Supplement', tagline: 'An herbal supplement for mastalgia' },
    { intervention: 'supportive bra', category: 'Lifestyle', tagline: 'Proper support for breast pain relief' },
    { intervention: 'vitamin E supplementation', category: 'Supplement', tagline: 'An antioxidant for breast pain' },
    { intervention: 'nsaid topical', category: 'OTC', tagline: 'Topical anti-inflammatory for breast pain' },
    { intervention: 'evening primrose oil', category: 'Supplement', tagline: 'An essential fatty acid for breast comfort' },
  ],
  endometriosis: [
    { intervention: 'laparoscopic excision surgery', category: 'Surgical', tagline: 'Surgical removal of endometriosis lesions' },
    { intervention: 'pelvic floor physical therapy', category: 'Lifestyle', tagline: 'Physical therapy for endometriosis-related pain' },
    { intervention: 'hormonal contraceptive therapy', category: 'Prescription', tagline: 'Hormonal management for endometriosis' },
    { intervention: 'anti-inflammatory diet', category: 'Lifestyle', tagline: 'Dietary changes for endometriosis management' },
    { intervention: 'acupuncture', category: 'Lifestyle', tagline: 'Traditional Chinese medicine for pelvic pain' },
  ],
  toothache: [
    { intervention: 'clove oil', category: 'Herbal', tagline: 'An herbal topical for toothache relief' },
    { intervention: 'ibuprofen', category: 'OTC', tagline: 'An NSAID for dental pain relief' },
    { intervention: 'benzocaine topical', category: 'OTC', tagline: 'A numbing gel for tooth pain relief' },
    { intervention: 'salt water rinse', category: 'Lifestyle', tagline: 'A simple rinse for dental pain relief' },
    { intervention: 'cold compress', category: 'Lifestyle', tagline: 'Cold therapy for toothache relief' },
  ],
  canker_sore: [
    { intervention: 'amlexanox', category: 'OTC', tagline: 'A topical paste for aphthous ulcers' },
    { intervention: 'hydrogen peroxide rinse', category: 'Lifestyle', tagline: 'Antiseptic rinse for mouth sores' },
    { intervention: 'vitamin B12 supplementation', category: 'Supplement', tagline: 'A vitamin for canker sore prevention' },
    { intervention: 'lycopene supplementation', category: 'Supplement', tagline: 'An antioxidant for oral health' },
    { intervention: 'sodium lauryl sulfate free toothpaste', category: 'Lifestyle', tagline: 'Gentle toothpaste for mouth sore prevention' },
  ],
  gum_pain: [
    { intervention: 'salt water rinse', category: 'Lifestyle', tagline: 'A simple rinse for gum discomfort' },
    { intervention: 'antibacterial mouthwash', category: 'OTC', tagline: 'A rinse for gum infection prevention' },
    { intervention: 'warm compress', category: 'Lifestyle', tagline: 'Heat therapy for gum pain relief' },
    { intervention: 'clove oil topical', category: 'Herbal', tagline: 'A numbing oil for gum pain relief' },
    { intervention: 'tea tree oil mouthwash', category: 'Herbal', tagline: 'An antibacterial rinse for gum health' },
  ],
  bad_breath: [
    { intervention: 'chlorhexidine mouthwash', category: 'OTC', tagline: 'An antibacterial rinse for halitosis' },
    { intervention: 'tongue scraper', category: 'Lifestyle', tagline: 'A device for tongue bacteria removal' },
    { intervention: 'parsley chewing', category: 'Herbal', tagline: 'A natural breath freshener' },
    { intervention: 'probiotic lozenges', category: 'Supplement', tagline: 'Beneficial bacteria for oral health' },
    { intervention: 'green tea rinse', category: 'Herbal', tagline: 'An antimicrobial rinse for fresh breath' },
  ],
  tmj_pain: [
    { intervention: 'occlusal splint', category: 'Lifestyle', tagline: 'A dental appliance for jaw pain relief' },
    { intervention: 'jaw relaxation exercises', category: 'Lifestyle', tagline: 'Exercises for TMJ muscle relaxation' },
    { intervention: 'bite adjustment', category: 'Lifestyle', tagline: 'Dental adjustment for bite alignment' },
    { intervention: 'soft food diet', category: 'Lifestyle', tagline: 'Dietary modification for jaw rest' },
    { intervention: 'nsaid topical gel', category: 'OTC', tagline: 'Topical anti-inflammatory for TMJ pain' },
  ],
  dry_mouth: [
    { intervention: 'xylitol', category: 'OTC', tagline: 'A sugar substitute that stimulates saliva' },
    { intervention: 'biotene', category: 'OTC', tagline: 'Commercial saliva substitute products' },
    { intervention: 'artificial saliva spray', category: 'OTC', tagline: 'A spray for dry mouth relief' },
    { intervention: 'increase water intake', category: 'Lifestyle', tagline: 'Adequate hydration for oral moisture' },
    { intervention: 'sugar-free gum', category: 'Lifestyle', tagline: 'Chewing gum for saliva stimulation' },
  ],
  cold_sore: [
    { intervention: 'acyclovir topical', category: 'OTC', tagline: 'An antiviral cream for cold sores' },
    { intervention: 'docosanol cream', category: 'OTC', tagline: 'An OTC antiviral for cold sore prevention' },
    { intervention: 'lysine supplementation', category: 'Supplement', tagline: 'An amino acid for cold sore prevention' },
    { intervention: 'zinc oxide cream', category: 'OTC', tagline: 'A protective cream for cold sore healing' },
    { intervention: 'lemon balm cream', category: 'Herbal', tagline: 'An herbal topical for cold sore relief' },
  ],
  ankle_pain: [
    { intervention: 'ankle brace', category: 'Lifestyle', tagline: 'External support for ankle stability and pain' },
    { intervention: 'RICE protocol', category: 'Lifestyle', tagline: 'Rest ice compression elevation for sprains' },
    { intervention: 'physical therapy exercises', category: 'Lifestyle', tagline: 'Targeted exercises for ankle recovery' },
    { intervention: 'nsaid topical gel', category: 'OTC', tagline: 'Topical anti-inflammatory for ankle pain' },
    { intervention: 'balance training exercises', category: 'Lifestyle', tagline: 'Proprioception exercises for ankle stability' },
  ],
  wrist_pain: [
    { intervention: 'wrist splint', category: 'Lifestyle', tagline: 'Immobilization for wrist pain relief' },
    { intervention: 'carpal tunnel exercises', category: 'Lifestyle', tagline: 'Exercises for carpal tunnel relief' },
    { intervention: 'nsaid topical gel', category: 'OTC', tagline: 'Topical anti-inflammatory for wrist pain' },
    { intervention: 'ergonomic workstation setup', category: 'Lifestyle', tagline: 'Workspace optimization for wrist comfort' },
    { intervention: 'wrist stretching routine', category: 'Lifestyle', tagline: 'Daily stretches for wrist flexibility' },
  ],
  hip_pain: [
    { intervention: 'gluteal strengthening exercises', category: 'Lifestyle', tagline: 'Targeted exercise for hip pain' },
    { intervention: 'physical therapy for hip', category: 'Lifestyle', tagline: 'Rehabilitation exercises for hip recovery' },
    { intervention: 'hip brace support', category: 'Lifestyle', tagline: 'Supportive brace for hip stability' },
    { intervention: 'nsaid topical gel', category: 'OTC', tagline: 'Topical anti-inflammatory for hip pain' },
    { intervention: 'tai chi for hip pain', category: 'Lifestyle', tagline: 'Gentle movement for hip pain improvement' },
  ],
  elbow_pain: [
    { intervention: 'counterforce brace', category: 'Lifestyle', tagline: 'A brace for lateral epicondylitis pain relief' },
    { intervention: 'eccentric exercise', category: 'Lifestyle', tagline: 'Targeted exercises for tennis elbow recovery' },
    { intervention: 'nsaid topical gel', category: 'OTC', tagline: 'Topical anti-inflammatory for elbow pain' },
    { intervention: 'ice massage therapy', category: 'Lifestyle', tagline: 'Cold therapy for elbow pain relief' },
    { intervention: 'ergonomic mouse pad', category: 'Lifestyle', tagline: 'Supportive mouse pad for elbow comfort' },
  ],
  foot_pain: [
    { intervention: 'custom orthotic insole', category: 'Lifestyle', tagline: 'Arch support for foot pain relief' },
    { intervention: 'plantar fascia stretching', category: 'Lifestyle', tagline: 'Targeted stretches for plantar fasciitis' },
    { intervention: 'night splint', category: 'Lifestyle', tagline: 'A splint for morning foot pain relief' },
    { intervention: 'nsaid topical gel', category: 'OTC', tagline: 'Topical anti-inflammatory for foot pain' },
    { intervention: 'proper footwear selection', category: 'Lifestyle', tagline: 'Supportive shoes for foot pain prevention' },
  ],
  hand_pain: [
    { intervention: 'wrist splint', category: 'Lifestyle', tagline: 'Immobilization for hand and wrist pain' },
    { intervention: 'hand strengthening exercises', category: 'Lifestyle', tagline: 'Targeted exercises for hand recovery' },
    { intervention: 'nsaid topical gel', category: 'OTC', tagline: 'Topical anti-inflammatory for hand pain' },
    { intervention: 'paraffin wax bath', category: 'Lifestyle', tagline: 'Warm therapy for hand joint pain' },
    { intervention: 'ergonomic tool grips', category: 'Lifestyle', tagline: 'Adaptive grips for hand pain relief' },
  ],
  eczema: [
    { intervention: 'moisturizer emollient', category: 'OTC', tagline: 'A thick moisturizer for eczema relief' },
    { intervention: 'hydrocortisone cream', category: 'OTC', tagline: 'A topical steroid for eczema flare-ups' },
    { intervention: 'colloidal oatmeal bath', category: 'Herbal', tagline: 'A soothing bath for eczema comfort' },
    { intervention: 'ceramide cream', category: 'OTC', tagline: 'A skin barrier repair cream for eczema' },
    { intervention: 'probiotic supplementation', category: 'Supplement', tagline: 'Beneficial bacteria for skin health' },
  ],
  psoriasis: [
    { intervention: 'vitamin D analogue', category: 'Prescription', tagline: 'Topical vitamin D for plaque psoriasis' },
    { intervention: 'salicylic acid', category: 'OTC', tagline: 'A keratolytic for psoriasis scale removal' },
    { intervention: 'coal tar preparation', category: 'OTC', tagline: 'A traditional treatment for psoriasis' },
    { intervention: 'moisturizer emollient', category: 'OTC', tagline: 'A thick moisturizer for psoriasis relief' },
    { intervention: 'turmeric supplement', category: 'Herbal', tagline: 'An anti-inflammatory spice for psoriasis' },
  ],
  sunburn: [
    { intervention: 'aloe vera topical', category: 'Herbal', tagline: 'A cooling gel for sunburn relief' },
    { intervention: 'hydrocortisone cream', category: 'OTC', tagline: 'A topical steroid for sunburn inflammation' },
    { intervention: 'cool compress', category: 'Lifestyle', tagline: 'Cold therapy for sunburn comfort' },
    { intervention: 'oral nsaid', category: 'OTC', tagline: 'Oral anti-inflammatory for sunburn pain' },
    { intervention: 'moisturizer after sun', category: 'OTC', tagline: 'Hydrating lotion for sunburn recovery' },
  ],
  fungal_infection: [
    { intervention: 'clotrimazole', category: 'OTC', tagline: 'A topical antifungal for skin infections' },
    { intervention: 'terbinafine', category: 'OTC', tagline: 'A topical antifungal for nail and skin' },
    { intervention: 'tea tree oil', category: 'Herbal', tagline: 'An antifungal essential oil for skin' },
    { intervention: 'probiotic supplementation', category: 'Supplement', tagline: 'Beneficial bacteria for fungal prevention' },
    { intervention: 'garlic supplement', category: 'Herbal', tagline: 'An antifungal supplement for infections' },
  ],
  rosacea: [
    { intervention: 'metronidazole topical', category: 'Prescription', tagline: 'A topical antibiotic for rosacea' },
    { intervention: 'azelaic acid', category: 'Prescription', tagline: 'A topical acid for rosacea management' },
    { intervention: 'ivermectin topical', category: 'Prescription', tagline: 'A topical antiparasitic for rosacea' },
    { intervention: 'green tea extract topical', category: 'Herbal', tagline: 'An anti-inflammatory for rosacea redness' },
    { intervention: 'sunscreen daily', category: 'Lifestyle', tagline: 'UV protection for rosacea prevention' },
  ],
  sleep_apnea: [
    { intervention: 'continuous positive airway pressure', category: 'Lifestyle', tagline: 'Gold standard treatment for obstructive sleep apnea' },
    { intervention: 'oral appliance therapy', category: 'Lifestyle', tagline: 'A dental device for mild sleep apnea' },
    { intervention: 'weight management', category: 'Lifestyle', tagline: 'Weight reduction for sleep apnea improvement' },
    { intervention: 'positional therapy', category: 'Lifestyle', tagline: 'Side sleeping for sleep apnea management' },
    { intervention: 'throat exercises', category: 'Lifestyle', tagline: 'Strengthening exercises for airway opening' },
  ],
  restless_leg: [
    { intervention: 'iron supplementation', category: 'Supplement', tagline: 'Iron for restless leg syndrome relief' },
    { intervention: 'regular exercise', category: 'Lifestyle', tagline: 'Moderate exercise for restless leg improvement' },
    { intervention: 'magnesium supplementation', category: 'Supplement', tagline: 'A mineral for muscle relaxation' },
    { intervention: 'hot cold compress', category: 'Lifestyle', tagline: 'Alternating heat and ice for comfort' },
    { intervention: 'leg massage', category: 'Lifestyle', tagline: 'Massage therapy for restless leg relief' },
  ],
  night_sweats: [
    { intervention: 'clonidine', category: 'Prescription', tagline: 'A medication studied for night sweats' },
    { intervention: 'black cohosh', category: 'Herbal', tagline: 'An herbal remedy for menopausal night sweats' },
    { intervention: 'breathable sleepwear', category: 'Lifestyle', tagline: 'Moisture-wicking clothing for night sweats' },
    { intervention: 'bedroom temperature control', category: 'Lifestyle', tagline: 'Cool sleeping environment for comfort' },
    { intervention: 'vitamin E supplementation', category: 'Supplement', tagline: 'An antioxidant for menopausal symptoms' },
  ],
  teeth_grinding: [
    { intervention: 'night guard', category: 'Lifestyle', tagline: 'A dental appliance for teeth grinding' },
    { intervention: 'stress management', category: 'Lifestyle', tagline: 'Relaxation techniques for bruxism prevention' },
    { intervention: 'jaw relaxation exercises', category: 'Lifestyle', tagline: 'Exercises for jaw muscle relaxation' },
    { intervention: 'bite adjustment', category: 'Lifestyle', tagline: 'Dental adjustment for bite alignment' },
    { intervention: 'muscle relaxant', category: 'Prescription', tagline: 'A medication for severe bruxism' },
  ],
  tinnitus: [
    { intervention: 'sound therapy', category: 'Lifestyle', tagline: 'Background sound for tinnitus habituation' },
    { intervention: 'hearing aid use', category: 'Lifestyle', tagline: 'Amplification for tinnitus relief' },
    { intervention: 'ginkgo biloba', category: 'Herbal', tagline: 'An herbal supplement for tinnitus' },
    { intervention: 'cognitive behavioral therapy', category: 'Lifestyle', tagline: 'Therapy for tinnitus distress management' },
    { intervention: 'masking devices', category: 'Lifestyle', tagline: 'Sound generators for tinnitus masking' },
  ],
  vertigo: [
    { intervention: 'Epley maneuver', category: 'Lifestyle', tagline: 'A repositioning maneuver for BPPV' },
    { intervention: 'meclizine', category: 'OTC', tagline: 'An antihistamine for vertigo relief' },
    { intervention: 'brandt daroff exercises', category: 'Lifestyle', tagline: 'Exercises for vertigo habituation' },
    { intervention: 'vitamin D supplementation', category: 'Supplement', tagline: 'A vitamin for vestibular health' },
    { intervention: 'ginger tea', category: 'Herbal', tagline: 'A natural remedy for vertigo nausea' },
  ],
  neuropathy: [
    { intervention: 'alpha-lipoic acid', category: 'Supplement', tagline: 'An antioxidant studied for neuropathic pain' },
    { intervention: 'capsaicin topical cream', category: 'OTC', tagline: 'A topical cream for nerve pain relief' },
    { intervention: 'b vitamins complex', category: 'Supplement', tagline: 'B vitamins for nerve health support' },
    { intervention: 'acupuncture', category: 'Lifestyle', tagline: 'Traditional Chinese medicine for nerve pain' },
    { intervention: 'tENS therapy', category: 'Lifestyle', tagline: 'Electrical stimulation for nerve pain relief' },
  ],
  sciatica: [
    { intervention: ' McKenzie method', category: 'Lifestyle', tagline: 'A physiotherapy approach for sciatica' },
    { intervention: 'mckenzie extension exercises', category: 'Lifestyle', tagline: 'Targeted exercises for disc-related sciatica' },
    { intervention: 'sciatic nerve glides', category: 'Lifestyle', tagline: 'Nerve mobilization exercises for sciatica' },
    { intervention: 'heat cold therapy', category: 'Lifestyle', tagline: 'Alternating heat and ice for pain relief' },
    { intervention: 'yoga for sciatica', category: 'Lifestyle', tagline: 'Gentle yoga for sciatica relief' },
  ],
  palpitations: [
    { intervention: 'magnesium supplementation', category: 'Supplement', tagline: 'A mineral for heart rhythm support' },
    { intervention: 'deep breathing exercises', category: 'Lifestyle', tagline: 'Breathing techniques for palpitation relief' },
    { intervention: 'reduced caffeine intake', category: 'Lifestyle', tagline: 'Caffeine reduction for palpitation prevention' },
    { intervention: 'coenzyme Q10', category: 'Supplement', tagline: 'A supplement for heart health support' },
    { intervention: 'vagal maneuver techniques', category: 'Lifestyle', tagline: 'Techniques to stop palpitations' },
  ],
  poor_circulation: [
    { intervention: 'regular aerobic exercise', category: 'Lifestyle', tagline: 'Physical activity for circulation improvement' },
    { intervention: 'compression stockings', category: 'Lifestyle', tagline: 'Graduated compression for circulation support' },
    { intervention: 'cayenne pepper supplement', category: 'Herbal', tagline: 'A spice for circulation support' },
    { intervention: 'leg elevation', category: 'Lifestyle', tagline: 'Positioning for circulation improvement' },
    { intervention: 'ginger tea', category: 'Herbal', tagline: 'A warming tea for circulation support' },
  ],
  edema: [
    { intervention: 'leg elevation', category: 'Lifestyle', tagline: 'Positioning for dependent edema relief' },
    { intervention: 'compression therapy', category: 'Lifestyle', tagline: 'External compression for edema management' },
    { intervention: 'dandelion tea', category: 'Herbal', tagline: 'A natural diuretic for fluid retention' },
    { intervention: 'reduce sodium intake', category: 'Lifestyle', tagline: 'Dietary changes for edema prevention' },
    { intervention: 'horse chestnut extract', category: 'Herbal', tagline: 'An herbal supplement for venous insufficiency' },
  ],
  anemia: [
    { intervention: 'ferrous sulfate', category: 'Supplement', tagline: 'Standard oral iron supplementation' },
    { intervention: 'vitamin C with iron', category: 'Supplement', tagline: 'Iron absorption enhancer' },
    { intervention: 'iron-rich foods', category: 'Lifestyle', tagline: 'Dietary iron for anemia prevention' },
    { intervention: 'folate supplementation', category: 'Supplement', tagline: 'A B vitamin for red blood cell production' },
    { intervention: 'liver extract supplement', category: 'Supplement', tagline: 'A natural iron source for anemia' },
  ],
  arthritis: [
    { intervention: 'glucosamine', category: 'Supplement', tagline: 'A supplement studied for joint pain in arthritis' },
    { intervention: 'turmeric curcumin', category: 'Herbal', tagline: 'An anti-inflammatory spice studied in arthritis' },
    { intervention: 'fish oil omega-3', category: 'Supplement', tagline: 'Essential fatty acids for joint inflammation' },
    { intervention: 'boswellia serrata', category: 'Herbal', tagline: 'An herbal anti-inflammatory for joints' },
    { intervention: 'physical therapy exercises', category: 'Lifestyle', tagline: 'Joint-friendly exercises for arthritis' },
  ],
  ibs: [
    { intervention: 'low FODMAP diet', category: 'Lifestyle', tagline: 'Dietary restriction for IBS symptom relief' },
    { intervention: 'peppermint oil enteric', category: 'Herbal', tagline: 'An enteric-coated oil for IBS symptoms' },
    { intervention: 'probiotic supplements', category: 'Supplement', tagline: 'Beneficial bacteria for IBS management' },
    { intervention: 'psyllium husk fiber', category: 'Supplement', tagline: 'A bulk-forming fiber for IBS-C' },
    { intervention: 'antispasmodic medication', category: 'Prescription', tagline: 'A medication for IBS cramping' },
  ],
  hemorrhoids: [
    { intervention: 'witch hazel', category: 'Herbal', tagline: 'A topical astringent for hemorrhoid relief' },
    { intervention: 'stool softener', category: 'OTC', tagline: 'To reduce straining during bowel movements' },
    { intervention: 'hydrocortisone cream', category: 'OTC', tagline: 'A topical steroid for hemorrhoid inflammation' },
    { intervention: 'sitz bath', category: 'Lifestyle', tagline: 'Warm water therapy for hemorrhoid comfort' },
    { intervention: 'fiber supplementation', category: 'Supplement', tagline: 'Fiber for softer stools and hemorrhoid prevention' },
  ],
  gerd: [
    { intervention: 'proton pump inhibitor', category: 'OTC', tagline: 'Acid suppression for reflux symptoms' },
    { intervention: 'deglycyrrhizinated licorice', category: 'Herbal', tagline: 'A demulcent herbal option for mild reflux' },
    { intervention: 'melatonin', category: 'Supplement', tagline: 'A supplement studied for GERD symptom relief' },
    { intervention: 'famotidine', category: 'OTC', tagline: 'An H2 blocker for acid reflux relief' },
    { intervention: 'elevate head during sleep', category: 'Lifestyle', tagline: 'Positioning for nighttime reflux prevention' },
  ],
  hair_loss: [
    { intervention: 'minoxidil topical', category: 'OTC', tagline: 'A topical solution for hair regrowth' },
    { intervention: 'biotin supplementation', category: 'Supplement', tagline: 'A B vitamin for hair health' },
    { intervention: 'saw palmetto', category: 'Herbal', tagline: 'An herbal remedy for hair loss prevention' },
    { intervention: 'iron supplementation', category: 'Supplement', tagline: 'Iron for hair loss related to deficiency' },
    { intervention: 'scalp massage', category: 'Lifestyle', tagline: 'Massage for scalp circulation improvement' },
  ],
  sprain: [
    { intervention: 'RICE protocol', category: 'Lifestyle', tagline: 'Rest, Ice, Compression, Elevation for sprains' },
    { intervention: 'ankle brace', category: 'Lifestyle', tagline: 'Supportive brace for sprain recovery' },
    { intervention: 'ibuprofen', category: 'OTC', tagline: 'An NSAID for sprain pain and inflammation' },
    { intervention: 'physical therapy', category: 'Lifestyle', tagline: 'Rehabilitation exercises for sprain recovery' },
    { intervention: 'compression bandage', category: 'OTC', tagline: 'Elastic bandage for sprain support' },
  ],
  insect_bite: [
    { intervention: 'hydrocortisone cream', category: 'OTC', tagline: 'A topical steroid for insect bite relief' },
    { intervention: 'antihistamine oral', category: 'OTC', tagline: 'Oral medication for bite-related itching' },
    { intervention: 'calamine lotion', category: 'OTC', tagline: 'A soothing lotion for insect bites' },
    { intervention: 'baking soda paste', category: 'Herbal', tagline: 'A natural remedy for bite itch relief' },
    { intervention: 'ice pack therapy', category: 'Lifestyle', tagline: 'Cold therapy for insect bite swelling' },
  ],
  minor_burn: [
    { intervention: 'aloe vera gel', category: 'Herbal', tagline: 'A topical gel for minor burn comfort' },
    { intervention: 'cool running water', category: 'Lifestyle', tagline: 'First aid for burn cooling' },
    { intervention: 'silver sulfadiazine', category: 'OTC', tagline: 'A topical antimicrobial for burn care' },
    { intervention: 'honey topical', category: 'Herbal', tagline: 'A natural antimicrobial for burn healing' },
    { intervention: 'petroleum jelly', category: 'OTC', tagline: 'A protective ointment for minor burns' },
  ],
  bruising: [
    { intervention: 'arnica montana', category: 'Herbal', tagline: 'A topical herbal remedy for bruising' },
    { intervention: 'vitamin K cream', category: 'Supplement', tagline: 'Topical vitamin K for bruise resolution' },
    { intervention: 'cold compress', category: 'Lifestyle', tagline: 'Cold therapy for bruise prevention' },
    { intervention: 'bromelain supplement', category: 'Supplement', tagline: 'An enzyme for bruise healing' },
    { intervention: 'pineapple extract', category: 'Herbal', tagline: 'A natural source of bromelain for bruises' },
  ],
  loss_of_appetite: [
    { intervention: 'ginger', category: 'Herbal', tagline: 'An herbal remedy that may stimulate appetite' },
    { intervention: 'small frequent meals', category: 'Lifestyle', tagline: 'Dietary strategy for appetite improvement' },
    { intervention: 'exercise before meals', category: 'Lifestyle', tagline: 'Physical activity for appetite stimulation' },
    { intervention: 'bitter herbs', category: 'Herbal', tagline: 'Herbal bitters for digestive appetite support' },
    { intervention: 'zinc supplementation', category: 'Supplement', tagline: 'A mineral for taste and appetite support' },
  ],
  chills: [
    { intervention: 'warm blankets', category: 'Lifestyle', tagline: 'Warmth for chills comfort' },
    { intervention: 'warm fluids', category: 'Lifestyle', tagline: 'Hot drinks for warmth and comfort' },
    { intervention: 'fever reducer medication', category: 'OTC', tagline: 'Medication for fever-related chills' },
    { intervention: 'layered clothing', category: 'Lifestyle', tagline: 'Dress warmly for chills prevention' },
    { intervention: 'warm bath', category: 'Lifestyle', tagline: 'Warm water therapy for chills relief' },
  ],
  swollen_lymph_nodes: [
    { intervention: 'warm compress', category: 'Lifestyle', tagline: 'A comfort measure for tender lymph nodes' },
    { intervention: 'rest and hydration', category: 'Lifestyle', tagline: 'Adequate rest for immune system support' },
    { intervention: 'nsaid pain reliever', category: 'OTC', tagline: 'Pain medication for lymph node discomfort' },
    { intervention: 'echinacea supplement', category: 'Herbal', tagline: 'An herbal immune stimulant' },
    { intervention: 'salt water gargle', category: 'Lifestyle', tagline: 'A soothing rinse for throat-related swelling' },
  ],
  low_libido: [
    { intervention: 'stress management', category: 'Lifestyle', tagline: 'Relaxation techniques for libido support' },
    { intervention: 'regular exercise', category: 'Lifestyle', tagline: 'Physical activity for libido improvement' },
    { intervention: 'maca root', category: 'Herbal', tagline: 'An herbal supplement for sexual desire' },
    { intervention: 'ashwagandha', category: 'Herbal', tagline: 'An adaptogenic herb for stress-related low libido' },
    { intervention: 'vitamin D supplementation', category: 'Supplement', tagline: 'A vitamin for hormonal balance support' },
  ],
  erectile_difficulty: [
    { intervention: 'pelvic floor exercises', category: 'Lifestyle', tagline: 'Kegel exercises for erectile function' },
    { intervention: 'l-arginine supplementation', category: 'Supplement', tagline: 'An amino acid for blood flow support' },
    { intervention: 'regular aerobic exercise', category: 'Lifestyle', tagline: 'Physical activity for cardiovascular health' },
    { intervention: 'weight management', category: 'Lifestyle', tagline: 'Weight reduction for erectile function' },
    { intervention: 'yohimbe supplement', category: 'Herbal', tagline: 'An herbal supplement for erectile support' },
  ],
  vaginal_dryness: [
    { intervention: 'vaginal moisturizer', category: 'OTC', tagline: 'A moisturizer for vaginal dryness relief' },
    { intervention: 'vaginal estrogen', category: 'Prescription', tagline: 'A topical hormone for vaginal moisture' },
    { intervention: 'coconut oil lubricant', category: 'Herbal', tagline: 'A natural lubricant for comfort' },
    { intervention: 'phytoestrogen supplements', category: 'Supplement', tagline: 'Plant estrogens for vaginal health' },
    { intervention: 'hyaluronic acid gel', category: 'OTC', tagline: 'A hydrating gel for vaginal moisture' },
  ],
  painful_intercourse: [
    { intervention: 'vaginal moisturizer', category: 'OTC', tagline: 'A moisturizer for vaginal dryness and discomfort' },
    { intervention: 'pelvic floor physical therapy', category: 'Lifestyle', tagline: 'Rehabilitation for pelvic pain relief' },
    { intervention: 'lubricant use', category: 'OTC', tagline: 'Personal lubricant for comfortable intercourse' },
    { intervention: 'relaxation techniques', category: 'Lifestyle', tagline: 'Stress reduction for painful intercourse' },
    { intervention: 'vaginal dilator therapy', category: 'Lifestyle', tagline: 'Progressive dilation for vaginismus relief' },
  ],
};

async function discoverPubMed(intervention, condition) {
  const query = `(${intervention}[Title/Abstract]) AND (${condition}[Title/Abstract]) AND (systematic review[pt] OR meta-analysis[pt] OR randomized controlled trial[pt] OR clinical trial[pt] OR practice guideline[pt])`;
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
  const query = `TITLE_ABS:"${intervention}" AND TITLE_ABS:"${condition}" AND (PUB_TYPE:"systematic review" OR PUB_TYPE:"meta-analysis" OR PUB_TYPE:"randomized controlled trial" OR PUB_TYPE:"practice guideline")`;
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

async function discoverGoogleScholar(intervention, condition) {
  if (!SCRAPINGBEE_API_KEY || SCRAPINGBEE_API_KEY.length < 10) return [];
  if (SCHOLAR_QUOTA.used >= SCHOLAR_QUOTA.total) return [];
  const query = `${intervention} ${condition} clinical trial OR systematic review OR meta-analysis`;
  const url = new URL('https://app.scrapingbee.com/api/v1/');
  url.search = new URLSearchParams({ api_key: SCRAPINGBEE_API_KEY, search: 'google_scholar', q: query, country_code: 'us', language: 'en', as_ylo: '2015' }).toString();
  try {
    const response = await fetchJson(url.toString());
    SCHOLAR_QUOTA.used++;
    return (response.organic_results || []).slice(0, perSource).map(result => {
      const pmidMatch = result.snippet?.match(/PMID:\s*(\d+)/i) || result.link?.match(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)/);
      const pmid = pmidMatch?.[1] || null;
      const doiMatch = result.snippet?.match(/doi[:\s]+(10\.\d{4,}\/\S+)/i) || result.link?.match(/doi\.org\/(10\.\d{4,}\/\S+)/);
      return {
        retrievalSource: 'Google Scholar', publicationId: pmid ? `pmid:${pmid}` : doiMatch?.[1] ? `doi:${doiMatch[1]}` : `scholar:${result.position}`,
        pmid, doi: doiMatch?.[1] || null, url: pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` : result.link || null,
        title: result.title || null, journal: result.publication_info?.split?.(',')[0] || null,
        year: result.publication_info?.match?.(/\d{4}/)?.[0] || null, publicationTypes: [], abstract: null,
        citedByCount: result.cited_by?.value ?? null, semanticStatus: 'unassessed',
      };
    });
  } catch { return []; }
}

async function discoverForSymptom(symptomCode, interventions) {
  const condition = symptomCode.replace(/_/g, ' ');
  const allCandidates = [];
  for (const { intervention, category, tagline } of interventions) {
    const results = await Promise.allSettled([
      discoverPubMed(intervention, condition),
      discoverEuropePmc(intervention, condition),
      discoverGoogleScholar(intervention, condition),
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

const output = resolve('reports/comprehensive-discovery.json');
const report = { generatedAt: new Date().toISOString(), symptomCount: Object.keys(interventionsBySymptom).length, packets: [] };

for (const [symptomCode, interventions] of Object.entries(interventionsBySymptom)) {
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
console.log(`\nComprehensive discovery: ${totalCandidates} candidates across ${report.symptomCount} symptoms.`);
console.log(`Google Scholar quota used: ${SCHOLAR_QUOTA.used}/${SCHOLAR_QUOTA.total}`);
