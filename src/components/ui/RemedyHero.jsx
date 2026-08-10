import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { RemedyImage } from './RemedyImage';
import { CategoryBadge } from './CategoryBadge';
import { EvidenceLabel } from './EvidenceLabel';
import { RatingStars } from './RatingStars';

export function RemedyHero({ remedy, evidenceScore, className }) {
  return (
    <section className={cn('flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12', className)}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative shrink-0"
      >
        <div className="w-40 h-40 md:w-52 md:h-52 rounded-full bg-primary-tint flex items-center justify-center shadow-glow ring-[3px] ring-primary/10">
          <RemedyImage category={remedy.category} size="hero" alt={remedy.name} />
        </div>
      </motion.div>

      <div className="flex-1 min-w-0 text-center md:text-left">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-5"
        >
          <CategoryBadge category={remedy.category} firstOccurrence />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.12 }}
          className="page-title mb-5"
        >
          {remedy.name}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.18 }}
          className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-5"
        >
          {(evidenceScore > 0 || remedy.evidenceBackendStatus === 'needs-review') && (
            <EvidenceLabel
              score={evidenceScore}
              tier={remedy.evidenceTier}
              note={remedy.evidenceNote}
              status={remedy.evidenceBackendStatus}
              sourceCount={(remedy.researchPapers?.length || 0) + (remedy.researchLinks?.length || 0)}
            />
          )}
          {remedy.rating > 0 && (
            <RatingStars rating={remedy.rating} size="sm" />
          )}
        </motion.div>

        {remedy.shortDescription && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.22 }}
            className="text-ink-muted text-base leading-relaxed max-w-lg"
          >
            {remedy.shortDescription}
          </motion.p>
        )}
      </div>
    </section>
  );
}
