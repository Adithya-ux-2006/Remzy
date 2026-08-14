import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

export function FAQAccordion({ items, bordered = false }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div
            key={item.question}
            className={cn('overflow-hidden rounded-2xl bg-card shadow-soft', bordered && 'border border-border/60')}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className={cn('text-sm font-semibold transition-colors', isOpen ? 'text-primary' : 'text-ink')}>
                {item.question}
              </span>
              <ChevronDown className={cn('h-4 w-4 shrink-0 text-ink-muted transition-transform', isOpen && 'rotate-180')} />
            </button>

            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-border px-5 py-4 text-sm leading-relaxed text-ink-muted">
                    {Array.isArray(item.answer) ? (
                      <ul className="space-y-2.5">
                        {item.answer.map((line, i) => (
                          <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                            <span aria-hidden className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      item.answer
                    )}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
