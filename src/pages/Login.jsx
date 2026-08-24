import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { PageWrapper } from '../components/layout';
import { PasswordInput } from '../components/ui/PasswordInput';
import { AuthDivider, GoogleAuthButton } from '../components/ui/GoogleAuthButton';
import { useAuthStore } from '../store/authStore';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const login = useAuthStore(state => state.login);
  const isLoading = useAuthStore(state => state.isLoading);
  const isOAuthLoading = useAuthStore(state => state.isOAuthLoading);
  const loginWithGoogle = useAuthStore(state => state.loginWithGoogle);
  const navigate = useNavigate();

  const isFormValid = email.trim() !== '' && password.trim() !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setErrorMessage('');
    const result = await login({ email, password });

    if (result.success) {
      navigate(result.needsOnboarding ? '/onboarding' : '/dashboard');
      return;
    }

    setErrorMessage(result.error?.message || 'Unable to sign in.');
  };

  const handleGoogleLogin = async () => {
    setErrorMessage('');
    const result = await loginWithGoogle();
    if (!result.success) setErrorMessage(result.error?.message || 'Unable to connect to Google.');
  };

  return (
    <PageWrapper className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex w-14 h-14 rounded-2xl shadow-glow mb-4 bg-primary dark:bg-primary-tint items-center justify-center">
            <img src="/logo.png?v=3" alt="Remzy" className="w-12 h-12 object-contain" />
          </Link>
          <h1 className="text-3xl font-bold text-ink">Welcome back</h1>
          <p className="text-ink-muted mt-2">Log in to your Remzy account</p>
        </div>

        <div className="bg-card rounded-3xl shadow-xl p-8 border border-ink/5">
          <div className="space-y-4 pb-5">
            <GoogleAuthButton isLoading={isOAuthLoading} onClick={handleGoogleLogin} />
            <AuthDivider />
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-ink mb-1" htmlFor="email">Email address</label>
              <div className="bg-card rounded-full shadow-soft border border-border/50 transition-shadow duration-200 focus-within:shadow-[0_0_0_2px_hsl(var(--primary)/0.25)] focus-within:border-primary/30">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent px-5 py-3.5 text-base text-ink placeholder-ink-muted focus:outline-none"
                  placeholder="you@university.edu"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1" htmlFor="password">Password</label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent px-5 py-3.5 text-base text-ink placeholder-ink-muted focus:outline-none"
                wrapperClassName="bg-card rounded-full shadow-soft border border-border/50 transition-shadow duration-200 focus-within:shadow-[0_0_0_2px_hsl(var(--primary)/0.25)] focus-within:border-primary/30"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={!isFormValid || isLoading || isOAuthLoading}
              className="w-full py-3.5 bg-primary text-white rounded-xl font-bold shadow-glow hover:bg-primary-dark transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
            </button>

            {errorMessage ? (
              <p className="text-sm text-red-600">{errorMessage}</p>
            ) : null}
          </form>

          <div className="mt-8 text-center text-sm">
            <p className="text-ink">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-semibold hover:underline">
                Register &rarr;
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
