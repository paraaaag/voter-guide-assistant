import React, { useState } from 'react';
import styles from './StateSelector.module.css';

const INDIAN_STATES = [
  { code: 'AP', name: 'Andhra Pradesh' },
  { code: 'BR', name: 'Bihar' },
  { code: 'DL', name: 'Delhi' },
  { code: 'GJ', name: 'Gujarat' },
  { code: 'KA', name: 'Karnataka' },
  { code: 'MP', name: 'Madhya Pradesh' },
  { code: 'MH', name: 'Maharashtra' },
  { code: 'RJ', name: 'Rajasthan' },
  { code: 'TN', name: 'Tamil Nadu' },
  { code: 'UP', name: 'Uttar Pradesh' },
  { code: 'WB', name: 'West Bengal' }
];

export default function StateSelector({ onStateSelect, navigateTo }) {
  const [localState, setLocalState] = useState('');

  const handleStart = () => {
    if (localState) {
      onStateSelect(localState);
      navigateTo('chat');
    }
  };

  return (
    <div className={styles.card}>
      <h1 className={styles.visuallyHidden}>VoteEasy — Election Assistant</h1>
      <h2 className={styles.title}>Select Your State</h2>
      <p className={styles.description}>
        Welcome to VoteEasy. Please select your state to get localized civic and election information.
      </p>
      
      <div className={styles.formGroup}>
        <label htmlFor="stateSelect" className={styles.label}>State / Union Territory</label>
        <select 
          id="stateSelect"
          className={styles.select}
          value={localState}
          onChange={(event) => setLocalState(event.target.value)}
        >
          <option value="" disabled>Select a state...</option>
          {INDIAN_STATES.map(state => (
            <option key={state.code} value={state.code}>
              {state.name}
            </option>
          ))}
        </select>
      </div>

      <button 
        className={styles.primaryButton}
        disabled={!localState}
        onClick={handleStart}
        aria-label="Get started with selected state"
      >
        Get Started
      </button>
    </div>
  );
}
