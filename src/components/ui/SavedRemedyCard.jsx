import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Heart } from 'lucide-react';
import { cn } from '../../utils/cn';
import { CategoryBadge } from './CategoryBadge';
import { RatingStars } from './RatingStars';
import { RemedyImage } from './RemedyImage';
import { useFavoritesStore } from '../../store/favoritesStore';
import { useAuthStore } from '../../store/authStore';

export function SavedRemedyCard({ remedy, className }) {
  const navigate = useNavigate();
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const favorited = useFavoritesStore((s) => s.favorites.some((favorite) => favorite.id === remedy.id));
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/register'); return; }
    toggleFavorite(remedy);
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <Link
        to={`/remedy/${remedy.id}`}
        className={cn(
          'block bg-card rounded-[20px] border border-border/60 shadow-soft p-4',
          'hover:shadow-card-hover hover:border-border transition-all duration-200',
          className
        )}
      >
        <div className="flex items-start gap-3">
          <RemedyImage category={remedy.category} size="card" />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-ink text-[16px] leading-snug line-clamp-1">
                {remedy.name}
              </h3>
              <button
                onClick={handleFavorite}
                className={cn(
                  'shrink-0 p-1 -mr-1 -mt-1 rounded-full transition-all duration-200',
                  'hover:scale-110 active:scale-95',
                  favorited ? 'text-red-500' : 'text-ink-muted hover:text-red-400'
                )}
                aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart
                  className="w-4 h-4"
                  fill={favorited ? 'currentColor' : 'none'}
                />
              </button>
            </div>

            <div className="mt-1">
              <CategoryBadge category={remedy.category} />
            </div>

            <p className="text-sm text-ink-muted leading-relaxed line-clamp-2 mt-1.5">
              {remedy.shortDescription}
            </p>

            <div className="flex items-center justify-between mt-2">
              {remedy.timeToEffect && (
                <span className="flex items-center gap-1 text-xs text-ink-muted">
                  <Clock className="w-3 h-3" />
                  {remedy.timeToEffect}
                </span>
              )}

              <RatingStars
                rating={remedy.rating}
                size="sm"
              />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
