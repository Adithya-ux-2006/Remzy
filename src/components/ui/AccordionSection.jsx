import { FAQAccordion } from './FAQAccordion';
import { cn } from '../../utils/cn';

export function AccordionSection({ title, subtitle, lead, items, className }) {
  return (
    <div className={cn('text-center', className)}>
      <h2 className="text-heading font-semibold text-ink">{title}</h2>
      {subtitle && <p className="mt-2 text-ink-muted">{subtitle}</p>}
      {lead && <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-ink-muted">{lead}</p>}
      <div className="mt-8 text-left">
        <FAQAccordion items={items} />
      </div>
    </div>
  );
}
