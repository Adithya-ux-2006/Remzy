export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary-other', label: 'Non-binary / Other' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
];
export const AGE_RANGE_OPTIONS = [
  { value: 'under-12', label: 'Under 12' },
  { value: '12-17', label: '12-17' },
  { value: '18-64', label: '18-64' },
  { value: '65-plus', label: '65+' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
];

export const CONDITIONS = [
  { value: 'asthma', label: 'Asthma', emoji: '🫁' },
  { value: 'diabetes', label: 'Diabetes', emoji: '🩸' },
  { value: 'high-blood-pressure', label: 'High Blood Pressure', emoji: '🫀' },
  { value: 'heart-conditions', label: 'Heart Conditions', emoji: '❤️' },
  { value: 'migraines', label: 'Migraines', emoji: '🤕' },
  { value: 'anxiety', label: 'Anxious', emoji: '😰' },
  { value: 'depression', label: 'Depression', emoji: '🌧️' },
  { value: 'ibs-digestive-issues', label: 'IBS / Digestive Issues', emoji: '🤢' },
  { value: 'pcos', label: 'PCOS', emoji: '🌙', relevantFor: ['female'] },
  { value: 'thyroid-disorders', label: 'Thyroid Disorders', emoji: '🦋' },
  { value: 'other', label: 'Other', emoji: '✏️' },
  { value: 'none', label: 'None', emoji: '○' },
];

export function getVisibleConditions(gender, selectedValues = []) {
  if (gender !== 'male' && gender !== 'female') return CONDITIONS;
  const selected = new Set(selectedValues);
  return CONDITIONS.filter((option) => {
    if (!option.relevantFor) return true;
    return option.relevantFor.includes(gender) || selected.has(option.value);
  });
}

export const ALLERGIES = [
  { value: 'nuts', label: 'Nuts', emoji: '🥜' },
  { value: 'dairy', label: 'Dairy', emoji: '🥛' },
  { value: 'eggs', label: 'Eggs', emoji: '🥚' },
  { value: 'soy', label: 'Soy', emoji: '🫘' },
  { value: 'gluten', label: 'Gluten', emoji: '🌾' },
  { value: 'shellfish', label: 'Shellfish', emoji: '🦐' },
  { value: 'pollen', label: 'Pollen', emoji: '🌿' },
  { value: 'herbal', label: 'Herbal Supplements', emoji: '🌱' },
  { value: 'turmeric', label: 'Turmeric', emoji: '🟡' },
  { value: 'ashwagandha', label: 'Ashwagandha', emoji: '🍃' },
  { value: 'tulsi', label: 'Tulsi', emoji: '🌿' },
  { value: 'ginger', label: 'Ginger', emoji: '🫚' },
  { value: 'aloe-vera', label: 'Aloe Vera', emoji: '🪴' },
  { value: 'essential-oils', label: 'Essential Oils', emoji: '🧴' },
  { value: 'other', label: 'Other', emoji: '✏️' },
  { value: 'none', label: 'None', emoji: '○' },
];

export const REMOVED_ALLERGY_VALUES = ['medication-allergies'];

export const TREATMENT_PREFERENCES = [
  { value: 'prefer_natural', label: 'Prefer Natural Remedies', emoji: '🌿', description: 'Prioritize natural and herbal treatments over OTC medicine' },
  { value: 'avoid_medication', label: 'Avoid Medication', emoji: '💊', description: 'Minimize pharmaceutical interventions when possible' },
  { value: 'vegetarian_remedies', label: 'Vegetarian Only', emoji: '🥬', description: 'Only show remedies without animal-derived ingredients' },
];

export const FAQ_ITEMS = [
  {
    question: 'Are these remedies safe to use?',
    answer: 'All remedies on Remzy are sourced from peer-reviewed research and traditional medical literature. However, they are informational only and not a substitute for professional medical advice. Always consult a doctor before starting any new treatment, especially if you have existing conditions or take medication.',
  },
  {
    question: 'Can I use Remzy instead of seeing a doctor?',
    answer: 'No. Remzy is designed to help you understand your options before a doctor visit, not replace one. If your symptoms are severe, persistent, or worsening, please seek professional medical care immediately.',
  },
  {
    question: 'Where does the research come from?',
    answer: 'Our remedy database is built from NIH studies, PubMed meta-analyses, WHO guidelines, and established OTC, lifestyle, natural, and Ayurveda references. Each remedy card links to its source research.',
  },
  {
    question: 'How are remedies personalized to me?',
    answer: 'When you complete the onboarding questionnaire, we use your common conditions, allergies, and treatment preferences to prioritize relevant remedies and flag ones that may not suit you.',
  },
  {
    question: 'Is my health data private?',
    answer: 'Yes. Your allergy and condition data is stored securely in our database and never sold. We do not share personally identifiable information with third parties. Your search queries may be processed through AI services (Google Gemini) to improve search accuracy — this processing is anonymized and not linked to your identity. You can delete your account and all associated data at any time from your Profile page.',
  },
  {
    question: 'How do I save a remedy?',
    answer: 'Tap the heart icon on any remedy card or on the Remedy Detail page. If you are signed in, it saves to Favorites. If not, you can quick-save it with your email and finish creating an account later.',
  },
  {
    question: 'What do the warning badges mean?',
    answer: 'If a remedy contains an ingredient that matches an allergy you reported during onboarding, a yellow warning badge appears on that card. This does not mean you cannot use the remedy - it means you should review the ingredients carefully and consult a doctor if unsure.',
  },
  {
    question: 'Which countries is Remzy available in?',
    answer: 'Remzy is available globally. Remedy content is in English. We include both Western OTC medicine, lifestyle care, natural remedies, and Ayurveda to serve users across different cultural health contexts.',
  },
];
