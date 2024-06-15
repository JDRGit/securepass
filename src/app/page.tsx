import React from 'react';
import PasswordGenerator from '../components/PasswordGenerator';
import '../app/globals.css';

const Home: React.FC = () => {
  return (
    <div className="container">
      <main className="main">
        <PasswordGenerator />
      </main>
    </div>
  );
};

export default Home;


