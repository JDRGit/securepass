import Link from 'next/link'
import clsx from 'clsx'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

type SharedProps = {
  variant?: ButtonVariant
  className?: string
}

type LinkButtonProps = SharedProps &
  Omit<React.ComponentPropsWithoutRef<typeof Link>, 'className'> & {
    href: string
  }

type NativeButtonProps = SharedProps &
  Omit<React.ComponentPropsWithoutRef<'button'>, 'className'> & {
    href?: undefined
  }

type ButtonProps = LinkButtonProps | NativeButtonProps

const styles: Record<ButtonVariant, string> = {
  primary:
    'bg-mint-300 text-ink-950 hover:bg-mint-200 active:bg-mint-400',
  secondary:
    'bg-[color:var(--page-button-secondary-bg)] text-[color:var(--page-foreground)] ring-1 ring-inset ring-[color:var(--page-button-secondary-ring)] hover:bg-[color:var(--page-button-secondary-hover)] active:bg-[color:var(--page-button-secondary-active)]',
  ghost:
    'bg-transparent text-[color:var(--page-foreground)] hover:bg-[color:var(--page-button-ghost-hover)] active:bg-[color:var(--page-button-ghost-active)]',
}

export function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonProps) {
  const classes = clsx(
    'inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint-300 disabled:cursor-not-allowed disabled:opacity-50',
    styles[variant],
    className,
  )

  if ('href' in props && typeof props.href !== 'undefined') {
    return <Link className={classes} {...props} />
  }

  return <button className={classes} {...props} />
}
