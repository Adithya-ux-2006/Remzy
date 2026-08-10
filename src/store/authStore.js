import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { getInitials } from '../utils/mappers';
import { clearQuickSaves, getQuickSaves } from '../utils/quickSave';
import { REMOVED_ALLERGY_VALUES } from '../constants/onboarding';

export function needsOnboardingProfile(user) {
  if (!user) return false;

  const hasCompletedOnboarding = user.has_completed_onboarding ?? false;
  const hasGender = Boolean((user.gender || '').trim());
  const hasConditions = (user.common_conditions ?? []).length > 0;
  const hasAllergies = (user.known_allergies ?? []).length > 0;

  return !hasCompletedOnboarding || (!hasGender && !hasConditions && !hasAllergies);
}

const OAUTH_RETURN_PATH_KEY = 'remzy_oauth_return_path';

function getSafeReturnPath(path) {
  if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//')) {
    return '/dashboard';
  }

  const authOnlyPaths = ['/login', '/register', '/auth/callback'];
  return authOnlyPaths.includes(path) ? '/dashboard' : path;
}

function rememberOAuthReturnPath(path) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(OAUTH_RETURN_PATH_KEY, getSafeReturnPath(path));
}

function consumeOAuthReturnPath() {
  if (typeof window === 'undefined') return '/dashboard';
  const path = getSafeReturnPath(window.sessionStorage.getItem(OAUTH_RETURN_PATH_KEY));
  window.sessionStorage.removeItem(OAUTH_RETURN_PATH_KEY);
  return path;
}

async function importQuickSavedFavorites(userId) {
  const quickSaves = getQuickSaves();
  const remedyIds = quickSaves?.remedyIds || [];

  if (remedyIds.length === 0) return;

  const rows = remedyIds.map((remedyId) => ({ user_id: userId, remedy_id: remedyId }));
  const { error } = await supabase.from('favorites').upsert(rows, { onConflict: 'user_id,remedy_id' });

  if (error) throw error;

  clearQuickSaves();
}

async function migrateGuestProfileIfNeeded(user) {
  if (!user?.id) return;

  const userConditions = user.common_conditions ?? [];
  const userAllergies = user.known_allergies ?? [];
  const userTreatmentPrefs = user.treatment_prefs ?? [];
  const hasExistingProfile = userConditions.length > 0 || userAllergies.length > 0 || user.is_child_safe || userTreatmentPrefs.length > 0;

  if (hasExistingProfile) return;

  const GUEST_ALLERGIES_KEY = 'clotsolid_guest_allergies';
  const GUEST_CONDITIONS_KEY = 'clotsolid_guest_conditions';
  const GUEST_CHILD_SAFE_KEY = 'clotsolid_guest_child_safe';
  const GUEST_TREATMENT_PREFS_KEY = 'clotsolid_guest_treatment_prefs';

  function readArr(key) {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }

  const guestAllergies = readArr(GUEST_ALLERGIES_KEY).filter((value) => !REMOVED_ALLERGY_VALUES.includes(value));
  const guestConditions = readArr(GUEST_CONDITIONS_KEY);
  const guestChildSafe = typeof window === 'undefined' ? false : window.localStorage.getItem(GUEST_CHILD_SAFE_KEY) === 'true';
  const guestTreatmentPrefs = readArr(GUEST_TREATMENT_PREFS_KEY);

  if (guestAllergies.length === 0 && guestConditions.length === 0 && !guestChildSafe && guestTreatmentPrefs.length === 0) return;

  const updates = {};
  if (guestConditions.length > 0) updates.common_conditions = guestConditions;
  if (guestAllergies.length > 0) updates.known_allergies = guestAllergies;
  if (guestChildSafe) updates.is_child_safe = guestChildSafe;
  if (guestTreatmentPrefs.length > 0) updates.treatment_prefs = guestTreatmentPrefs;

  await updateUserProfileRow(user.id, updates);

  window.localStorage.removeItem(GUEST_ALLERGIES_KEY);
  window.localStorage.removeItem(GUEST_CONDITIONS_KEY);
  window.localStorage.removeItem(GUEST_CHILD_SAFE_KEY);
  window.localStorage.removeItem(GUEST_TREATMENT_PREFS_KEY);
  window.localStorage.removeItem('clotsolid_guest_profile');

  return updates;
}

async function updateUserProfileRow(userId, updates) {
  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId);

  if (!error) return;

  const isMissingNewColumn = /column .* does not exist/i.test(error.message || '')
    || /could not find the '.*' column of 'users' in the schema cache/i.test(error.message || '');
  if (!isMissingNewColumn) throw error;

  const KNOWN_COLUMNS = [
    'name', 'university_name', 'current_year', 'gender',
    'common_conditions', 'known_allergies', 'has_completed_onboarding',
    'is_child_safe', 'treatment_prefs',
  ];

  const fallbackUpdates = {};
  for (const key of KNOWN_COLUMNS) {
    if (updates[key] !== undefined) fallbackUpdates[key] = updates[key];
  }

  const { error: fallbackError } = await supabase
    .from('users')
    .update(fallbackUpdates)
    .eq('id', userId);

  if (fallbackError) throw fallbackError;
}

const buildUser = async (session) => {
  if (!session?.user) return null;

  const { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle();

  const metadata = session.user.user_metadata || {};
  const metadataName = metadata.name || metadata.full_name || '';

  if (error) throw error;

  return {
    ...session.user,
    ...profile,
    name: profile?.name || metadataName,
    university_email: profile?.university_email || metadata.university_email || '',
    university_name: profile?.university_name || metadata.university_name || '',
    current_year: profile?.current_year || metadata.current_year || '',
    gender: profile?.gender || metadata.gender || '',
    is_child_safe: profile?.is_child_safe ?? false,
    common_conditions: profile?.common_conditions ?? [],
    known_allergies: profile?.known_allergies ?? [],
    treatment_prefs: profile?.treatment_prefs ?? [],
    has_completed_onboarding: profile?.has_completed_onboarding ?? false,
    is_admin: profile?.is_admin ?? false,
    notify_nearby_launch: profile?.notify_nearby_launch ?? false,
    search_count: profile?.search_count ?? 0,
    avatar: metadata.avatar || metadata.avatar_url || getInitials(profile?.name || metadataName),
  };
};

async function completeAuthenticatedSession(session) {
  if (!session?.user) throw new Error('Google sign-in did not return a valid session.');

  const metadata = session.user.user_metadata || {};
  const metadataName = metadata.name || metadata.full_name || '';
  const initialUser = await buildUser(session);

  if (metadataName && (!initialUser.name || initialUser.name === 'Student')) {
    await updateUserProfileRow(session.user.id, { name: metadataName });
  }

  await importQuickSavedFavorites(session.user.id);

  let user = await buildUser(session);
  const migratedUpdates = await migrateGuestProfileIfNeeded(user);
  if (migratedUpdates) user = { ...user, ...migratedUpdates };

  const { useFavoritesStore } = await import('./favoritesStore');
  await useFavoritesStore.getState().fetchFavorites();

  return user;
}

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
  authSubscription: null,
  isOAuthLoading: false,

  checkSession: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const user = await buildUser(session);
        set({ user, isAuthenticated: true, isLoading: false, isInitialized: true });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true });
      }
    } catch (error) {
      console.error('Error checking session:', error);
      set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true });
    }
  },

  initialize: async () => {
    if (get().authSubscription) return () => {};

    await get().checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (!session) {
          set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true });
          return;
        }

        const user = await buildUser(session);
        set({ user, isAuthenticated: true, isLoading: false, isInitialized: true });
      } catch (error) {
        console.error('Auth state change error:', error);
        set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true });
      }
    });

    set({ authSubscription: subscription });

    return () => {
      subscription.unsubscribe();
      set({ authSubscription: null });
    };
  },

  login: async ({ email, password }) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const user = await buildUser({ user: data.user });
      set({ user, isAuthenticated: true });

      const migratedUpdates = await migrateGuestProfileIfNeeded(user);
      if (migratedUpdates) {
        set((state) => ({
          user: { ...state.user, ...migratedUpdates },
        }));
      }

      return { success: true, needsOnboarding: needsOnboardingProfile(user) };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error };
    } finally {
      set({ isLoading: false });
    }
  },

  loginWithGoogle: async ({ returnTo = '/dashboard' } = {}) => {
    set({ isOAuthLoading: true });
    try {
      rememberOAuthReturnPath(returnTo);
      const redirectTo = new URL('/auth/callback', window.location.origin).toString();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      });

      if (error) throw error;
      return { success: true, url: data.url };
    } catch (error) {
      console.error('Google login error:', error);
      if (typeof window !== 'undefined') window.sessionStorage.removeItem(OAUTH_RETURN_PATH_KEY);
      set({ isOAuthLoading: false });
      return { success: false, error };
    }
  },

  completeOAuthLogin: async () => {
    set({ isOAuthLoading: true });
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      const user = await completeAuthenticatedSession(session);
      set({
        user,
        isAuthenticated: true,
        isInitialized: true,
        isLoading: false,
        isOAuthLoading: false,
      });

      return {
        success: true,
        destination: needsOnboardingProfile(user) ? '/onboarding' : consumeOAuthReturnPath(),
      };
    } catch (error) {
      console.error('Google callback error:', error);
      if (typeof window !== 'undefined') window.sessionStorage.removeItem(OAUTH_RETURN_PATH_KEY);
      set({ isOAuthLoading: false });
      return { success: false, error };
    }
  },

  register: async (details) => {
    set({ isLoading: true });
    try {
      const avatar = getInitials(details.name);
      const { data, error } = await supabase.auth.signUp({
        email: details.email,
        password: details.password,
        options: {
          data: {
            name: details.name,
            avatar,
          },
        },
      });
      if (error) throw error;
      if (!data.user) throw new Error('User signup did not return a user record.');

      await updateUserProfileRow(data.user.id, {
        name: details.name,
      });

      if (data.session) {
        await importQuickSavedFavorites(data.user.id);
        const user = await buildUser(data.session);
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
        });

        const migratedUpdates = await migrateGuestProfileIfNeeded(user);
        if (migratedUpdates) {
          set((state) => ({
            user: { ...state.user, ...migratedUpdates },
          }));
        }

        const { useFavoritesStore } = await import('./favoritesStore');
        await useFavoritesStore.getState().fetchFavorites();
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
        });
      }

      return {
        success: true,
        needsEmailConfirmation: !data.session,
          needsOnboarding: data.session ? needsOnboardingProfile(get().user) : true,
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error };
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
  },

  updateUser: async (updates) => {
    const { user } = get();
    if (!user) return;
    
    try {
      const dbUpdates = {
        name: updates.name,
        university_email: updates.universityEmail,
        university_name: updates.universityName,
        current_year: updates.currentYear,
        gender: updates.gender,
        known_allergies: updates.known_allergies,
        common_conditions: updates.common_conditions,
        is_child_safe: updates.is_child_safe,
        treatment_prefs: updates.treatment_prefs,
      };

      Object.keys(dbUpdates).forEach((key) => dbUpdates[key] === undefined && delete dbUpdates[key]);

      const metadataUpdates = {
        name: updates.name,
        university_email: updates.universityEmail,
        university_name: updates.universityName,
        current_year: updates.currentYear,
        gender: updates.gender,
      };

      Object.keys(metadataUpdates).forEach((key) => metadataUpdates[key] === undefined && delete metadataUpdates[key]);

      if (Object.keys(metadataUpdates).length > 0) {
        const { error: authUpdateError } = await supabase.auth.updateUser({ data: metadataUpdates });
        if (authUpdateError) throw authUpdateError;
      }

      await updateUserProfileRow(user.id, dbUpdates);
      set((state) => ({
        user: {
          ...state.user,
          ...updates,
          university_name: updates.universityName ?? state.user.university_name,
          current_year: updates.currentYear ?? state.user.current_year,
          university_email: updates.universityEmail ?? state.user.university_email,
        },
      }));
    } catch (error) {
      console.error('Update profile error:', error);
    }
  },

  saveOnboarding: async ({ gender, commonConditions, knownAllergies, treatmentPrefs }) => {
    const { user } = get();
    if (!user) {
      return { success: false, error: new Error('No authenticated user found.') };
    }

    try {
      const updates = {
        gender,
        common_conditions: commonConditions,
        known_allergies: knownAllergies,
        treatment_prefs: treatmentPrefs || [],
        has_completed_onboarding: true,
      };

      await updateUserProfileRow(user.id, updates);

      set((state) => ({
        user: {
          ...state.user,
          ...updates,
        },
      }));

      return { success: true };
    } catch (error) {
      console.error('Save onboarding error:', error);
      return { success: false, error };
    }
  },

  enableNearbyLaunchNotification: async () => {
    const { user } = get();
    if (!user) return { success: false, error: new Error('No authenticated user found.') };

    try {
      const { error } = await supabase
        .from('users')
        .update({ notify_nearby_launch: true })
        .eq('id', user.id);

      if (error) throw error;

      set((state) => ({
        user: {
          ...state.user,
          notify_nearby_launch: true,
        },
      }));

      return { success: true };
    } catch (error) {
      console.error('Enable nearby launch notification error:', error);
      return { success: false, error };
    }
  },

  incrementSearchCount: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ search_count: (user.search_count ?? 0) + 1 })
        .eq('id', user.id);

      if (error) throw error;

      set((state) => ({
        user: {
          ...state.user,
          search_count: (state.user.search_count ?? 0) + 1,
        },
      }));
    } catch (error) {
      console.error('Increment search count error:', error);
    }
  }
}));
