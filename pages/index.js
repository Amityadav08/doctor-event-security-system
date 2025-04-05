import { useState } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [selectedZone, setSelectedZone] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleZoneSelection = (zone) => {
    setSelectedZone(zone);
    setPassword('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!selectedZone || !password) {
      setMessage('Please select a zone and enter your password.');
      return;
    }

    const res = await fetch('/api/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zone: selectedZone, password }),
    });

    const data = await res.json();
    if (res.ok) {
      window.location.href = data.url;
    } else {
      setMessage(data.error);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Doctor Zone Access</h1>
      {!selectedZone ? (
        <div className={styles.zoneOptions}>
          <button
            className={`${styles.zoneButton} ${styles.food}`}
            onClick={() => handleZoneSelection('food')}
          >
            Food Stall
          </button>
          <button
            className={`${styles.zoneButton} ${styles.conference}`}
            onClick={() => handleZoneSelection('conference')}
          >
            Conference Room
          </button>
          <button
            className={`${styles.zoneButton} ${styles.chill}`}
            onClick={() => handleZoneSelection('chill')}
          >
            Chill Space
          </button>
        </div>
      ) : (
        <div className={styles.passwordForm}>
          <p className={styles.selectedZoneText}>
            Zone Selected: <strong>{selectedZone.toUpperCase()}</strong>
          </p>
          <p className={styles.instruction}>
            Please enter your {selectedZone === 'food'
              ? 'Food Stall'
              : selectedZone === 'conference'
              ? 'Conference Room'
              : 'Chill Space'} password.
          </p>
          <form onSubmit={handleSubmit} className={styles.form}>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              className={styles.input}
              required
            />
            <button type="submit" className={styles.submitButton}>
              Submit
            </button>
          </form>
          <button
            onClick={() => setSelectedZone('')}
            className={styles.backButton}
          >
            ← Change Zone
          </button>
          {message && <p className={styles.error}>{message}</p>}
        </div>
      )}
    </div>
  );
}
