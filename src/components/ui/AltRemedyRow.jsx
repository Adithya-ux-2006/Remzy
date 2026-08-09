import { Link, useNavigate } from 'react-router-dom';
import { Clock, ChevronRight } from 'lucide-react';
import { FavoriteHeart } from './FavoriteHeart';
import { cn } from '../../utils/cn';
import { RemedyImage } from './RemedyImage';
import { CategoryBadge } from './CategoryBadge';
import { EvidenceLabel } from './EvidenceLabel';
import { SafetyBadge } from './SafetyBadge';
import { useFavoritesStore } from '../../store/favoritesStore';
import { useAuthStore } from '../../store/authStore';

export function AltRemedyRow({ remedy, evidenceScore, isChildSafe, showDivider = true, className }) {
  const navigate = useNavigate();
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFavorite = useFavoritesStore((s) => s.isFavorite);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const favorited = isFavorite(remedy.id);

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/register'); return; }
    toggleFavorite(remedy);
  };

  return (
    <div className={cn(showDivider && 'border-b border-border', className)}>
      <Link
        to={`/remedy/${remedy.id}`}
        className="hidden md:grid grid-cols-[80px_minmax(0,1fr)_150px_150px_140px_40px] items-center gap-4 px-4 h-24 hover:bg-mint/30 rounded-xl transition-colors"
      >
        <div className="flex items-center justify-center">
          <RemedyImage category={remedy.category} size="sm" alt={remedy.name} />
        </div>

        <div className="min-w-0 pr-4">
          <CategoryBadge category={remedy.category} className="scale-90 origin-left mb-1" />
          <h4 className="font-semibold text-ink text-sm leading-snug line-clamp-2">{remedy.name}</h4>
          <p className="text-xs text-ink-muted mt-0.5 truncate">{remedy.tagline || remedy.shortDescription}</p>
        </div>

        <div className="flex items-center justify-center">
          {remedy.timeToEffect ? (
            <span className="flex items-center gap-1.5 text-xs text-ink-muted whitespace-nowrap">
              <Clock className="w-3 h-3 shrink-0" />
              {remedy.timeToEffect}
            </span>
          ) : null}
        </div>

        <div className="flex items-center justify-center">
          <SafetyBadge remedy={remedy} isChildSafe={isChildSafe} compact />
        </div>

        <div className="flex items-center justify-center">
          <EvidenceLabel score={evidenceScore} tier={remedy.evidenceTier} note={remedy.evidenceNote} size="sm" />
        </div>

        <div className="flex items-center justify-center gap-1">
          <button
            onClick={handleFavorite}
            className={cn(
              'p-1.5 rounded-full transition-colors',
              favorited ? 'text-primary' : 'text-ink-muted hover:text-primary'
            )}
            aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <FavoriteHeart favorited={favorited} className="w-4 h-4" />
          </button>
          <ChevronRight className="w-4 h-4 text-ink-subtle" />
        </div>
      </Link>

      <Link
        to={`/remedy/${remedy.id}`}
        className="md:hidden flex items-center gap-3 px-4 h-[140px] hover:bg-mint/30 rounded-xl transition-colors"
      >
        <RemedyImage category={remedy.category} size="sm" alt={remedy.name} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-ink text-sm leading-snug line-clamp-2 flex-1 min-w-0">{remedy.name}</h4>
            <CategoryBadge category={remedy.category} className="shrink-0" />
          </div>
          <p className="text-xs text-ink-muted mt-1 truncate">{remedy.tagline || remedy.shortDescription}</p>
          <div className="flex items-center gap-x-3 gap-y-1 mt-2 flex-wrap">
            {remedy.timeToEffect && (
              <span className="flex items-center gap-1 text-xs text-ink-muted whitespace-nowrap">
                <Clock className="w-3 h-3 shrink-0" />
                {remedy.timeToEffect}
              </span>
            )}
            <SafetyBadge remedy={remedy} isChildSafe={isChildSafe} compact />
            <EvidenceLabel score={evidenceScore} tier={remedy.evidenceTier} note={remedy.evidenceNote} size="sm" />
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 self-center">
          <button
            onClick={handleFavorite}
            className={cn(
              'p-1.5 rounded-full transition-colors',
              favorited ? 'text-primary' : 'text-ink-muted hover:text-primary'
            )}
            aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <FavoriteHeart favorited={favorited} className="w-4 h-4" />
          </button>
          <ChevronRight className="w-4 h-4 text-ink-subtle" />
        </div>
      </Link>
    </div>
  );
}
