import { useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, ArrowRight, ShieldCheck } from 'lucide-react';
import { PageWrapper } from '../components/layout';
import { SearchBar } from '../components/forms/SearchBar';
import { TrustBadges } from '../components/ui/TrustBadges';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { useSearch } from '../hooks/useSearch';
import { useCatalogStore } from '../store/catalogStore';
import { useAuthStore } from '../store/authStore';
import { useGuestProfileStore } from '../store/guestProfileStore';
import { trackSearchEvent } from '../utils/analytics';
import { isRemedySafeForUser } from '../utils/guestProfile';
import { getRankedRemediesForSymptoms, isEmergencyQuery } from '../utils/symptomSearch';
import { resolveQuery } from '../utils/symptomEngine';
import { fetchGeminiInterpretation } from '../utils/geminiInterpreter';
import { EMERGENCY_MESSAGE, EMERGENCY_ACTION } from '../constants/emergency';
import { POPULAR_SYMPTOM_IDS, SYMPTOM_COLOR_CLASSES } from '../constants/symptoms';

const EMPTY_ARRAY = [];

function normalizeValue(value) {
  return value.toLowerCase().trim().replace(/\s+/g, ' ');
}

export function SymptomSearch() {
  const { searchTerm, setSearchTerm, debouncedTerm } = useSearch('', 300);
  const navigate = useNavigate();

  const symptoms = useCatalogStore((state) => state.symptoms);
  const remedies = useCatalogStore((state) => state.remedies);
  const symptomRemedies = useCatalogStore((state) => state.symptomRemedies);
  const isCatalogLoading = useCatalogStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userKnownAllergies = useAuthStore((state) => state.user?.known_allergies);
  const userConditions = useAuthStore((state) => state.user?.common_conditions);
  const userIsChildSafe = useAuthStore((state) => state.user?.is_child_safe ?? false);
  const userTreatmentPrefs = useAuthStore((state) => state.user?.treatment_prefs ?? EMPTY_ARRAY);
  const guestAllergies = useGuestProfileStore((state) => state.known_allergies);
  const guestConditions = useGuestProfileStore((state) => state.common_conditions);
  const guestIsChildSafe = useGuestProfileStore((state) => state.is_child_safe);
  const guestTreatmentPrefs = useGuestProfileStore((state) => state.treatment_prefs ?? EMPTY_ARRAY);
  const activeAllergies = isAuthenticated ? userKnownAllergies : guestAllergies;
  const activeConditions = isAuthenticated ? userConditions : guestConditions;
  const activeIsChildSafe = isAuthenticated ? userIsChildSafe : guestIsChildSafe;
  const activeTreatmentPrefs = isAuthenticated ? userTreatmentPrefs : guestTreatmentPrefs;

  const isSearching = searchTerm !== debouncedTerm;
  const trimmedQuery = debouncedTerm.trim();

  const symptomCards = useMemo(() => {
    if (!symptoms?.length) return [];
    return POPULAR_SYMPTOM_IDS
      .map(id => symptoms.find(s => s.id === id))
      .filter(Boolean)
      .map(s => ({
        id: s.id,
        label: s.label,
        emoji: s.emoji || '💊',
        color: s.color || 'sage',
      }));
  }, [symptoms]);

  const exactSymptom = useMemo(() => {
    const normalizedQuery = normalizeValue(searchTerm);
    if (!normalizedQuery || !symptoms?.length) return null;
    return symptoms.find((symptom) => normalizeValue(symptom.label) === normalizedQuery) || null;
  }, [searchTerm, symptoms]);

  const symptomResolution = useMemo(
    () => (trimmedQuery.length >= 2 ? resolveQuery(trimmedQuery, symptoms) : { symptomIds: [], confidence: 0, allMatches: [] }),
    [symptoms, trimmedQuery]
  );

  const matchedSymptomIds = symptomResolution.symptomIds;

  const safeFilter = useMemo(
    () => (remedy) => isRemedySafeForUser(remedy, { allergies: activeAllergies, conditions: activeConditions, isChildSafe: activeIsChildSafe }),
    [activeAllergies, activeConditions, activeIsChildSafe]
  );

  const symptomRankedResults = useMemo(() => {
    if (matchedSymptomIds.length === 0) return [];
    const result = getRankedRemediesForSymptoms(matchedSymptomIds, symptomRemedies, remedies, {
      symptoms,
      allergies: activeAllergies,
      conditions: activeConditions,
      isChildSafe: activeIsChildSafe,
      treatmentPrefs: activeTreatmentPrefs,
      queryConfidence: symptomResolution.confidence,
      primarySymptomId: symptomResolution.primarySymptomId,
    });
    const combined = [...(result.primary || []), ...(result.related || [])];
    return combined.filter(safeFilter);
  }, [matchedSymptomIds, remedies, safeFilter, symptomRemedies, symptoms, activeAllergies, activeConditions, activeIsChildSafe, activeTreatmentPrefs, symptomResolution.confidence, symptomResolution.primarySymptomId]);

  const dropdownResults = symptomRankedResults;
  const shouldShowDropdown = trimmedQuery.length >= 2;

  const goToResults = useCallback(async () => {
    const query = searchTerm.trim();
    if (!query) return;

    if (exactSymptom) {
      navigate(`/results?symptom=${encodeURIComponent(exactSymptom.id)}`);
      return;
    }

    trackSearchEvent({ source: 'text', queryText: query }).catch(() => {});

    try {
      const geminiInterp = await fetchGeminiInterpretation(query, symptoms);
      navigate(`/results?q=${encodeURIComponent(query)}`, {
        state: { geminiInterpretation: geminiInterp || null },
      });
    } catch (err) {
      console.error('[GEMINI-SEARCH] goToResults fetch failed:', err?.message || err);
      navigate(`/results?q=${encodeURIComponent(query)}`);
    }
  }, [exactSymptom, searchTerm, symptoms, navigate]);

  const handleCardClick = (item) => {
    const query = item.label;
    trackSearchEvent({ source: 'symptom_card', queryText: query, symptomIds: [item.id] }).catch(() => {});
    navigate(`/results?symptom=${encodeURIComponent(item.id)}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      goToResults();
    }
  };

  function evidenceDots(score) {
    if (!score) return null;
    const filled = Math.round(score / 3.4);
    return (
      <span className="ml-1.5 text-[10px] tracking-wider text-ink-subtle">
        {[...Array(3)].map((_, i) => (
          <span key={i} className={i < filled ? 'text-primary' : 'text-ink/10'}>
            ●
          </span>
        ))}
      </span>
    );
  }

  return (
    <PageWrapper className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center px-6 py-16 max-w-2xl mx-auto w-full">
        <div className="text-center mb-10 w-full">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-500 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Research-backed remedies</span>
          </div>

          <h1 className="text-[44px] md:text-[52px] font-bold text-ink tracking-tight leading-[1.05] mb-3">
            Something feels off?
            <br />
            <span className="text-primary">Find out what might help.</span>
          </h1>

          <p className="text-base md:text-lg text-ink-muted leading-relaxed max-w-lg mx-auto">
            Evidence-backed remedies for common symptoms.{' '}
            <span className="text-primary font-medium">No sign-up needed.</span>
          </p>
        </div>
        <div onKeyDown={handleKeyDown} className="relative mb-10 w-full">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            onSearch={() => goToResults()}
            placeholder="Search backache, period cramps, sore throat..."
          />

          {shouldShowDropdown && (
            <div
              className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-ink/15 bg-modal shadow-2xl shadow-black/30"
            >
              <button
                type="button"
                onClick={goToResults}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-ink transition-colors hover:bg-surface"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <Search className="h-4 w-4 shrink-0 text-primary" />
                  <span className="truncate font-semibold">{searchTerm}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-ink-muted" />
              </button>

                <div className="border-t border-ink/5 px-4 py-3">
                  {isSearching || isCatalogLoading ? (
                    <div className="space-y-2">
                      <LoadingSkeleton count={3} className="h-8" />
                    </div>
                  ) : dropdownResults.length > 0 ? (
                    <>
                      {symptomResolution.primarySymptom && (
                        <div className="mb-3">
                          <p className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
                            Best symptom match
                          </p>
                          <button
                            type="button"
                            onClick={() => navigate(`/results?symptom=${encodeURIComponent(symptomResolution.primarySymptomId)}`)}
                            className="flex w-full items-center justify-between gap-3 rounded-xl px-2 py-2 text-left text-ink transition-colors hover:bg-surface"
                          >
                            <span className="flex min-w-0 items-center gap-3">
                              <span className="w-6 h-6 rounded-lg bg-surface text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                                {symptomResolution.primarySymptom.label.charAt(0)}
                              </span>
                              <span className="truncate font-semibold">{symptomResolution.primarySymptom.label}</span>
                            </span>
                            <ArrowRight className="h-4 w-4 shrink-0 text-ink-muted" />
                          </button>
                        </div>
                      )}
                      <p className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
                        Recommended remedies
                      </p>
                    <div className="space-y-1">
                      {dropdownResults.slice(0, 5).map((remedy) => (
                        <Link
                          key={remedy.id}
                          to={`/remedy/${remedy.id}`}
                          className="flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface"
                        >
                          <span className="w-6 h-6 rounded-lg bg-surface text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                            {remedy.name.charAt(0)}
                          </span>
                          <span className="truncate">{remedy.name}</span>
                          {evidenceDots(remedy._evidenceScore)}
                        </Link>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={goToResults}
                      className="mt-3 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
                    >
                      See all {dropdownResults.length} results &rarr;
                    </button>
                  </>
                ) : isEmergencyQuery(trimmedQuery) ? (
                  <div className="py-3 text-sm">
                    <p className="font-semibold text-red-600">{EMERGENCY_MESSAGE}</p>
                    <p className="text-red-500 mt-1">{EMERGENCY_ACTION}</p>
                  </div>
                ) : symptomResolution.matchInfo ? (
                  <div className="py-3 text-sm text-ink-muted">
                    <p className="font-semibold text-ink">We couldn't match remedies to your symptom.</p>
                    <p className="mt-1">Try a different search term or browse popular symptoms below.</p>
                  </div>
                ) : (
                  <div className="py-3 text-sm text-ink-muted">
                    <p className="font-semibold text-ink">No remedies found for this symptom.</p>
                    <p className="mt-1">Try a different search term or browse popular symptoms below.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="w-full mb-8">
          <p className="text-sm font-medium text-ink-muted mb-4 text-center">Common Searches</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {symptomCards.map((item) => {
              const color = SYMPTOM_COLOR_CLASSES[item.color] || SYMPTOM_COLOR_CLASSES.sage;
              return (
                <button
                  key={item.id}
                  onClick={() => handleCardClick(item)}
                  className="flex items-center gap-4 p-4 bg-card rounded-2xl shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all text-left"
                >
                  <div className={`w-12 h-12 rounded-full ${color.bg} flex items-center justify-center shrink-0`}>
                    <span className="text-xl">{item.emoji}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-ink">{item.label}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <TrustBadges className="mb-10" />
      </div>
    </PageWrapper>
  );
}
