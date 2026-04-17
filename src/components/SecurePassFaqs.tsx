import { Container } from './Container'

const faqs = [
  {
    question: 'Does SecurePass require an account now?',
    answer:
      'No. This version is intentionally local-first. You can generate passwords immediately and only use a passphrase if you want to unlock the local vault.',
  },
  {
    question: 'Where are saved passwords stored?',
    answer:
      'In browser localStorage as encrypted vault entries. The app stores ciphertext, IVs, salt, and metadata, not plaintext secrets.',
  },
  {
    question: 'Why keep the vault local for an MVP?',
    answer:
      'It simplifies the trust boundary, removes backend overhead, and makes the security design easier to explain in a portfolio context.',
  },
  {
    question: 'What happens if I forget the passphrase?',
    answer:
      'There is no recovery flow in this design. The key is derived from the passphrase, so losing it means the encrypted entries cannot be decrypted.',
  },
]

export function SecurePassFaqs() {
  return (
    <section id="faqs" className="py-24 sm:py-32">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div>
            <span className="eyebrow">FAQs</span>
            <h2 className="theme-text-primary mt-6 font-display text-4xl tracking-tight sm:text-5xl">
              Common questions from both product and security angles.
            </h2>
            <p className="theme-text-muted mt-6 max-w-xl text-lg leading-8">
              This version is meant to feel like a polished product page while
              still making the implementation choices easy to talk through.
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <article key={faq.question} className="surface-card p-6">
                <h3 className="theme-text-primary text-lg font-semibold">
                  {faq.question}
                </h3>
                <p className="theme-text-muted mt-3 text-sm leading-7">
                  {faq.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
