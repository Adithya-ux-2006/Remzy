import { BookOpen } from 'lucide-react';
import { cn } from '../../utils/cn';

function getEvidenceLevel(score, tier, status, sourceCount) {
  if (status === 'needs-review' && sourceCount > 0) return { text: `${sourceCount} Linked — Under Review`, color: 'bg-warning/10 text-warning' };
  if (tier === 'traditional') return { text: 'Traditional Use', color: 'bg-purple-500/10 text-purple-700 dark:text-purple-300' };
  if (tier === 'supportive') return { text: 'Supportive Care', color: 'bg-sky-500/10 text-sky-700 dark:text-sky-300' };
  if (score == null || score === 0) return null;
  if (score >= 7) return { text: '3+ Linked Sources', color: 'bg-success/10 text-success' };
  if (score >= 6) return { text: '2 Linked Sources', color: 'bg-warning/10 text-warning' };
  return { text: '1 Linked Source', color: 'bg-ink-muted/10 text-ink-muted' };
}

export function EvidenceLabel({ score, tier, note, status, sourceCount = 0, size = 'md', className }) {
  const level = getEvidenceLevel(score, tier, status, sourceCount);
  if (!level) return null;

  if (size === 'sm') {
    return (
      <span
        className={cn('inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap', level.color, className)}
        aria-label={`Evidence level: ${level.text}${note ? `. ${note}` : ''}`}
        title={note || level.text}
      >
        <BookOpen className="w-3 h-3 shrink-0" />
        {level.text}
      </span>
    );
  }

  return (
    <span
      className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap justify-center', level.color, className)}
      aria-label={`Evidence level: ${level.text}${note ? `. ${note}` : ''}`}
      title={note || level.text}
    >
      <BookOpen className="w-3.5 h-3.5 shrink-0" />
      {level.text}
    </span>
  );
}
