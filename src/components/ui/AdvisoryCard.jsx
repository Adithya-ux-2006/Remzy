import { motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, Pill } from 'lucide-react';
import { cn } from '../../utils/cn';

function SectionHeader({ label, icon: Icon = AlertTriangle }) {
  return (
    <div className="flex items-center gap-2.5 mb-1">
      <div className="w-6 h-6 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-warning" />
      </div>
      <p className="font-semibold text-ink text-sm">{label}</p>
    </div>
  );
}

export function AdvisoryCard({ title, message, subtitle, subMessage, className }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14 }}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      role="alert"
      className={cn(
        'rounded-2xl border border-warning/20 bg-warning-light p-5',
        'transition-shadow duration-200 hover:shadow-lg',
        className
      )}
    >
      {title && <SectionHeader label={title} />}
      {Array.isArray(message) ? (
        <ul className="mt-2 space-y-2.5 pl-[34px]">
          {message.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-ink-muted leading-relaxed">
              <span aria-hidden className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : message ? (
        <p className="mt-2 pl-[34px] text-sm text-ink-muted leading-relaxed">{message}</p>
      ) : null}
      {subtitle && subMessage && (
        <div className="mt-6 pt-5 border-t border-warning/15">
          <SectionHeader label={subtitle} icon={Pill} />
          <p className="mt-2 pl-[34px] text-sm text-ink-muted leading-relaxed">{subMessage}</p>
        </div>
      )}
    </motion.div>
  );
}
