import { Button } from './Button'
import { Container } from './Container'

const pillars = [
  {
    title: 'Generate locally',
    body: 'Passwords are created in the browser with cryptographically secure randomness.',
  },
  {
    title: 'Encrypt before storage',
    body: 'Saved entries are wrapped with AES-GCM using a key derived from your passphrase.',
  },
  {
    title: 'Move safely',
    body: 'Backup export and import carry encrypted vault data between devices.',
  },
]

export function Hero() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24 lg:py-28">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(24rem,30rem)] lg:items-center">
          <div>
            <h1 className="theme-text-primary max-w-4xl font-sans text-5xl font-semibold leading-none tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              A cleaner SecurePass built for shipping and showing your work.
            </h1>
            <p className="theme-text-muted mt-6 max-w-2xl text-lg leading-8 sm:text-xl">
              SecurePass is now structured like a polished product page with a
              live studio at the center. It still stays fully client-side, but
              the interface now explains the value and the security model more
              clearly.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href="#studio">Open the live demo</Button>
              <Button href="#security" variant="secondary">
                Explore the security model
              </Button>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {pillars.map((pillar) => (
                <div
                  key={pillar.title}
                  className="surface-card p-5"
                >
                  <p className="theme-accent-mint text-sm font-semibold">
                    {pillar.title}
                  </p>
                  <p className="theme-text-muted mt-2 text-sm leading-6">
                    {pillar.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-panel relative overflow-hidden p-6 sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,230,190,0.22),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(248,193,94,0.18),transparent_38%)]" />
            <div className="relative">
              <div className="theme-text-muted flex items-center justify-between text-xs uppercase tracking-[0.24em]">
                <span>SecurePass studio</span>
                <span>Portfolio MVP</span>
              </div>
              <div className="theme-code-panel mt-6 rounded-[1.75rem] p-5">
                <p className="theme-text-muted text-sm font-medium">Current focus</p>
                <p className="theme-text-primary mt-3 font-display text-3xl">
                  Local-first password security with a cleaner product narrative.
                </p>
                <div className="mt-6 space-y-3">
                  {[
                    'No account requirement',
                    'Encrypted vault with passphrase unlock',
                    'Exportable encrypted backups',
                    'Static deploy ready for Netlify',
                  ].map((item) => (
                    <div
                      key={item}
                      className="theme-subcard theme-text-primary flex items-center gap-3 rounded-2xl px-4 py-3 text-sm opacity-90"
                    >
                      <span className="h-2.5 w-2.5 rounded-full bg-mint-300" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
