"use client";

import { ReactNode } from 'react';
import { AuthProvider } from '../context/AuthContext';
import '../app/globals.css';

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <AuthProvider>
      <html lang="en">
        <body>
          {children}
        </body>
      </html>
    </AuthProvider>
  );
};

export default RootLayout;
