import { useState } from 'react';
import { Stethoscope, MapPin } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Checklist } from './Checklist';
import { Reveal } from './Reveal';
import { Modal } from './Modal';
import { MedicalCentreFinder } from '../MedicalCentreFinder';

const DEFAULT_FLAGS = [
  'Symptoms last over 48 hours',
  'Symptoms worsen',
  'Difficulty breathing',
  'High fever',
  "Symptoms aren't improving",
];

export function DoctorGuidance({ message, flags, ctaLabel, onCtaClick, className }) {
  const items = flags || DEFAULT_FLAGS;
  const [isFinderOpen, setIsFinderOpen] = useState(false);

  const handleCtaClick = () => {
    if (onCtaClick) {
      onCtaClick();
    } else {
      setIsFinderOpen(true);
    }
  };

  return (
    <Reveal className={cn("section-card", className)}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
          <Stethoscope className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-ink">When To See A Doctor</p>
          {message && (
            <p className="text-xs text-ink-muted">{message}</p>
          )}
        </div>
      </div>

      {!message && (
        <p className="text-sm text-ink-muted mb-5">
          Seek medical attention if you experience any of the following:
        </p>
      )}

      <Checklist items={items} delay={0.1} className="mb-6 space-y-3" />

      <button
        onClick={handleCtaClick}
        className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl border border-border text-ink font-medium text-sm transition-all duration-200 hover:bg-surface hover:border-border active:scale-[0.98] active:bg-ink/5"
      >
        <MapPin className="w-4 h-4" />
        {ctaLabel || 'Find Nearby Medical Centres'}
      </button>

      <Modal isOpen={isFinderOpen} onClose={() => setIsFinderOpen(false)} className="md:max-w-6xl">
        <MedicalCentreFinder className="rounded-none border-0 bg-transparent shadow-none" />
      </Modal>
    </Reveal>
  );
}
