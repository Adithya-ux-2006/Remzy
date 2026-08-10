import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Star, ShieldCheck, FileText } from 'lucide-react';
import { cn } from '../../utils/cn';
import { CategoryBadge } from './CategoryBadge';
import { getEvidenceText } from '../../utils/evidence';

export function FeaturedRecommendation({ remedy, evidenceScore, isSafe, safetyWarnings, className }) {
  if (!remedy) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Link
        to={`/remedy/${remedy.id}`}
        className={cn(
          'block bg-gradient-card rounded-3xl p-6 shadow-card hover:shadow-card-hover transition-shadow',
          className
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <CategoryBadge category={remedy.category} />
          <span className="text-xs font-semibold text-primary bg-card px-3 py-1 rounded-full">
            Top Recommendation
          </span>
        </div>

        <h3 className="text-2xl font-bold text-ink mb-2">{remedy.name}</h3>
        <p className="text-ink-muted text-sm mb-5 leading-relaxed">{remedy.shortDescription}</p>

        <div className="flex flex-wrap items-center gap-2 text-sm text-ink-muted mb-5">
          {remedy.timeToEffect && (
            <span className="flex items-center gap-1.5 bg-card px-3 py-1.5 rounded-xl">
              <Clock className="w-3.5 h-3.5 text-primary" />
              {remedy.timeToEffect}
            </span>
          )}
          {remedy.difficulty && (
            <span className="flex items-center gap-1.5 bg-card px-3 py-1.5 rounded-xl">
              <Star className="w-3.5 h-3.5 text-primary" />
              {remedy.difficulty}
            </span>
          )}
          {evidenceScore != null && (
            <span className="flex items-center gap-1.5 bg-card px-3 py-1.5 rounded-xl font-semibold text-primary">
              <FileText className="w-3.5 h-3.5" />
              {getEvidenceText(evidenceScore)}
            </span>
          )}
        </div>

        {!isSafe && (
          <div className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 px-4 py-2.5 rounded-xl">
            <ShieldCheck className="w-4 h-4" />
            May not be suitable based on your health profile
          </div>
        )}
        {isSafe && safetyWarnings && (
          <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-4 py-2.5 rounded-xl">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            {safetyWarnings}
          </div>
        )}
        {isSafe && !safetyWarnings && (
          <div className="flex items-center gap-2 text-sm text-primary-dark bg-accent/20 px-4 py-2.5 rounded-xl">
            <ShieldCheck className="w-4 h-4" />
            No known conflicts with your profile
          </div>
        )}
      </Link>
    </motion.div>
  );
}
