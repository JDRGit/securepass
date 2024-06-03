// src/pages/index.js

import PasswordGenerator from '../components/PasswordGenerator';
import styles from './globals.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <PasswordGenerator />
      </main>
    </div>
  );
}
