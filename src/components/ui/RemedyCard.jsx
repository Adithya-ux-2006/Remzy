import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Star } from 'lucide-react';
import { FavoriteHeart } from './FavoriteHeart';
import { ScheduleQuickAdd } from './ScheduleQuickAdd';
import { cn } from '../../utils/cn';
import { CategoryBadge } from './CategoryBadge';
import { RatingStars } from './RatingStars';
import { AllergyBadge } from './AllergyBadge';
import { useFavoritesStore } from '../../store/favoritesStore';
import { useAuthStore } from '../../store/authStore';
import { getEvidenceText } from '../../utils/evidence';

export function RemedyCard({ remedy, className, featured, variant, isSafe = true }) {
  const resolvedVariant = featured ? 'featured' : (variant || 'default');
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

  if (resolvedVariant === 'carousel') {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="snap-start shrink-0 w-[260px]"
      >
        <Link
          to={`/remedy/${remedy.id}`}
          className={cn(
            'block bg-card rounded-2xl p-4 shadow-soft hover:shadow-card transition-all h-full',
            className
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <CategoryBadge category={remedy.category} />
            <div className="flex items-center gap-1">
              <AllergyBadge isSafe={isSafe} compact />
              <ScheduleQuickAdd remedy={remedy} />
              <button
                onClick={handleFavorite}
                className={cn(
                  "p-1 rounded-full transition-colors",
                  favorited ? "text-primary" : "text-ink-muted hover:text-primary"
                )}
                aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
              >
                <FavoriteHeart favorited={favorited} className="w-4 h-4" />
              </button>
            </div>
          </div>
          <h3 className="font-semibold text-ink text-sm leading-snug mb-1 line-clamp-1">{remedy.name}</h3>
          <p className="text-xs text-ink-muted mb-3 line-clamp-1">{remedy.shortDescription}</p>
          <div className="flex items-center gap-2 text-xs text-ink-muted">
            {remedy._evidenceScore != null && (
              <span className="bg-primary/10 text-primary font-semibold px-1.5 py-0.5 rounded-md">
                {getEvidenceText(remedy._evidenceScore)}
              </span>
            )}
            {remedy.timeToEffect && (
              <span className="flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" />{remedy.timeToEffect}
              </span>
            )}
          </div>
        </Link>
      </motion.div>
    );
  }

  if (resolvedVariant === 'featured') {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <Link
          to={`/remedy/${remedy.id}`}
          className={cn(
            'block bg-gradient-card rounded-3xl p-6 shadow-card hover:shadow-card-hover transition-shadow',
            className
          )}
        >
          <div className="flex items-center gap-2 mb-3">
            <CategoryBadge category={remedy.category} />
            <div className="flex items-center gap-1 ml-auto">
              <ScheduleQuickAdd remedy={remedy} />
              <button
                onClick={handleFavorite}
                className={cn(
                  "p-1.5 rounded-full transition-colors",
                  favorited ? "text-primary" : "text-ink-muted hover:text-primary"
                )}
                aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
              >
                <FavoriteHeart favorited={favorited} className="w-4 h-4" />
              </button>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-ink mb-2">{remedy.name}</h3>
          <p className="text-ink-muted text-sm mb-4 line-clamp-2">{remedy.shortDescription}</p>
          <div className="flex items-center gap-4 text-sm text-ink-muted">
            {remedy.timeToEffect && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {remedy.timeToEffect}
              </span>
            )}
            {remedy.difficulty && (
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5" />
                {remedy.difficulty}
              </span>
            )}
          </div>
          <AllergyBadge isSafe={isSafe} className="mt-4" />
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <Link
        to={`/remedy/${remedy.id}`}
        className={cn(
          'block bg-card rounded-3xl p-5 shadow-soft hover:shadow-card transition-all',
          className
        )}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-surface flex items-center justify-center shrink-0 text-primary font-semibold text-sm">
              {remedy.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-ink truncate">{remedy.name}</h3>
              <CategoryBadge category={remedy.category} />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <AllergyBadge isSafe={isSafe} compact />
            <ScheduleQuickAdd remedy={remedy} />
            <button
              onClick={handleFavorite}
              className={cn(
                "p-1.5 rounded-full transition-colors",
                favorited ? "text-primary" : "text-ink-muted hover:text-primary"
              )}
              aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
            >
              <FavoriteHeart favorited={favorited} className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-sm text-ink-muted mb-3 line-clamp-2">{remedy.shortDescription}</p>

        <div className="flex items-center gap-3 text-xs text-ink-muted mb-3">
          {remedy.timeToEffect && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {remedy.timeToEffect}
            </span>
          )}
          {remedy.cost && (
            <span className="bg-surface px-2 py-0.5 rounded-md">{remedy.cost}</span>
          )}
          {remedy._evidenceScore ? (
            <span className="text-primary font-medium" title="Linked research sources">
              {getEvidenceText(remedy._evidenceScore)}
            </span>
          ) : null}
        </div>

        <div className="flex items-center justify-between">
          <RatingStars rating={remedy.rating} />
          <span className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">
            View Details &rarr;
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
