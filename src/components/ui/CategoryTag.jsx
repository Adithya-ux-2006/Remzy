import { cn } from '../../utils/cn';
import { CATEGORY_LABELS } from '../../constants/categoryIcons';

export function CategoryTag({ category, className }) {
  return (
    <span className={cn(
      'whitespace-nowrap inline-flex px-3 py-1 rounded-full text-xs font-medium bg-surface text-primary',
      className
    )}>
      {CATEGORY_LABELS[category] || category}
    </span>
  );
}
