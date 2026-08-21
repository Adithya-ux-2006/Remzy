import { Link } from 'react-router-dom';

export function LegalFooter() {
  return (
    <footer className="px-6 py-8 border-t border-ink/5 text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <span className="w-5 h-5 rounded-md bg-primary dark:bg-primary-tint flex items-center justify-center shrink-0">
          <img src="/logo.png" alt="Remzy" className="w-3.5 h-3.5 object-contain" />
        </span>
        <span className="font-bold text-ink">Remzy</span>
      </div>
      <p className="text-xs text-ink-subtle mb-3">
        Educational information only. Not a substitute for professional medical advice.
      </p>
      <div className="flex items-center justify-center gap-4 text-xs text-ink-subtle">
        <Link to="/privacy" className="hover:text-ink transition-colors">Privacy Policy</Link>
        <Link to="/terms" className="hover:text-ink transition-colors">Terms of Service</Link>
      </div>
      <p className="text-xs text-ink-subtle mt-3">&copy; 2026 Remzy.</p>
    </footer>
  );
}
