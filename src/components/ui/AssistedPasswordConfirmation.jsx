import { motion, useReducedMotion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { PasswordInput } from './PasswordInput';
import { cn } from '../../utils/cn';

export function AssistedPasswordConfirmation({
  password,
  value,
  onChange,
  className,
  ...props
}) {
  const reduceMotion = useReducedMotion();
  const hasConfirmation = value.length > 0;
  const passwordsMatch = hasConfirmation && password === value;
  const hasMismatch = hasConfirmation && password !== value;
  const statusId = props['aria-describedby'];

  const handleChange = (event) => {
    if (!reduceMotion && password && event.target.value.length > password.length) {
      event.currentTarget.closest('[data-confirm-password]')?.animate(
        [
          { transform: 'translateX(0)' },
          { transform: 'translateX(-5px)' },
          { transform: 'translateX(5px)' },
          { transform: 'translateX(0)' },
        ],
        { duration: 220 },
      );
    }

    onChange(event);
  };

  return (
    <div className={cn('space-y-2', className)} data-confirm-password>
      {password ? (
        <div
          className="flex min-h-10 w-full items-center overflow-x-auto rounded-xl border border-border/70 bg-surface/60 px-3 py-2"
          aria-hidden="true"
        >
          <div className="flex min-w-fit gap-1">
            {password.split('').map((letter, index) => {
              const confirmedLetter = value[index];
              const matches = confirmedLetter === letter;

              return (
                <motion.span
                  key={index}
                  initial={false}
                  animate={reduceMotion ? undefined : { scale: confirmedLetter ? [1, 1.08, 1] : 1 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs transition-colors',
                    !confirmedLetter && 'border-border/60 bg-card text-ink-muted',
                    confirmedLetter && matches && 'border-success/30 bg-success/10 text-success',
                    confirmedLetter && !matches && 'border-danger/30 bg-danger/10 text-danger',
                  )}
                >
                  {confirmedLetter ? (matches ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />) : '•'}
                </motion.span>
              );
            })}
          </div>
        </div>
      ) : null}

      <motion.div
        initial={false}
        animate={reduceMotion || !passwordsMatch ? undefined : { scale: [1, 1.01, 1] }}
        transition={{ duration: 0.25 }}
      >
        <PasswordInput
          {...props}
          value={value}
          onChange={handleChange}
          aria-invalid={hasMismatch}
          className={cn(
            'w-full px-4 py-3 border rounded-xl bg-card text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all',
            hasMismatch && 'border-danger/50 focus:border-danger',
            passwordsMatch && 'border-success/60 focus:border-success',
            !hasConfirmation && 'border-ink/10 focus:border-primary',
          )}
        />
      </motion.div>

      <p
        id={statusId}
        className={cn(
          'min-h-5 text-xs transition-colors',
          passwordsMatch ? 'text-success' : hasMismatch ? 'text-danger' : 'text-ink-muted',
        )}
        aria-live="polite"
      >
        {passwordsMatch
          ? 'Passwords match.'
          : hasMismatch
            ? 'Keep typing—the passwords do not match yet.'
            : 'Re-enter your password to confirm it.'}
      </p>
    </div>
  );
}
