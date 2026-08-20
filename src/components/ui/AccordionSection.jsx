import { FAQAccordion } from './FAQAccordion';
import { cn } from '../../utils/cn';

export function AccordionSection({ title, subtitle, lead, items, bordered = false, className, twoColumn = false, leftItems, rightItems }) {
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

  return (
    <div className={cn('text-center', className)}>
      <h2 className="text-heading font-semibold text-ink">{title}</h2>
      {subtitle && <p className="mt-2 text-ink-muted">{subtitle}</p>}
      {lead && <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-ink-muted">{lead}</p>}
      <div className="mt-8 text-left">
        <FAQAccordion items={items} bordered={bordered} />
      </div>
    </div>
  );
}
