import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Heart, ChevronDown, ShieldCheck } from 'lucide-react';
import { cn } from '../utils/cn';
import { PageWrapper } from '../components/layout';

import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { SeverityBadge } from '../components/ui/SeverityBadge';
import { HighlightedRemedyCard } from '../components/ui/HighlightedRemedyCard';
import { AltRemedyRow } from '../components/ui/AltRemedyRow';
import { LifestyleTips } from '../components/ui/LifestyleTips';
import { MedicalGuidancePanel } from '../components/ui/MedicalGuidancePanel';
import { useCatalogStore } from '../store/catalogStore';
import { useAuthStore } from '../store/authStore';
import { useGuestProfileStore } from '../store/guestProfileStore';
import { isRemedySafeForUser } from '../utils/guestProfile';
import { getRankedRemediesForSymptoms, isEmergencyQuery, resolveWithSemanticFallback } from '../utils/symptomSearch';
import { resolveQuery } from '../utils/symptomEngine';
import { fetchGeminiInterpretation } from '../utils/geminiInterpreter';
import { trackSearchEvent } from '../utils/analytics';
import { isRemedyDisplayable } from '../utils/evidence';

const EMPTY_ARRAY = [];

const INTENT_LABELS = {
  relief: 'Looking for Relief',
  cause: 'Understanding Causes',
  information: 'Seeking Information',
  prevention: 'Prevention',
};

function IntentBadge({ intent }) {
  const label = INTENT_LABELS[intent];
  if (!label) return null;

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-mint text-primary">
      {label}
    </span>
  );
}

function MonitorBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-warning/10 text-warning">
      <AlertTriangle className="w-3 h-3" />
      Monitor Closely
    </span>
  );
}

function LowConfidenceWarning() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-warning/20 bg-warning/10 p-4">
      <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
      <div className="text-sm text-warning">
        <p className="font-semibold mb-1">Low confidence match</p>
        <p>Your search didn't strongly match a known symptom. Results may be less specific. Try using a more precise term.</p>
      </div>
    </div>
  );
}

function EmergencyBanner() {
  return (
    <div className="rounded-3xl border-2 border-danger/30 bg-danger/10 p-6">
      <h2 className="text-xl font-bold text-danger mb-2">Get emergency help now</h2>
      <p className="text-danger/90 font-medium mb-4">
        Sudden difficulty breathing, chest pain, coughing up blood, fainting or severe weakness can be signs of a medical emergency. Call emergency services immediately.
      </p>
      <div className="flex flex-wrap gap-3">
        <a
          href="tel:112"
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-danger text-white font-bold text-lg hover:bg-danger/90 transition-colors shadow-lg"
        >
          Call 112
        </a>
        <p className="text-danger/70 text-sm self-center">India's unified emergency number</p>
      </div>
      <p className="text-danger/70 text-sm mt-4">Remzy does not provide self-treatment guidance for potentially serious symptoms.</p>
    </div>
  );
}

function EvidenceBanner() {
  return null;
}

function MedicalDisclaimer() {
  return (
    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 max-w-4xl mx-auto mb-6">
      <p className="text-sm text-ink-muted leading-relaxed text-center">
        <strong>Not medical advice.</strong> Remzy provides general educational information only.
        It cannot diagnose or replace professional medical advice. Always consult a qualified healthcare provider.
        Do not delay emergency care because of a result shown on this website.
      </p>
    </div>
  );
}

function SafetyProfilePanel({ isChildSafe, onToggleChildSafe, isSaving }) {
  return (
    <div className="max-w-4xl mx-auto px-6 mb-6">
      <section className={cn(
        'rounded-2xl border p-4 md:p-5 shadow-soft',
        isChildSafe ? 'border-success/20 bg-success/5' : 'border-border bg-card'
      )}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className={cn(
              'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
              isChildSafe ? 'bg-success/10 text-success' : 'bg-surface text-ink-muted'
            )}>
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-ink">Child Safe Mode</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                {isChildSafe
                  ? 'Filtering out remedies not recommended for children.'
                  : 'Toggle on to filter remedies not safe for children.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => onToggleChildSafe(!isChildSafe)}
            className={cn(
              'relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60',
              isChildSafe ? 'bg-primary' : 'bg-ink/20'
            )}
            role="switch"
            aria-checked={isChildSafe}
          >
            <span
              className={cn(
                'pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out',
                isChildSafe ? 'translate-x-5' : 'translate-x-0'
              )}
            />
          </button>
        </div>
      </section>
    </div>
  );
}

export function Results() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const symptomParam = searchParams.get('symptom');
  const queryParam = searchParams.get('q') || '';

  const [showAllAlternatives, setShowAllAlternatives] = useState(false);
  const [geminiInterpretation, setGeminiInterpretation] = useState(
    location.state?.geminiInterpretation || null
  );
  const [semanticFallbackId, setSemanticFallbackId] = useState(null);
  const [isSavingChildSafe, setIsSavingChildSafe] = useState(false);

  const userKnownAllergies = useAuthStore((state) => state.user?.known_allergies ?? EMPTY_ARRAY);
  const userConditions = useAuthStore((state) => state.user?.common_conditions);
  const userIsChildSafe = useAuthStore((state) => state.user?.is_child_safe ?? false);
  const userTreatmentPrefs = useAuthStore((state) => state.user?.treatment_prefs ?? EMPTY_ARRAY);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const incrementSearchCount = useAuthStore((state) => state.incrementSearchCount);
  const updateUser = useAuthStore((state) => state.updateUser);
  const guestAllergies = useGuestProfileStore((state) => state.known_allergies);
  const guestConditions = useGuestProfileStore((state) => state.common_conditions);
  const guestIsChildSafe = useGuestProfileStore((state) => state.is_child_safe ?? false);
  const guestTreatmentPrefs = useGuestProfileStore((state) => state.treatment_prefs ?? EMPTY_ARRAY);
  const setGuestIsChildSafe = useGuestProfileStore((state) => state.setIsChildSafe);
  const activeAllergies = isAuthenticated ? userKnownAllergies : guestAllergies;
  const activeConditions = isAuthenticated ? userConditions : guestConditions;
  const activeIsChildSafe = isAuthenticated ? userIsChildSafe : guestIsChildSafe;
  const activeTreatmentPrefs = isAuthenticated ? userTreatmentPrefs : guestTreatmentPrefs;

  const symptoms = useCatalogStore((state) => state.symptoms);
  const remedies = useCatalogStore((state) => state.remedies);
  const symptomRemedies = useCatalogStore((state) => state.symptomRemedies);
  const popularityMap = useCatalogStore((state) => state.popularityMap);
  const isCatalogLoading = useCatalogStore((state) => state.isLoading);
  const hasLoaded = useCatalogStore((state) => state.hasLoaded);

  const knownSymptom = useMemo(
    () => (symptomParam ? symptoms.find((symptom) => symptom.id === symptomParam) || null : null),
    [symptomParam, symptoms]
  );
  const shouldResolveSymptomParamAsText = Boolean(hasLoaded && symptomParam && !knownSymptom);
  const freeTextQuery = queryParam.trim() || (shouldResolveSymptomParamAsText ? symptomParam.trim() : '');
  const isFreeTextSearch = Boolean(freeTextQuery);

  const deterministicResolution = useMemo(
    () => (isFreeTextSearch ? resolveQuery(freeTextQuery, symptoms, null) : null),
    [isFreeTextSearch, freeTextQuery, symptoms]
  );
  const hasStrongPhraseMatch = Boolean(
    deterministicResolution?.matchedPhrases?.length && deterministicResolution.confidence >= 80
  );

  useEffect(() => {
    if (!isFreeTextSearch || !freeTextQuery || geminiInterpretation || hasStrongPhraseMatch) return;

    let cancelled = false;

    fetchGeminiInterpretation(freeTextQuery, symptoms)
      .then((interp) => {
        if (!cancelled && interp) {
          setGeminiInterpretation(interp);
        }
      })
      .catch((err) => {
        console.error('[GEMINI-RESULTS] Fallback fetch failed:', err?.message || err);
      });

    return () => { cancelled = true; };
  }, [isFreeTextSearch, freeTextQuery, symptoms, geminiInterpretation, hasStrongPhraseMatch]);

  // Semantic fallback: fires when deterministic + NLU both fail to resolve a confident match
  useEffect(() => {
    if (!isFreeTextSearch || !freeTextQuery) return;
    if (hasStrongPhraseMatch) return;
    if (geminiInterpretation) return;
    if (semanticFallbackId) return;

    // Only try semantic fallback if we have no resolved symptom IDs or very low confidence
    const currentResolution = resolveQuery(freeTextQuery, symptoms, null);
    if (currentResolution.symptomIds.length > 0 && currentResolution.confidence >= 50) return;

    let cancelled = false;

    resolveWithSemanticFallback(freeTextQuery)
      .then((symptomId) => {
        if (!cancelled && symptomId) {
          console.log(`[RESULTS] Semantic fallback resolved: ${freeTextQuery} → ${symptomId}`);
          setSemanticFallbackId(symptomId);
        }
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [isFreeTextSearch, freeTextQuery, symptoms, geminiInterpretation, hasStrongPhraseMatch, semanticFallbackId]);

  const symptomResolution = useMemo(() => {
    if (!isFreeTextSearch) {
      return {
        symptomIds: knownSymptom ? [knownSymptom.id] : [],
        allSymptomIds: knownSymptom ? [knownSymptom.id] : [],
        confidence: knownSymptom ? 100 : 0,
        allMatches: [],
        primarySymptom: knownSymptom,
        primarySymptomId: knownSymptom?.id || null,
      };
    }

    const baseResolution = hasStrongPhraseMatch
      ? deterministicResolution
      : resolveQuery(freeTextQuery, symptoms, geminiInterpretation);

    // If the base resolution found something with decent confidence, use it
    if (baseResolution.symptomIds.length > 0 && baseResolution.confidence >= 50) {
      return baseResolution;
    }

    // Otherwise, try semantic fallback if available
    if (semanticFallbackId) {
      const fallbackSymptom = symptoms.find(s => s.id === semanticFallbackId);
      if (fallbackSymptom) {
        return {
          symptomIds: [semanticFallbackId],
          allSymptomIds: [semanticFallbackId],
          confidence: 75, // Semantic match confidence threshold
          allMatches: [],
          primarySymptom: fallbackSymptom,
          primarySymptomId: semanticFallbackId,
        };
      }
    }

    return baseResolution;
  }, [isFreeTextSearch, freeTextQuery, symptoms, knownSymptom, geminiInterpretation, hasStrongPhraseMatch, deterministicResolution, semanticFallbackId]);

  const matchedSymptom = symptomResolution.primarySymptom;
  const queryConfidence = symptomResolution.confidence;
  const isLowConfidence = isFreeTextSearch && queryConfidence < 50 && symptomResolution.symptomIds.length > 0;
  const emergencyQueryText = freeTextQuery || queryParam;
  const isEmergencySearch = isEmergencyQuery(emergencyQueryText);
  const primarySymptomId = symptomResolution.symptomIds[0];

  useEffect(() => {
    if (isFreeTextSearch && freeTextQuery) {
      trackSearchEvent({
        source: symptomParam ? 'symptom_page' : 'text_direct',
        queryText: freeTextQuery,
        symptomIds: symptomParam ? [symptomParam] : [],
      }).catch(() => {});
    } else if (symptomParam) {
      trackSearchEvent({
        source: 'symptom_page',
        symptomIds: [symptomParam],
      }).catch(() => {});
    }

    if (isAuthenticated) {
      incrementSearchCount();
    }
  }, [isFreeTextSearch, freeTextQuery, symptomParam, isAuthenticated, incrementSearchCount]);

  const safeFilter = useMemo(
    () => (remedy) => isRemedySafeForUser(remedy, { allergies: activeAllergies, conditions: activeConditions, isChildSafe: activeIsChildSafe }),
    [activeAllergies, activeConditions, activeIsChildSafe]
  );

  const searchResult = useMemo(() => {
    const ids = symptomResolution.symptomIds;
    if (ids.length === 0) return { primary: [], related: [], grouped: null };

    return getRankedRemediesForSymptoms(ids, symptomRemedies, remedies, {
      symptoms,
      allergies: activeAllergies,
      conditions: activeConditions,
      isChildSafe: activeIsChildSafe,
      treatmentPrefs: activeTreatmentPrefs,
      queryConfidence: symptomResolution.confidence,
      primarySymptomId: symptomResolution.primarySymptomId,
      popularityMap,
    });
  }, [symptomResolution.symptomIds, symptomResolution.confidence, symptomResolution.primarySymptomId, symptomRemedies, remedies, symptoms, activeAllergies, activeConditions, activeIsChildSafe, activeTreatmentPrefs, popularityMap]);

  const grouped = searchResult.grouped;

  const highlightedRemedies = useMemo(() => {
    if (!grouped) return [];
    const all = [
      grouped.bestMatch,
      ...(grouped.bestMatches || []),
      ...(grouped.additionalOptions || []),
      ...(grouped.supportive || []),
    ].filter(Boolean).filter(r => isRemedyDisplayable(r));
    return all.slice(0, 3);
  }, [grouped]);

  const highlightedIds = useMemo(
    () => new Set(highlightedRemedies.map((r) => r.id)),
    [highlightedRemedies]
  );

  const hasResults = highlightedRemedies.length > 0 || allAlternatives.length > 0;

  const allAlternatives = useMemo(() => {
    if (!grouped) return [];
    return [
      ...(grouped.bestMatches || []),
      ...(grouped.additionalOptions || []),
      ...(grouped.supportive || []),
    ].filter((r) => !highlightedIds.has(r.id) && isRemedyDisplayable(r));
  }, [grouped, highlightedIds]);

  const visibleAlternatives = showAllAlternatives ? allAlternatives : allAlternatives.slice(0, 5);

  const handleChildSafeToggle = async (newValue) => {
    if (newValue === activeIsChildSafe) return;

    if (!isAuthenticated) {
      setGuestIsChildSafe(newValue);
      return;
    }

    setIsSavingChildSafe(true);
    try {
      await updateUser({ is_child_safe: newValue });
    } finally {
      setIsSavingChildSafe(false);
    }
  };

  if (!hasLoaded && isCatalogLoading) {
    return (
      <PageWrapper className="min-h-screen pb-16">
        <div className="max-w-4xl mx-auto px-6 pt-8">
          <LoadingSkeleton count={2} />
        </div>
      </PageWrapper>
    );
  }

  if (!isFreeTextSearch && !matchedSymptom && hasLoaded) {
    return (
      <PageWrapper className="min-h-screen pt-16 px-6">
        <EmptyState
          title="Symptom not found"
          description="Please select a valid symptom from the search page."
          ctaLabel="Go to Search"
          ctaHref="/search"
        />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="min-h-screen pb-24 md:pb-16">
      <div className="max-w-4xl mx-auto px-6 pt-8">
        <button
          onClick={() => navigate('/search')}
          className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Search
        </button>

        <h1 className="text-hero font-extrabold text-ink mt-8 mb-4">
          {isEmergencySearch ? emergencyQueryText : (matchedSymptom?.label || freeTextQuery)}
        </h1>

        {matchedSymptom && !isEmergencySearch && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <SeverityBadge severity={symptomResolution.severity} />
            <IntentBadge intent={symptomResolution.userIntent} />
            {symptomResolution.emergencyIndicators?.length > 0 && <MonitorBadge />}
          </div>
        )}

        {matchedSymptom && !isEmergencySearch && (
          <p className="text-ink-muted text-lg mb-8">
            Based on your input, here&apos;s the best next step.
          </p>
        )}
      </div>

      {isLowConfidence && (
        <div className="max-w-4xl mx-auto px-6 mb-4">
          <LowConfidenceWarning />
        </div>
      )}

      {hasResults && !isEmergencySearch && (
        <SafetyProfilePanel
          isChildSafe={activeIsChildSafe}
          onToggleChildSafe={handleChildSafeToggle}
          isSaving={isSavingChildSafe}
        />
      )}

      {isEmergencySearch ? (
        <div className="max-w-4xl mx-auto px-6 mb-8">
          <EmergencyBanner />
        </div>
      ) : !hasResults && !isCatalogLoading ? (
        <div className="max-w-4xl mx-auto px-6 mb-8">
          <EmptyState
            title="No remedies found"
            description={symptomResolution.symptomIds.length > 0
              ? `No evidence-backed remedies were found for "${matchedSymptom?.label || freeTextQuery}". Try a different search term.`
              : `We couldn't confidently identify a matching symptom for "${freeTextQuery}". Try a different search term.`}
            ctaLabel="Search Again"
            ctaHref="/search"
          />
        </div>
      ) : (
        <>
          {highlightedRemedies.length > 0 && (
            <div className="max-w-4xl mx-auto px-6 mb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-warning text-sm">&#9733;</span>
                <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">Recommended for you</p>
              </div>
              <p className="text-sm text-ink-muted mb-5">Top picks based on your symptoms, safety profile, and available evidence.</p>
              <div className={cn(
                'grid gap-5',
                highlightedRemedies.length === 1 && 'grid-cols-1 max-w-md mx-auto',
                highlightedRemedies.length === 2 && 'grid-cols-1 sm:grid-cols-2',
                highlightedRemedies.length >= 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              )}>
                {highlightedRemedies.map((remedy, i) => (
                  <HighlightedRemedyCard
                    key={remedy.id}
                    remedy={remedy}
                    isSafe={safeFilter(remedy)}
                    evidenceScore={remedy._evidenceScore}
                    safetyScore={remedy._safetyScore}
                    isChildSafe={activeIsChildSafe}
                    delay={i * 0.06}
                  />
                ))}
              </div>
            </div>
          )}

          {highlightedRemedies.length > 0 && <EvidenceBanner />}

          {allAlternatives.length > 0 && (
            <div className="max-w-4xl mx-auto px-6 mt-16">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-section-heading font-bold text-ink mb-1">Other Remedies</h2>
                  <p className="text-sm text-ink-muted">Excellent alternatives if you need another option.</p>
                </div>
                {allAlternatives.length > 5 && !showAllAlternatives && (
                  <button
                    onClick={() => setShowAllAlternatives(true)}
                    className="hidden md:inline-flex text-sm font-semibold text-primary hover:text-primary-dark transition-colors shrink-0"
                  >
                    Show all
                  </button>
                )}
              </div>

              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div>
                  {visibleAlternatives.map((remedy, i) => (
                    <AltRemedyRow
                      key={remedy.id}
                      remedy={remedy}
                      isSafe={safeFilter(remedy)}
                      evidenceScore={remedy._evidenceScore}
                      safetyScore={remedy._safetyScore}
                      isChildSafe={activeIsChildSafe}
                      showDivider={i < visibleAlternatives.length - 1}
                    />
                  ))}
                </div>

              </div>

              {!showAllAlternatives && allAlternatives.length > 5 && (
                <button
                  onClick={() => setShowAllAlternatives(true)}
                  className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors mx-auto md:hidden"
                >
                  Show all {allAlternatives.length} alternatives
                  <ChevronDown className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {primarySymptomId && (
            <div className="max-w-4xl mx-auto px-6 mt-16">
              <LifestyleTips symptomId={primarySymptomId} />
            </div>
          )}

          {primarySymptomId && (
            <div className="max-w-4xl mx-auto px-6 mt-16">
              <MedicalGuidancePanel
                symptomId={primarySymptomId}
                severity={symptomResolution.severity}
              />
            </div>
          )}

          <div className="max-w-4xl mx-auto px-6 mt-8">
            <MedicalDisclaimer />
          </div>

          {!isAuthenticated && hasResults && (
            <div className="max-w-4xl mx-auto px-6 mt-8">
              <section className="rounded-3xl bg-gradient-card p-6 shadow-soft border border-primary/10">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-5 h-5 text-primary" />
                  <p className="text-lg font-semibold text-ink">Save this remedy</p>
                </div>
                <p className="text-sm text-ink-muted leading-relaxed mb-4">
                  Create a free account to track your recovery and build your personal remedy library.
                </p>
                <div className="space-y-2">
                  <Link
                    to="/register"
                    className="block w-full rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-white shadow-glow hover:bg-primary-dark transition-colors"
                  >
                    Create Free Account
                  </Link>
                  <Link
                    to="/login"
                    className="block w-full text-center text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
                  >
                    Log In
                  </Link>
                </div>
              </section>
            </div>
          )}
        </>
      )}
    </PageWrapper>
  );
}
