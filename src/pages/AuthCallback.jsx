import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PageWrapper } from '../components/layout';
import { useAuthStore } from '../store/authStore';

function getOAuthError() {
  const query = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  return query.get('error_description') || hash.get('error_description') || query.get('error') || hash.get('error');
}

export function AuthCallback() {
  const completeOAuthLogin = useAuthStore((state) => state.completeOAuthLogin);
  const navigate = useNavigate();
  const started = useRef(false);
  const [errorMessage, setErrorMessage] = useState(getOAuthError);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    if (errorMessage) return;

    completeOAuthLogin().then((result) => {
      if (result.success) {
        navigate(result.destination, { replace: true });
        return;
      }
      setErrorMessage(result.error?.message || 'Google sign-in could not be completed.');
    });
  }, [completeOAuthLogin, errorMessage, navigate]);

  return (
    <PageWrapper className="flex min-h-screen items-center justify-center p-6">
      <section className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-xl">
        {errorMessage ? (
          <>
            <AlertCircle className="mx-auto h-10 w-10 text-danger" />
            <h1 className="mt-4 text-2xl font-bold text-ink">Google sign-in was not completed</h1>
            <p className="mt-2 text-sm text-ink-muted">{errorMessage}</p>
            <Link to="/login" className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 font-semibold text-white hover:bg-primary-dark">
              Return to login
            </Link>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
            <h1 className="mt-4 text-2xl font-bold text-ink">Finishing your sign-in</h1>
            <p className="mt-2 text-sm text-ink-muted">We’re securely connecting your Google account to Remzy.</p>
          </>
        )}
      </section>
    </PageWrapper>
  );
}
