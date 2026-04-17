import clsx from 'clsx'

interface PasswordStrengthMeterProps {
  password: string
}

const ratings = [
  {
    label: 'Very weak',
    color:
      'bg-[color:var(--page-rating-very-weak-bg)] text-[color:var(--page-rating-very-weak-text)]',
  },
  {
    label: 'Weak',
    color:
      'bg-[color:var(--page-rating-weak-bg)] text-[color:var(--page-rating-weak-text)]',
  },
  {
    label: 'Fair',
    color:
      'bg-[color:var(--page-rating-fair-bg)] text-[color:var(--page-rating-fair-text)]',
  },
  {
    label: 'Good',
    color:
      'bg-[color:var(--page-rating-good-bg)] text-[color:var(--page-rating-good-text)]',
  },
  {
    label: 'Strong',
    color:
      'bg-[color:var(--page-rating-strong-bg)] text-[color:var(--page-rating-strong-text)]',
  },
]

function getPasswordStrength(password: string) {
  let strength = 0

  if (password.length > 8) strength += 1
  if (password.length > 12) strength += 1
  if (/[A-Z]/.test(password)) strength += 1
  if (/[0-9]/.test(password)) strength += 1
  if (/[^A-Za-z0-9]/.test(password)) strength += 1

  return strength
}

export default function PasswordStrengthMeter({
  password,
}: PasswordStrengthMeterProps) {
  const hasPassword = password.length > 0
  const rawStrength = getPasswordStrength(password)
  const visibleStrength = hasPassword
    ? Math.min(Math.max(rawStrength, 1), ratings.length)
    : 0
  const rating = hasPassword
    ? ratings[visibleStrength - 1]
    : {
        label: 'Waiting',
        color:
          'bg-[color:var(--page-surface-soft)] text-[color:var(--page-muted)]',
      }

  return (
    <div className="theme-subcard rounded-[1.5rem] p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="theme-text-primary text-sm font-medium">Password strength</p>
          <p className="theme-text-muted mt-1 text-sm">
            Heuristic signal for usability, not a formal entropy model.
          </p>
        </div>
        <span
          className={clsx(
            'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]',
            rating.color,
          )}
        >
          {rating.label}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-5 gap-2">
        {ratings.map((_, index) => (
          <div
            key={index}
            className={clsx(
              'h-2 rounded-full',
              index < visibleStrength ? 'bg-mint-300' : 'bg-[color:var(--page-border)]',
            )}
          />
        ))}
      </div>
    </div>
  )
}
