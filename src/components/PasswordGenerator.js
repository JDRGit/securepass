// src/components/PasswordGenerator.js

"use client";

import React, { useState } from 'react';
import passwordGenerator from 'generate-password';

const PasswordGenerator = () => {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(12);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);

  const generatePassword = () => {
    const pwd = passwordGenerator.generate({
      length,
      numbers: includeNumbers,
      symbols: includeSymbols,
      uppercase: true,
      lowercase: true,
      excludeSimilarCharacters: true,
      strict: true,
    });
    setPassword(pwd);
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
            onChange={(e) => setLength(e.target.value)}
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
      <button onClick={generatePassword}>Generate Password</button>
      {password && (
        <div>
          <h2>Your Secure Password:</h2>
          <p>{password}</p>
        </div>
      )}
    </div>
  );
};

export default PasswordGenerator;
