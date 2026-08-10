import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, ChevronRight } from 'lucide-react';
import { FavoriteHeart } from '../components/ui/FavoriteHeart';
import { ScheduleQuickAdd } from '../components/ui/ScheduleQuickAdd';
import { PageWrapper } from '../components/layout';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { RemedyHero } from '../components/ui/RemedyHero';
import { QuickStats } from '../components/ui/QuickStats';
import { BenefitCard } from '../components/ui/BenefitCard';
import { TimelineStep } from '../components/ui/TimelineStep';
import { EvidenceCard } from '../components/ui/EvidenceCard';
import { AdvisoryCard } from '../components/ui/AdvisoryCard';
import { DoctorGuidance } from '../components/ui/DoctorGuidance';
import { NearbyShops } from '../components/ui/NearbyShops';
import { Reveal } from '../components/ui/Reveal';
import { useFavoritesStore } from '../store/favoritesStore';
import { useCatalogStore } from '../store/catalogStore';
import { useAuthStore } from '../store/authStore';
import { useGuestProfileStore } from '../store/guestProfileStore';
import { isRemedySafeForUser } from '../utils/guestProfile';
import { cn } from '../utils/cn';
import { trackRemedyEvent } from '../utils/analytics';
import { getMedicalCareWarnings } from '../data/symptoms';
import { computeEvidenceScore } from '../utils/evidence';
import { parseHowToUseSteps } from '../utils/howToUse';

const CATEGORY_BENEFITS = {
  Natural: [
    { title: 'Gentle & plant-based', description: 'Derived from natural sources with minimal processing.' },
    { title: 'Holistic relief', description: 'Addresses root causes, not just surface symptoms.' },
    { title: 'Low side-effect profile', description: 'Well tolerated by most people when used as directed.' },
  ],
  OTC: [
    { title: 'Clinically validated', description: 'Backed by rigorous trials and peer-reviewed research.' },
    { title: 'Fast-acting relief', description: 'Rapid onset of symptom relief when needed most.' },
    { title: 'Precise, standardised dosing', description: 'Consistent formulation for predictable results.' },
  ],
  Lifestyle: [
    { title: 'No medication required', description: 'Drug-free habit built from everyday routines.' },
    { title: 'Long-term health gains', description: 'Builds sustainable improvements over time.' },
    { title: 'Combines with any treatment', description: 'Zero drug interactions or contraindications.' },
  ],
};

const EVIDENCE_SHOW_LIMIT = 4;

const MEDICINE_INFO_MESSAGE = 'This medicine may not be suitable for everyone. Check with a pharmacist or doctor if you have high blood pressure, heart problems, take other medicines, are pregnant, or are unsure.';

export function RemedyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const remedies = useCatalogStore((state) => state.remedies);
  const isCatalogLoading = useCatalogStore((state) => state.isLoading);
  const hasLoaded = useCatalogStore((state) => state.hasLoaded);
  const [showAllEvidence, setShowAllEvidence] = useState(false);

  const userKnownAllergies = useAuthStore((state) => state.user?.known_allergies) ?? [];
  const userConditions = useAuthStore((state) => state.user?.common_conditions);
  const userIsChildSafe = useAuthStore((state) => state.user?.is_child_safe ?? false);
  const guestAllergies = useGuestProfileStore((state) => state.known_allergies);
  const guestConditions = useGuestProfileStore((state) => state.common_conditions);
  const guestIsChildSafe = useGuestProfileStore((state) => state.is_child_safe ?? false);
  const activeAllergies = isAuthenticated ? userKnownAllergies : guestAllergies;
  const activeConditions = isAuthenticated ? userConditions : guestConditions;
  const activeIsChildSafe = isAuthenticated ? userIsChildSafe : guestIsChildSafe;

  const remedy = remedies.find(r => r.id === id);
  const isOtc = remedy?.category === 'OTC';
  const favorite = useFavoritesStore((state) => (remedy ? state.isFavorite(remedy.id) : false));

  const isSafe = useMemo(() => {
    if (!remedy) return true;
    return isRemedySafeForUser(remedy, { allergies: activeAllergies, conditions: activeConditions, isChildSafe: activeIsChildSafe });
  }, [remedy, activeAllergies, activeConditions, activeIsChildSafe]);

  useEffect(() => {
    if (!remedy?.id) return;
    trackRemedyEvent({ remedyId: remedy.id, eventType: 'viewed' }).catch(() => {});
  }, [remedy?.id]);

  const howToUseSteps = useMemo(() => {
    return parseHowToUseSteps(remedy?.howToUse);
  }, [remedy]);

  const benefits = useMemo(() => {
    if (remedy?.benefits) return remedy.benefits;
    const category = remedy?.category;
    const defaults = CATEGORY_BENEFITS[category] || CATEGORY_BENEFITS.Natural;
    if (!remedy?.longDescription) return defaults;
    const parts = remedy.longDescription.split(/\.\s+/).filter(Boolean);
    if (parts.length <= 1) return defaults;
    return parts.slice(0, 3).map((sentence, i) => {
      const clean = sentence.trim().replace(/\.$/, '');
      return {
        title: clean.length > 60 ? clean.slice(0, 57) + '…' : clean,
        description: defaults[i]?.description || undefined,
      };
    });
  }, [remedy]);

  const researchLinks = useMemo(() => {
    if (!remedy) return [];
    return remedy.researchPapers || remedy.researchLinks || [];
  }, [remedy]);

  const evidenceScore = useMemo(() => {
    return computeEvidenceScore(remedy);
  }, [remedy]);

  const safetyScore = useMemo(() => {
    if (!remedy) return 80;
    if (remedy.contraindications?.length > 2) return 40;
    if (remedy.contraindications?.length > 0) return 65;
    return 90;
  }, [remedy]);

  const visibleEvidence = showAllEvidence ? researchLinks : researchLinks.slice(0, EVIDENCE_SHOW_LIMIT);
  const hasGuidance = researchLinks.some((source) => /guideline|guidance|evidence-summary/.test(source.evidenceType || ''));

  const doctorWarnings = getMedicalCareWarnings(remedy?.primarySymptoms?.[0] || remedy?.symptoms?.[0]);

  if (!hasLoaded && isCatalogLoading) {
    return (
      <PageWrapper className="min-h-screen">
        <div className="max-w-[800px] mx-auto px-5 md:px-8 pt-8">
          <LoadingSkeleton count={1} />
        </div>
      </PageWrapper>
    );
  }

  if (!remedy) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <p className="text-ink-muted text-base">Recommended step not found</p>
      </div>
    );
  }

  return (
    <PageWrapper className="min-h-screen pb-28 md:pb-24">
      <div className="sticky top-0 z-40 bg-bg/80 backdrop-blur-md border-b border-border">
        <div className="max-w-[800px] mx-auto px-5 md:px-8 h-14 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/search');
              }
            }}
            className="flex items-center gap-1.5 text-sm text-ink-muted transition-colors duration-200 min-h-[44px] hover:text-ink active:text-ink/70"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-1">
            <ScheduleQuickAdd remedy={remedy} className="!p-2.5 !min-w-[44px] !min-h-[44px]" />
            <button
              onClick={() => {
                if (!isAuthenticated) { navigate('/register'); return; }
                toggleFavorite(remedy);
              }}
              className={cn(
                'p-2.5 rounded-full transition-colors duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center',
                'active:scale-90',
                favorite ? 'text-primary' : 'text-ink-muted hover:text-primary'
              )}
              aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <FavoriteHeart favorited={favorite} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-5 md:px-8 pt-10 pb-8 md:pt-14 md:pb-10">
        <RemedyHero
          remedy={remedy}
          evidenceScore={evidenceScore}
          safetyScore={safetyScore}
        />
      </div>

      <div className="max-w-[800px] mx-auto px-5 md:px-8 pb-12 md:pb-16">
        <Reveal>
          <div className="rounded-2xl bg-card border border-border p-4 md:p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
            <QuickStats
              remedy={remedy}
              isSafe={isSafe}
              evidenceScore={evidenceScore}
              safetyScore={safetyScore}
            />
          </div>
        </Reveal>
      </div>

      <div className="max-w-[800px] mx-auto px-5 md:px-8">

        {remedy.warnings && (
          <section className="mb-12 md:mb-16">
            <Reveal>
              <div className="mb-5">
                <h2 className="section-title mb-2">Health Alert</h2>
                <div className="h-1 w-12 rounded-full bg-warning" />
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <AdvisoryCard
                title="Important"
                message={remedy.warnings}
                subtitle={isOtc ? 'Medicine Information' : undefined}
                subMessage={isOtc ? MEDICINE_INFO_MESSAGE : undefined}
              />
            </Reveal>
          </section>
        )}

        {howToUseSteps.length > 0 && (
          <section className="mb-12 md:mb-16">
            <Reveal>
              <h2 className="section-title mb-5">How To Use</h2>
            </Reveal>
            <div className="rounded-[20px] bg-card border border-border p-6 md:p-8 shadow-card hover:shadow-card-lg transition-shadow duration-200">
              {howToUseSteps.map((step, i) => (
                <TimelineStep
                  key={i}
                  number={i + 1}
                  description={step}
                  isLast={i === howToUseSteps.length - 1}
                  delay={i * 0.15}
                />
              ))}
            </div>
          </section>
        )}

        {benefits.length > 0 && (
          <section className="mb-12 md:mb-16">
            <Reveal>
              <h2 className="section-title mb-5">Benefits</h2>
            </Reveal>
            <div className="rounded-[20px] bg-card border border-border p-6 md:p-8 shadow-card hover:shadow-card-lg transition-shadow duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {benefits.map((benefit, i) => (
                  <div key={i} className={cn(
                    'relative',
                    i > 0 && 'lg:pl-8',
                  )}>
                    {i < benefits.length - 1 && (
                      <div className="hidden lg:block absolute top-3 bottom-3 left-0 w-px bg-border-subtle/60" />
                    )}
                    <BenefitCard
                      title={benefit.title}
                      description={benefit.description}
                      delay={i * 0.07}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {remedy.isPurchasable !== false && (
          <div className="mb-12 md:mb-16">
            <NearbyShops remedyName={remedy.name} />
          </div>
        )}

        <section className="mb-12 md:mb-16">
          <Reveal>
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <h2 className="section-title mb-0">Supporting Information</h2>
              <div className="flex items-center gap-2">
                {researchLinks.length > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-evidence-light text-evidence">
                    <BookOpen className="w-3.5 h-3.5" />
                    {researchLinks.length} linked {researchLinks.length === 1 ? 'source' : 'sources'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-ink-muted/10 text-ink-muted">
                    <BookOpen className="w-3.5 h-3.5" />
                    {remedy.evidenceTier === 'traditional' ? 'Traditional Use' : remedy.evidenceTier === 'supportive' ? 'Supportive Care' : 'Not yet rated'}
                  </span>
                )}
                {researchLinks.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-evidence/10 text-evidence">
                    <BookOpen className="w-3.5 h-3.5" />
                    {hasGuidance ? 'Guideline-Referenced' : 'Research-Referenced'}
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm text-ink-muted mb-5">
              {researchLinks.length > 0
                ? hasGuidance
                  ? `${researchLinks.length} named clinical or public-health ${researchLinks.length === 1 ? 'source is' : 'sources are'} linked below. Relevance and certainty depend on the population, intervention, and outcome studied.`
                  : `${researchLinks.length} peer-reviewed ${researchLinks.length === 1 ? 'source is' : 'sources are'} linked below. A citation does not by itself prove that a remedy works for every person or use.`
                : remedy.evidenceNote || 'No published studies indexed yet'}
            </p>
          </Reveal>
          {researchLinks.length > 0 && (
            <>
              <div className="space-y-4">
                {visibleEvidence.map((source, idx) => (
                  <EvidenceCard
                    key={idx}
                    source={source}
                    delay={idx * 0.06}
                    onTrackClick={() => trackRemedyEvent({ remedyId: remedy.id, eventType: 'research_clicked', metadata: { url: source.url, label: source.journal || source.label } }).catch(() => {})}
                  />
                ))}
              </div>
              {!showAllEvidence && researchLinks.length > EVIDENCE_SHOW_LIMIT && (
                <button
                  onClick={() => setShowAllEvidence(true)}
                  className="flex items-center gap-1 text-sm font-medium text-evidence mt-4 transition-all duration-200 hover:opacity-80 active:opacity-60"
                >
                  Show {researchLinks.length - EVIDENCE_SHOW_LIMIT} more {researchLinks.length - EVIDENCE_SHOW_LIMIT === 1 ? 'study' : 'studies'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </section>

        <section className="mb-12 md:mb-16">
          <DoctorGuidance flags={doctorWarnings} />
        </section>
      </div>
    </PageWrapper>
  );
}
