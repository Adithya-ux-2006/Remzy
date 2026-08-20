import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, ChevronLeft } from 'lucide-react';
import { CONDITIONS, ALLERGIES, GENDER_OPTIONS, REMOVED_ALLERGY_VALUES, getVisibleConditions, TREATMENT_PREFERENCES } from '../../constants/onboarding';
import { cn } from '../../utils/cn';

const STEPS = [
  {
    key: 'gender',
    title: 'Sex / Gender Information *',
    options: GENDER_OPTIONS,
  },
  {
    key: 'conditions',
    title: 'Health Conditions',
    options: CONDITIONS,
  },
  {
    key: 'allergies',
    title: 'Allergies & Sensitivities',
    options: ALLERGIES,
  },
  {
    key: 'treatmentPrefs',
    title: 'Treatment Preferences',
    options: TREATMENT_PREFERENCES,
  },
];

export function QuestionnaireFlow({
  initialValues,
  onSubmit,
  onComplete,
  completeMessage = 'Your dashboard is ready.',
  compact = false,
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [gender, setGender] = useState(initialValues?.gender ?? '');
  const [conditions, setConditions] = useState(initialValues?.common_conditions ?? []);
  const [allergies, setAllergies] = useState(initialValues?.known_allergies ?? []);
  const [treatmentPrefs, setTreatmentPrefs] = useState(initialValues?.treatment_prefs ?? []);
  const [otherAllergy, setOtherAllergy] = useState(
    () => (initialValues?.known_allergies ?? []).find((value) => value.startsWith('other:'))?.slice(6).trim() || ''
  );
  const [otherCondition, setOtherCondition] = useState(
    () => (initialValues?.common_conditions ?? []).find((value) => value.startsWith('other:'))?.slice(6).trim() || ''
  );

  const currentStep = STEPS[stepIndex];
  const progress = useMemo(() => stepIndex + 1, [stepIndex]);

  const handleNoneAwareToggle = (value, selectedValues, setSelectedValues) => {
    if (value === 'none' || value === 'no_preference') {
      setSelectedValues(selectedValues.includes(value) ? [] : [value]);
      return;
    }

    const nextValues = selectedValues.includes(value)
      ? selectedValues.filter((item) => item !== value)
      : [...selectedValues.filter((item) => item !== 'none' && item !== 'no_preference'), value];

    setSelectedValues(nextValues);
  };

  const handleBack = () => {
    if (stepIndex === 0) return;
    setDirection(-1);
    setStepIndex((current) => current - 1);
  };

  const handleContinue = async () => {
    setErrorMessage('');

    if (currentStep.key === 'gender' && !gender) {
      setErrorMessage('Select a sex or gender option to continue.');
      return;
    }

    if (stepIndex < STEPS.length - 1) {
      setDirection(1);
      setStepIndex((current) => current + 1);
      return;
    }

    setIsSaving(true);

    const trimmedOtherAllergy = otherAllergy.trim();
    const normalizedAllergies = allergies.filter(
      (value) => value !== 'none' && !value.startsWith('other:') && !REMOVED_ALLERGY_VALUES.includes(value)
    );

    if (trimmedOtherAllergy) {
      normalizedAllergies.push(`other:${trimmedOtherAllergy}`);
    }

    const trimmedOtherCondition = otherCondition.trim();
    const normalizedConditions = conditions.filter((value) => value !== 'none' && !value.startsWith('other:'));

    if (trimmedOtherCondition) {
      normalizedConditions.push(`other:${trimmedOtherCondition}`);
    }

    const result = await onSubmit({
      gender,
      commonConditions: normalizedConditions,
      knownAllergies: normalizedAllergies,
      treatmentPrefs,
    });

    setIsSaving(false);

    if (!result.success) {
      setErrorMessage(result.error?.message || 'Unable to continue right now.');
      return;
    }

    setShowComplete(true);
    window.setTimeout(() => {
      onComplete?.();
    }, 900);
  };

  if (showComplete) {
    return (
      <div className={cn('flex min-h-[320px] flex-col items-center justify-center text-center', compact ? 'px-2 py-4' : 'min-h-[80vh] px-6 py-10')}>
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="mb-6"
        >
          <CheckCircle2 className="h-16 w-16 text-ink" />
        </motion.div>
        <h1 className={cn('font-extrabold text-ink', compact ? 'text-3xl' : 'text-4xl')}>
          All set
        </h1>
        <p className="mt-3 text-lg text-ink-muted">{completeMessage}</p>
      </div>
    );
  }

  const selectedValues = currentStep.key === 'conditions'
    ? conditions
    : currentStep.key === 'treatmentPrefs'
      ? treatmentPrefs
      : allergies;

  const visibleOptions = currentStep.key === 'conditions'
    ? getVisibleConditions(gender, conditions)
    : currentStep.options;

  return (
    <div className={cn('mx-auto flex flex-col rounded-[2rem] bg-transparent', compact ? 'min-h-0 flex-1 max-w-2xl' : 'min-h-[82vh] max-w-3xl')}>
      <div className={cn(compact ? 'mb-4 shrink-0 space-y-2' : 'mb-8 space-y-4')}>
        <div className="flex gap-2">
          {STEPS.map((step, index) => (
            <div key={step.key} className="h-2 flex-1 overflow-hidden rounded-full bg-card">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-300',
                  index < progress ? 'w-full bg-primary' : 'w-0 bg-primary'
                )}
              />
            </div>
          ))}
        </div>
        <p className="text-sm font-medium text-ink-muted">Step {progress} of {STEPS.length}</p>
      </div>

      <div className={cn('relative flex-1 rounded-[2rem] border border-white/70 bg-card shadow-sm backdrop-blur', compact ? 'min-h-0 overflow-y-auto p-4 md:p-5' : 'overflow-hidden p-6 md:p-10')}>
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={currentStep.key}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 48 : -48 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -48 : 48 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="space-y-8"
          >
            <div className="max-w-2xl">
              <h1 className={cn('font-extrabold leading-tight text-ink', compact ? 'text-xl md:text-2xl' : 'text-3xl md:text-4xl')}>
                {currentStep.title}
              </h1>
            </div>

            <div className={cn('grid gap-2.5', currentStep.key === 'gender' ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3')}>
              {visibleOptions.map((option) => {
                const isSelected = currentStep.key === 'gender'
                  ? gender === option.value
                  : selectedValues.includes(option.value);
                const handleClick = () => {
                  if (currentStep.key === 'gender') {
                    setErrorMessage('');
                    setGender(option.value);
                    return;
                  }

                  if (currentStep.key === 'conditions') {
                    handleNoneAwareToggle(option.value, conditions, setConditions);
                    return;
                  }

                  if (currentStep.key === 'allergies') {
                    handleNoneAwareToggle(option.value, allergies, setAllergies);
                    return;
                  }

                  if (currentStep.key === 'treatmentPrefs') {
                    handleNoneAwareToggle(option.value, treatmentPrefs, setTreatmentPrefs);
                    return;
                  }
                };

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={handleClick}
                    className={cn(
                      'rounded-2xl border px-4 py-3 text-left transition-all',
                      compact ? 'min-h-[64px]' : 'min-h-[88px]',
                      isSelected
                        ? 'border-primary bg-primary text-white'
                        : 'border-primary bg-card text-ink hover:bg-primary/5'
                    )}
                  >
                    {'emoji' in option && option.emoji ? <div className="mb-2 text-2xl">{option.emoji}</div> : null}
                    <div className="text-sm font-semibold leading-snug md:text-base">{option.label}</div>
                  </button>
                );
              })}
            </div>

            {currentStep.key === 'conditions' ? (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-ink" htmlFor="otherCondition">Other Conditions (Optional)</label>
                <input
                  id="otherCondition"
                  type="text"
                  value={otherCondition}
                  onChange={(event) => setOtherCondition(event.target.value)}
                  className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Add another condition"
                />
              </div>
            ) : null}

            {currentStep.key === 'allergies' ? (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-ink" htmlFor="otherAllergy">Other Allergies (Optional)</label>
                <input
                  id="otherAllergy"
                  type="text"
                  value={otherAllergy}
                  onChange={(event) => setOtherAllergy(event.target.value)}
                  className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Add another allergy"
                />
              </div>
            ) : null}

            {errorMessage ? <p className="text-sm font-medium text-red-600">{errorMessage}</p> : null}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className={cn('flex shrink-0 items-center justify-between gap-3', compact ? 'mt-4' : 'mt-6')}>
        <button
          type="button"
          onClick={handleBack}
          disabled={stepIndex === 0 || isSaving}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-card disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        <button
          type="button"
          onClick={handleContinue}
          disabled={isSaving}
          className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSaving ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
