import { motion, useReducedMotion } from 'framer-motion';
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
        'rounded-2xl p-5',
        'bg-warning/[0.06]',
        'transition-shadow duration-200 hover:shadow-lg',
        className
      )}
    >
      {title && <p className="font-semibold text-ink text-sm mb-1">{title}</p>}
      {Array.isArray(message) ? (
        <ul className="mt-1.5 space-y-2.5">
          {message.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-ink-muted leading-relaxed">
              <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : message ? (
        <p className="text-sm text-ink-muted leading-relaxed">{message}</p>
      ) : null}
    </motion.div>
  );
}
