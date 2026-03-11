"use client";

import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import { useAuth } from '../context/AuthContext';
import {
  VaultEntry,
  addVaultEntry,
  decryptEntryPassword,
  deriveVaultKey,
  exportVaultBackup,
  getOrCreateVaultSalt,
  importVaultBackup,
  loadVaultEntries,
  removeVaultEntry,
} from '../context/localVault';

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 64;
const MIN_VAULT_PASSPHRASE_LENGTH = 12;

const numbers = '0123456789';
const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
const lowercase = 'abcdefghijklmnopqrstuvwxyz';
const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const secureRandomIndex = (maxExclusive: number): number => {
  if (maxExclusive <= 0) {
    throw new Error('maxExclusive must be greater than zero');
  }

  const random = new Uint8Array(1);
  const limit = Math.floor(256 / maxExclusive) * maxExclusive;
  let value = 256;

  while (value >= limit) {
    crypto.getRandomValues(random);
    value = random[0];
  }

  return value % maxExclusive;
};

const pickRandomChar = (source: string): string => source[secureRandomIndex(source.length)];

const secureShuffle = (values: string[]): string[] => {
  const next = [...values];

  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = secureRandomIndex(i + 1);
    const tmp = next[i];
    next[i] = next[j];
    next[j] = tmp;
  }

  return next;
};

const timestampFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const PasswordGenerator: React.FC = () => {
  const [password, setPassword] = useState<string>('');
  const [length, setLength] = useState<number>(16);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [includeUppercase, setIncludeUppercase] = useState<boolean>(true);
  const [includeLowercase, setIncludeLowercase] = useState<boolean>(true);
  const [nickname, setNickname] = useState<string>('');
  const [vaultPassphrase, setVaultPassphrase] = useState<string>('');
  const [vaultKey, setVaultKey] = useState<CryptoKey | null>(null);
  const [unlockingVault, setUnlockingVault] = useState<boolean>(false);
  const [importingVault, setImportingVault] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [savedPasswords, setSavedPasswords] = useState<VaultEntry[]>([]);
  const { user, logout } = useAuth();
  const importFileInputRef = useRef<HTMLInputElement | null>(null);

  const hasVaultAccess = useMemo(() => !!user && !!vaultKey, [user, vaultKey]);

  useEffect(() => {
    setVaultKey(null);
    setSavedPasswords([]);
    setVaultPassphrase('');
    setCopied(false);

    if (user) {
      setStatusMessage('Unlock your local vault to save and retrieve passwords.');
      return;
    }

    setStatusMessage('');
  }, [user]);

  const generatePassword = () => {
    const enabledSets: string[] = [];

    if (includeNumbers) {
      enabledSets.push(numbers);
    }

    if (includeSymbols) {
      enabledSets.push(symbols);
    }

    if (includeLowercase) {
      enabledSets.push(lowercase);
    }

    if (includeUppercase) {
      enabledSets.push(uppercase);
    }

    if (enabledSets.length === 0) {
      setPassword('');
      setStatusMessage('Select at least one character type.');
      return;
    }

    if (length < enabledSets.length) {
      setStatusMessage(`Length must be at least ${enabledSets.length} for selected character types.`);
      return;
    }

    const combinedSet = enabledSets.join('');
    const generatedChars = enabledSets.map((set) => pickRandomChar(set));

    for (let i = generatedChars.length; i < length; i += 1) {
      generatedChars.push(pickRandomChar(combinedSet));
    }

    const nextPassword = secureShuffle(generatedChars).join('');
    setPassword(nextPassword);
    setCopied(false);
    setStatusMessage('Generated a new password.');
  };

  const unlockVault = async () => {
    if (!user) {
      setStatusMessage('Sign in before unlocking your vault.');
      return;
    }

    if (!crypto?.subtle) {
      setStatusMessage('This browser does not support Web Crypto required for encrypted storage.');
      return;
    }

    if (vaultPassphrase.length < MIN_VAULT_PASSPHRASE_LENGTH) {
      setStatusMessage(`Use at least ${MIN_VAULT_PASSPHRASE_LENGTH} characters for the vault passphrase.`);
      return;
    }

    setUnlockingVault(true);

    try {
      const salt = getOrCreateVaultSalt(user.uid);
      const key = await deriveVaultKey(vaultPassphrase, salt);
      const entries = loadVaultEntries(user.uid);

      if (entries.length > 0) {
        await decryptEntryPassword(key, entries[0]);
      }

      setVaultKey(key);
      setSavedPasswords(entries);
      setVaultPassphrase('');
      setStatusMessage('Vault unlocked. Data stays local to this browser.');
      setCopied(false);
    } catch {
      setStatusMessage('Failed to unlock vault. Check your passphrase.');
    } finally {
      setUnlockingVault(false);
    }
  };

  const lockVault = () => {
    setVaultKey(null);
    setSavedPasswords([]);
    setCopied(false);
    setStatusMessage('Vault locked.');
  };

  const handleSavePassword = async () => {
    if (!user || !vaultKey) {
      setStatusMessage('Unlock your vault before saving passwords.');
      return;
    }

    if (!password) {
      setStatusMessage('Generate a password before saving.');
      return;
    }

    try {
      const updatedEntries = await addVaultEntry(user.uid, vaultKey, nickname, password);
      setSavedPasswords(updatedEntries);
      setNickname('');
      setPassword('');
      setCopied(false);
      setStatusMessage('Password saved to local encrypted vault.');
    } catch {
      setStatusMessage('Failed to save password in local vault.');
    }
  };

  const handleDeletePassword = (id: string) => {
    if (!user || !vaultKey) {
      setStatusMessage('Unlock your vault before deleting passwords.');
      return;
    }

    const updatedEntries = removeVaultEntry(user.uid, id);
    setSavedPasswords(updatedEntries);
    setStatusMessage('Saved password deleted.');
  };

  const downloadVaultBackup = () => {
    if (!user) {
      setStatusMessage('Sign in before exporting a vault backup.');
      return;
    }

    try {
      const backupJson = exportVaultBackup(user.uid);
      const blob = new Blob([backupJson], { type: 'application/json' });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const datePart = new Date().toISOString().slice(0, 10);
      link.href = downloadUrl;
      link.download = `securepass-vault-backup-${datePart}.json`;
      link.click();
      URL.revokeObjectURL(downloadUrl);
      setStatusMessage('Encrypted vault backup downloaded.');
    } catch {
      setStatusMessage('Failed to export vault backup.');
    }
  };

  const openImportPicker = () => {
    importFileInputRef.current?.click();
  };

  const handleImportFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      setStatusMessage('Sign in before importing a vault backup.');
      return;
    }

    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      e.target.value = '';
      setStatusMessage('Backup file is too large. Choose a file smaller than 5 MB.');
      return;
    }

    const shouldReplace = window.confirm(
      'Importing a backup replaces your local vault data for this account in this browser. Continue?'
    );

    if (!shouldReplace) {
      e.target.value = '';
      setStatusMessage('Vault import canceled.');
      return;
    }

    setImportingVault(true);

    try {
      const backupJson = await selectedFile.text();
      const importedEntries = importVaultBackup(user.uid, backupJson);

      setVaultKey(null);
      setSavedPasswords([]);
      setVaultPassphrase('');
      setCopied(false);
      setStatusMessage(
        `Imported ${importedEntries.length} encrypted entries. Unlock your vault using the backup passphrase.`
      );
    } catch {
      setStatusMessage('Vault import failed. Use a valid SecurePass backup file.');
    } finally {
      e.target.value = '';
      setImportingVault(false);
    }
  };

  const copyToClipboard = async (text: string, sourceLabel: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setStatusMessage(`${sourceLabel} copied to clipboard.`);
    } catch {
      setStatusMessage('Clipboard write failed. Check browser permissions.');
    }
  };

  const handleCopySavedPassword = async (entry: VaultEntry) => {
    if (!vaultKey) {
      setStatusMessage('Unlock vault to copy saved passwords.');
      return;
    }

    try {
      const plaintext = await decryptEntryPassword(vaultKey, entry);
      await copyToClipboard(plaintext, 'Saved password');
    } catch {
      setStatusMessage('Unable to decrypt this entry. Re-lock and unlock vault with the correct passphrase.');
    }
  };

  const handleLengthChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value, 10);

    if (Number.isNaN(value)) {
      setLength(MIN_PASSWORD_LENGTH);
      return;
    }

    setLength(Math.min(MAX_PASSWORD_LENGTH, Math.max(MIN_PASSWORD_LENGTH, value)));
  };

  return (
    <div className="container">
      <main className="main">
        <h1>Secure Password Generator</h1>
        <button onClick={logout}>Log Out</button>

        {user && (
          <section>
            <h2>Local Encrypted Vault</h2>
            <p>Passwords are encrypted and stored only in this browser.</p>
            <label>
              Vault Passphrase:
              <input
                type="password"
                value={vaultPassphrase}
                onChange={(e) => setVaultPassphrase(e.target.value)}
                disabled={hasVaultAccess}
                autoComplete="off"
              />
            </label>
            <button onClick={unlockVault} disabled={unlockingVault || hasVaultAccess}>
              {unlockingVault ? 'Unlocking...' : 'Unlock Vault'}
            </button>
            <button onClick={lockVault} disabled={!hasVaultAccess}>
              Lock Vault
            </button>
            <button onClick={downloadVaultBackup} disabled={!user}>
              Export Vault Backup
            </button>
            <button onClick={openImportPicker} disabled={!user || importingVault}>
              {importingVault ? 'Importing...' : 'Import Vault Backup'}
            </button>
            <input
              ref={importFileInputRef}
              type="file"
              accept="application/json"
              style={{ display: 'none' }}
              onChange={handleImportFileChange}
            />
          </section>
        )}

        <section>
          <label>
            Password Length:
            <input type="number" value={length} onChange={handleLengthChange} min={MIN_PASSWORD_LENGTH} max={MAX_PASSWORD_LENGTH} />
          </label>
          <label>
            Include Numbers:
            <input type="checkbox" checked={includeNumbers} onChange={(e) => setIncludeNumbers(e.target.checked)} />
          </label>
          <label>
            Include Symbols:
            <input type="checkbox" checked={includeSymbols} onChange={(e) => setIncludeSymbols(e.target.checked)} />
          </label>
          <label>
            Include Uppercase:
            <input type="checkbox" checked={includeUppercase} onChange={(e) => setIncludeUppercase(e.target.checked)} />
          </label>
          <label>
            Include Lowercase:
            <input type="checkbox" checked={includeLowercase} onChange={(e) => setIncludeLowercase(e.target.checked)} />
          </label>
          <label>
            Nickname:
            <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={80} />
          </label>
          <button onClick={generatePassword}>Generate Password</button>
        </section>

        {password && (
          <section>
            <h2>Your Secure Password</h2>
            <p>{password}</p>
            <button onClick={() => copyToClipboard(password, 'Generated password')}>Copy to Clipboard</button>
            {hasVaultAccess && <button onClick={handleSavePassword}>Save to Vault</button>}
            {copied && <span style={{ color: 'green' }}>Copied</span>}
            <PasswordStrengthMeter password={password} />
          </section>
        )}

        {hasVaultAccess && savedPasswords.length > 0 && (
          <section>
            <h2>Saved Passwords</h2>
            <ul>
              {savedPasswords.map((entry) => (
                <li key={entry.id}>
                  <div>
                    <strong>{entry.nickname || 'No Nickname'}</strong>
                    <p>{timestampFormatter.format(new Date(entry.createdAt))}</p>
                  </div>
                  <div>
                    <button onClick={() => handleCopySavedPassword(entry)}>Copy</button>
                    <button onClick={() => handleDeletePassword(entry.id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {hasVaultAccess && savedPasswords.length === 0 && <p>No saved passwords in this local vault yet.</p>}

        {statusMessage && <p>{statusMessage}</p>}
      </main>
    </div>
  );
};

export default PasswordGenerator;
