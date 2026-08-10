import { motion } from 'framer-motion';
import { Clock, ShieldCheck, BarChart3, Gauge } from 'lucide-react';
import { cn } from '../../utils/cn';
import { getSafetyText } from '../../utils/safety';

function getSafetyColor(score, hasConflicts) {
  if (hasConflicts) return 'text-danger';
  if (score >= 60) return 'text-success';
  if (score >= 30) return 'text-warning';
  return 'text-danger';
}

function getEvidenceText(score, remedy) {
  const sourceCount = (remedy.researchPapers?.length || 0) + (remedy.researchLinks?.length || 0);
  if (remedy.evidenceBackendStatus === 'needs-review' && sourceCount > 0) return `${sourceCount} linked`;
  if (score >= 7) return '3+ sources';
  if (score >= 6) return '2 sources';
  if (score > 0) return '1 source';
  return '—';
}

function StatColumn({ icon: Icon, iconBg, iconColor, value, label, subLabel, subLabelClassName, ariaLabel, delay, isLast, allowWrap = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      role="group"
      aria-label={ariaLabel}
      className={cn(
        'flex flex-col items-center justify-center gap-1.5 text-center min-w-0',
        'py-3 px-1 sm:py-4 sm:px-2 md:py-5 md:px-3',
        !isLast && 'border-r border-border-subtle'
      )}
    >
      <div className={cn(
        'rounded-full flex items-center justify-center shrink-0',
        'w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11',
        iconBg
      )}>
        <Icon className={cn(
          'w-4 h-4 sm:w-[18px] sm:h-[18px] md:w-5 md:h-5',
          iconColor
        )} />
      </div>
      <span className={cn(
        'font-semibold text-ink leading-tight w-full',
        !allowWrap && 'truncate',
        'text-[13px] sm:text-sm md:text-[17px]'
      )}>
        {value}
      </span>
      {label && (
        <span className={cn(
          'text-ink-muted leading-tight truncate w-full',
          'text-[10px] sm:text-[11px] md:text-xs'
        )}>
          {label}
        </span>
      )}
      {subLabel && (
        <span className={cn(
          'font-medium leading-tight w-full',
          'text-[11px] sm:text-xs md:text-sm text-ink-muted',
          subLabelClassName
        )}>
          {subLabel}
        </span>
      )}
    </motion.div>
  );
}

export function QuickStats({ remedy, isSafe, evidenceScore, safetyScore, className }) {
  const safetyText = getSafetyText(safetyScore, !isSafe);
  const safetyColor = getSafetyColor(safetyScore, !isSafe);
  const evidenceText = getEvidenceText(evidenceScore, remedy);
  const safetySubLabel = isSafe ? 'Safe for you' : 'Potential conflict — check with a professional';

  return (
    <div
      className={cn('grid grid-cols-4', className)}
      role="region"
      aria-label="Quick statistics"
    >
      <StatColumn
        icon={Clock}
        iconBg="bg-primary/10"
        iconColor="text-primary"
        value={remedy.timeToEffect || 'Varies'}
        label="When it may help"
        ariaLabel={`When it may help: ${remedy.timeToEffect || 'Varies'}`}
        delay={0}
        isLast={false}
      />
      <StatColumn
        icon={ShieldCheck}
        iconBg="bg-success/10"
        iconColor={safetyColor}
        value={safetyText}
        subLabel={safetySubLabel}
        subLabelClassName={isSafe ? undefined : 'text-danger'}
        ariaLabel={`Safety: ${safetyText}, ${safetySubLabel}`}
        delay={0.04}
        isLast={false}
        allowWrap
      />
      <StatColumn
        icon={BarChart3}
        iconBg="bg-primary/10"
        iconColor="text-primary"
        value={evidenceText}
        label={remedy.evidenceBackendStatus === 'needs-review' ? 'Sources under review' : 'Supporting info'}
        ariaLabel={`Supporting information: ${evidenceText}`}
        delay={0.08}
        isLast={false}
      />
      <StatColumn
        icon={Gauge}
        iconBg="bg-primary/10"
        iconColor="text-primary"
        value={remedy.difficulty || 'Easy'}
        label="Difficulty"
        ariaLabel={`Difficulty: ${remedy.difficulty || 'Easy'}`}
        delay={0.12}
        isLast={true}
      />
    </div>
  );
}
