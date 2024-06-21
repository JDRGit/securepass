"use client";

import React, { useState, useEffect, ChangeEvent } from 'react';
import { db } from '../app/firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../app/firebase';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import { useAuth } from '../context/AuthContext';

const PasswordGenerator: React.FC = () => {
  const [password, setPassword] = useState<string>('');
  const [length, setLength] = useState<number>(12);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [includeUppercase, setIncludeUppercase] = useState<boolean>(true);
  const [includeLowercase, setIncludeLowercase] = useState<boolean>(true);
  const [nickname, setNickname] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [savedPasswords, setSavedPasswords] = useState<any[]>([]);
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchSavedPasswords = async () => {
      if (user) {
        const q = query(collection(db, 'passwords'), where('uid', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const passwords = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSavedPasswords(passwords);
      }
    };

    fetchSavedPasswords();
  }, [user]);

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

  const handleSavePassword = async () => {
    if (user) {
      try {
        await addDoc(collection(db, 'passwords'), {
          uid: user.uid,
          password,
          nickname,
          createdAt: new Date()
        });
        alert('Password saved successfully!');
        setPassword('');
        setNickname('');
        // Fetch saved passwords again to update the list
        const q = query(collection(db, 'passwords'), where('uid', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const passwords = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSavedPasswords(passwords);
      } catch (error) {
        console.error('Error saving password: ', error);
      }
    } else {
      alert('You need to be logged in to save passwords.');
    }
  };

  const handleDeletePassword = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'passwords', id));
      setSavedPasswords(savedPasswords.filter(password => password.id !== id));
      alert('Password deleted successfully!');
    } catch (error) {
      console.error('Error deleting password: ', error);
    }
  };

  const handleLengthChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLength(parseInt(e.target.value));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
  };

  return (
    <div>
      <h1>Secure Password Generator</h1>
      <button onClick={logout}>Log Out</button>
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
      <div>
        <label>
          Nickname:
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </label>
      </div>
      <button onClick={generatePassword}>Generate Password</button>
      {password && (
        <div>
          <h2>Your Secure Password:</h2>
          <p>{password}</p>
          <button onClick={() => handleCopy(password)}>Copy to Clipboard</button>
          {copied && <span style={{ color: 'green' }}>Copied!</span>}
          {user && <button onClick={handleSavePassword}>Save Password</button>}
          <PasswordStrengthMeter password={password} />
        </div>
      )}

      {user && savedPasswords.length > 0 && (
        <div>
          <h2>Your Saved Passwords:</h2>
          <ul>
            {savedPasswords.map(({ id, password, nickname }) => (
              <li key={id}>
                <div>
                  <strong>{nickname || 'No Nickname'}</strong>: {password}
                </div>
                <button onClick={() => handleCopy(password)}>Copy</button>
                <button onClick={() => handleDeletePassword(id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PasswordGenerator;
