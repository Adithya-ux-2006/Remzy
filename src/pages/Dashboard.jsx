import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Activity, ArrowRight, Sparkles, AlertTriangle, Bell, Clock, MapPin, Building2, Navigation } from 'lucide-react';
import { PageWrapper } from '../components/layout';
import { RemedyCard } from '../components/ui/RemedyCard';
import { AccordionSection } from '../components/ui/AccordionSection';
import { useAuthStore } from '../store/authStore';
import { useFavoritesStore } from '../store/favoritesStore';
import { useCatalogStore } from '../store/catalogStore';
import { useRemedyScheduleStore } from '../store/remedyScheduleStore';
import { useGuestProfileStore } from '../store/guestProfileStore';
import { CONDITIONS, FAQ_ITEMS } from '../constants/onboarding';
import { hasOccurrenceOnDate, formatTime } from '../utils/scheduleDates';
import { searchNearbyCentres } from '../services/overpassService';

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

  const todayReminders = useMemo(
    () => schedules.filter((s) => s.active && hasOccurrenceOnDate(s, today)).sort((a, b) => (a.scheduled_time || '').localeCompare(b.scheduled_time || '')),
    [schedules, today]
  );

  return (
    <PageWrapper className="min-h-screen md:pb-16 pt-6 md:pt-10">
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
          <ReminderWidget reminders={todayReminders} />
          <MedicalCentreWidget />
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
            twoColumn
            leftItems={[FAQ_ITEMS[0], FAQ_ITEMS[2], FAQ_ITEMS[3], FAQ_ITEMS[7], FAQ_ITEMS[8]]}
            rightItems={[FAQ_ITEMS[1], FAQ_ITEMS[4], FAQ_ITEMS[5], FAQ_ITEMS[6], FAQ_ITEMS[9]]}
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

const REMINDER_CAP = 3;

function ReminderWidget({ reminders }) {
  const count = reminders.length;
  const visible = reminders.slice(0, REMINDER_CAP);
  const overflow = count - REMINDER_CAP;

  return (
    <div className="bg-card rounded-2xl shadow-soft border border-ink/5 p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
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

      {count === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mb-3">
            <Bell className="w-5 h-5 text-violet-400" />
          </div>
          <p className="text-sm text-ink-muted mb-1">No reminders today</p>
          <Link to="/reminders" className="text-sm text-primary font-medium hover:underline">
            Set one up &rarr;
          </Link>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-2">
          <p className="text-xs font-medium text-ink-muted mb-1">
            {count} today
          </p>
          <ul className="space-y-2 flex-1">
            {visible.map((reminder) => (
              <li
                key={reminder.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-surface"
              >
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-violet-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink text-sm truncate">{reminder.remedy_name}</p>
                  <p className="text-xs text-ink-muted">{formatTime(reminder.scheduled_time)}</p>
                </div>
              </li>
            ))}
          </ul>
          {overflow > 0 && (
            <Link to="/reminders" className="text-xs text-primary font-medium hover:underline text-center pt-1">
              +{overflow} more
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function formatDistanceKm(km) {
  if (km == null) return null;
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

function MedicalCentreWidget() {
  const [centre, setCentre] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationDenied, setLocationDenied] = useState(() => !navigator.geolocation);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchCentre = useCallback(async (lat, lon) => {
    if (!mountedRef.current) return;
    setLoading(true);
    try {
      const results = await searchNearbyCentres(lat, lon, 5);
      if (mountedRef.current) setCentre(results?.[0] || null);
    } catch {
      if (mountedRef.current) setCentre(null);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  const requestLocation = useCallback(() => {
    setLocationDenied(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchCentre(pos.coords.latitude, pos.coords.longitude),
      () => setLocationDenied(true),
      { timeout: 10000, maximumAge: 300000 }
    );
  }, [fetchCentre]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchCentre(pos.coords.latitude, pos.coords.longitude),
      () => setLocationDenied(true),
      { timeout: 10000, maximumAge: 300000 }
    );
  }, [fetchCentre]);

  if (locationDenied) {
    return (
      <div className="bg-card rounded-2xl shadow-soft border border-ink/5 p-5 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Building2 className="w-4.5 h-4.5 text-emerald-500" />
          </div>
          <h3 className="font-bold text-ink">Medical Centre</h3>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
          <MapPin className="w-8 h-8 text-ink-muted mx-auto mb-3" />
          <p className="text-sm text-ink-muted mb-2">Enable location to find medical centres near you</p>
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
    <div className="bg-card rounded-2xl shadow-soft border border-ink/5 p-5 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <Building2 className="w-4.5 h-4.5 text-emerald-500" />
        </div>
        <h3 className="font-bold text-ink">Medical Centre</h3>
      </div>

      {loading ? (
        <div className="flex-1 space-y-3 animate-pulse">
          <div className="h-3 bg-surface rounded w-1/3" />
          <div className="h-4 bg-surface rounded w-3/4" />
          <div className="h-3 bg-surface rounded w-1/2" />
        </div>
      ) : centre ? (
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-success/10 text-success">
              <MapPin className="w-3 h-3" />
              Closest to You
            </span>
          </div>

          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-ink truncate">{centre.name}</p>
              {centre.address && (
                <p className="text-sm text-ink-muted truncate">{centre.address}</p>
              )}
              <div className="flex items-center gap-3 mt-1.5">
                <span className="flex items-center gap-1 text-xs text-ink-muted">
                  <Navigation className="w-3 h-3" />
                  {formatDistanceKm(centre.distance)}
                </span>
                {centre.type && (
                  <span className="text-xs font-medium text-primary">{centre.type}</span>
                )}
              </div>
            </div>
          </div>

          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${centre.lat},${centre.lon}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto flex items-center justify-center w-full h-11 rounded-xl bg-primary text-white text-sm font-semibold shadow-glow transition-all duration-200 hover:bg-primary-dark hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] active:shadow-md"
          >
            Get Directions
          </a>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
          <Building2 className="w-8 h-8 text-ink-muted mx-auto mb-3" />
          <p className="text-sm text-ink-muted">No medical centres found nearby</p>
        </div>
      )}
    </div>
  );
}
