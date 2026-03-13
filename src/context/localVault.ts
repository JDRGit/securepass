export interface VaultEntry {
  id: string;
  nickname: string;
  ciphertext: string;
  iv: string;
  createdAt: number;
}

interface VaultRecord {
  version: 1;
  salt: string;
  entries: VaultEntry[];
}

interface VaultBackup {
  app: 'SecurePass';
  version: 1;
  exportedAt: string;
  salt: string;
  entries: VaultEntry[];
}

const STORAGE_PREFIX = 'securepass:vault:';
export const DEFAULT_VAULT_ID = 'default';
const KEY_DERIVATION_ITERATIONS = 310000;
const KEY_LENGTH = 256;
const SALT_BYTES = 16;
const IV_BYTES = 12;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const storageKeyForVault = (vaultId: string): string => `${STORAGE_PREFIX}${vaultId}`;

const randomBytes = (size: number): Uint8Array => {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return bytes;
};

const toBase64 = (input: ArrayBuffer | Uint8Array): string => {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  let binary = '';

  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary);
};

const fromBase64 = (value: string): Uint8Array => {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
};

const generateId = (): string => {
  if ('randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return toBase64(randomBytes(16));
};

const parseVaultRecord = (raw: string | null): VaultRecord | null => {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<VaultRecord>;

    if (parsed.version !== 1 || typeof parsed.salt !== 'string' || !Array.isArray(parsed.entries)) {
      return null;
    }

    const entries: VaultEntry[] = parsed.entries.filter((entry) => {
      const candidate = entry as Partial<VaultEntry>;
      return (
        typeof candidate.id === 'string' &&
        typeof candidate.nickname === 'string' &&
        typeof candidate.ciphertext === 'string' &&
        typeof candidate.iv === 'string' &&
        typeof candidate.createdAt === 'number'
      );
    }) as VaultEntry[];

    return {
      version: 1,
      salt: parsed.salt,
      entries,
    };
  } catch {
    return null;
  }
};

const writeVaultRecord = (vaultId: string, record: VaultRecord): void => {
  localStorage.setItem(storageKeyForVault(vaultId), JSON.stringify(record));
};

export const loadVaultEntries = (vaultId: string): VaultEntry[] => {
  const record = parseVaultRecord(localStorage.getItem(storageKeyForVault(vaultId)));
  return record ? [...record.entries].sort((a, b) => b.createdAt - a.createdAt) : [];
};

export const getOrCreateVaultSalt = (vaultId: string): string => {
  const current = parseVaultRecord(localStorage.getItem(storageKeyForVault(vaultId)));

  if (current) {
    return current.salt;
  }

  const salt = toBase64(randomBytes(SALT_BYTES));
  const initial: VaultRecord = {
    version: 1,
    salt,
    entries: [],
  };

  writeVaultRecord(vaultId, initial);
  return salt;
};

export const deriveVaultKey = async (passphrase: string, saltBase64: string): Promise<CryptoKey> => {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: fromBase64(saltBase64),
      iterations: KEY_DERIVATION_ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    {
      name: 'AES-GCM',
      length: KEY_LENGTH,
    },
    false,
    ['encrypt', 'decrypt']
  );
};

const readVaultRecord = (vaultId: string): VaultRecord => {
  const raw = localStorage.getItem(storageKeyForVault(vaultId));
  const record = parseVaultRecord(raw);

  if (record) {
    return record;
  }

  const fresh: VaultRecord = {
    version: 1,
    salt: toBase64(randomBytes(SALT_BYTES)),
    entries: [],
  };

  writeVaultRecord(vaultId, fresh);
  return fresh;
};

const encryptText = async (key: CryptoKey, plaintext: string): Promise<{ ciphertext: string; iv: string }> => {
  const iv = randomBytes(IV_BYTES);
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    encoder.encode(plaintext)
  );

  return {
    ciphertext: toBase64(encrypted),
    iv: toBase64(iv),
  };
};

export const decryptEntryPassword = async (key: CryptoKey, entry: VaultEntry): Promise<string> => {
  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: fromBase64(entry.iv),
    },
    key,
    fromBase64(entry.ciphertext)
  );

  return decoder.decode(decrypted);
};

export const addVaultEntry = async (
  vaultId: string,
  key: CryptoKey,
  nickname: string,
  plaintextPassword: string
): Promise<VaultEntry[]> => {
  const record = readVaultRecord(vaultId);
  const encrypted = await encryptText(key, plaintextPassword);

  const nextEntry: VaultEntry = {
    id: generateId(),
    nickname: nickname.trim(),
    ciphertext: encrypted.ciphertext,
    iv: encrypted.iv,
    createdAt: Date.now(),
  };

  const nextRecord: VaultRecord = {
    ...record,
    entries: [nextEntry, ...record.entries],
  };

  writeVaultRecord(vaultId, nextRecord);
  return [...nextRecord.entries];
};

export const removeVaultEntry = (vaultId: string, entryId: string): VaultEntry[] => {
  const record = readVaultRecord(vaultId);
  const nextEntries = record.entries.filter((entry) => entry.id !== entryId);

  writeVaultRecord(vaultId, {
    ...record,
    entries: nextEntries,
  });

  return [...nextEntries];
};

export const exportVaultBackup = (vaultId: string): string => {
  const record = readVaultRecord(vaultId);
  const backup: VaultBackup = {
    app: 'SecurePass',
    version: 1,
    exportedAt: new Date().toISOString(),
    salt: record.salt,
    entries: [...record.entries],
  };

  return JSON.stringify(backup, null, 2);
};

export const importVaultBackup = (vaultId: string, backupJson: string): VaultEntry[] => {
  const record = parseVaultRecord(backupJson);

  if (!record) {
    throw new Error('Invalid backup format');
  }

  const nextRecord: VaultRecord = {
    version: 1,
    salt: record.salt,
    entries: [...record.entries].sort((a, b) => b.createdAt - a.createdAt),
  };

  writeVaultRecord(vaultId, nextRecord);
  return [...nextRecord.entries];
};
