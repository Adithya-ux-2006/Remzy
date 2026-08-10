import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Navbar, BottomNav, AppDock, AdminGuard } from './components/layout';
import { ThemeProvider } from './context/ThemeProvider';

import { needsOnboardingProfile, useAuthStore } from './store/authStore';
import { useFavoritesStore } from './store/favoritesStore';
import { useRemedyScheduleStore } from './store/remedyScheduleStore';
import { useCatalogStore } from './store/catalogStore';
import { LoadingSkeleton } from './components/ui/LoadingSkeleton';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { QuickScheduleModal } from './components/ui/QuickScheduleModal';

// Pages — lazy-loaded for code splitting
const Landing = lazy(() => import('./pages/Landing').then(m => ({ default: m.Landing })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Register').then(m => ({ default: m.Register })));
const AuthCallback = lazy(() => import('./pages/AuthCallback').then(m => ({ default: m.AuthCallback })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const SymptomSearch = lazy(() => import('./pages/SymptomSearch').then(m => ({ default: m.SymptomSearch })));
const Results = lazy(() => import('./pages/Results').then(m => ({ default: m.Results })));
const RemedyDetail = lazy(() => import('./pages/RemedyDetail').then(m => ({ default: m.RemedyDetail })));
const Favorites = lazy(() => import('./pages/Favorites').then(m => ({ default: m.Favorites })));
const TreatmentReminders = lazy(() => import('./pages/TreatmentReminders').then(m => ({ default: m.TreatmentReminders })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const Onboarding = lazy(() => import('./pages/Onboarding').then(m => ({ default: m.Onboarding })));
const AdminAnalytics = lazy(() => import('./pages/AdminAnalytics').then(m => ({ default: m.AdminAnalytics })));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const TermsOfService = lazy(() => import('./pages/TermsOfService').then(m => ({ default: m.TermsOfService })));

/** Wraps a lazy page in its own Suspense + ErrorBoundary so the navbar stays visible during transitions. */
function Page({ children }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[40vh]"><LoadingSkeleton count={2} /></div>}>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </Suspense>
  );
}

/**
 * AuthEnforcer: Runs on EVERY route to enforce onboarding for authenticated users
 * with incomplete profiles. Redirects to /onboarding unless already on onboarding,
 * login, or register pages.
 */
function AuthEnforcer({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!isInitialized) {
    return null;
  }

  const publicAuthPaths = ['/login', '/register', '/auth/callback', '/onboarding'];
  const isPublicAuthPath = publicAuthPaths.includes(location.pathname);

  if (isAuthenticated && !isPublicAuthPath && needsOnboardingProfile(user)) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!isInitialized) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (needsOnboardingProfile(user) && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

function AppRoutes() {
  const isInitialized = useAuthStore((state) => state.isInitialized);

  if (!isInitialized) {
    return null;
  }

  return (
    <AuthEnforcer>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Page><Landing /></Page>} />
        <Route path="/login" element={<Page><Login /></Page>} />
        <Route path="/register" element={<Page><Register /></Page>} />
        <Route path="/auth/callback" element={<Page><AuthCallback /></Page>} />
        <Route path="/search" element={<Page><SymptomSearch /></Page>} />
        <Route path="/results" element={<Page><Results /></Page>} />
        <Route path="/remedy/:id" element={<Page><RemedyDetail /></Page>} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Page><Dashboard /></Page></ProtectedRoute>} />
        <Route path="/favorites" element={<ProtectedRoute><Page><Favorites /></Page></ProtectedRoute>} />
        <Route path="/schedules" element={<Navigate to="/reminders" replace />} />
        <Route path="/reminders" element={<ProtectedRoute><Page><TreatmentReminders /></Page></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Page><Profile /></Page></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminGuard><Page><AdminAnalytics /></Page></AdminGuard></ProtectedRoute>} />
        <Route path="/onboarding" element={<ProtectedRoute><Page><Onboarding /></Page></ProtectedRoute>} />
        <Route path="/privacy" element={<Page><PrivacyPolicy /></Page>} />
        <Route path="/terms" element={<Page><TermsOfService /></Page>} />
        
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthEnforcer>
  );
}

/** Dark mode uses the solid `--background` token — no ambient gradient overlay. */

function App() {
  const initialize = useAuthStore((state) => state.initialize);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const fetchFavorites = useFavoritesStore((state) => state.fetchFavorites);
  const fetchSchedules = useRemedyScheduleStore((state) => state.fetchSchedules);
  const fetchCompletions = useRemedyScheduleStore((state) => state.fetchCompletions);
  const clearSchedules = useRemedyScheduleStore((state) => state.clear);
  const fetchCatalog = useCatalogStore((state) => state.fetchCatalog);
  const clearFavorites = useFavoritesStore((state) => state.clear);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [initTimedOut, setInitTimedOut] = useState(false);
  const bootstrappedRef = useRef(false);

  useEffect(() => {
    let dispose = () => {};

    initialize().then((cleanup) => {
      dispose = cleanup || (() => {});
      bootstrappedRef.current = true;
      setBootstrapped(true);
    }).catch((error) => {
      console.error('[APP] Auth initialization failed:', error);
      bootstrappedRef.current = true;
      setBootstrapped(true);
    });

    fetchCatalog();

    const timeoutId = setTimeout(() => {
      if (!bootstrappedRef.current) {
        setInitTimedOut(true);
        bootstrappedRef.current = true;
        setBootstrapped(true);
      }
    }, 10000);

    return () => {
      clearTimeout(timeoutId);
      dispose();
    };
  }, [fetchCatalog, initialize]);

  useEffect(() => {
    if (!isAuthenticated) {
      clearFavorites();
      clearSchedules();
      return;
    }

    fetchFavorites();
    fetchSchedules();
    fetchCompletions();
  }, [clearFavorites, clearSchedules, fetchFavorites, fetchSchedules, fetchCompletions, isAuthenticated]);

  if (!bootstrapped && !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-ink-muted font-medium">Loading Remzy...</p>
          {initTimedOut && (
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors"
            >
              Refresh Page
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <div className="flex flex-col min-h-screen transition-colors duration-250">
            <Navbar />
            <main className="flex-1 relative">
              <AppRoutes />
            </main>
            <BottomNav />
            <AppDock />
            <QuickScheduleModal />
          </div>
        </ErrorBoundary>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
