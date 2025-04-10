import { useState } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [selectedZone, setSelectedZone] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [zoneData, setZoneData] = useState(null); // State to hold data after validation

  const handleZoneSelection = (zone) => {
    setSelectedZone(zone);
    setPassword('');
    setMessage('');
    setZoneData(null); // Clear previous data when selecting a new zone
  };

  const resetView = () => {
    setSelectedZone('');
    setPassword('');
    setMessage('');
    setZoneData(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setZoneData(null); // Clear previous data on new submission

    if (!selectedZone || !password) {
      setMessage('Please select a zone and enter your password.');
      return;
    }

    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zone: selectedZone, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // On success: Store fetched data, hide form, clear password
        setZoneData(data);
        setSelectedZone('');
        setPassword('');
      } else {
        // On error: Set message, keep form visible, DO NOT clear password
        setMessage(data.error || 'An error occurred.');
        // setPassword(''); // Keep password entered by user
      }
    } catch (error) {
      console.error("Validation error:", error);
      setMessage('Failed to validate password. Please try again.');
    }
  };

  // Determine button text based on original zone key
  const getZoneButtonText = (zoneKey) => {
    switch (zoneKey) {
      case 'food': return 'Food Stall';
      case 'conference': return 'Conference Room';
      case 'trade': return 'Trade Zone'; // Renamed from 'chill'
      default: return 'Unknown Zone';
    }
  };

  // Determine input prompt text
  const getPasswordPrompt = (zoneKey) => {
    return `Please enter your ${getZoneButtonText(zoneKey)} password.`;
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Doctor Zone Access</h1>

      {/* Show Zone Buttons if no zone selected and no data displayed */}
      {!selectedZone && !zoneData && (
        <div className={styles.zoneOptions}>
          <button
            className={`${styles.zoneButton} ${styles.food}`}
            onClick={() => handleZoneSelection('food')}
          >
            {getZoneButtonText('food')}
          </button>
          <button
            className={`${styles.zoneButton} ${styles.conference}`}
            onClick={() => handleZoneSelection('conference')}
          >
            {getZoneButtonText('conference')}
          </button>
          <button
            className={`${styles.zoneButton} ${styles.chill}`} // Keep original style class if needed
            onClick={() => handleZoneSelection('trade')} // Use 'trade' as the key
          >
            {getZoneButtonText('trade')}
          </button>
        </div>
      )}

      {/* Show Password Form if a zone is selected */}
      {selectedZone && !zoneData && (
        <div className={styles.passwordForm}>
          <p className={styles.selectedZoneText}>
            Zone Selected: <strong>{getZoneButtonText(selectedZone)}</strong>
          </p>
          <p className={styles.instruction}>
            {getPasswordPrompt(selectedZone)}
          </p>
          <form onSubmit={handleSubmit} className={styles.form}>
            <input
              type="text" // Changed from password to text
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
            onClick={resetView} // Use resetView to go back
            className={styles.backButton}
          >
            ← Change Zone
          </button>
          {message && <p className={styles.error}>{message}</p>}
        </div>
      )}

      {/* Show Zone Data if validation was successful */}
      {zoneData && (
        <div className={styles.contentDisplay}>
          {/* Display Food Zone Data */}
          {zoneData.type === 'food' && zoneData.details && (
            <div className={styles.dataCard}>
              <h2 className={styles.subHeading}>Food Zone Details</h2>
              <div className={styles.dataField}>
                <span>Registration Number:</span>
                <span>{zoneData.details.registrationNumber}</span>
              </div>
              <div className={styles.dataField}>
                <span>Doctor Name:</span>
                <span>{zoneData.details.doctorName}</span>
              </div>
            </div>
          )}

          {/* Display Trade Zone Data */}
          {zoneData.type === 'trade' && zoneData.details && (
            <div className={styles.dataCard}>
              <h2 className={styles.subHeading}>Trade Zone Details</h2>
              <div className={styles.dataField}>
                <span>Doctor Name:</span>
                <span>{zoneData.details.doctorName}</span>
              </div>
              <div className={styles.dataField}>
                <span>Mobile:</span>
                <span>{zoneData.details.mobile}</span>
              </div>
              <div className={styles.dataField}>
                <span>Place:</span>
                <span>{zoneData.details.place}</span>
              </div>
              <div className={styles.dataField}>
                <span>Email:</span>
                <span>{zoneData.details.email}</span>
              </div>
            </div>
          )}

          {/* Display Conference Zone Link */}
          {zoneData.type === 'conference' && zoneData.url && (
            <div className={styles.dataCard}>
              <h2 className={styles.subHeading}>Conference Zone</h2>
              <p>Access granted. Please find the program agenda below:</p>
              <a
                href={zoneData.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.linkButton}
              >
                View Program Agenda (PDF)
              </a>
            </div>
          )}

          {/* Fallback if data structure is unexpected */}
          {!zoneData.type && (
             <p className={styles.error}>Received unexpected data format.</p>
          )}


          <button
            onClick={resetView} // Use resetView to go back
            className={styles.backButton}
          >
            ← Back to Zones
          </button>
        </div>
      )}
    </div>
  );
}
