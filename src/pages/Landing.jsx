import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Stethoscope, Globe, Search, ArrowRight } from 'lucide-react';
import { AccordionSection } from '../components/ui/AccordionSection';
import { Modal } from '../components/ui/Modal';
import { QuestionnaireFlow } from '../components/onboarding/QuestionnaireFlow';
import { PageWrapper } from '../components/layout';
import { TrustBadges } from '../components/ui/TrustBadges';
import { LegalFooter } from '../components/ui/LegalFooter';
import { useCatalogStore } from '../store/catalogStore';
import { POPULAR_SYMPTOM_IDS } from '../constants/symptoms';
import { ABOUT_REMZY_ITEMS, FAQ_ITEMS } from '../constants/onboarding';
import { useGuestProfileStore } from '../store/guestProfileStore';
import { trackSearchEvent } from '../utils/analytics';

export function Landing() {
  const symptoms = useCatalogStore((state) => state.symptoms);
  const remedies = useCatalogStore((state) => state.remedies);
  const navigate = useNavigate();
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);
  const updateGuestProfile = useGuestProfileStore((state) => state.updateProfile);

  const quickSymptoms = useMemo(
    () => symptoms.filter((s) => POPULAR_SYMPTOM_IDS.includes(s.id)).slice(0, 6),
    [symptoms]
  );

  const evidenceStats = useMemo(() => {
    let claims = 0;
    const sources = new Set();
    for (const r of remedies) {
      if (r.researchPapers) {
        claims += r.researchPapers.length;
        for (const p of r.researchPapers) {
          if (p.url) sources.add(p.url);
        }
      }
    }
    return { claims, sourceCount: sources.size };
  }, [remedies]);

  return (
    <PageWrapper className="min-h-screen flex flex-col">
      <section className="relative pt-24 pb-16 px-6 lg:px-8 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="w-14 h-14 mx-auto rounded-2xl shadow-glow bg-primary dark:bg-primary-tint flex items-center justify-center">
            <img src="/logo.png?v=3" alt="Remzy" className="w-12 h-12 object-contain" />
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-ink tracking-tight">
            Understand your symptoms
            <br />
            <span className="text-primary">get clear next steps.</span>
          </h1>

          <p className="text-lg text-ink-muted max-w-2xl mx-auto leading-relaxed">
            No sign-up needed. Search symptoms, save what works, set reminders, and find help nearby.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => setIsQuestionnaireOpen(true)}
              className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary-dark transition-all shadow-glow hover:shadow-lg"
            >
              Personalised Search
            </button>
            <Link
              to="/search"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-card text-ink rounded-2xl font-medium text-lg shadow-soft hover:shadow-card transition-all"
            >
              Quick Search <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <TrustBadges />
        </div>
      </section>

<section className="px-6 pb-10">
        <div className="mx-auto grid max-w-lg grid-cols-3 gap-3">
          <StatCard value={remedies.length} label="Remedies" />
          <StatCard value={evidenceStats.claims} label="Evidence Claims" />
          <StatCard value={`${evidenceStats.sourceCount.toLocaleString()}+`} label="Linked Sources" />
        </div>
      </section>

      {quickSymptoms.length > 0 && (
        <section className="py-6 border-y border-ink/5 bg-background/50">
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-4">
              Common Searches
            </p>
            <div className="flex overflow-x-auto justify-center gap-3 pb-2 no-scrollbar -mx-6 px-6 snap-x">
              {quickSymptoms.map((symptom) => (
                <Link
                  key={symptom.id}
                  to={`/results?symptom=${symptom.id}`}
                  className="snap-start shrink-0"
                  onClick={() => trackSearchEvent({ source: 'landing_chip', symptomIds: [symptom.id] }).catch(() => {})}
                >
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card shadow-soft hover:shadow-card transition-shadow text-sm font-medium text-ink border border-ink/5 whitespace-nowrap">
                    <span className="text-lg">{symptom.emoji}</span>
                    {symptom.label}
                  </span>
                </Link>
              ))}
              <Link
                to="/search"
                className="snap-start shrink-0 inline-flex items-center gap-2 px-4 py-3 rounded-full bg-primary/5 text-primary text-sm font-medium border border-primary/20 whitespace-nowrap hover:bg-primary/10 transition-colors"
              >
                <Search className="w-4 h-4" />
                View all
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="py-20 flex-1">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-10">
            <Feature
              icon={ShieldCheck}
              title="Transparent Evidence Status"
              description="Linked sources are labeled as claim-reviewed or still under relevance review. A citation alone is not proof."
            />
            <Feature
              icon={Stethoscope}
              title="Evidence-Backed Remedies"
              description="Each remedy claim is assessed against clinical evidence with full source transparency."
            />
            <Feature
              icon={Globe}
              title="Fast & Accessible"
              description="Free of cost, accessible and available for all."
            />
          </div>
        </div>
      </section>

      <section className="bg-card py-16">
        <div className="max-w-2xl mx-auto px-6">
          <AccordionSection
            title="About Remzy"
            subtitle="The health platform behind your search."
            lead="Remzy is a health information platform that maps common concerns to remedies and shows the review status of linked sources. Always consult a certified medical professional for serious health concerns."
            items={ABOUT_REMZY_ITEMS}
            bordered
          />
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <AccordionSection
            title="Frequently Asked Questions"
            subtitle="Everything you need to know before your first search."
            items={FAQ_ITEMS}
            twoColumn
            leftItems={[FAQ_ITEMS[0], FAQ_ITEMS[2], FAQ_ITEMS[3], FAQ_ITEMS[7], FAQ_ITEMS[8]]}
            rightItems={[FAQ_ITEMS[1], FAQ_ITEMS[4], FAQ_ITEMS[5], FAQ_ITEMS[6], FAQ_ITEMS[9]]}
          />
        </div>
      </section>

      <LegalFooter />

      <Modal isOpen={isQuestionnaireOpen} onClose={() => setIsQuestionnaireOpen(false)} title="Quick Health Profile">
        <QuestionnaireFlow
          compact
          completeMessage="Your search is ready."
          initialValues={{}}
          onSubmit={async ({ gender, commonConditions, knownAllergies, treatmentPrefs }) => {
            updateGuestProfile({
              gender,
              common_conditions: commonConditions,
              known_allergies: knownAllergies,
              treatment_prefs: treatmentPrefs,
            });
            return { success: true };
          }}
          onComplete={() => {
            setIsQuestionnaireOpen(false);
            navigate('/search');
          }}
        />
      </Modal>
    </PageWrapper>
  );
}

function StatCard({ value, label }) {
  return (
    <div className="rounded-2xl bg-card p-4 text-center shadow-card">
      <p className="text-2xl font-bold text-primary">{value}</p>
      <p className="mt-1 text-sm text-ink-muted">{label}</p>
    </div>
  );
}

function Feature({ icon: Icon, title, description }) {
  return (
    <div className="text-center">
      <div className="w-14 h-14 mx-auto bg-accent/20 rounded-2xl flex items-center justify-center mb-5 text-primary">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-xl font-semibold text-ink mb-3">{title}</h3>
      <p className="text-ink-muted leading-relaxed">{description}</p>
    </div>
  );
}
