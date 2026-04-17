import clsx from 'clsx'

export function Logo({ className }: { className?: string }) {
  return (
    <div className={clsx('inline-flex items-center gap-3', className)}>
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mint-300 text-ink-950 shadow-lg shadow-mint-300/20">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
          <path
            fill="currentColor"
            d="M12 2 4 5.5V11c0 5.25 3.43 9.97 8 11 4.57-1.03 8-5.75 8-11V5.5L12 2Zm0 3.28 5 2.18V11c0 3.92-2.38 7.61-5 8.71-2.62-1.1-5-4.79-5-8.71V7.46l5-2.18Zm0 2.72a3 3 0 0 0-3 3v1H8v5h8v-5h-1v-1a3 3 0 0 0-3-3Zm-1 4v-1a1 1 0 1 1 2 0v1h-2Z"
          />
        </svg>
      </span>
      <div>
        <p className="theme-text-primary font-display text-xl tracking-tight">
          SecurePass
        </p>
        <p className="theme-text-muted text-xs">Client-side password vault</p>
      </div>
    </div>
  )
}
