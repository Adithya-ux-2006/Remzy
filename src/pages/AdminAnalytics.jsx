import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Heart, Search, ThumbsDown, ThumbsUp } from 'lucide-react';
import { PageWrapper } from '../components/layout';
import { useCatalogStore } from '../store/catalogStore';
import { fetchAnalyticsSummary } from '../utils/analytics';

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

  useEffect(() => {
    let isMounted = true;

    fetchAnalyticsSummary()
      .then((data) => {
        if (!isMounted) return;
        setSummary(data);
        setIsLoading(false);
      })
      .catch((error) => {
        if (!isMounted) return;
        setErrorMessage(error.message || 'Unable to load analytics right now.');
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
      </div>
    </PageWrapper>
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
