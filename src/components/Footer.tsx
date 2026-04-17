import { Container } from './Container'
import { Logo } from './Logo'

export function Footer() {
  return (
    <footer className="border-t border-[color:var(--page-border)] py-10">
      <Container className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <Logo className="mb-4" />
          <p className="theme-text-muted max-w-xl text-sm">
            SecurePass is a portfolio-friendly client-side security project:
            strong local password generation, encrypted browser storage, and
            portable encrypted backups.
          </p>
        </div>
        <div className="theme-text-muted text-sm">
          <p>Built for a local-first MVP.</p>
          <p>Designed to explain the product as clearly as it demonstrates it.</p>
        </div>
      </Container>
    </footer>
  )
}
