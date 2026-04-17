import { Container } from './Container'

const highlights = [
  {
    title: 'Browser-only trust boundary',
    body: 'The active app path has no login, no cloud vault, and no server-side persistence layer. That keeps the threat boundary simple and easy to explain.',
  },
  {
    title: 'Passphrase-derived encryption',
    body: 'SecurePass derives an AES-GCM key from a passphrase using PBKDF2 with SHA-256, 310000 iterations, and a random salt.',
  },
  {
    title: 'Portable encrypted backups',
    body: 'The exported backup is encrypted vault data, not plaintext secrets. Import restores the encrypted record and still requires the original passphrase.',
  },
]

const lifecycle = [
  'Generate a password with secure browser randomness.',
  'Unlock the vault by deriving a key from the passphrase.',
  'Encrypt the entry with AES-GCM and a fresh IV.',
  'Store only ciphertext, salt, IV, and metadata in localStorage.',
]

const boundaries = {
  stored: ['Salt', 'Ciphertext', 'IV per entry', 'Entry label', 'Created timestamp'],
  omitted: ['Plaintext passphrase', 'Derived AES key', 'Plaintext vault entries', 'Remote database session'],
}

export function SecurityHighlights() {
  return (
    <section id="security" className="py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">Security story</span>
          <h2 className="theme-text-primary mt-6 font-display text-4xl tracking-tight sm:text-5xl">
            The product design and the security model now explain each other.
          </h2>
          <p className="theme-text-muted mt-6 text-lg leading-8">
            This rebuild keeps the local vault mechanics but packages them in a
            structure that is easier for technical and non-technical visitors to
            understand quickly.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {highlights.map((highlight) => (
            <article key={highlight.title} className="surface-card p-6">
              <p className="theme-accent-gold text-sm font-semibold uppercase tracking-[0.2em]">
                Highlight
              </p>
              <h3 className="theme-text-primary mt-4 text-2xl font-semibold tracking-tight">
                {highlight.title}
              </h3>
              <p className="theme-text-muted mt-3 text-sm leading-7">
                {highlight.body}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="surface-panel p-8">
            <p className="theme-accent-mint text-sm font-semibold uppercase tracking-[0.2em]">
              Entry lifecycle
            </p>
            <ol className="mt-6 space-y-4">
              {lifecycle.map((step, index) => (
                <li key={step} className="flex gap-4">
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-2xl bg-mint-300 text-sm font-semibold text-ink-950">
                    0{index + 1}
                  </span>
                  <p className="theme-text-muted pt-2 text-sm leading-7">{step}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="surface-panel p-8">
            <p className="theme-accent-gold text-sm font-semibold uppercase tracking-[0.2em]">
              Trust boundary snapshot
            </p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="theme-subcard rounded-[1.5rem] p-5">
                <h3 className="theme-text-primary text-lg font-semibold">
                  Stored in browser
                </h3>
                <ul className="theme-text-muted mt-4 space-y-3 text-sm leading-6">
                  {boundaries.stored.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-mint-300" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="theme-subcard rounded-[1.5rem] p-5">
                <h3 className="theme-text-primary text-lg font-semibold">
                  Never stored by the app
                </h3>
                <ul className="theme-text-muted mt-4 space-y-3 text-sm leading-6">
                  {boundaries.omitted.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-gold-300" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>
      </Container>
    </section>
  )
}
