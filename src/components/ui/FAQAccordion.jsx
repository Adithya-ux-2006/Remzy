import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, CircleHelp } from 'lucide-react';
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
            className={cn(
              'group overflow-hidden rounded-2xl transition-shadow duration-200',
              'bg-gradient-to-br from-card to-card/80 shadow-soft',
              isOpen && 'ring-1 ring-primary/20 shadow-[0_0_20px_-4px] shadow-primary/10',
              bordered && 'border border-border/60'
            )}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
              className="flex w-full items-center gap-3.5 px-5 py-4 text-left"
            >
              <div className={cn(
                'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200',
                isOpen ? 'bg-primary/15 text-primary' : 'bg-accent/20 text-ink-muted group-hover:text-primary'
              )}>
                <CircleHelp className="w-4 h-4" />
              </div>
              <span className={cn(
                'flex-1 text-sm font-semibold transition-colors',
                isOpen ? 'text-primary' : 'text-ink'
              )}>
                {item.question}
              </span>
              <ChevronDown className={cn(
                'h-4 w-4 shrink-0 text-ink-muted transition-transform duration-200',
                isOpen && 'rotate-180 text-primary'
              )} />
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
                  <div className="border-t border-border/60 px-5 py-4 pl-[68px] text-sm leading-relaxed text-ink-muted">
                    {Array.isArray(item.answer) ? (
                      <ul className="space-y-2.5">
                        {item.answer.map((line, i) => (
                          <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                            <span aria-hidden className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary/40" />
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
