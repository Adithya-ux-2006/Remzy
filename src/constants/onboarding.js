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

export const ABOUT_REMZY_ITEMS = [
  {
    question: 'Our Mission',
    answer: 'Remzy exists to help people understand their symptoms and explore evidence-informed options with clear, honest labeling — without ever replacing professional care. The goal is health information that is easy to navigate, so you can go into a conversation with a doctor better informed, not less cautious.',
  },
  {
    question: 'Why We Built Remzy',
    answer: 'Health information online is often overwhelming, unsourced, or hard to trust. We built Remzy to make it easier to see what is backed by published research and what is not — so the choices you make about your health are grounded in something you can actually verify.',
  },
  {
    question: 'Our Values',
    answer: 'Evidence comes first, and we are honest about what is and is not well-supported. We avoid fear-based framing, label uncertainty plainly, and try to keep the information clear enough that it is useful whether or not you have a medical background.',
  },
  {
    question: 'How We Review Evidence',
    answer: 'Remzy distinguishes peer-reviewed clinical research and established guidance from traditional and supportive approaches, and is explicit when something lacks established evidence rather than presenting it as equally validated. Sources are labeled so you can see what kind of support a claim actually has.',
  },
  {
    question: 'Who Remzy Is For',
    answer: 'Remzy is for anyone trying to understand a symptom and their options before deciding next steps. It is not a replacement for diagnosis or treatment — it is a starting point for more informed conversations with a doctor.',
  },
  {
    question: 'What\'s Next / Roadmap',
    answer: 'Looking ahead, we want to expand symptom coverage, keep refining how evidence is reviewed and labeled, and improve personalization so the information you see fits your situation better.',
  },
];

export const FAQ_ITEMS = [
  {
    question: 'Are these remedies safe to use?',
    answer: 'Remzy shows linked research or guidance where a source has been identified and clearly separates claim-reviewed evidence from sources whose relevance is still under review. Not every remedy has established clinical evidence. Traditional and supportive approaches are labeled separately. Remzy is informational only and is not a substitute for medical advice. Consult a qualified medical professional before starting treatment, especially if you have a health condition, take medication, are pregnant, or are unsure whether it is safe for you.',
  },
  {
    question: 'What\'s the difference between remedy categories?',
    answer: 'Remedies are grouped into four categories: Natural, Lifestyle, OTC (Over the Counter), and TCM (Traditional Chinese Medicine). Each is labeled separately so you can see what kind of approach you are looking at.',
  },
  {
    question: 'Can I use Remzy instead of seeing a doctor?',
    answer: 'No. Remzy can help you explore remedy information, but it cannot diagnose you or replace a qualified medical professional. If your symptoms are severe, persistent, worsening, or feel urgent, seek professional medical care immediately. You can also use the Find Medical Centres Near You feature on a remedy page to locate nearby care.',
  },
  {
    question: 'Where does the research come from?',
    answer: 'Remzy systematically uses five main source types: peer-reviewed journal articles indexed in PubMed; systematic reviews from the Cochrane Library; clinical guidelines and evidence summaries from NICE (the UK National Institute for Health and Care Excellence); clinical and evidence guidance from the World Health Organization through WHO IRIS and WHO eLENA; and public-health guidance from the US Centers for Disease Control and Prevention (CDC). Europe PMC and DOI publisher records may also be used as supplemental bibliographic sources. A pipeline checks each source domain and, where the source permits automated access, its canonical title, publisher or organization, year, and evidence type. Sources that block automated metadata access are explicitly marked for manual metadata review. Population, intervention, outcome, and applicability always require explicit content review; a working link alone is never treated as proof.',
  },
  {
    question: 'How are remedies personalized to me?',
    answer: 'When you complete the health-profile questionnaire, Remzy uses the conditions, allergies, age information, and treatment preferences you provide to rank relevant options and filter remedies with identified conflicts. If you skip the questionnaire or leave it incomplete, Remzy has less context about you, so your results and safety filtering will be less personalized and may be less accurate for your needs.',
  },
  {
    question: 'What is Child Safe Mode?',
    answer: 'Child Safe Mode removes remedies that are not recommended for children from your results, so you can search more confidently on behalf of a child. Toggle it on from the search results page whenever needed. Remedies whose child safety has not been reviewed yet are not hidden — they show a caution badge instead.',
  },
  {
    question: 'Is my health data private?',
    answer: 'Your account and health-profile information is stored through Supabase and protected by authenticated, user-specific access controls. Remzy does not sell your personal data. For complex or ambiguous searches, the symptom text you enter may be sent to Google Gemini through a server-side service to help interpret the query; it is not sent with your Remzy identity. If you use Remzy as a guest, profile information is kept in your browser. See the Privacy Policy for full details or to request deletion of your data.',
  },
  {
    question: 'How do I save a remedy?',
    answer: 'Tap the heart icon on a remedy card or on the Remedy Detail page. You must be signed in to add or remove a remedy from Favorites; if you are not signed in, Remzy will take you to account registration. Your favorites are linked to your account and available from the Saved page whenever you sign in.',
  },
  {
    question: 'How do Treatment Reminders work?',
    answer: 'You can schedule reminders for any remedy directly from its detail page or card. Reminders show up on your Treatment Reminders dashboard, where you can track today\'s schedule, upcoming reminders, and what you\'ve already completed.',
  },
  {
    question: 'What do the warning badges mean?',
    answer: 'Use this safety-badge key: Green “Safe” or “Generally Safe” means Remzy found no known conflict with the health-profile information you provided. Yellow “Check,” “Allergy conflict detected,” or “Check with a professional first” means the remedy may conflict with a reported allergy, condition, or child-safety rule and should be reviewed with a qualified medical professional before use. Red “Not Recommended” means Remzy identified a stronger allergy or child-safety conflict and the remedy should be avoided unless a qualified medical professional specifically advises otherwise. These automated badges depend on the completeness of your profile and do not guarantee that a remedy is safe. Evidence badges report linked-source counts, Supportive Care, or Traditional Use; they do not grade clinical quality or personal safety.',
  },
  {
    question: 'Which countries is Remzy available in?',
    answer: 'Remzy is available globally, and its current content is in English. The current remedy catalog is organized into three categories: OTC treatments, natural remedies, and lifestyle care. Availability, product names, and medical guidance can vary by country, so check local instructions and consult a qualified medical professional when needed.',
  },
];
