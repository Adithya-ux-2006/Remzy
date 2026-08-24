import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FAQAccordion } from './FAQAccordion';
import { cn } from '../../utils/cn';

export function AccordionSection({ title, subtitle, lead, items, bordered = false, className, twoColumn = false, leftItems, rightItems, collapsed = false }) {
  const [expanded, setExpanded] = useState(!collapsed);

  if (twoColumn) {
    const left = leftItems || [];
    const right = rightItems || items;

    return (
      <div className={cn('text-center md:text-left', className)}>
        <h2 className="text-heading font-semibold text-ink">{title}</h2>
        {subtitle && <p className="mt-2 text-ink-muted">{subtitle}</p>}
        {lead && <p className="mt-4 leading-relaxed text-ink-muted">{lead}</p>}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14">
          <div className="text-left">
            {left.length > 0 && <FAQAccordion items={left} bordered={bordered} />}
          </div>
          <div className="text-left">
            <FAQAccordion items={right} bordered={bordered} />
          </div>
        </div>
      </div>
    );
  }

  const showAccordion = !collapsed || expanded;

  return (
    <div className={cn('text-center', className)}>
      <h2 className="text-heading font-semibold text-ink">{title}</h2>
      {subtitle && <p className="mt-2 text-ink-muted">{subtitle}</p>}
      {lead && <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-ink-muted">{lead}</p>}
      {collapsed && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          className="mt-6 inline-flex items-center gap-2 px-4 py-3 rounded-full bg-primary/5 text-primary text-sm font-medium border border-primary/20 whitespace-nowrap hover:bg-primary/10 transition-colors"
        >
          {expanded ? 'Show Less' : 'Learn More'}
        </button>
      )}
      <AnimatePresence initial={false}>
        {showAccordion && (
          <motion.div
            initial={{ height: 0, opacity: 0, filter: 'blur(8px)' }}
            animate={{ height: 'auto', opacity: 1, filter: 'blur(0px)' }}
            exit={{ height: 0, opacity: 0, filter: 'blur(8px)' }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="mt-8 text-left">
              <FAQAccordion items={items} bordered={bordered} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
