# SecurePass

SecurePass is a Next.js + TypeScript password generator with a local encrypted vault.

## Security Model

- Password generation uses `crypto.getRandomValues` (not `Math.random`).
- Saved passwords are encrypted in-browser using Web Crypto (`PBKDF2` + `AES-GCM`).
- Vault data is stored only in local browser storage per user session identity.
- No Firestore dependency for password storage.

## Features

- Configurable password generation.
- Password strength indicator.
- Copy to clipboard.
- Local encrypted vault with lock/unlock flow.
- Encrypted vault export/import for device migration and backup.

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start dev server:

   ```bash
   npm run dev
   ```

3. Open `http://localhost:3000`.

## Notes

- Vault contents are device/browser-local and do not sync across devices.
- If you forget the vault passphrase, existing saved entries cannot be decrypted.
- Importing a backup replaces existing local vault data for that signed-in account in that browser.
