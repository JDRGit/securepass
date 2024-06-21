"use client";

import React from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import PasswordGenerator from '../components/PasswordGenerator';

const Home: React.FC = () => {
  return (
    <ProtectedRoute>
      <PasswordGenerator />
    </ProtectedRoute>
  );
};

export default Home;
