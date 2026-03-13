# SecurePass

SecurePass is a Next.js + TypeScript password generator with a local encrypted vault. It runs entirely in the browser, requires no account, and is configured for a simple Netlify MVP deploy.

## Security Model

- Password generation uses `crypto.getRandomValues` (not `Math.random`).
- Saved passwords are encrypted in-browser using Web Crypto (`PBKDF2` + `AES-GCM`).
- Vault data is stored only in local browser storage on the current device.
- No login, Firebase, or database dependency.

## Features

- Configurable password generation.
- Password strength indicator.
- Copy to clipboard.
- Local encrypted vault with lock/unlock flow.
- Encrypted vault export/import for device migration and backup.
- Static export configuration for Netlify hosting.

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

## Netlify Deploy

- Build command: `npm run build`
- Publish directory: `out`
- The included [netlify.toml](/Users/jwho/Documents/next/securepass/netlify.toml) already matches this setup.

## Notes

- Vault contents are device/browser-local and do not sync across devices.
- If you forget the vault passphrase, existing saved entries cannot be decrypted.
- Importing a backup replaces existing local vault data in that browser.
