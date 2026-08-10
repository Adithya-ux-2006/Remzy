import { motion } from 'framer-motion';
import { Search, ArrowDown, ShieldCheck, AlertTriangle, Sparkles, Clock } from 'lucide-react';
import { cn } from '../../utils/cn';
import { CategoryBadge } from './CategoryBadge';
import { getEvidenceText } from '../../utils/evidence';

const CAUSES = {
  back_pain: ['Muscle Strain', 'Poor Posture', 'Sedentary Lifestyle', 'Heavy Lifting'],
  leg_pain: ['Muscle Fatigue', 'Overexertion', 'Poor Circulation', 'Dehydration'],
  knee_pain: ['Overuse', 'Poor Biomechanics', 'Weak Support Muscles', 'Inflammation'],
  neck_pain: ['Poor Posture', 'Tech Neck', 'Sleep Position', 'Stress Tension'],
  shoulder_pain: ['Muscle Tension', 'Poor Posture', 'Overhead Activity', 'Sleep Position'],
  eye_pain: ['Digital Eye Strain', 'Dry Eyes', 'Eye Fatigue', 'Poor Lighting'],
  sore_throat: ['Dry Air', 'Seasonal Allergies', 'Voice Strain', 'Post-Nasal Drip'],
  eye_strain: ['Extended Screens', 'Poor Lighting', 'Uncorrected Vision', 'Dry Air'],
  period_cramps: ['Hormonal Changes', 'Prostaglandin Release', 'Uterine Contractions'],
  fever: ['Immune Response', 'Seasonal Infection', 'Inflammation', 'Overexertion'],
  skin_rash: ['Contact Irritant', 'Seasonal Allergies', 'Dry Skin', 'Heat or Friction'],
  ear_pain: ['Eustachian Congestion', 'Pressure Changes', 'Wax Buildup'],
  bloating: ['Dietary Triggers', 'Swallowed Air', 'Digestive Sluggishness', 'Food Intolerance'],
  hangover: ['Dehydration', 'Alcohol Metabolism', 'Sleep Disruption', 'Blood Sugar Shift'],
  headache: ['Tension', 'Dehydration', 'Eye Strain', 'Sleep Disruption', 'Stress'],
  migraine: ['Neurological Sensitivity', 'Hormonal Shifts', 'Environmental Triggers'],
  cold: ['Seasonal Virus', 'Immune Response', 'Dry Mucous Membranes'],
  congestion: ['Common Cold', 'Seasonal Allergies', 'Sinus Irritation', 'Dry Air'],
  cough: ['Airway Irritation', 'Post-Nasal Drip', 'Dry Air', 'Reflux Irritation'],
  sinus_pressure: ['Sinus Congestion', 'Seasonal Allergies', 'Barometric Changes', 'Inflammation'],
  anxiety: ['Stress Response', 'Cognitive Overload', 'Caffeine Sensitivity', 'Sleep Debt'],
  insomnia: ['Stress', 'Caffeine Timing', 'Screen Exposure', 'Irregular Schedule'],
  nausea: ['Digestive Irritation', 'Inner Ear Disturbance', 'Odor Sensitivity', 'Anxious'],
  stress: ['Work Pressure', 'Information Overload', 'Sleep Disruption', 'Lifestyle'],
  fatigue: ['Sleep Debt', 'Nutritional Gaps', 'Stress', 'Sedentary Lifestyle'],
  low_energy: ['Sleep Quality', 'Hydration Status', 'Nutrition', 'Movement'],
  burnout: ['Chronic Stress', 'Insufficient Recovery', 'Work-Life Imbalance', 'Sleep Debt'],
  brain_fog: ['Sleep Deprivation', 'Stress', 'Poor Nutrition', 'Hormonal Changes', 'Dehydration'],
  joint_pain: ['Inflammation', 'Overuse', 'Weather Changes', 'Age-Related Changes'],
  muscle_pain: ['Overexertion', 'Poor Recovery', 'Dehydration', 'Sedentary Habits'],
  indigestion: ['Eating Too Fast', 'Large Meals', 'Food Triggers', 'Stress'],
  heartburn: ['Dietary Triggers', 'Meal Timing', 'Abdominal Pressure', 'Lying Down'],
  constipation: ['Low Fiber', 'Insufficient Hydration', 'Sedentary Lifestyle', 'Ignoring Urge'],
  diarrhea: ['Dietary Sensitivity', 'Stress Response', 'Hydration Imbalance'],
  stomach_ache: ['Digestive Sensitivity', 'Meal Timing', 'Food Triggers', 'Stress'],
  gas: ['Swallowed Air', 'Fiber Fermentation', 'Food Intolerance', 'Eating Quickly'],
  dehydration: ['Insufficient Intake', 'Excess Caffeine', 'Physical Exertion', 'Dry Air'],
  pms: ['Hormonal Fluctuation', 'Serotonin Changes', 'Nutrient Shifts', 'Stress'],
  menopause: ['Hormonal Transition', 'Temperature Regulation', 'Sleep Disruption'],
  dry_skin: ['Low Humidity', 'Frequent Washing', 'Cold Weather', 'Nutrient Gaps'],
  acne: ['Hormonal Fluctuation', 'Pore Congestion', 'Inflammation', 'Skincare Routine'],
};

export function SymptomInterpreter({
  symptom,
  confidence,
  topRemedy,
  evidenceScore,
  categoryCounts,
  safetyNote,
  isSafe,
  isEmergency,
  onViewRemedies,
  relatedSymptoms,
  className,
}) {
  const causes = symptom ? CAUSES[symptom.id] || CAUSES[symptom.label?.toLowerCase()] || null : null;

  const confidenceColor =
    confidence >= 95 ? 'text-primary' :
    confidence >= 80 ? 'text-primary-light' :
    confidence >= 60 ? 'text-amber-600' :
    'text-ink-muted';

  const confidenceBarColor =
    confidence >= 95 ? 'bg-accent' :
    confidence >= 80 ? 'bg-accent' :
    confidence >= 60 ? 'bg-amber-400' :
    'bg-ink-subtle';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn('bg-card rounded-3xl shadow-card overflow-hidden', className)}
    >
      <div className="h-2 bg-gradient-to-r from-accent via-accent-light to-accent" />

      <div className="p-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-surface flex items-center justify-center">
            <Search className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            Symptom Interpretation
          </span>
        </div>

        <div className="flex items-start justify-between gap-4 mt-3">
          <div>
            <p className="text-xs text-ink-muted mb-0.5">
              Detected Symptom
            </p>
            <h2 className="text-2xl font-bold text-ink">
              {symptom?.label || 'Unknown'}
            </h2>
          </div>
          <div className="flex flex-col items-end">
            <span className={cn('text-lg font-bold', confidenceColor)}>
              {confidence}%
            </span>
            <span className="text-[10px] text-ink-subtle uppercase tracking-wider">
              Confidence
            </span>
            <div className="w-16 h-1.5 bg-surface rounded-full mt-1 overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all', confidenceBarColor)}
                style={{ width: `${confidence}%` }}
              />
            </div>
          </div>
        </div>

        {causes && causes.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
              Possible Causes
            </p>
            <div className="flex flex-wrap gap-1.5">
              {causes.map((cause) => (
                <span
                  key={cause}
                  className="text-xs px-2.5 py-1 rounded-full bg-surface text-ink-muted font-medium"
                >
                  {cause}
                </span>
              ))}
            </div>
          </div>
        )}

        {relatedSymptoms && relatedSymptoms.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
              Related Symptoms
            </p>
            <div className="flex flex-wrap gap-1.5">
              {relatedSymptoms.map((rs) => (
                <span
                  key={rs.id}
                  className="text-xs px-2.5 py-1 rounded-full bg-accent/10 text-primary-dark font-medium"
                >
                  {rs.emoji} {rs.label}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="my-5 border-t border-border" />

        {isEmergency ? (
          <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <p className="font-semibold text-red-700 text-sm">Urgent Medical Attention May Be Needed</p>
            </div>
            <p className="text-red-600 text-xs leading-relaxed">
              Do not rely on self-treatment guidance. Seek immediate medical care.
            </p>
          </div>
        ) : topRemedy ? (
          <div>
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
              Top Recommendation
            </p>
            <div className="rounded-2xl bg-surface p-4">
              <div className="flex items-center gap-2 mb-1">
                <CategoryBadge category={topRemedy.category} />
                {evidenceScore != null && (
                  <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                    {getEvidenceText(evidenceScore)}
                  </span>
                )}
              </div>
              <p className="text-base font-semibold text-ink">{topRemedy.name}</p>
              <p className="text-xs text-ink-muted mt-1 line-clamp-1">{topRemedy.shortDescription}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-ink-muted">
                {topRemedy.timeToEffect && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {topRemedy.timeToEffect}
                  </span>
                )}
                {topRemedy.difficulty && (
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {topRemedy.difficulty}
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {categoryCounts && !isEmergency && (
          <div className="mt-5">
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
              Available Remedies
            </p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(categoryCounts).map(([cat, count]) => {
                if (!count) return null;
                return (
                  <div key={cat} className="rounded-xl bg-surface px-3 py-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-ink-muted">{cat}</span>
                    <span className="text-sm font-bold text-primary">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!isSafe && (
          <div className="mt-4 flex items-start gap-2 text-xs text-yellow-700 bg-yellow-50 px-3 py-2.5 rounded-xl">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>Some remedies may conflict with your health profile. Check individual safety tags.</span>
          </div>
        )}

        {isSafe && safetyNote && (
          <div className="mt-4 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-2.5 rounded-xl">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{safetyNote}</span>
          </div>
        )}

        {isSafe && !safetyNote && !isEmergency && (
          <div className="mt-4 flex items-center gap-2 text-xs text-primary-dark bg-accent/20 px-3 py-2.5 rounded-xl">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>No conflicts with your profile</span>
          </div>
        )}

        {onViewRemedies && !isEmergency && (
          <button
            onClick={onViewRemedies}
            className="mt-5 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-glow hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
          >
            View Remedies
            <ArrowDown className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
