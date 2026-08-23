import { motion, useReducedMotion } from 'framer-motion';
import { Activity, AlertTriangle, FlaskConical } from 'lucide-react';
import { cn } from '../../utils/cn';

export function ClinicalTrialBadge({ count, activeCount, className }) {
  const reduced = useReducedMotion();
  if (!count || count === 0) return null;

  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <div className="inline-flex items-center gap-1.5 rounded-full bg-evidence/10 px-3 py-1.5">
        <FlaskConical className="w-3.5 h-3.5 text-evidence" />
        <span className="text-xs font-semibold text-evidence">
          {count} clinical {count === 1 ? 'trial' : 'trials'}
        </span>
        {activeCount > 0 && (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-success bg-success/10 rounded-full px-1.5 py-0.5">
            <Activity className="w-2.5 h-2.5" />
            {activeCount} active
          </span>
        )}
      </div>
    </motion.div>
  );
}

export function FdaWarningBadge({ warnings, recordCount, className }) {
  const reduced = useReducedMotion();
  if (!recordCount || recordCount === 0) return null;

  const hasWarning = warnings && warnings.length > 0;

  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay: 0.05 }}
      className={className}
    >
      <div className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5',
        hasWarning ? 'bg-warning/10' : 'bg-success/10'
      )}>
        {hasWarning ? (
          <AlertTriangle className="w-3.5 h-3.5 text-warning" />
        ) : (
          <span className="w-3.5 h-3.5 text-success text-center text-xs font-bold">&#10003;</span>
        )}
        <span className={cn(
          'text-xs font-semibold',
          hasWarning ? 'text-warning' : 'text-success'
        )}>
          {hasWarning ? 'FDA interaction data available' : 'No FDA warnings found'}
        </span>
      </div>
    </motion.div>
  );
}

export function EnrichmentSection({ enrichment }) {
  const reduced = useReducedMotion();
  if (!enrichment) return null;

  const hasAnyData = enrichment.clinicalTrialCount > 0 || enrichment.fdaRecordCount > 0;
  if (!hasAnyData) return null;

  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="rounded-[20px] bg-card border border-border p-5 md:p-6 shadow-card"
    >
      <h3 className="text-sm font-bold uppercase tracking-wider text-ink-muted mb-3">External Data</h3>
      <div className="flex flex-wrap gap-2 mb-3">
        <ClinicalTrialBadge
          count={enrichment.clinicalTrialCount}
          activeCount={enrichment.activeTrialCount}
        />
        <FdaWarningBadge
          warnings={enrichment.fdaWarningsSummary}
          recordCount={enrichment.fdaRecordCount}
        />
      </div>
      {enrichment.fdaWarningsSummary && (
        <details className="mt-3 group">
          <summary className="text-xs font-semibold text-ink-muted cursor-pointer hover:text-ink transition-colors">
            View FDA warning details
          </summary>
          <p className="mt-2 text-xs text-ink leading-relaxed bg-bg rounded-xl p-3 border border-border">
            {enrichment.fdaWarningsSummary}
          </p>
        </details>
      )}
    </motion.div>
  );
}
