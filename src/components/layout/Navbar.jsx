import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { ThemeToggle } from '../ui/ThemeToggle';

export function Navbar() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  return (
    <nav className="sticky top-0 z-40 h-16 bg-card backdrop-blur-md border-b border-border transition-colors duration-250">
      {isAuthenticated ? (
        <div className="h-full px-4 md:px-6 grid grid-cols-[1fr_auto_1fr] items-center">
          <div />
          <Link to="/dashboard" className="flex items-center gap-2 justify-self-center">
            <span className="w-10 h-10 rounded-xl bg-primary dark:bg-background shadow-glow flex items-center justify-center">
              <img src="/logo.png" alt="Remzy" className="w-8 h-8 object-contain" />
            </span>
            <span className="text-xl font-bold text-ink tracking-tight">Remzy</span>
          </Link>
          <div className="flex items-center justify-self-end gap-2">
            <ThemeToggle />
            <Link
              to="/profile"
              className="min-w-[44px] min-h-[44px] rounded-full bg-surface text-primary flex items-center justify-center text-sm font-semibold hover:bg-accent transition-colors p-2"
            >
              {(user?.name?.[0] || 'U').toUpperCase()}
            </Link>
          </div>
        </div>
      ) : (
        <div className="h-full max-w-5xl mx-auto px-4 md:px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 min-w-[44px] min-h-[44px] p-1.5">
            <span className="w-8 h-8 rounded-lg bg-primary dark:bg-background shadow-glow flex items-center justify-center">
              <img src="/logo.png" alt="Remzy" className="w-7 h-7 object-contain" />
            </span>
            <span className="font-bold text-xl text-ink">Remzy</span>
          </Link>
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/search"
              aria-label="Search"
              title="Search"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-ink-muted hover:text-ink hover:bg-accent transition-colors"
            >
              <Search className="w-5 h-5" />
            </Link>
            <Link to="/login" className="rounded-full border border-border px-4 py-2 text-ink text-sm font-medium hover:bg-accent transition-colors">
              Log In
            </Link>
            <Link to="/register" className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-dark transition-colors shadow-glow">
              Sign Up Free
            </Link>
          </div>
          <div className="md:hidden flex items-center gap-1.5">
            <Link
              to="/login"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center px-2 text-ink-muted hover:text-ink text-sm font-medium transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="min-h-[44px] inline-flex items-center px-4 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-dark transition-colors shadow-glow"
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
