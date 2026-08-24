import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LogOut, User, Shield, Pencil, X, Check, Share2, Eye
} from 'lucide-react';
import { cn } from '../utils/cn';
import { PageWrapper } from '../components/layout';
import { AccordionSection } from '../components/ui/AccordionSection';
import { ShareModal } from '../components/ui/ShareModal';
import { useAuthStore } from '../store/authStore';
import { useGuestProfileStore } from '../store/guestProfileStore';
import { useProfileSharesStore } from '../store/profileSharesStore';
import { getInitials } from '../utils/mappers';
import { ALLERGIES, CONDITIONS, GENDER_OPTIONS, ABOUT_REMZY_ITEMS, getVisibleConditions, TREATMENT_PREFERENCES } from '../constants/onboarding';

const EMPTY_ARRAY = [];

const ONBOARDING_LABELS = new Map(
  [...CONDITIONS, ...ALLERGIES].map((option) => [option.value, option.label])
);

const CONDITION_MAP = new Map(CONDITIONS.map((c) => [c.value, { label: c.label, emoji: c.emoji }]));
const ALLERGY_MAP = new Map(ALLERGIES.map((a) => [a.value, { label: a.label, emoji: a.emoji }]));
const OTHER_EMOJI = '✏️';
const NONE_EMOJI = '○';

const INITIAL_VISIBLE = 5;

function formatChip(value) {
  if (!value) return value;
  if (value.startsWith('other:')) return value.slice(6).trim();
  if (ONBOARDING_LABELS.has(value)) return ONBOARDING_LABELS.get(value);
  return value.split('-').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
}

function getConditionDisplay(value) {
  if (value.startsWith('other:')) return { emoji: OTHER_EMOJI, label: value.slice(6).trim() };
  const entry = CONDITION_MAP.get(value);
  if (entry) return entry;
  return { emoji: NONE_EMOJI, label: formatChip(value) };
}

function getAllergyDisplay(value) {
  if (value.startsWith('other:')) return { emoji: OTHER_EMOJI, label: value.slice(6).trim() };
  const entry = ALLERGY_MAP.get(value);
  if (entry) return entry;
  return { emoji: NONE_EMOJI, label: formatChip(value) };
}

function PillGroup({ items, getDisplay, emptyLabel }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? items : items.slice(0, INITIAL_VISIBLE);
  const remaining = items.length - INITIAL_VISIBLE;

  if (items.length === 0) {
    return <p className="text-sm text-ink-muted">{emptyLabel}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {visible.map((value) => {
        const { emoji, label } = getDisplay(value);
        return (
          <span
            key={value}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
          >
            <span className="text-xs leading-none">{emoji}</span>
            <span>{label}</span>
          </span>
        );
      })}
      {!showAll && remaining > 0 && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="rounded-full border border-border/60 px-3 py-1.5 text-sm font-medium text-ink-muted hover:text-ink hover:border-border transition-colors"
        >
          +{remaining} more
        </button>
      )}
    </div>
  );
}

export function Profile() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const updateUser = useAuthStore((state) => state.updateUser);
  const guestAllergies = useGuestProfileStore((state) => state.known_allergies);
  const guestConditions = useGuestProfileStore((state) => state.common_conditions);
  const guestGender = useGuestProfileStore((state) => state.gender);
  const guestIsChildSafe = useGuestProfileStore((state) => state.is_child_safe ?? false);
  const guestTreatmentPrefs = useGuestProfileStore((state) => state.treatment_prefs ?? EMPTY_ARRAY);
  const updateGuestProfile = useGuestProfileStore((state) => state.updateProfile);
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [isEditingHealth, setIsEditingHealth] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [viewingShared, setViewingShared] = useState(null);
  const [healthForm, setHealthForm] = useState({
    selectedConditions: [],
    selectedAllergies: [],
    isChildSafe: user?.is_child_safe ?? false,
    treatmentPrefs: user?.treatment_prefs ?? [],
    otherConditionText: '',
    otherAllergyText: '',
  });

  const [guestEditForm, setGuestEditForm] = useState({
    selectedConditions: guestConditions,
    selectedAllergies: guestAllergies,
    isChildSafe: guestIsChildSafe,
    treatmentPrefs: guestTreatmentPrefs,
    otherConditionText: '',
    otherAllergyText: '',
  });

  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    gender: user?.gender || '',
    selectedConditions: user?.common_conditions ?? [],
    selectedAllergies: user?.known_allergies ?? [],
  });

  const fetchShares = useProfileSharesStore((s) => s.fetchShares);
  const fetchSharedProfiles = useProfileSharesStore((s) => s.fetchSharedProfiles);
  const fetchPendingInvites = useProfileSharesStore((s) => s.fetchPendingInvites);
  const sharedProfiles = useProfileSharesStore((s) => s.sharedProfiles);
  const pendingInvites = useProfileSharesStore((s) => s.pendingInvites);
  const acceptInvite = useProfileSharesStore((s) => s.acceptInvite);
  const declineInvite = useProfileSharesStore((s) => s.declineInvite);

  useEffect(() => {
    fetchShares();
    fetchSharedProfiles();
    fetchPendingInvites();
  }, [fetchShares, fetchSharedProfiles, fetchPendingInvites]);

  // Guest profile view
  if (!isAuthenticated) {
    const handleGuestSave = () => {
      const conditions = guestEditForm.selectedConditions.filter(v => v !== 'none');
      const allergies = guestEditForm.selectedAllergies.filter(v => v !== 'none');
      if (guestEditForm.otherConditionText.trim() && !conditions.includes(guestEditForm.otherConditionText.trim())) {
        conditions.push(guestEditForm.otherConditionText.trim());
      }
      if (guestEditForm.otherAllergyText.trim() && !allergies.includes(guestEditForm.otherAllergyText.trim())) {
        allergies.push(guestEditForm.otherAllergyText.trim());
      }
      updateGuestProfile({
        known_allergies: allergies,
        common_conditions: conditions,
        is_child_safe: guestEditForm.isChildSafe,
        treatment_prefs: guestEditForm.treatmentPrefs,
      });
    };

    const formatValue = (value) => {
      if (!value) return value;
      if (value.startsWith('other:')) return value.slice(6).trim();
      if (ONBOARDING_LABELS.has(value)) return ONBOARDING_LABELS.get(value);
      return value.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
    };

    return (
      <PageWrapper className="min-h-screen md:pb-8 pt-6">
        <div className="max-w-5xl mx-auto px-6 space-y-8">
          {/* Guest Profile Card */}
          <div className="bg-card rounded-3xl p-6 md:p-8 shadow-sm border border-border flex flex-col items-center gap-4 text-center">
            <div className="w-20 h-20 rounded-2xl bg-accent/20 flex items-center justify-center text-primary">
              <User className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-ink mb-1">Guest Profile</h1>
              <p className="text-ink-muted text-sm">Sign in to save favorites and get a personalized dashboard.</p>
            </div>
            <div className="flex gap-3 mt-2">
              <Link
                to="/register"
                className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm shadow-glow hover:bg-primary-dark transition-colors"
              >
                Sign Up Free
              </Link>
              <Link
                to="/login"
                className="px-6 py-2.5 border border-ink/10 text-ink rounded-xl font-medium text-sm hover:bg-surface transition-colors"
              >
                Log In
              </Link>
            </div>
          </div>

          {/* Guest Health Profile */}
          <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="p-5 border-b border-border">
              <h2 className="font-bold text-lg text-ink">Health Profile</h2>
              <p className="text-xs text-ink-muted mt-1">Edit your allergies and conditions to get safer remedy recommendations.</p>
            </div>
            <div className="space-y-5 p-5">
              <ChildSafeToggle
                value={guestEditForm.isChildSafe}
                onChange={(isChildSafe) => setGuestEditForm({ ...guestEditForm, isChildSafe })}
              />
              <div className="space-y-2">
                <p className="text-sm font-semibold text-ink">Allergies & Sensitivities</p>
                <div className="flex flex-wrap gap-2">
                  {ALLERGIES.map((option) => {
                    const isSelected = guestEditForm.selectedAllergies.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => {
                          const next = option.value === 'none'
                            ? (isSelected ? [] : ['none'])
                            : isSelected
                              ? guestEditForm.selectedAllergies.filter(v => v !== option.value && v !== 'none')
                              : [...guestEditForm.selectedAllergies.filter(v => v !== 'none'), option.value];
                          setGuestEditForm({ ...guestEditForm, selectedAllergies: next });
                        }}
                        className={isSelected ? 'rounded-full border border-forest bg-primary px-3 py-1.5 text-sm font-medium text-white' : 'rounded-full border border-border px-3 py-1.5 text-sm font-medium text-ink'}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
                {guestEditForm.selectedAllergies.includes('other') && (
                  <div className="bg-card rounded-xl shadow-soft border border-border/50 transition-shadow duration-200 focus-within:shadow-[0_0_0_2px_hsl(var(--primary)/0.25)] focus-within:border-primary/30 mt-2">
                    <input
                      type="text"
                      value={guestEditForm.otherAllergyText}
                      onChange={(e) => setGuestEditForm({ ...guestEditForm, otherAllergyText: e.target.value })}
                      placeholder="Please specify your allergy..."
                      className="w-full bg-transparent px-3 py-2 text-sm text-ink placeholder-ink-muted focus:outline-none"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-ink">Health Conditions</p>
                <div className="flex flex-wrap gap-2">
                  {getVisibleConditions(guestGender, guestEditForm.selectedConditions).map((option) => {
                    const isSelected = guestEditForm.selectedConditions.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => {
                          const next = option.value === 'none'
                            ? (isSelected ? [] : ['none'])
                            : isSelected
                              ? guestEditForm.selectedConditions.filter(v => v !== option.value && v !== 'none')
                              : [...guestEditForm.selectedConditions.filter(v => v !== 'none'), option.value];
                          setGuestEditForm({ ...guestEditForm, selectedConditions: next });
                        }}
                        className={isSelected ? 'rounded-full border border-forest bg-primary px-3 py-1.5 text-sm font-medium text-white' : 'rounded-full border border-border px-3 py-1.5 text-sm font-medium text-ink'}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
                {guestEditForm.selectedConditions.includes('other') && (
                  <input
                    type="text"
                    value={guestEditForm.otherConditionText}
                    onChange={(e) => setGuestEditForm({ ...guestEditForm, otherConditionText: e.target.value })}
                    placeholder="Please specify your condition..."
                    className="w-full rounded-xl border border-border px-3 py-2 text-sm mt-2"
                  />
                )}
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-ink">Treatment Preferences</p>
                <div className="flex flex-wrap gap-2">
                  {TREATMENT_PREFERENCES.map((option) => {
                    const isSelected = guestEditForm.treatmentPrefs.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => {
                          const next = isSelected
                            ? guestEditForm.treatmentPrefs.filter(v => v !== option.value)
                            : option.value === 'no_preference'
                              ? [option.value]
                              : [...guestEditForm.treatmentPrefs.filter(v => v !== 'no_preference'), option.value];
                          setGuestEditForm({ ...guestEditForm, treatmentPrefs: next });
                        }}
                        className={isSelected ? 'rounded-full border border-forest bg-primary px-3 py-1.5 text-sm font-medium text-white' : 'rounded-full border border-border px-3 py-1.5 text-sm font-medium text-ink'}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button onClick={handleGuestSave} className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm w-full">
                Save
              </button>

              {(guestEditForm.isChildSafe || guestEditForm.selectedAllergies.length > 0 || guestEditForm.selectedConditions.length > 0 || guestEditForm.treatmentPrefs.length > 0) && (
                <div className="pt-3 border-t border-border space-y-3">
                  <ProfileGroup title="Child Safe" values={guestEditForm.isChildSafe ? ['Enabled'] : []} emptyLabel="Not enabled" />
                  <ProfileGroup title="Allergies" values={guestEditForm.selectedAllergies.map(formatValue)} emptyLabel="None selected" />
                  <ProfileGroup title="Conditions" values={guestEditForm.selectedConditions.map(formatValue)} emptyLabel="None selected" />
                  <ProfileGroup title="Treatment Preferences" values={guestEditForm.treatmentPrefs.map(v => {
                    const pref = TREATMENT_PREFERENCES.find(p => p.value === v);
                    return pref ? pref.label : v;
                  })} emptyLabel="None selected" />
                </div>
              )}
            </div>
          </div>

        </div>
      </PageWrapper>
    );
  }

  // Authenticated user
  const selectedConditions = user.common_conditions ?? [];
  const selectedAllergies = user.known_allergies ?? [];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSaveHealth = () => {
    const conditions = healthForm.selectedConditions.filter(v => v !== 'none');
    const allergies = healthForm.selectedAllergies.filter(v => v !== 'none');
    if (healthForm.otherConditionText.trim() && !conditions.includes(healthForm.otherConditionText.trim())) {
      conditions.push(healthForm.otherConditionText.trim());
    }
    if (healthForm.otherAllergyText.trim() && !allergies.includes(healthForm.otherAllergyText.trim())) {
      allergies.push(healthForm.otherAllergyText.trim());
    }
    updateUser({
      known_allergies: allergies,
      common_conditions: conditions,
      is_child_safe: healthForm.isChildSafe,
      treatment_prefs: healthForm.treatmentPrefs,
    });
    setIsEditingHealth(false);
  };

  const startEditingHealth = () => {
    const existingConditions = user?.common_conditions ?? [];
    const existingAllergies = user?.known_allergies ?? [];
    const existingTreatmentPrefs = user?.treatment_prefs ?? [];
    const otherConditionEntry = existingConditions.find(v => !CONDITIONS.some(c => c.value === v));
    const otherAllergyEntry = existingAllergies.find(v => !ALLERGIES.some(a => a.value === v));
    setHealthForm({
      selectedConditions: existingConditions.filter(v => CONDITIONS.some(c => c.value === v)),
      selectedAllergies: existingAllergies.filter(v => ALLERGIES.some(a => a.value === v)),
      isChildSafe: user?.is_child_safe ?? false,
      treatmentPrefs: existingTreatmentPrefs,
      otherConditionText: otherConditionEntry || '',
      otherAllergyText: otherAllergyEntry || '',
    });
    setIsEditingHealth(true);
  };

  const handleSaveProfile = () => {
    updateUser({
      name: editForm.name,
      gender: editForm.gender,
      avatar: getInitials(editForm.name),
      known_allergies: editForm.selectedAllergies.filter(v => v !== 'none'),
      common_conditions: editForm.selectedConditions.filter(v => v !== 'none'),
    });
    setIsEditing(false);
  };

  const startEditing = () => {
    setEditForm({
      name: user?.name || '',
      gender: user?.gender || '',
      selectedConditions: user?.common_conditions ?? [],
      selectedAllergies: user?.known_allergies ?? [],
    });
    setIsEditing(true);
  };

  const toggleHealthChip = (value, type) => {
    const field = type === 'conditions' ? 'selectedConditions' : 'selectedAllergies';
    const current = healthForm[field];
    const next = value === 'none'
      ? (current.includes('none') ? [] : ['none'])
      : current.includes(value)
        ? current.filter(v => v !== value && v !== 'none')
        : [...current.filter(v => v !== 'none'), value];
    setHealthForm({ ...healthForm, [field]: next });
  };

  return (
    <PageWrapper className="min-h-screen md:pb-12">
      <div className="max-w-5xl mx-auto px-5 md:px-8 pt-6 md:pt-8 space-y-6 md:space-y-8">

        {/* ── Pending Invite Banner ── */}
        {pendingInvites.length > 0 && pendingInvites.map((invite) => (
          <div key={invite.id} className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-amber-900 text-sm">
                {invite.users?.name || 'Someone'} shared their Health Profile with you
              </p>
              <p className="text-xs text-amber-700 mt-0.5">Accept to view their profile, saved remedies, and treatment reminders.</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => declineInvite(invite.id)}
                className="px-3 py-1.5 rounded-xl text-sm font-medium border border-amber-300 text-amber-800 hover:bg-amber-100 transition-colors"
              >
                Decline
              </button>
              <button
                onClick={() => acceptInvite(invite.id)}
                className="px-3 py-1.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition-colors"
              >
                Accept
              </button>
            </div>
          </div>
        ))}

        {/* ── Shared Profile Selector ── */}
        {sharedProfiles.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Viewing:</span>
            <button
              onClick={() => setViewingShared(null)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                !viewingShared ? 'bg-primary text-white' : 'bg-surface text-ink border border-border hover:bg-surface/80'
              )}
            >
              My Profile
            </button>
            {sharedProfiles.map((sp) => (
              <button
                key={sp.shareId}
                onClick={() => setViewingShared(sp)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                  viewingShared?.shareId === sp.shareId ? 'bg-primary text-white' : 'bg-surface text-ink border border-border hover:bg-surface/80'
                )}
              >
                {sp.owner.name}'s Profile
              </button>
            ))}
          </div>
        )}

        {viewingShared ? (
          <SharedProfileView sharedProfile={viewingShared} />
        ) : (
          <>
        {/* ── Welcome Header Card ── */}
        <section className="relative overflow-hidden bg-card rounded-3xl border border-border/60 shadow-soft">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/8 via-emerald-500/5 to-transparent pointer-events-none" />
          <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="shrink-0">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-primary flex items-center justify-center text-2xl md:text-3xl font-bold text-white shadow-glow">
                {user.avatar}
              </div>
            </div>

            <div className="flex-1 w-full text-center md:text-left">
              {isEditing ? (
                <div className="space-y-3">
                  <div className="bg-card rounded-xl shadow-soft border border-border/50 transition-shadow duration-200 focus-within:shadow-[0_0_0_2px_hsl(var(--primary)/0.25)] focus-within:border-primary/30">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full bg-transparent px-3 py-2 text-sm text-ink placeholder-ink-muted focus:outline-none"
                      placeholder="Name"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {GENDER_OPTIONS.map((option) => {
                      const isSelected = editForm.gender === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => setEditForm({ ...editForm, gender: option.value })}
                          className={isSelected
                            ? 'rounded-full border border-forest bg-primary px-4 py-2 text-sm font-medium text-white'
                            : 'rounded-full border border-border px-4 py-2 text-sm font-medium text-ink'
                          }
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-2 justify-center md:justify-start pt-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-1.5 rounded-full text-sm font-medium border text-ink"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-1.5 rounded-full text-sm font-medium bg-primary text-white"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
                    Welcome back
                  </p>
                  <h1 className="text-2xl md:text-3xl font-bold text-ink mb-1">{user.name}</h1>
                  <p className="text-sm text-ink-muted mb-2">{user.email}</p>
                  <p className="text-sm text-ink-muted">
                    Sex / Gender:{' '}
                    {user.gender
                      ? GENDER_OPTIONS.find((option) => option.value === user.gender)?.label || user.gender
                      : 'Not provided'}
                  </p>
                  <p className="text-sm text-ink-muted mt-1">Child Safe: {user.is_child_safe ? 'Enabled' : 'Not enabled'}</p>
                  <button
                    onClick={startEditing}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit Profile
                  </button>
                </div>
              )}
            </div>

          </div>
        </section>

        {/* ── Health Profile Card ── */}
        <section className="bg-card rounded-2xl shadow-sm border border-border/60 overflow-hidden">
          <div className="p-5 border-b border-border/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-lg text-ink">Health Profile</h2>
            </div>
            {isEditingHealth ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditingHealth(false)}
                  className="p-2 rounded-lg hover:bg-surface transition-colors text-ink-muted"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSaveHealth}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Share
                </button>
                <button
                  onClick={startEditingHealth}
                  className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
              </div>
            )}
          </div>

          <div className="p-5 space-y-5">
            <ChildSafeToggle
              value={isEditingHealth ? healthForm.isChildSafe : user.is_child_safe}
              onChange={(isChildSafe) => setHealthForm({ ...healthForm, isChildSafe })}
              readOnly={!isEditingHealth}
            />
            {/* Conditions */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-ink">Health Conditions</p>
              {isEditingHealth ? (
                <>
                  <div className="flex flex-wrap gap-2">
                    {getVisibleConditions(user.gender, healthForm.selectedConditions).map((option) => {
                      const isSelected = healthForm.selectedConditions.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => toggleHealthChip(option.value, 'conditions')}
                          className={isSelected
                            ? 'rounded-full border border-forest bg-primary px-3 py-1.5 text-sm font-medium text-white'
                            : 'rounded-full border border-border px-3 py-1.5 text-sm font-medium text-ink'
                          }
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                  {healthForm.selectedConditions.includes('other') && (
                    <div className="bg-card rounded-xl shadow-soft border border-border/50 transition-shadow duration-200 focus-within:shadow-[0_0_0_2px_hsl(var(--primary)/0.25)] focus-within:border-primary/30 mt-2">
                      <input
                        type="text"
                        value={healthForm.otherConditionText}
                        onChange={(e) => setHealthForm({ ...healthForm, otherConditionText: e.target.value })}
                        placeholder="Please specify your condition..."
                        className="w-full bg-transparent px-3 py-2 text-sm text-ink placeholder-ink-muted focus:outline-none"
                      />
                    </div>
                  )}
                </>
              ) : (
                <PillGroup
                  items={selectedConditions}
                  getDisplay={getConditionDisplay}
                  emptyLabel="No conditions selected"
                />
              )}
            </div>

            {/* Allergies */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-ink">Allergies & Sensitivities</p>
              {isEditingHealth ? (
                <>
                  <div className="flex flex-wrap gap-2">
                    {ALLERGIES.map((option) => {
                      const isSelected = healthForm.selectedAllergies.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => toggleHealthChip(option.value, 'allergies')}
                          className={isSelected
                            ? 'rounded-full border border-forest bg-primary px-3 py-1.5 text-sm font-medium text-white'
                            : 'rounded-full border border-border px-3 py-1.5 text-sm font-medium text-ink'
                          }
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                  {healthForm.selectedAllergies.includes('other') && (
                    <div className="bg-card rounded-xl shadow-soft border border-border/50 transition-shadow duration-200 focus-within:shadow-[0_0_0_2px_hsl(var(--primary)/0.25)] focus-within:border-primary/30 mt-2">
                      <input
                        type="text"
                        value={healthForm.otherAllergyText}
                        onChange={(e) => setHealthForm({ ...healthForm, otherAllergyText: e.target.value })}
                        placeholder="Please specify your allergy..."
                        className="w-full bg-transparent px-3 py-2 text-sm text-ink placeholder-ink-muted focus:outline-none"
                      />
                    </div>
                  )}
                </>
              ) : (
                <PillGroup
                  items={selectedAllergies}
                  getDisplay={getAllergyDisplay}
                  emptyLabel="No allergies selected"
                />
              )}
            </div>

            {/* Treatment Preferences */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-ink">Treatment Preferences</p>
              {isEditingHealth ? (
                <div className="flex flex-wrap gap-2">
                  {TREATMENT_PREFERENCES.map((option) => {
                    const isSelected = healthForm.treatmentPrefs.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => {
                          const next = isSelected
                            ? healthForm.treatmentPrefs.filter(v => v !== option.value)
                            : option.value === 'no_preference'
                              ? [option.value]
                              : [...healthForm.treatmentPrefs.filter(v => v !== 'no_preference'), option.value];
                          setHealthForm({ ...healthForm, treatmentPrefs: next });
                        }}
                        className={isSelected
                          ? 'rounded-full border border-forest bg-primary px-3 py-1.5 text-sm font-medium text-white'
                          : 'rounded-full border border-border px-3 py-1.5 text-sm font-medium text-ink'
                        }
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <PillGroup
                  items={user.treatment_prefs ?? []}
                  getDisplay={(value) => {
                    const pref = TREATMENT_PREFERENCES.find(p => p.value === value);
                    return pref ? { emoji: pref.emoji, label: pref.label } : { emoji: '○', label: value };
                  }}
                  emptyLabel="No preferences selected"
                />
              )}
            </div>
          </div>
        </section>

        <section className="bg-card py-16 rounded-2xl">
          <AccordionSection
            title="About Remzy"
            subtitle="The health platform behind your search."
            lead="Remzy is a health information platform that maps common concerns to remedies and shows the review status of linked sources. Always consult a certified medical professional for serious health concerns."
            items={ABOUT_REMZY_ITEMS}
            bordered
            collapsed
          />
        </section>
          </>
        )}

        {/* ── Sign Out ── */}
        <button
          onClick={handleLogout}
          className="w-full py-4 rounded-2xl border-2 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-bold flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
        >
          <LogOut className="w-5 h-5" /> Sign Out
        </button>

      </div>

      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} />
    </PageWrapper>
  );
}

function SharedProfileView({ sharedProfile }) {
  const { owner, favorites, schedules, sharedAt } = sharedProfile;

  const ownerInitials = getInitials(owner.name);

  return (
    <>
      {/* View-only banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
        <Eye className="w-5 h-5 text-blue-600 shrink-0" />
        <div>
          <p className="font-semibold text-blue-900 text-sm">Viewing {owner.name}'s shared profile</p>
          <p className="text-xs text-blue-700">This is a read-only view. Shared on {new Date(sharedAt).toLocaleDateString()}.</p>
        </div>
      </div>

      {/* Owner header */}
      <section className="relative overflow-hidden bg-card rounded-3xl border border-border/60 shadow-soft">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/8 via-emerald-500/5 to-transparent pointer-events-none" />
        <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="shrink-0">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-primary flex items-center justify-center text-2xl md:text-3xl font-bold text-white shadow-glow">
              {ownerInitials}
            </div>
          </div>
          <div className="flex-1 w-full text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-ink">{owner.name}</h1>
            <p className="text-ink-muted mt-1 capitalize">{owner.gender || 'Not specified'}</p>
            <p className="text-sm text-ink-muted mt-1">Child Safe: {owner.is_child_safe ? 'Enabled' : 'Not enabled'}</p>
          </div>
        </div>
      </section>

      {/* Health Profile */}
      <section className="bg-card rounded-2xl shadow-sm border border-border/60 overflow-hidden">
        <div className="p-5 border-b border-border/60 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-lg text-ink">Health Profile</h2>
        </div>
        <div className="p-5 space-y-5">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-ink">Health Conditions</p>
            <PillGroup items={owner.common_conditions || []} getDisplay={getConditionDisplay} emptyLabel="No conditions selected" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-ink">Allergies & Sensitivities</p>
            <PillGroup items={owner.known_allergies || []} getDisplay={getAllergyDisplay} emptyLabel="No allergies selected" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-ink">Treatment Preferences</p>
            <PillGroup items={owner.treatment_prefs || []} getDisplay={(v) => { const p = TREATMENT_PREFERENCES.find((tp) => tp.value === v); return p ? { emoji: p.emoji, label: p.label } : { emoji: '○', label: v }; }} emptyLabel="No preferences selected" />
          </div>
        </div>
      </section>

      {/* Saved Remedies */}
      <section className="bg-card rounded-2xl shadow-sm border border-border/60 overflow-hidden">
        <div className="p-5 border-b border-border/60">
          <h2 className="font-bold text-lg text-ink">Saved Remedies</h2>
        </div>
        <div className="p-5">
          {favorites.length === 0 ? (
            <p className="text-sm text-ink-muted">No saved remedies.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {favorites.map((fav) => (
                <div key={fav.id} className="p-3 rounded-xl bg-surface border border-border/50">
                  <p className="text-sm font-medium text-ink">{fav.remedies?.name || 'Unknown remedy'}</p>
                  {fav.remedies?.summary && <p className="text-xs text-ink-muted mt-1 line-clamp-2">{fav.remedies.summary}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Treatment Reminders */}
      <section className="bg-card rounded-2xl shadow-sm border border-border/60 overflow-hidden">
        <div className="p-5 border-b border-border/60">
          <h2 className="font-bold text-lg text-ink">Treatment Reminders</h2>
        </div>
        <div className="p-5">
          {schedules.length === 0 ? (
            <p className="text-sm text-ink-muted">No scheduled reminders.</p>
          ) : (
            <div className="space-y-2">
              {schedules.map((sch) => (
                <div key={sch.id} className="p-3 rounded-xl bg-surface border border-border/50 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-ink">{sch.remedy_name || sch.title || 'Reminder'}</p>
                    <p className="text-xs text-ink-muted">{sch.scheduled_time ? new Date(sch.scheduled_time).toLocaleString() : ''}</p>
                  </div>
                  {sch.dosage && <span className="text-xs text-ink-muted">{sch.dosage}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function ChildSafeToggle({ value, onChange, readOnly = false }) {
  if (readOnly) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-semibold text-ink">Child Safe Mode</p>
        <p className="text-sm text-ink-muted">{value ? 'Enabled' : 'Not enabled'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-ink">Child Safe Mode</p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={value}
          onClick={() => onChange(!value)}
          className={cn(
            'relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/20',
            value ? 'bg-primary' : 'bg-ink/20'
          )}
        >
          <span
            className={cn(
              'pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out',
              value ? 'translate-x-5' : 'translate-x-0'
            )}
          />
        </button>
        <span className="text-sm text-ink-muted">
          {value ? 'Filtering remedies not safe for children' : 'Toggle on to filter remedies not safe for children'}
        </span>
      </div>
    </div>
  );
}
function ProfileGroup({ title, values, emptyLabel }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">{title}</h3>
      {values.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <span key={value} className="rounded-full bg-bg px-3 py-1.5 text-sm font-medium text-ink">
              {value}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-ink-muted">{emptyLabel}</p>
      )}
    </div>
  );
}
