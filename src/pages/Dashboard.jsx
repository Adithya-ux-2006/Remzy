import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Activity, ArrowRight, Sparkles, AlertTriangle, Bell, Clock, MapPin, Store } from 'lucide-react';
import { PageWrapper } from '../components/layout';
import { RemedyCard } from '../components/ui/RemedyCard';
import { FeaturedPharmacy } from '../components/ui/PharmacyComponents';
import { AccordionSection } from '../components/ui/AccordionSection';
import { useAuthStore } from '../store/authStore';
import { useFavoritesStore } from '../store/favoritesStore';
import { useCatalogStore } from '../store/catalogStore';
import { useRemedyScheduleStore } from '../store/remedyScheduleStore';
import { useGuestProfileStore } from '../store/guestProfileStore';
import { CONDITIONS, FAQ_ITEMS } from '../constants/onboarding';
import { hasOccurrenceOnDate, getUpcomingOccurrences, formatTime } from '../utils/scheduleDates';
import { getApiUrl } from '../utils/api';

export function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const favorites = useFavoritesStore((state) => state.favorites);
  const symptoms = useCatalogStore((state) => state.symptoms);
  const remedies = useCatalogStore((state) => state.remedies);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const guestConditions = useGuestProfileStore((state) => state.common_conditions);
  const schedules = useRemedyScheduleStore((state) => state.schedules);
  const navigate = useNavigate();

  const activeConditions = useMemo(
    () => isAuthenticated ? (user?.common_conditions ?? []) : guestConditions,
    [isAuthenticated, user?.common_conditions, guestConditions]
  );
  const hasOnboarding = user?.has_completed_onboarding ?? false;

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const lifestyleRemedies = useMemo(
    () => remedies.filter(r => r.isFeatured && r.category === 'Lifestyle').slice(0, 3),
    [remedies]
  );

  const recentlySaved = useMemo(() => favorites.slice(0, 3), [favorites]);

  const selectedConditionChips = useMemo(
    () => CONDITIONS.filter((condition) => activeConditions.includes(condition.value)),
    [activeConditions]
  );

  const today = useMemo(() => new Date(), []);

  const todayCount = useMemo(
    () => schedules.filter((s) => s.active && hasOccurrenceOnDate(s, today)).length,
    [schedules, today]
  );

  const nextReminder = useMemo(() => {
    const active = schedules.filter((s) => s.active);
    const upcoming = getUpcomingOccurrences(active, today, 1);
    return upcoming[0] || null;
  }, [schedules, today]);

  return (
    <PageWrapper className="min-h-screen pb-24 md:pb-16 pt-6 md:pt-10">
      <div className="max-w-5xl mx-auto px-6 space-y-10">
        <header>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-ink-muted">{greeting}</span>
          </div>
          <h1 className="text-3xl md:text-display font-bold text-ink mb-2">
            {user?.name?.split(' ')[0] || 'there'}
          </h1>
          <p className="text-ink-muted">Ready to feel better today?</p>
        </header>

        {/* Onboarding Incomplete Banner */}
        {isAuthenticated && !hasOnboarding && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-amber-900">Complete your health profile</p>
              <p className="text-sm text-amber-700 mt-0.5">Tell us about your allergies and conditions for safer, personalized remedy recommendations.</p>
            </div>
            <Link
              to="/onboarding"
              className="shrink-0 px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-semibold hover:bg-amber-700 transition-colors"
            >
              Complete
            </Link>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <StatCard icon={Heart} value={favorites.length} label="Saved" />
          <StatCard icon={Activity} value={user?.search_count ?? 0} label="Searches" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ReminderWidget todayCount={todayCount} nextReminder={nextReminder} />
          <PharmacyWidget />
        </div>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0">Quick Search</h2>
            <Link to="/search" className="text-sm font-medium text-primary hover:text-primary-dark flex items-center gap-1 py-3 transition-colors">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {selectedConditionChips.length > 0 && (
            <div className="mb-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">Your Conditions</p>
              <div className="flex flex-wrap gap-2">
                {selectedConditionChips.map((condition) => (
                  <button
                    key={condition.value}
                    type="button"
                    onClick={() => navigate('/search')}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white shadow-soft transition-transform hover:scale-105"
                  >
                    <span>{condition.emoji}</span>
                    <span>{condition.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar -mx-6 px-6 snap-x">
            {symptoms.slice(0, 8).map((symptom) => (
              <button
                key={symptom.id}
                type="button"
                onClick={() => navigate(`/results?symptom=${symptom.id}`)}
                className="snap-start shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card shadow-soft hover:shadow-card transition-shadow text-sm font-medium text-ink border border-ink/5"
              >
                <span>{symptom.emoji}</span>
                <span>{symptom.label}</span>
              </button>
            ))}
          </div>
        </section>

        {lifestyleRemedies.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title mb-0">Lifestyle Remedies</h2>
              <Link to="/search" className="text-sm font-medium text-primary hover:text-primary-dark flex items-center gap-1 py-3 transition-colors">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {lifestyleRemedies.map((remedy) => (
                <RemedyCard key={remedy.id} remedy={remedy} featured />
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0">Recently Saved</h2>
            {favorites.length > 0 && (
              <Link to="/favorites" className="text-sm font-medium text-primary hover:text-primary-dark flex items-center gap-1 py-3 transition-colors">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
          {recentlySaved.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recentlySaved.map((remedy) => (
                <RemedyCard key={remedy.id} remedy={remedy} featured />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-12 bg-card rounded-2xl border border-ink/5 shadow-soft">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
                <Heart className="w-7 h-7 text-emerald-500" />
              </div>
              <h3 className="text-lg font-semibold text-ink mb-2">No Saved Remedies Yet</h3>
              <p className="text-ink-muted max-w-sm mb-6 leading-relaxed text-sm">
                Save remedies by tapping the heart icon while browsing.
              </p>
              <Link
                to="/search"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary-dark transition-colors shadow-glow"
              >
                Browse Remedies <span className="text-lg leading-none">&rarr;</span>
              </Link>
            </div>
          )}
        </section>

        <section>
          <AccordionSection
            title="Frequently Asked Questions"
            subtitle="Everything you need to know about Remzy."
            items={FAQ_ITEMS}
          />
        </section>
      </div>
    </PageWrapper>
  );
}

function StatCard({ icon: Icon, value, label }) {
  return (
    <div className="bg-card p-4 rounded-2xl shadow-card flex flex-col items-center justify-center text-center">
      <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center mb-2 text-primary">
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-2xl font-bold text-ink">{value}</span>
      <span className="text-xs font-medium text-ink-muted uppercase tracking-wider">{label}</span>
    </div>
  );
}

function ReminderWidget({ todayCount, nextReminder }) {
  return (
    <div className="bg-card rounded-2xl shadow-soft border border-ink/5 p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
            <Bell className="w-4.5 h-4.5 text-violet-500" />
          </div>
          <h3 className="font-bold text-ink">Reminders</h3>
        </div>
        <Link to="/reminders" className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors">
          View all
        </Link>
      </div>
      {todayCount > 0 ? (
        <div>
          <p className="text-sm text-ink-muted mb-1">
            <span className="font-semibold text-ink">{todayCount}</span> reminder{todayCount !== 1 ? 's' : ''} today
          </p>
          {nextReminder && (
            <div className="flex items-center gap-2 text-sm text-ink-muted">
              <Clock className="w-3.5 h-3.5" />
              <span>
                Next: <span className="font-medium text-ink">{nextReminder.schedule.remedy_name}</span> at{' '}
                {formatTime(nextReminder.schedule.scheduled_time)}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div>
          <p className="text-sm text-ink-muted">No reminders scheduled</p>
          <Link to="/reminders" className="text-sm text-primary font-medium hover:underline mt-1 inline-block">
            Set one up &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}

function PharmacyWidget() {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationDenied, setLocationDenied] = useState(() => !navigator.geolocation);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchShop = useCallback(async (lat, lon) => {
    if (!mountedRef.current) return;
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/nearby-shops'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lon, radius: 5000, limit: 1 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch');
      if (mountedRef.current) setShop(data.shops?.[0] || null);
    } catch {
      if (mountedRef.current) setShop(null);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  const requestLocation = useCallback(() => {
    setLocationDenied(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchShop(pos.coords.latitude, pos.coords.longitude),
      () => setLocationDenied(true),
      { timeout: 10000, maximumAge: 300000 }
    );
  }, [fetchShop]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchShop(pos.coords.latitude, pos.coords.longitude),
      () => setLocationDenied(true),
      { timeout: 10000, maximumAge: 300000 }
    );
  }, [fetchShop]);

  if (locationDenied) {
    return (
      <div className="bg-card rounded-2xl shadow-soft border border-ink/5 p-5 flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <MapPin className="w-4.5 h-4.5 text-emerald-500" />
          </div>
          <h3 className="font-bold text-ink">Nearby Pharmacy</h3>
        </div>
        <div className="text-center py-4">
          <MapPin className="w-6 h-6 text-ink-muted mx-auto mb-2" />
          <p className="text-sm text-ink-muted mb-2">Enable location to find pharmacies near you</p>
          <button
            type="button"
            onClick={requestLocation}
            className="text-sm text-primary font-medium hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl shadow-soft border border-ink/5 p-5 flex flex-col justify-between">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <MapPin className="w-4.5 h-4.5 text-emerald-500" />
        </div>
        <h3 className="font-bold text-ink">Nearby Pharmacy</h3>
      </div>
      {loading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-4 bg-surface rounded w-3/4" />
          <div className="h-3 bg-surface rounded w-1/2" />
        </div>
      ) : shop ? (
        <FeaturedPharmacy shop={shop} />
      ) : (
        <div className="text-center py-4">
          <Store className="w-6 h-6 text-ink-muted mx-auto mb-2" />
          <p className="text-sm text-ink-muted">No pharmacies found nearby</p>
        </div>
      )}
    </div>
  );
}
