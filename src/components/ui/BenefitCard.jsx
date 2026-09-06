import { motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';

export function BenefitCard({ title, description, delay = 0, className }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14 }}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      className={cn(
        'flex flex-col items-start gap-3.5 py-2 group/card',
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-success/[0.08] border border-success/15 flex items-center justify-center shrink-0 shadow-[0_0_12px_hsl(var(--success)/0.06)] transition-all duration-200 group-hover/card:bg-success/[0.12] group-hover/card:shadow-[0_0_20px_hsl(var(--success)/0.1)]">
        <Check className="w-5 h-5 text-success transition-colors duration-200 group-hover/card:text-success/80" />
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-ink text-lg leading-snug mb-1">{title}</p>
        {description && (
          <p className="text-[14px] text-ink-muted leading-relaxed line-clamp-2">{description}</p>
        )}
      </div>
    </motion.div>
  );
}
