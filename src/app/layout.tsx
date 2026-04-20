import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'

import './globals.css'

const themeInitScript = `
(() => {
  const storageKey = 'securepass-theme-mode';
  const validModes = ['light', 'dark', 'system'];
  let mode = 'system';

  try {
    const savedMode = window.localStorage.getItem(storageKey);
    if (savedMode && validModes.includes(savedMode)) {
      mode = savedMode;
    }
  } catch {}

  const resolvedMode =
    mode === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : mode;

  document.documentElement.dataset.theme = resolvedMode;
  document.documentElement.dataset.themeMode = mode;
})();
`

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})


export const metadata: Metadata = {
  title: {
    default: 'SecurePass',
    template: '%s | SecurePass',
  },
  description:
    'A local-first password generator and encrypted vault rebuilt with a cleaner product structure and a stronger frontend presentation.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={manrope.variable}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
