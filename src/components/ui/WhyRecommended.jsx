import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';

function generateReasons(remedy, evidenceScore, safetyScore) {
  const reasons = [];

  if (remedy.timeToEffect?.match(/immediate|minute/i)) {
    reasons.push('Fast acting');
  }
  if (evidenceScore >= 7) {
    reasons.push('Three or more linked sources');
  } else if (evidenceScore > 0) {
    reasons.push('Linked research source');
  }
  if (safetyScore >= 85) {
    reasons.push('Very low risk');
  } else if (safetyScore >= 60) {
    reasons.push('Generally well tolerated');
  }
  if (remedy.difficulty === 'Easy') {
    reasons.push('Easy to use');
  }
  if (remedy._relevanceReason) {
    const reason = remedy._relevanceReason;
    if (!reasons.includes(reason)) {
      reasons.push(reason);
    }
  }

  return reasons;
}

export function WhyRecommended({ remedy, evidenceScore, safetyScore, className }) {
  const reasons = generateReasons(remedy, evidenceScore, safetyScore);

  if (reasons.length === 0) return null;

  return (
    <div className={cn('guidance-panel', className)}>
      <h3 className="text-sm font-bold uppercase tracking-wider text-ink-muted mb-3">
        Why This May Help
      </h3>
      <ul className="space-y-2.5">
        {reasons.map((reason, i) => (
          <motion.li
            key={reason}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
            className="flex items-start gap-2.5 text-sm text-ink"
          >
            <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>{reason}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
