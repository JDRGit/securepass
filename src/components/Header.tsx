import Link from 'next/link'

import { Button } from './Button'
import { Container } from './Container'
import { Logo } from './Logo'
import { ThemeToggle } from './ThemeToggle'

const links = [
  ['Studio', '#studio'],
  ['Security', '#security'],
  ['FAQs', '#faqs'],
]

export function Header() {
  return (
    <header className="theme-header sticky top-0 z-50 border-b backdrop-blur-xl">
      <Container className="flex flex-wrap items-center justify-between gap-4 py-4">
        <Link href="/" aria-label="SecurePass home">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-2 md:flex">
          {links.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="theme-nav-link rounded-full px-4 py-2 text-sm transition"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button href="#studio" variant="secondary">
            Launch the studio
          </Button>
        </div>
      </Container>
    </header>
  )
}
