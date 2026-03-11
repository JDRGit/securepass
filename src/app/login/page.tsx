"use client";

import React from 'react';
import { auth } from '../../app/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import GoogleButton from 'react-google-button';
import { useRouter } from 'next/navigation';

const Login: React.FC = () => {
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.replace('/');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Welcome to SecurePass</h1>
        <p>Your secure password manager. Please sign in to continue.</p>
        <GoogleButton onClick={handleGoogleSignIn} />
      </div>
    </div>
  );
};

export default Login;
