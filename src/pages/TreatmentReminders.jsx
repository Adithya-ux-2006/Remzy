import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus, Check, ChevronLeft, ChevronRight, ChevronRight as Chevron,
  Sparkles, Sprout, CalendarClock, Bell, ArrowRight, ToggleLeft, ToggleRight, Trash2,
} from 'lucide-react';
import { cn } from '../utils/cn';
import { PageWrapper } from '../components/layout';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { CategoryBadge } from '../components/ui/CategoryBadge';
import { CATEGORY_ICONS } from '../constants/categoryIcons';
import { RemedyScheduleForm } from '../components/forms';
import { useRemedyScheduleStore } from '../store/remedyScheduleStore';
import { useCatalogStore } from '../store/catalogStore';
import { useFavoritesStore } from '../store/favoritesStore';
import {
  WEEKDAY_LABELS, formatTime, formatDayShort, formatMonthYear,
  isSameDay, startOfDay, addDays, toDateKey, hasOccurrenceOnDate,
  getNextOccurrence, getUpcomingOccurrences, getOccurrencesInRange,
  getMonthGrid, getRecurrenceLabel,
} from '../utils/scheduleDates';

const HEALTH_TIPS = [
  'Consistency beats intensity. Taking your remedies at the same time each day builds the habit that makes treatment work.',
  'Pair your reminder with an existing habit — like brushing your teeth — so you never forget a dose.',
  'Missed a dose? Do not double up. Just pick back up with your next scheduled reminder.',
  'Keep remedies somewhere visible and easy to reach, but away from direct sunlight and moisture.',
  'Track your progress. Marking reminders complete gives you a clear picture of your consistency.',
];

const STAT_COLORS = {
  emerald: 'bg-emerald-500/10 text-emerald-500',
  violet: 'bg-violet-500/10 text-violet-500',
  orange: 'bg-orange-500/10 text-orange-500',
};

function byTime(a, b) {
  return (a.scheduled_time || '').localeCompare(b.scheduled_time || '');
}

function StatCard({ icon: Icon, value, label, sub, color }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="bg-card rounded-[20px] border border-border/60 shadow-soft p-4 md:p-5 flex items-center gap-3 md:gap-4"
    >
      <div className={cn('w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0', STAT_COLORS[color])}>
        <Icon className="w-5 h-5 md:w-6 md:h-6" />
      </div>
      <div className="min-w-0">
        <p className="text-xl md:text-2xl font-bold text-ink leading-none mb-1">{value}</p>
        <p className="text-xs md:text-sm text-ink-muted truncate">{label}</p>
        {sub ? (
          <p className="text-[11px] md:text-xs text-ink-muted/80 truncate">{sub}</p>
        ) : null}
      </div>
    </motion.div>
  );
}

function ReminderIcon({ category }) {
  const config = CATEGORY_ICONS[category] || CATEGORY_ICONS.Natural;
  const { Icon, bg, color } = config;
  return (
    <div className={cn('w-11 h-11 rounded-full flex items-center justify-center shrink-0', bg)} aria-hidden="true">
      <Icon className={cn('w-5 h-5', color)} />
    </div>
  );
}

function CalendarIllustration() {
  return (
    <svg
      viewBox="0 0 240 240"
      className="w-[220px] h-[220px] md:w-[260px] md:h-[260px] shrink-0"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="reminderGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#34D399" stopOpacity="0.35" />
          <stop offset="60%" stopColor="#34D399" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#34D399" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="120" cy="120" r="110" fill="url(#reminderGlow)" />

      {/* Calendar body */}
      <rect x="72" y="78" width="96" height="84" rx="14" fill="#34D399" fillOpacity="0.12" stroke="#34D399" strokeWidth="1.5" />
      {/* Top band */}
      <path d="M72 96a12 12 0 0 1 12-12h72a12 12 0 0 1 12 12v6H72v-6z" fill="#34D399" fillOpacity="0.25" />
      {/* Binding rings */}
      <circle cx="100" cy="106" r="5" stroke="#34D399" strokeWidth="1.5" />
      <circle cx="118" cy="106" r="5" stroke="#34D399" strokeWidth="1.5" />
      <circle cx="136" cy="106" r="5" stroke="#34D399" strokeWidth="1.5" />
      {/* Page lines */}
      <rect x="86" y="122" width="30" height="4" rx="2" fill="#34D399" fillOpacity="0.35" />
      <rect x="86" y="132" width="22" height="4" rx="2" fill="#34D399" fillOpacity="0.25" />
      <rect x="128" y="122" width="30" height="4" rx="2" fill="#34D399" fillOpacity="0.35" />
      <rect x="128" y="132" width="22" height="4" rx="2" fill="#34D399" fillOpacity="0.25" />
      {/* Highlighted day */}
      <rect x="128" y="140" width="30" height="10" rx="5" fill="#34D399" fillOpacity="0.3" />

      {/* Plant leaves, right side */}
      <path d="M176 150c-2 14-12 24-20 26 4-12 6-20 20-26z" fill="#34D399" fillOpacity="0.3" />
      <path d="M176 150c-4 10-4 18-2 22" stroke="#34D399" strokeWidth="1" strokeLinecap="round" fill="none" />
      <path d="M182 158c4 10 2 18-2 20 0-8-2-14 2-20z" fill="#34D399" fillOpacity="0.2" />

      {/* Small leaf, left side */}
      <path d="M64 140c-6 8-4 16 0 18 2-4 2-12 0-18z" fill="#34D399" fillOpacity="0.25" />
    </svg>
  );
}

export function TreatmentReminders() {
  const schedules = useRemedyScheduleStore((s) => s.schedules);
  const completions = useRemedyScheduleStore((s) => s.completions);
  const isLoading = useRemedyScheduleStore((s) => s.isLoading);
  const markComplete = useRemedyScheduleStore((s) => s.markComplete);
  const toggleActive = useRemedyScheduleStore((s) => s.toggleActive);
  const remove = useRemedyScheduleStore((s) => s.remove);
  const add = useRemedyScheduleStore((s) => s.add);
  const remedies = useCatalogStore((s) => s.remedies);
  const favorites = useFavoritesStore((s) => s.favorites);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calMonth, setCalMonth] = useState(() => new Date());
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTipIndex((i) => (i + 1) % HEALTH_TIPS.length), 8000);
    return () => clearInterval(id);
  }, []);

  const today = new Date();
  const remediesById = new Map(remedies.map((r) => [r.id, r]));

  const activeSchedules = schedules.filter((s) => s.active);
  const todaySchedules = activeSchedules
    .filter((s) => hasOccurrenceOnDate(s, today))
    .sort(byTime);

  const completedTodayIds = new Set(
    completions
      .filter((c) => isSameDay(new Date(c.completed_at), today))
      .map((c) => c.schedule_id)
  );

  const upcoming = getUpcomingOccurrences(activeSchedules, today, 10);
  const upcomingCount = activeSchedules.filter((s) => getNextOccurrence(s, today)).length;
  const nextOccurrence = upcoming[0]?.date;

  const weekStart = addDays(startOfDay(today), -(((today.getDay() + 6) % 7)));
  const weekEnd = addDays(weekStart, 6);
  const weekOccurrences = getOccurrencesInRange(activeSchedules, weekStart, weekEnd);

  const calStart = new Date(calMonth.getFullYear(), calMonth.getMonth(), 1);
  const calEnd = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 0);
  const monthOccurrences = getOccurrencesInRange(activeSchedules, calStart, calEnd);
  const calGrid = getMonthGrid(calMonth.getFullYear(), calMonth.getMonth());

  const handleAdd = async (data) => {
    setFormError(null);
    setIsSubmitting(true);
    const result = await add(data);
    setIsSubmitting(false);
    if (result.success) {
      setIsModalOpen(false);
      setFormError(null);
    } else {
      setFormError(result.error?.message || 'Could not add reminder — please try again.');
    }
  };

  const handleToggleComplete = (scheduleId) => {
    markComplete(scheduleId);
  };

  const handleRemove = (scheduleId) => {
    if (window.confirm('Remove this reminder?')) {
      remove(scheduleId);
    }
  };

  return (
    <PageWrapper className="min-h-screen md:pb-12">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/8 via-emerald-500/5 to-transparent pointer-events-none" />
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/4 blur-3xl pointer-events-none" />

        <div className="max-w-[1280px] mx-auto px-5 md:px-8 pt-8 md:pt-12 pb-6 md:pb-10">
          <div className="flex items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-500 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-4">
                <CalendarClock className="w-3.5 h-3.5" />
                <span>
                  {activeSchedules.length} Active Reminder{activeSchedules.length !== 1 && 's'}
                </span>
              </div>

              <h1 className="text-[44px] md:text-[52px] font-bold text-ink tracking-tight leading-[1.05] mb-3">
                Treatment Reminders
              </h1>

              <p className="text-base md:text-lg text-ink-muted leading-relaxed max-w-lg">
                Never miss a remedy again. Stay consistent with your treatment plan.
              </p>

              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary-dark transition-colors shadow-glow"
              >
                <Plus className="w-4 h-4" /> New Reminder
              </button>
            </div>

            <div className="hidden md:block">
              <CalendarIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* Stat Cards */}
      <section className="max-w-[1280px] mx-auto px-5 md:px-8 mb-8 md:mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          <StatCard
            icon={CalendarClock}
            value={todaySchedules.length}
            label="Today's Reminders"
            sub={todaySchedules.length ? `${todaySchedules.length} scheduled for today` : 'Nothing scheduled'}
            color="emerald"
          />
          <StatCard
            icon={Bell}
            value={upcomingCount}
            label="Upcoming"
            sub={nextOccurrence ? `Next: ${formatDayShort(nextOccurrence)}, ${formatTime(upcoming[0]?.schedule?.scheduled_time)}` : ''}
            color="violet"
          />
          <StatCard
            icon={Check}
            value={completedTodayIds.size}
            label="Completed Today"
            sub={completedTodayIds.size ? 'Nice work!' : 'Not started yet'}
            color="orange"
          />
        </div>
      </section>

      {/* Two-column layout */}
      <section className="max-w-[1280px] mx-auto px-5 md:px-8 grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule */}
          <section className="bg-card rounded-[20px] border border-border/60 shadow-soft p-5 md:p-6">
            <header className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-ink">Today&apos;s Schedule</h2>
              <span className="text-xs text-ink-muted">
                {today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </header>

            {isLoading && todaySchedules.length === 0 ? (
              <p className="text-sm text-ink-muted py-6 text-center">Loading your reminders…</p>
            ) : todaySchedules.length > 0 ? (
              <ul className="space-y-3">
                {todaySchedules.map((schedule) => {
                  const done = completedTodayIds.has(schedule.id);
                  return (
                    <li
                      key={schedule.id}
                      className="flex items-center gap-3 p-3 rounded-2xl border border-border/60 bg-surface"
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleComplete(schedule.id)}
                        aria-label={done ? `Mark ${schedule.remedy_name} as not complete` : `Mark ${schedule.remedy_name} as complete`}
                        aria-pressed={done}
                        className={cn(
                          'w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors border',
                          done
                            ? 'bg-primary border-primary text-white'
                            : 'border-ink-muted/30 text-transparent hover:border-primary hover:text-primary/30'
                        )}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <ReminderIcon category={remediesById.get(schedule.remedy_id)?.category} />
                      <div className="min-w-0 flex-1">
                        <p className={cn('font-semibold text-ink text-sm truncate', done && 'line-through text-ink-muted')}>
                          {schedule.remedy_name}
                        </p>
                        <p className="text-xs text-ink-muted">
                          {formatTime(schedule.scheduled_time)} · {getRecurrenceLabel(schedule)}
                        </p>
                      </div>
                      {remediesById.get(schedule.remedy_id)?.category && (
                        <CategoryBadge category={remediesById.get(schedule.remedy_id).category} className="hidden sm:inline-flex" />
                      )}
                      <Link
                        to={`/remedy/${schedule.remedy_id}`}
                        className="p-1 text-ink-muted hover:text-ink rounded-full shrink-0"
                        aria-label={`View ${schedule.remedy_name} details`}
                      >
                        <Chevron className="w-4 h-4" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState
                icon={Sprout}
                title="Nothing scheduled today"
                description="Enjoy your day! Your reminders will show up here on the days they're due."
              />
            )}
          </section>

          {/* Upcoming Reminders */}
          <section className="bg-card rounded-[20px] border border-border/60 shadow-soft p-5 md:p-6">
            <header className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-ink">Upcoming Reminders</h2>
              <a href="#all-reminders" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">
                View All
              </a>
            </header>

            {upcoming.length > 0 ? (
              <ul className="divide-y divide-border-subtle">
                {upcoming.map(({ schedule, date }) => {
                  const remedy = remediesById.get(schedule.remedy_id);
                  return (
                    <li key={schedule.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <ReminderIcon category={remedy?.category} />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-ink text-sm truncate">{schedule.remedy_name}</p>
                        <p className="text-xs text-ink-muted">
                          {formatDayShort(date)}, {formatTime(schedule.scheduled_time)} · {getRecurrenceLabel(schedule)}
                        </p>
                      </div>
                      {remedy?.category && (
                        <CategoryBadge category={remedy.category} className="hidden sm:inline-flex" />
                      )}
                      <Link
                        to={`/remedy/${schedule.remedy_id}`}
                        className="p-1 text-ink-muted hover:text-ink rounded-full shrink-0"
                        aria-label={`View ${schedule.remedy_name} details`}
                      >
                        <Chevron className="w-4 h-4" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState
                icon={Bell}
                title="No upcoming reminders"
                description="Add a reminder to see your future schedule here."
              />
            )}
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Weekly Overview */}
          <section className="bg-card rounded-[20px] border border-border/60 shadow-soft p-5">
            <h2 className="text-lg font-bold text-ink mb-4">This Week</h2>
            <div className="grid grid-cols-7 gap-1">
              {WEEKDAY_LABELS.map((label, i) => {
                const day = addDays(weekStart, i);
                const count = (weekOccurrences.get(toDateKey(day)) || []).length;
                const isToday = isSameDay(day, today);
                return (
                  <div key={label} className="flex flex-col items-center gap-1.5 py-1">
                    <span className="text-[11px] font-medium text-ink-muted">{label}</span>
                    <span
                      className={cn(
                        'w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold',
                        isToday ? 'bg-primary text-white' : 'text-ink'
                      )}
                    >
                      {day.getDate()}
                    </span>
                    <span className={cn('w-1.5 h-1.5 rounded-full', count > 0 ? 'bg-primary' : 'bg-ink-muted/20')} />
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-border-subtle text-xs text-ink-muted">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" /> With reminders
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-ink-muted/20" /> No reminders
              </span>
            </div>
          </section>

          {/* Calendar */}
          <section className="bg-card rounded-[20px] border border-border/60 shadow-soft p-5">
            <header className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-ink">Calendar</h2>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCalMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                  className="p-1.5 text-ink-muted hover:text-ink hover:bg-surface rounded-lg transition-colors"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-semibold text-ink w-32 text-center">
                  {formatMonthYear(calMonth)}
                </span>
                <button
                  type="button"
                  onClick={() => setCalMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                  className="p-1.5 text-ink-muted hover:text-ink hover:bg-surface rounded-lg transition-colors"
                  aria-label="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </header>

            <div className="grid grid-cols-7 gap-1 text-center">
              {WEEKDAY_LABELS.map((label) => (
                <span key={label} className="text-[11px] font-medium text-ink-muted py-1">{label}</span>
              ))}
              {calGrid.map((cell, i) => {
                if (!cell) return <span key={`pad-${i}`} />;
                const hasReminders = monthOccurrences.has(toDateKey(cell));
                const isToday = isSameDay(cell, today);
                return (
                  <div
                    key={toDateKey(cell)}
                    className={cn(
                      'flex flex-col items-center justify-center aspect-square rounded-lg text-sm',
                      isToday ? 'text-primary font-bold' : 'text-ink'
                    )}
                  >
                    <span
                      className={cn(
                        'flex items-center justify-center w-7 h-7 rounded-full',
                        isToday && 'bg-primary text-white'
                      )}
                    >
                      {cell.getDate()}
                    </span>
                    <span className={cn('w-1 h-1 rounded-full mt-0.5', hasReminders ? 'bg-primary' : 'bg-transparent')} />
                  </div>
                );
              })}
            </div>
          </section>

          {/* Health Tip */}
          <section className="bg-gradient-to-br from-emerald-500/8 via-emerald-500/5 to-transparent border border-emerald-500/10 rounded-[20px] shadow-soft p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-emerald-500" />
              </div>
              <h3 className="font-bold text-ink">Health Tip</h3>
            </div>
            <p className="text-sm text-ink-muted leading-relaxed mb-4">{HEALTH_TIPS[tipIndex]}</p>
            <Link
              to="/search"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
            >
              Learn More <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </section>
        </div>
      </section>

      {/* All Reminders — full management list (pause/resume, remove) */}
      <section id="all-reminders" className="max-w-[1280px] mx-auto px-5 md:px-8 mb-10">
        <div className="bg-card rounded-[20px] border border-border/60 shadow-soft p-5 md:p-6">
          <header className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-ink">All Reminders</h2>
            <span className="text-xs text-ink-muted">{schedules.length} total</span>
          </header>

          {schedules.length > 0 ? (
            <ul className="space-y-2">
              {schedules.map((schedule) => {
                const remedy = remediesById.get(schedule.remedy_id);
                const active = schedule.active;
                return (
                  <li
                    key={schedule.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-2xl border border-border/60',
                      !active && 'opacity-60'
                    )}
                  >
                    <ReminderIcon category={remedy?.category} />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink text-sm truncate">{schedule.remedy_name}</p>
                      <p className="text-xs text-ink-muted">
                        {formatTime(schedule.scheduled_time)} · {getRecurrenceLabel(schedule)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'hidden sm:inline-flex text-xs font-medium px-2.5 py-1 rounded-full border',
                        active ? 'bg-success/10 text-success border-success/20' : 'bg-surface text-ink-muted border-border'
                      )}
                    >
                      {active ? 'Active' : 'Paused'}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleActive(schedule.id)}
                      aria-label={active ? `Pause ${schedule.remedy_name}` : `Resume ${schedule.remedy_name}`}
                      className="p-1.5 text-ink-muted hover:text-ink rounded-full transition-colors"
                    >
                      {active ? (
                        <ToggleRight className="w-5 h-5 text-primary" />
                      ) : (
                        <ToggleLeft className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(schedule.id)}
                      aria-label={`Remove ${schedule.remedy_name}`}
                      className="p-1.5 text-ink-muted hover:text-danger rounded-full transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState
              icon={Bell}
              title="No reminders yet"
              description="Add your first reminder to get started."
            />
          )}
        </div>
      </section>

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setFormError(null); }}
        title="New Remedy Schedule"
      >
        <RemedyScheduleForm
          remedies={remedies}
          favorites={favorites}
          onSubmit={handleAdd}
          onCancel={() => { setIsModalOpen(false); setFormError(null); }}
          error={formError}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </PageWrapper>
  );
}
