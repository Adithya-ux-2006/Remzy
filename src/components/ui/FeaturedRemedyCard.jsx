import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Check } from 'lucide-react';
import { FavoriteHeart } from './FavoriteHeart';
import { ScheduleQuickAdd } from './ScheduleQuickAdd';
import { cn } from '../../utils/cn';
import { CategoryBadge } from './CategoryBadge';
import { RemedyImage } from './RemedyImage';
import { EvidenceLabel } from './EvidenceLabel';
import { SafetyLabel } from './SafetyLabel';
import { useFavoritesStore } from '../../store/favoritesStore';
import { useAuthStore } from '../../store/authStore';

function generateReasons(remedy, evidenceScore, safetyScore) {
  const reasons = [];

  if (remedy.timeToEffect?.match(/immediate|minute/i)) {
    reasons.push('Fast acting');
  }
  if (remedy.evidenceTier === 'traditional') {
    reasons.push('Traditional use; clinical evidence not established');
  } else if (remedy.evidenceTier === 'supportive') {
    reasons.push('Supportive care; not a proven treatment');
  } else if (evidenceScore >= 7) {
    reasons.push('High quality evidence');
  } else if (evidenceScore >= 4) {
    reasons.push('Supported by clinical research');
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

  return reasons.slice(0, 5);
}

function MetadataCell({ icon, children, label }) {
  return (
    <div className="flex flex-col items-start gap-1.5">
      <span className="text-ink-muted">{icon}</span>
      <span className="font-semibold text-ink text-sm leading-tight whitespace-nowrap">{children}</span>
      <span className="text-[11px] text-ink-muted leading-tight whitespace-nowrap">{label}</span>
    </div>
  );
}

export function FeaturedRemedyCard({ remedy, isSafe, evidenceScore, safetyScore, className }) {
  const navigate = useNavigate();
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFavorite = useFavoritesStore((s) => s.isFavorite);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const favorited = isFavorite(remedy.id);
  const reasons = generateReasons(remedy, evidenceScore, safetyScore);

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/register'); return; }
    toggleFavorite(remedy);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4 }}
    >
      <div
        className={cn(
          'bg-card rounded-[28px] border border-border shadow-soft-lg overflow-hidden',
          className
        )}
      >
        <div className="grid grid-cols-1 md:grid-cols-[20%_52%_28%] md:min-h-[400px]">
          <div className="flex items-center justify-center py-8 px-4 bg-mint/40">
            <div className="w-[180px] h-[180px] rounded-full bg-card flex items-center justify-center shrink-0">
              <RemedyImage
                category={remedy.category}
                size="hero"
                alt={remedy.name}
              />
            </div>
          </div>

          <div className="p-8 flex flex-col items-start text-left min-w-0">
            <div className="mb-4">
              <CategoryBadge category={remedy.category} firstOccurrence />
            </div>

            <h3 className="text-[36px] leading-tight font-bold text-ink mb-3">{remedy.name}</h3>
            <p className="text-ink-muted text-sm leading-relaxed mb-6">{remedy.shortDescription}</p>

            <div className="grid grid-cols-3 gap-6 w-full mb-6">
              <MetadataCell icon={<Clock className="w-4 h-4 text-primary" />} label="When it may help">
                {remedy.timeToEffect || 'Varies'}
              </MetadataCell>
              <MetadataCell icon={<span className="text-sm">🛡</span>} label="Safety">
                <SafetyLabel safetyScore={safetyScore} hasConflicts={!isSafe} />
              </MetadataCell>
              <MetadataCell icon={<span className="text-sm">📈</span>} label="Evidence">
                <EvidenceLabel score={evidenceScore} tier={remedy.evidenceTier} note={remedy.evidenceNote} />
              </MetadataCell>
            </div>

            <div className="flex-1" />

            <Link
              to={`/remedy/${remedy.id}`}
              className="flex items-center justify-center w-[90%] h-14 rounded-2xl bg-primary text-white text-base font-semibold shadow-glow hover:bg-primary-dark transition-all hover:-translate-y-0.5 shrink-0"
            >
              View Remedy
            </Link>
          </div>

          <div className="bg-mint/60 px-8 py-8 flex flex-col items-start">
            <div className="flex items-center justify-between w-full mb-4 shrink-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                Why This May Help
              </p>
              <div className="flex items-center gap-1">
                <ScheduleQuickAdd remedy={remedy} />
                <button
                  onClick={handleFavorite}
                  className={cn(
                    'p-1.5 rounded-full transition-colors shrink-0',
                    favorited ? 'text-primary' : 'text-ink-muted hover:text-primary'
                  )}
                  aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <FavoriteHeart favorited={favorited} />
                </button>
              </div>
            </div>
            {reasons.length > 0 ? (
              <ul className="space-y-4">
                {reasons.map((reason, i) => (
                  <motion.li
                    key={reason}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.08 }}
                    className="flex items-start gap-3 text-sm text-ink"
                  >
                    <Check className="w-4 h-4 text-primary shrink-0 mt-[3px]" />
                    <span className="leading-snug">{reason}</span>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-muted">Tailored to your symptoms.</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
