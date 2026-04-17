import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { Hero } from '../components/Hero'
import { PasswordGenerator } from '../components/PasswordGenerator'
import { SecurePassFaqs } from '../components/SecurePassFaqs'
import { SecurityHighlights } from '../components/SecurityHighlights'

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <PasswordGenerator />
        <SecurityHighlights />
        <SecurePassFaqs />
      </main>
      <Footer />
    </>
  )
}
