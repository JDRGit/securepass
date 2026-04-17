'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'securepass-theme-mode'
const MODES = ['light', 'dark', 'system'] as const

type ThemeMode = (typeof MODES)[number]

function isThemeMode(value: string | null): value is ThemeMode {
  return value !== null && MODES.includes(value as ThemeMode)
}

function resolveTheme(mode: ThemeMode) {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }

  return mode
}

function applyTheme(mode: ThemeMode) {
  const resolvedTheme = resolveTheme(mode)
  document.documentElement.dataset.theme = resolvedTheme
  document.documentElement.dataset.themeMode = mode
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>('system')

  useEffect(() => {
    let initialMode: ThemeMode = 'system'

    try {
      const savedMode = window.localStorage.getItem(STORAGE_KEY)
      if (isThemeMode(savedMode)) {
        initialMode = savedMode
      }
    } catch {}

    setMode(initialMode)
    applyTheme(initialMode)
  }, [])

  useEffect(() => {
    applyTheme(mode)

    try {
      window.localStorage.setItem(STORAGE_KEY, mode)
    } catch {}

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const syncSystemTheme = () => {
      if (mode === 'system') {
        applyTheme('system')
      }
    }

    mediaQuery.addEventListener('change', syncSystemTheme)

    return () => {
      mediaQuery.removeEventListener('change', syncSystemTheme)
    }
  }, [mode])

  return (
    <div
      className="theme-toggle inline-flex items-center rounded-full p-1"
      aria-label="Theme mode"
      role="group"
    >
      {MODES.map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => setMode(value)}
          data-active={mode === value}
          className="theme-toggle-button rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition"
        >
          {value}
        </button>
      ))}
    </div>
  )
}
