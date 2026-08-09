import { motion, useReducedMotion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import { cn } from '../../utils/cn';

export function AdvisoryCard({ title, message, className }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14 }}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      role="alert"
      className={cn(
        'rounded-2xl p-5 flex items-start gap-4',
        'bg-warning/[0.06]',
        'transition-shadow duration-200 hover:shadow-lg',
        className
      )}
    >
      <div className="w-11 h-11 rounded-2xl bg-warning/10 flex items-center justify-center shrink-0">
        <ShieldAlert className="w-5 h-5 text-warning" />
      </div>
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold text-ink text-sm mb-1">{title}</p>}
        {Array.isArray(message) ? (
          <ul className="mt-1.5 space-y-2.5">
            {message.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-ink-muted leading-relaxed">
                <ShieldAlert className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : message ? (
          <p className="text-sm text-ink-muted leading-relaxed">{message}</p>
        ) : null}
      </div>
    </motion.div>
  );
}
