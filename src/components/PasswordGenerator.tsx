// src/components/PasswordGenerator.tsx

"use client";

import React, { useState, ChangeEvent } from 'react';

const PasswordGenerator: React.FC = () => {
  const [password, setPassword] = useState<string>('');
  const [length, setLength] = useState<number>(12);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [includeUppercase, setIncludeUppercase] = useState<boolean>(true);
  const [includeLowercase, setIncludeLowercase] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const generatePassword = () => {
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    let characterSet = '';
    if (includeNumbers) characterSet += numbers;
    if (includeSymbols) characterSet += symbols;
    if (includeLowercase) characterSet += lowercase;
    if (includeUppercase) characterSet += uppercase;

    if (!characterSet) {
      setPassword('');
      return;
    }

    let pwd = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characterSet.length);
      pwd += characterSet[randomIndex];
    }

    setPassword(pwd);
    setCopied(false);
  };

  const handleLengthChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLength(parseInt(e.target.value));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
  };

  return (
    <div>
      <h1>Secure Password Generator</h1>
      <div>
        <label>
          Password Length:
          <input
            type="number"
            value={length}
            onChange={handleLengthChange}
            min="6"
            max="32"
          />
        </label>
      </div>
      <div>
        <label>
          Include Numbers:
          <input
            type="checkbox"
            checked={includeNumbers}
            onChange={(e) => setIncludeNumbers(e.target.checked)}
          />
        </label>
      </div>
      <div>
        <label>
          Include Symbols:
          <input
            type="checkbox"
            checked={includeSymbols}
            onChange={(e) => setIncludeSymbols(e.target.checked)}
          />
        </label>
      </div>
      <div>
        <label>
          Include Uppercase:
          <input
            type="checkbox"
            checked={includeUppercase}
            onChange={(e) => setIncludeUppercase(e.target.checked)}
          />
        </label>
      </div>
      <div>
        <label>
          Include Lowercase:
          <input
            type="checkbox"
            checked={includeLowercase}
            onChange={(e) => setIncludeLowercase(e.target.checked)}
          />
        </label>
      </div>
      <button onClick={generatePassword}>Generate Password</button>
      {password && (
        <div>
          <h2>Your Secure Password:</h2>
          <p>{password}</p>
          <button onClick={handleCopy}>Copy to Clipboard</button>
          {copied && <span style={{ color: 'green' }}>Copied!</span>}

          <h2>Password Strength Guidelines:</h2>
          <ul>
            <li>12 characters or more</li>
            <li>Contains at least one uppercase letter</li>
            <li>Contains at least one number</li>
            <li>Contains at least one symbol</li>
          </ul>

          <h2>How to Improve Your Password Strength:</h2>
          <ul>
            <li>Use a longer password</li>
            <li>Include uppercase letters</li>
            <li>Include numbers</li>
            <li>Include symbols</li>
            <li>Avoid using common words</li>
            <li>Avoid using personal information</li>
          </ul>

          <h2>Why Password Strength Matters:</h2>
          <p>
            Password strength is a measure of the effectiveness of a password in resisting guessing and brute-force attacks. In its usual form, it estimates how many trials an attacker who does not have direct access to the password would need, on average, to guess it correctly.
          </p>

          <h2>How to Create a Strong Password:</h2>
          <p>
            To create a strong password, follow these guidelines:
          </p>
          <ul>
            <li>Use a mix of uppercase and lowercase letters</li>
            <li>Include numbers and symbols</li>
            <li>Avoid using common words or phrases</li>
            <li>Avoid using personal information</li>
            <li>Use a password manager to generate and store secure passwords</li>
          </ul>

          <h2>How to Remember Your Password:</h2>
          <p>
            To remember your password, consider using a password manager. A password manager is a software application that helps you store and organize your passwords securely. It can generate strong passwords for you and store them in an encrypted database. Some popular password managers include LastPass, Dashlane, and 1Password.
          </p>

          <h2>How to Protect Your Password:</h2>
          <p>
            To protect your password, follow these guidelines:
          </p>
          <ul>
            <li>Do not share your password with anyone</li>
            <li>Do not write down your password</li>
            <li>Do not use the same password for multiple accounts</li>
            <li>Change your password regularly</li>
            <li>Use two-factor authentication for added security</li>
          </ul>

          <h2>How to Secure Your Password:</h2>
          <p>
            To secure your password, follow these guidelines:
          </p>
          <ul>
            <li>Use a strong password</li>
            <li>Use a unique password for each account</li>
            <li>Enable two-factor authentication</li>
            <li>Regularly update your password</li>
            <li>Use a password manager</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default PasswordGenerator;
