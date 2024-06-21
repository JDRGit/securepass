"use client";

import { AuthProvider } from '../context/AuthContext';
import '../app/globals.css';

const RootLayout = ({ children }: { children: React.ReactNode }) => {
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
