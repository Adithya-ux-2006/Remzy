import { cn } from '../../utils/cn';
import { CATEGORY_LABELS } from '../../constants/categoryIcons';

const STYLES = {
  Natural: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'OTC': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Lifestyle: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
};

export function CategoryBadge({ category, className }) {
  if (!category) return null;

  const displayText = CATEGORY_LABELS[category] || category;

  return (
    <span
      className={cn(
        'whitespace-nowrap inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
        STYLES[category] || 'bg-primary/10 text-primary border-primary/20',
        className
      )}
    >
      {displayText}
    </span>
  );
}
