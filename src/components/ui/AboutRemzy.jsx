import { motion } from 'framer-motion';
import { Target, Lightbulb, ShieldCheck, Users, Rocket } from 'lucide-react';
import { HeroIllustration } from './HeroIllustration';
import { ABOUT_REMZY_ITEMS } from '../../constants/onboarding';

const ICONS = {
  'Our Mission': Target,
  'Why We Built It': Lightbulb,
  'Our Values': ShieldCheck,
  "Who It's For": Users,
  "What's Next": Rocket,
};

const leftItems = ABOUT_REMZY_ITEMS.slice(0, 3);
const rightItems = ABOUT_REMZY_ITEMS.slice(3);

function AboutCard({ item, index }) {
  const Icon = ICONS[item.question] || Target;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative"
    >
      <div className="relative bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 p-6 shadow-soft hover:shadow-card hover:border-primary/20 transition-all duration-300">
        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
          <Icon className="w-5 h-5 text-primary" />
        </div>

        <h3 className="text-lg font-semibold text-ink mb-3">{item.question}</h3>

        {Array.isArray(item.answer) ? (
          <ul className="space-y-2">
            {item.answer.map((line, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-muted">
                <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary/40" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm leading-relaxed text-ink-muted">{item.answer}</p>
        )}
      </div>
    </motion.div>
  );
}

export function AboutRemzy() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="section-label text-primary mb-3">About Remzy</p>
          <h2 className="text-heading font-semibold text-ink">The health platform behind your search.</h2>
          <div className="w-16 h-1 bg-primary/30 rounded-full mx-auto mt-4 mb-6" />
          <p className="max-w-2xl mx-auto leading-relaxed text-ink-muted">
            Remzy is a health information platform that maps common concerns to remedies and shows the review status of linked sources. Always consult a certified medical professional for serious health concerns.
          </p>
        </motion.div>

        {/* 3-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-8 items-start">
          {/* Left column */}
          <div className="space-y-8">
            {leftItems.map((item, i) => (
              <AboutCard key={item.question} item={item} index={i} />
            ))}
          </div>

          {/* Center — illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7 }}
            className="hidden lg:flex justify-center items-start pt-6"
          >
            <div className="relative">
              <HeroIllustration />
              {/* Decorative accents */}
              <svg className="absolute -top-4 -right-6 w-12 h-12 text-primary/20" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="3" fill="currentColor" />
                <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
              </svg>
              <svg className="absolute -bottom-3 -left-5 w-10 h-10 text-primary/15" viewBox="0 0 40 40" fill="none">
                <rect x="12" y="12" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1" />
              </svg>
            </div>
          </motion.div>

          {/* Right column */}
          <div className="space-y-8">
            {rightItems.map((item, i) => (
              <AboutCard key={item.question} item={item} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
