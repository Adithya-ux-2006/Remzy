import { useState, useMemo } from 'react';
import { Search, Heart, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { CATEGORY_LABELS } from '../../constants/categoryIcons';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function RemedyScheduleForm({ remedies, favorites, initialData, onSubmit, onCancel, error, isSubmitting, lockRemedy = false }) {
  const [formData, setFormData] = useState(
    initialData || {
      remedyId: '',
      remedyName: '',
      scheduledTime: '08:00',
      recurrence: 'daily',
      daysOfWeek: [],
    }
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const favoriteIds = useMemo(() => new Set(favorites.map(f => f.id)), [favorites]);

  const filteredRemedies = useMemo(() => {
    let list = remedies;
    if (showFavoritesOnly) {
      list = list.filter(r => favoriteIds.has(r.id));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r => r.name.toLowerCase().includes(q));
    }
    return list;
  }, [remedies, favoriteIds, showFavoritesOnly, searchQuery]);

  const hasFavorites = favorites.length > 0;
  const isFormValid = formData.remedyId && formData.scheduledTime;

  const handleRemedySelect = (remedy) => {
    setFormData((prev) => ({
      ...prev,
      remedyId: remedy.id,
      remedyName: remedy.name,
    }));
    setSearchQuery('');
  };

  const clearSelection = () => {
    setFormData((prev) => ({ ...prev, remedyId: '', remedyName: '' }));
  };

  const toggleDay = (dayIndex) => {
    setFormData((prev) => {
      const days = prev.daysOfWeek.includes(dayIndex)
        ? prev.daysOfWeek.filter((d) => d !== dayIndex)
        : [...prev.daysOfWeek, dayIndex];
      return { ...prev, daysOfWeek: days };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Remedy picker with search and favorites */}
      <div>
        <label className="block text-sm font-medium text-ink mb-1">
          Remedy *
        </label>
        {formData.remedyId ? (
          <div className="flex items-center gap-2 px-3 py-2 border border-primary/30 rounded-xl bg-primary/5">
            <Heart className={cn("w-4 h-4", favoriteIds.has(formData.remedyId) ? "text-primary" : "text-ink-muted")} fill={favoriteIds.has(formData.remedyId) ? "currentColor" : "none"} />
            <span className="flex-1 text-sm font-medium text-ink">{formData.remedyName}</span>
            {!lockRemedy && (
              <button type="button" onClick={clearSelection} className="p-1 text-ink-muted hover:text-ink rounded-full">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : lockRemedy ? null : (
          <>
            {/* Search input */}
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
              <input
                type="text"
                placeholder="Search remedies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-border rounded-xl text-sm"
              />
            </div>

            {/* Favorites toggle */}
            {hasFavorites && (
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setShowFavoritesOnly(false)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                    !showFavoritesOnly ? "bg-primary text-white" : "border border-border text-ink"
                  )}
                >
                  All Remedies
                </button>
                <button
                  type="button"
                  onClick={() => setShowFavoritesOnly(true)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1",
                    showFavoritesOnly ? "bg-primary text-white" : "border border-border text-ink"
                  )}
                >
                  <Heart className={cn("w-3 h-3", showFavoritesOnly ? "text-white" : "text-primary")} fill={showFavoritesOnly ? "currentColor" : "currentColor"} />
                  Favorites ({favorites.length})
                </button>
              </div>
            )}

            {/* Remedy list */}
            <div className="max-h-48 overflow-y-auto border border-border rounded-xl divide-y divide-border">
              {filteredRemedies.length > 0 ? (
                filteredRemedies.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleRemedySelect(r)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-surface transition-colors"
                  >
                    <Heart className={cn("w-4 h-4 shrink-0", favoriteIds.has(r.id) ? "text-primary" : "text-ink-muted")} fill={favoriteIds.has(r.id) ? "currentColor" : "none"} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{r.name}</p>
                      <p className="text-xs text-ink-muted">{CATEGORY_LABELS[r.category] || r.category}</p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-3 py-6 text-center text-sm text-ink-muted">
                  {showFavoritesOnly ? "No favorite remedies found" : "No remedies match your search"}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Time */}
      <div>
        <label className="block text-sm font-medium text-ink mb-1" htmlFor="scheduledTime">
          Time *
        </label>
        <div className="bg-card rounded-xl border border-border transition-shadow duration-200 focus-within:shadow-[0_0_0_2px_hsl(var(--primary)/0.25)] focus-within:border-primary/30">
          <input
            id="scheduledTime"
            type="time"
            required
            value={formData.scheduledTime}
            onChange={(e) => setFormData((prev) => ({ ...prev, scheduledTime: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl text-sm"
          />
        </div>
      </div>

      {/* Recurrence */}
      <div>
        <label className="block text-sm font-medium text-ink mb-2">Recurrence</label>
        <div className="flex gap-2">
          {['daily', 'weekly', 'once'].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, recurrence: opt }))}
              className={
                formData.recurrence === opt
                  ? 'rounded-full border border-forest bg-primary px-4 py-2 text-sm font-medium text-white'
                  : 'rounded-full border border-border px-4 py-2 text-sm font-medium text-ink'
              }
            >
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Days of week (weekly only) */}
      {formData.recurrence === 'weekly' && (
        <div>
          <label className="block text-sm font-medium text-ink mb-2">Days of Week</label>
          <div className="flex gap-2">
            {DAYS.map((day, i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleDay(i)}
                className={
                  formData.daysOfWeek.includes(i)
                    ? 'w-10 h-10 rounded-full bg-primary text-white text-sm font-medium flex items-center justify-center'
                    : 'w-10 h-10 rounded-full border border-border text-ink text-sm font-medium flex items-center justify-center hover:bg-accent'
                }
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 py-2.5 rounded-xl font-medium border border-border text-ink hover:bg-accent transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className="flex-1 py-2.5 rounded-xl font-medium bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Adding...
            </>
          ) : (
            initialData ? 'Update' : 'Add Schedule'
          )}
        </button>
      </div>
    </form>
  );
}
