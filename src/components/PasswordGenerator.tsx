'use client'

import { useEffect, useRef, useState, type ChangeEvent } from 'react'

import { Button } from './Button'
import { Container } from './Container'
import PasswordStrengthMeter from './PasswordStrengthMeter'
import {
  DEFAULT_VAULT_ID,
  addVaultEntry,
  decryptEntryPassword,
  deriveVaultKey,
  exportVaultBackup,
  getOrCreateVaultSalt,
  importVaultBackup,
  loadVaultEntries,
  removeVaultEntry,
  type VaultEntry,
} from '../context/localVault'

const MIN_PASSWORD_LENGTH = 8
const MAX_PASSWORD_LENGTH = 64
const MIN_VAULT_PASSPHRASE_LENGTH = 12

const numbers = '0123456789'
const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-='
const lowercase = 'abcdefghijklmnopqrstuvwxyz'
const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

const optionCards = [
  {
    key: 'numbers',
    title: 'Numbers',
    description: 'Layer digits into the generated set.',
  },
  {
    key: 'symbols',
    title: 'Symbols',
    description: 'Add punctuation for higher complexity.',
  },
  {
    key: 'uppercase',
    title: 'Uppercase',
    description: 'Include capital letters in the mix.',
  },
  {
    key: 'lowercase',
    title: 'Lowercase',
    description: 'Keep lowercase characters available.',
  },
] as const

const timestampFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function secureRandomIndex(maxExclusive: number) {
  if (maxExclusive <= 0) {
    throw new Error('maxExclusive must be greater than zero')
  }

  const random = new Uint8Array(1)
  const limit = Math.floor(256 / maxExclusive) * maxExclusive
  let value = 256

  while (value >= limit) {
    crypto.getRandomValues(random)
    value = random[0]
  }

  return value % maxExclusive
}

function pickRandomChar(source: string) {
  return source[secureRandomIndex(source.length)]
}

function secureShuffle(values: string[]) {
  const next = [...values]

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = secureRandomIndex(index + 1)
    const temp = next[index]
    next[index] = next[swapIndex]
    next[swapIndex] = temp
  }

  return next
}

export function PasswordGenerator() {
  const [password, setPassword] = useState('')
  const [length, setLength] = useState(18)
  const [includeNumbers, setIncludeNumbers] = useState(true)
  const [includeSymbols, setIncludeSymbols] = useState(true)
  const [includeUppercase, setIncludeUppercase] = useState(true)
  const [includeLowercase, setIncludeLowercase] = useState(true)
  const [nickname, setNickname] = useState('')
  const [vaultPassphrase, setVaultPassphrase] = useState('')
  const [vaultKey, setVaultKey] = useState<CryptoKey | null>(null)
  const [unlockingVault, setUnlockingVault] = useState(false)
  const [importingVault, setImportingVault] = useState(false)
  const [copied, setCopied] = useState(false)
  const [statusMessage, setStatusMessage] = useState(
    'Generate a password, then unlock the local vault only if you want to store it on this device.',
  )
  const [savedPasswords, setSavedPasswords] = useState<VaultEntry[]>([])
  const importFileInputRef = useRef<HTMLInputElement | null>(null)

  const hasVaultAccess = vaultKey !== null

  useEffect(() => {
    setVaultKey(null)
    setSavedPasswords([])
    setVaultPassphrase('')
    setCopied(false)
  }, [])

  const generatePassword = () => {
    const enabledSets: string[] = []

    if (includeNumbers) enabledSets.push(numbers)
    if (includeSymbols) enabledSets.push(symbols)
    if (includeLowercase) enabledSets.push(lowercase)
    if (includeUppercase) enabledSets.push(uppercase)

    if (enabledSets.length === 0) {
      setPassword('')
      setStatusMessage('Select at least one character type before generating.')
      return
    }

    if (length < enabledSets.length) {
      setStatusMessage(
        `Length must be at least ${enabledSets.length} for the selected character mix.`,
      )
      return
    }

    const combinedSet = enabledSets.join('')
    const generatedChars = enabledSets.map((set) => pickRandomChar(set))

    for (let index = generatedChars.length; index < length; index += 1) {
      generatedChars.push(pickRandomChar(combinedSet))
    }

    const nextPassword = secureShuffle(generatedChars).join('')

    setPassword(nextPassword)
    setCopied(false)
    setStatusMessage('Password generated locally with browser cryptography.')
  }

  const unlockVault = async () => {
    if (!crypto?.subtle) {
      setStatusMessage(
        'This browser does not support the Web Crypto features required for encrypted vault storage.',
      )
      return
    }

    if (vaultPassphrase.length < MIN_VAULT_PASSPHRASE_LENGTH) {
      setStatusMessage(
        `Use at least ${MIN_VAULT_PASSPHRASE_LENGTH} characters for the vault passphrase.`,
      )
      return
    }

    setUnlockingVault(true)

    try {
      const salt = getOrCreateVaultSalt(DEFAULT_VAULT_ID)
      const key = await deriveVaultKey(vaultPassphrase, salt)
      const entries = loadVaultEntries(DEFAULT_VAULT_ID)

      if (entries.length > 0) {
        await decryptEntryPassword(key, entries[0])
      }

      setVaultKey(key)
      setSavedPasswords(entries)
      setVaultPassphrase('')
      setCopied(false)
      setStatusMessage(
        'Vault unlocked. The derived key stays in browser memory until you lock the vault again.',
      )
    } catch {
      setStatusMessage(
        'Vault unlock failed. Check the passphrase and try again.',
      )
    } finally {
      setUnlockingVault(false)
    }
  }

  const lockVault = () => {
    setVaultKey(null)
    setSavedPasswords([])
    setCopied(false)
    setStatusMessage('Vault locked and in-memory entry state cleared.')
  }

  const handleSavePassword = async () => {
    if (!vaultKey) {
      setStatusMessage('Unlock the vault before trying to save a password.')
      return
    }

    if (!password) {
      setStatusMessage('Generate a password before trying to save it.')
      return
    }

    try {
      const updatedEntries = await addVaultEntry(
        DEFAULT_VAULT_ID,
        vaultKey,
        nickname,
        password,
      )

      setSavedPasswords(updatedEntries)
      setNickname('')
      setPassword('')
      setCopied(false)
      setStatusMessage('Password encrypted and saved to the local vault.')
    } catch {
      setStatusMessage('Saving failed. The vault entry was not written.')
    }
  }

  const handleDeletePassword = (id: string) => {
    if (!vaultKey) {
      setStatusMessage('Unlock the vault before deleting entries.')
      return
    }

    const updatedEntries = removeVaultEntry(DEFAULT_VAULT_ID, id)
    setSavedPasswords(updatedEntries)
    setStatusMessage('Saved vault entry deleted.')
  }

  const downloadVaultBackup = () => {
    try {
      const backupJson = exportVaultBackup(DEFAULT_VAULT_ID)
      const blob = new Blob([backupJson], { type: 'application/json' })
      const downloadUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const datePart = new Date().toISOString().slice(0, 10)

      link.href = downloadUrl
      link.download = `securepass-vault-backup-${datePart}.json`
      link.click()
      URL.revokeObjectURL(downloadUrl)

      setStatusMessage('Encrypted vault backup downloaded.')
    } catch {
      setStatusMessage('Backup export failed.')
    }
  }

  const openImportPicker = () => {
    importFileInputRef.current?.click()
  }

  const handleImportFileChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0]

    if (!selectedFile) return

    if (selectedFile.size > 5 * 1024 * 1024) {
      event.target.value = ''
      setStatusMessage('Backup file is too large. Choose a file smaller than 5 MB.')
      return
    }

    const shouldReplace = window.confirm(
      'Importing a backup replaces the current local vault in this browser. Continue?',
    )

    if (!shouldReplace) {
      event.target.value = ''
      setStatusMessage('Vault import canceled.')
      return
    }

    setImportingVault(true)

    try {
      const backupJson = await selectedFile.text()
      const importedEntries = importVaultBackup(DEFAULT_VAULT_ID, backupJson)

      setVaultKey(null)
      setSavedPasswords([])
      setVaultPassphrase('')
      setCopied(false)
      setStatusMessage(
        `Imported ${importedEntries.length} encrypted entries. Unlock the vault with the original passphrase to use them.`,
      )
    } catch {
      setStatusMessage('Vault import failed. Use a valid SecurePass backup file.')
    } finally {
      event.target.value = ''
      setImportingVault(false)
    }
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setStatusMessage(`${label} copied to the clipboard.`)
    } catch {
      setStatusMessage('Clipboard write failed. Check browser permissions.')
    }
  }

  const handleCopySavedPassword = async (entry: VaultEntry) => {
    if (!vaultKey) {
      setStatusMessage('Unlock the vault before copying saved entries.')
      return
    }

    try {
      const plaintext = await decryptEntryPassword(vaultKey, entry)
      await copyToClipboard(plaintext, 'Saved password')
    } catch {
      setStatusMessage(
        'Unable to decrypt that entry. Lock and unlock the vault with the correct passphrase.',
      )
    }
  }

  const handleLengthChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(event.target.value, 10)

    if (Number.isNaN(value)) {
      setLength(MIN_PASSWORD_LENGTH)
      return
    }

    setLength(Math.min(MAX_PASSWORD_LENGTH, Math.max(MIN_PASSWORD_LENGTH, value)))
  }

  const optionState = {
    numbers: includeNumbers,
    symbols: includeSymbols,
    uppercase: includeUppercase,
    lowercase: includeLowercase,
  }

  const toggleOption = (key: (typeof optionCards)[number]['key']) => {
    if (key === 'numbers') setIncludeNumbers((value) => !value)
    if (key === 'symbols') setIncludeSymbols((value) => !value)
    if (key === 'uppercase') setIncludeUppercase((value) => !value)
    if (key === 'lowercase') setIncludeLowercase((value) => !value)
  }

  return (
    <section id="studio" className="py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">Interactive studio</span>
          <h2 className="theme-text-primary mt-6 font-display text-4xl tracking-tight sm:text-5xl">
            Generate, encrypt, and move passwords without leaving the browser.
          </h2>
          <p className="theme-text-muted mt-6 text-lg leading-8">
            This section is the working demo. It keeps the local vault behavior
            from the original project, but presents it with a structure that is
            easier to explore and explain.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="space-y-6">
            <article className="surface-panel p-6 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="theme-accent-mint text-sm font-semibold uppercase tracking-[0.2em]">
                    Generator controls
                  </p>
                  <h3 className="theme-text-primary mt-3 text-2xl font-semibold tracking-tight">
                    Tune the password recipe
                  </h3>
                </div>
                <div className="theme-pill rounded-full px-4 py-2 text-sm">
                  Length: <span className="theme-text-primary font-semibold">{length}</span>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-[minmax(0,1fr)_7rem]">
                <label className="space-y-3">
                  <span className="theme-text-primary text-sm font-medium">
                    Password length
                  </span>
                  <input
                    type="range"
                    min={MIN_PASSWORD_LENGTH}
                    max={MAX_PASSWORD_LENGTH}
                    value={length}
                    onChange={handleLengthChange}
                    className="w-full accent-mint-300"
                  />
                </label>
                <label className="space-y-3">
                  <span className="theme-text-primary text-sm font-medium">Exact value</span>
                  <input
                    type="number"
                    min={MIN_PASSWORD_LENGTH}
                    max={MAX_PASSWORD_LENGTH}
                    value={length}
                    onChange={handleLengthChange}
                    className="theme-input w-full rounded-2xl"
                  />
                </label>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {optionCards.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => toggleOption(option.key)}
                    className={`rounded-[1.5rem] border p-4 text-left transition ${
                      optionState[option.key]
                        ? 'border-mint-300/40 bg-mint-300/10'
                        : 'theme-subcard hover:bg-[color:var(--page-nav-hover)]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="theme-text-primary font-semibold">{option.title}</p>
                      <span
                        className={`h-3 w-3 rounded-full ${
                          optionState[option.key]
                            ? 'bg-mint-300'
                            : 'bg-[color:var(--page-border)]'
                        }`}
                      />
                    </div>
                    <p className="theme-text-muted mt-2 text-sm leading-6">
                      {option.description}
                    </p>
                  </button>
                ))}
              </div>

              <label className="mt-6 block space-y-3">
                <span className="theme-text-primary text-sm font-medium">
                  Entry label for the vault
                </span>
                <input
                  type="text"
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  placeholder="Example: Personal email"
                  maxLength={80}
                  className="theme-input w-full rounded-[1.25rem]"
                />
              </label>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={generatePassword}>Generate password</Button>
                <Button
                  onClick={handleSavePassword}
                  variant="secondary"
                  disabled={!password || !hasVaultAccess}
                >
                  Save current password
                </Button>
              </div>
            </article>

            <article className="surface-panel p-6 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="theme-accent-gold text-sm font-semibold uppercase tracking-[0.2em]">
                    Local vault
                  </p>
                  <h3 className="theme-text-primary mt-3 text-2xl font-semibold tracking-tight">
                    Encrypt entries before you keep them
                  </h3>
                  <p className="theme-text-muted mt-3 text-sm leading-7">
                    Unlocking derives a key from your passphrase in browser
                    memory only. Nothing about this flow requires an account or
                    a backend session.
                  </p>
                </div>
                <div className="theme-chip rounded-full px-4 py-2 text-sm">
                  {hasVaultAccess ? 'Vault unlocked' : 'Vault locked'}
                </div>
              </div>

              <label className="mt-6 block space-y-3">
                <span className="theme-text-primary text-sm font-medium">
                  Vault passphrase
                </span>
                <input
                  type="password"
                  value={vaultPassphrase}
                  onChange={(event) => setVaultPassphrase(event.target.value)}
                  disabled={hasVaultAccess}
                  autoComplete="off"
                  placeholder="Use 12 or more characters"
                  className="theme-input w-full rounded-[1.25rem]"
                />
              </label>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  onClick={unlockVault}
                  disabled={unlockingVault || hasVaultAccess}
                >
                  {unlockingVault ? 'Unlocking…' : 'Unlock vault'}
                </Button>
                <Button
                  onClick={lockVault}
                  variant="secondary"
                  disabled={!hasVaultAccess}
                >
                  Lock vault
                </Button>
                <Button onClick={downloadVaultBackup} variant="ghost">
                  Export backup
                </Button>
                <Button
                  onClick={openImportPicker}
                  variant="ghost"
                  disabled={importingVault}
                >
                  {importingVault ? 'Importing…' : 'Import backup'}
                </Button>
              </div>

              <input
                ref={importFileInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={handleImportFileChange}
              />
            </article>

            {hasVaultAccess && savedPasswords.length > 0 && (
              <article className="surface-panel p-6 sm:p-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="theme-accent-mint text-sm font-semibold uppercase tracking-[0.2em]">
                      Saved entries
                    </p>
                    <h3 className="theme-text-primary mt-3 text-2xl font-semibold tracking-tight">
                      Vault contents
                    </h3>
                  </div>
                  <div className="theme-chip rounded-full px-4 py-2 text-sm">
                    {savedPasswords.length} entries
                  </div>
                </div>

                <ul className="mt-6 space-y-3">
                  {savedPasswords.map((entry) => (
                    <li
                      key={entry.id}
                      className="theme-subcard rounded-[1.5rem] p-4"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="theme-text-primary font-semibold">
                            {entry.nickname || 'Untitled entry'}
                          </p>
                          <p className="theme-text-muted mt-1 text-sm">
                            {timestampFormatter.format(new Date(entry.createdAt))}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <Button
                            onClick={() => handleCopySavedPassword(entry)}
                            variant="secondary"
                          >
                            Copy
                          </Button>
                          <Button
                            onClick={() => handleDeletePassword(entry.id)}
                            variant="ghost"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </article>
            )}
          </div>

          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <article className="surface-panel p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="theme-accent-gold text-sm font-semibold uppercase tracking-[0.2em]">
                    Current output
                  </p>
                  <h3 className="theme-text-primary mt-3 text-2xl font-semibold tracking-tight">
                    Active password
                  </h3>
                </div>
                {copied && (
                  <span className="rounded-full bg-[color:var(--page-accent-mint-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--page-accent-mint)]">
                    Copied
                  </span>
                )}
              </div>

              <div className="theme-code-panel mt-6 min-h-48 rounded-[1.75rem] p-5">
                {password ? (
                  <code className="theme-code-text block break-all font-mono text-lg leading-8">
                    {password}
                  </code>
                ) : (
                  <div className="theme-text-muted flex h-full items-center justify-center text-center text-sm leading-7">
                    Generate a password to preview it here before copying or
                    saving it.
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  onClick={() => copyToClipboard(password, 'Current password')}
                  disabled={!password}
                >
                  Copy password
                </Button>
                <Button
                  onClick={handleSavePassword}
                  variant="secondary"
                  disabled={!password || !hasVaultAccess}
                >
                  Save to vault
                </Button>
              </div>

              <div className="mt-6">
                <PasswordStrengthMeter password={password} />
              </div>
            </article>

            <article className="surface-card p-6">
              <p className="theme-accent-mint text-sm font-semibold uppercase tracking-[0.2em]">
                Demo notes
              </p>
              <ul className="theme-text-muted mt-4 space-y-3 text-sm leading-7">
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-mint-300" />
                  Generated passwords come from browser cryptography, not pseudo-random helpers.
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-mint-300" />
                  Stored entries are encrypted before being written to localStorage.
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-mint-300" />
                  Backup export and import move encrypted vault data between devices.
                </li>
              </ul>
            </article>

            <article className="surface-card p-6">
              <p className="theme-accent-gold text-sm font-semibold uppercase tracking-[0.2em]">
                Status
              </p>
              <p className="theme-text-muted mt-4 text-sm leading-7">
                {statusMessage}
              </p>
            </article>
          </div>
        </div>
      </Container>
    </section>
  )
}
