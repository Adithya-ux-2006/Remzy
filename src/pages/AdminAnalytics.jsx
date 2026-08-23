import { useEffect, useMemo, useState } from 'react';
import { BarChart3, BookOpenCheck, ExternalLink, Heart, Search, ShieldAlert, ThumbsDown, ThumbsUp, FlaskConical } from 'lucide-react';
import { PageWrapper } from '../components/layout';
import { useCatalogStore } from '../store/catalogStore';
import { fetchAnalyticsSummary } from '../utils/analytics';
import { fetchEvidenceAdminSummary, fetchHealthApiCoverage } from '../utils/evidenceAdmin';

function aggregateCounts(items, getKeys) {
  return items.reduce((accumulator, item) => {
    getKeys(item).forEach((key) => {
      if (!key) return;
      accumulator[key] = (accumulator[key] || 0) + 1;
    });
    return accumulator;
  }, {});
}

function toRankedEntries(countMap, labels) {
  return Object.entries(countMap)
    .map(([key, count]) => ({ key, label: labels[key] || key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

export function AdminAnalytics() {
  const symptoms = useCatalogStore((state) => state.symptoms);
  const remedies = useCatalogStore((state) => state.remedies);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [evidenceSummary, setEvidenceSummary] = useState({ undercoveredSymptoms: [], reviewQueue: [] });
  const [evidenceError, setEvidenceError] = useState('');
  const [healthCoverage, setHealthCoverage] = useState([]);
  const [healthCoverageError, setHealthCoverageError] = useState('');

  useEffect(() => {
    let isMounted = true;

    Promise.allSettled([fetchAnalyticsSummary(), fetchEvidenceAdminSummary(), fetchHealthApiCoverage()])
      .then(([analyticsResult, evidenceResult, healthResult]) => {
        if (!isMounted) return;
        if (analyticsResult.status === 'fulfilled') setSummary(analyticsResult.value);
        else setErrorMessage(analyticsResult.reason?.message || 'Unable to load analytics right now.');
        if (evidenceResult.status === 'fulfilled') setEvidenceSummary(evidenceResult.value);
        else setEvidenceError(evidenceResult.reason?.message || 'Unable to load the evidence review queue.');
        if (healthResult.status === 'fulfilled') setHealthCoverage(healthResult.value);
        else setHealthCoverageError(healthResult.reason?.message || '');
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const symptomLabels = useMemo(
    () => Object.fromEntries(symptoms.map((symptom) => [symptom.id, symptom.label])),
    [symptoms]
  );

  const remedyLabels = useMemo(
    () => Object.fromEntries(remedies.map((remedy) => [remedy.id, remedy.name])),
    [remedies]
  );

  const mostSearchedSymptoms = useMemo(() => {
    if (!summary) return [];
    return toRankedEntries(aggregateCounts(summary.searches, (item) => item.symptom_ids || []), symptomLabels);
  }, [summary, symptomLabels]);

  const mostViewedRemedies = useMemo(() => {
    if (!summary) return [];
    return toRankedEntries(
      aggregateCounts(summary.remedyEvents.filter((event) => event.event_type === 'viewed'), (item) => [item.remedy_id]),
      remedyLabels
    );
  }, [summary, remedyLabels]);

  const mostSavedRemedies = useMemo(() => {
    if (!summary) return [];
    return toRankedEntries(
      aggregateCounts(summary.remedyEvents.filter((event) => event.event_type === 'saved'), (item) => [item.remedy_id]),
      remedyLabels
    );
  }, [summary, remedyLabels]);

  const helpfulCount = useMemo(() => {
    if (!summary?.feedback) return 0;
    return summary.feedback.filter((item) => item.vote === 'helpful').length;
  }, [summary]);

  const notHelpfulCount = useMemo(() => {
    if (!summary?.feedback) return 0;
    return summary.feedback.filter((item) => item.vote === 'not_helpful').length;
  }, [summary]);

  return (
    <PageWrapper className="min-h-screen md:pb-8 pt-6">
      <div className="mx-auto max-w-5xl px-6 space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1 text-sm font-semibold text-primary shadow-sm">
            <BarChart3 className="h-4 w-4" />
            Validation Dashboard
          </div>
          <h1 className="mt-4 text-3xl font-extrabold text-ink">What testers are doing</h1>
          <p className="mt-2 text-ink-muted">A lightweight view of search behavior, remedy engagement, and usefulness feedback.</p>
        </div>

        {isLoading ? <p className="text-ink-muted">Loading analytics...</p> : null}
        {errorMessage ? <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{errorMessage}</p> : null}

        {!isLoading && !errorMessage ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard icon={Search} label="Searches" value={summary?.searches?.length || 0} />
              <StatCard icon={Heart} label="Remedy Saves" value={mostSavedRemedies.reduce((sum, item) => sum + item.count, 0)} />
              <StatCard icon={ThumbsUp} label="Helpful Votes" value={helpfulCount} />
              <StatCard icon={ThumbsDown} label="Not Helpful" value={notHelpfulCount} />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <RankedList title="Most Searched Symptoms" items={mostSearchedSymptoms} emptyLabel="No search data yet." />
              <RankedList title="Most Viewed Remedies" items={mostViewedRemedies} emptyLabel="No remedy views yet." />
              <RankedList title="Most Saved Remedies" items={mostSavedRemedies} emptyLabel="No remedy saves yet." />
            </div>
          </>
        ) : null}

        {!isLoading ? (
          <EvidenceReviewSection summary={evidenceSummary} errorMessage={evidenceError} />
        ) : null}

        {!isLoading ? (
          <HealthApiCoverageSection coverage={healthCoverage} errorMessage={healthCoverageError} />
        ) : null}
      </div>
    </PageWrapper>
  );
}

function EvidenceReviewSection({ summary, errorMessage }) {
  const undercovered = summary?.undercoveredSymptoms || [];
  const queue = summary?.reviewQueue || [];

  return (
    <section className="space-y-5" aria-labelledby="evidence-review-heading">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-sm font-semibold text-amber-700 dark:text-amber-300">
          <ShieldAlert className="h-4 w-4" />
          Clinical review required
        </div>
        <h2 id="evidence-review-heading" className="mt-3 text-2xl font-extrabold text-ink">Evidence discovery queue</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Crossref and OpenAlex candidates for symptoms with fewer than five remedies. These records are hidden from public evidence until reviewed and approved.
        </p>
      </div>

      {errorMessage ? <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">{errorMessage}</p> : null}

      {!errorMessage ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard icon={ShieldAlert} label="Under-covered symptoms" value={undercovered.length} />
            <StatCard icon={BookOpenCheck} label="Candidates awaiting review" value={queue.length} />
            <StatCard icon={Search} label="Symptoms with candidates" value={new Set(queue.map((item) => item.symptom_id)).size} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h3 className="text-lg font-bold text-ink">Coverage below five remedies</h3>
              <div className="mt-4 max-h-[30rem] space-y-2 overflow-y-auto pr-1">
                {undercovered.map((item) => (
                  <div key={item.symptom_id} className="flex items-center justify-between gap-4 rounded-xl bg-bg px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-ink">{item.symptom_label}</p>
                      <p className="text-xs text-ink-muted">{item.candidate_count} queued candidates</p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">{item.remedy_count}/5</span>
                  </div>
                ))}
                {undercovered.length === 0 ? <p className="text-sm text-ink-muted">Every symptom has at least five mapped remedies.</p> : null}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h3 className="text-lg font-bold text-ink">Research candidates</h3>
              <div className="mt-4 max-h-[30rem] space-y-3 overflow-y-auto pr-1">
                {queue.map((item) => (
                  <article key={`${item.claim_id}-${item.publication_id}`} className="rounded-xl border border-border bg-bg p-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">{item.symptom_label}</span>
                      <span className="rounded-full bg-amber-500/10 px-2 py-1 text-amber-700 dark:text-amber-300">Needs review</span>
                      <span className="text-ink-muted">{item.source_database}</span>
                    </div>
                    <p className="mt-2 text-sm font-bold text-ink">{item.remedy_name}</p>
                    <p className="mt-1 text-sm text-ink-muted">{item.title}</p>
                    <div className="mt-3 flex items-center justify-between gap-3 text-xs text-ink-muted">
                      <span>{[item.journal, item.publication_year].filter(Boolean).join(' · ') || 'Metadata only'}</span>
                      <a className="inline-flex items-center gap-1 font-semibold text-primary hover:underline" href={item.canonical_url} target="_blank" rel="noreferrer">
                        Inspect source <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </article>
                ))}
                {queue.length === 0 ? <p className="text-sm text-ink-muted">No candidates are waiting for review.</p> : null}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-medium text-ink-muted">
        <Icon className="h-4 w-4 text-primary" />
        {label}
      </div>
      <p className="mt-3 text-3xl font-extrabold text-ink">{value}</p>
    </div>
  );
}

function RankedList({ title, items, emptyLabel }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      <div className="mt-4 space-y-3">
        {items.length > 0 ? items.map((item, index) => (
          <div key={item.key} className="flex items-center justify-between gap-4 rounded-xl bg-bg px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {index + 1}
              </span>
              <span className="text-sm font-medium text-ink">{item.label}</span>
            </div>
            <span className="text-sm font-semibold text-primary">{item.count}</span>
          </div>
        )) : <p className="text-sm text-ink-muted">{emptyLabel}</p>}
      </div>
    </div>
  );
}

function HealthApiCoverageSection({ coverage, errorMessage }) {
  const items = coverage || [];

  return (
    <section className="space-y-5" aria-labelledby="health-api-heading">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-evidence/10 px-3 py-1 text-sm font-semibold text-evidence">
          <FlaskConical className="h-4 w-4" />
          Health API Coverage
        </div>
        <h2 id="health-api-heading" className="mt-3 text-2xl font-extrabold text-ink">External data discovery status</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Clinical trial and FDA data availability for symptoms with fewer than five mapped remedies.
        </p>
      </div>

      {errorMessage ? (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">{errorMessage}</p>
      ) : null}

      {!errorMessage ? (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-lg font-bold text-ink">Coverage gaps with external data</h3>
          <div className="mt-4 max-h-[30rem] space-y-2 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.symptom_id} className="flex items-center justify-between gap-4 rounded-xl bg-bg px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink">{item.symptom_label}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-ink-muted">
                    <span>{item.clinical_trial_count} clinical trials</span>
                    <span>{item.fda_record_count} FDA records</span>
                    {item.pending_discovery_claims > 0 && (
                      <span className="text-warning">{item.pending_discovery_claims} pending review</span>
                    )}
                  </div>
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary shrink-0">
                  {item.remedy_count}/5
                </span>
              </div>
            ))}
            {items.length === 0 && (
              <p className="text-sm text-ink-muted">No undercovered symptoms found. Every symptom has at least five mapped remedies.</p>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
