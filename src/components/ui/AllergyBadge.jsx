import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';

export function AllergyBadge({ isSafe, compact, className }) {
  if (compact) {
    return (
      <span className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap",
        isSafe
          ? "bg-accent/20 text-primary"
          : "bg-yellow-100 text-yellow-800",
        className
      )}>
        {isSafe ? (
          <><ShieldCheck className="w-3 h-3" /> Safe</>
        ) : (
          <><AlertTriangle className="w-3 h-3" /> Check</>
        )}
      </span>
    );
  }

  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium",
      isSafe
        ? "bg-accent/20 text-primary"
        : "bg-yellow-100 text-yellow-800",
      className
    )}>
      {isSafe ? (
        <><ShieldCheck className="w-4 h-4" /> Generally safe</>
      ) : (
        <><AlertTriangle className="w-4 h-4" /> Allergy conflict detected</>
      )}
    </div>
  );
}
