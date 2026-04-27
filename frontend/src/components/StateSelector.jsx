import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './StateSelector.module.css';
import { analytics, logEvent } from '../firebase';

/** Full list of supported Indian states with their ECI codes. */
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

/**
 * StateSelector renders the landing card where users pick their Indian state
 * before accessing civic information. Fires a `page_view` analytics event on mount.
 *
 * @param {StateSelectorProps} props
 * @returns {JSX.Element}
 */
export default function StateSelector({ onStateSelect, navigateTo }) {
  const [localState, setLocalState] = useState('');

  /** Log a page_view event the first time this component renders. */
  useEffect(() => {
    logEvent(analytics, 'page_view', { page_title: 'StateSelector' });
  }, []);

  /**
   * Confirms the user's state selection and navigates to the chat view.
   * Only proceeds when a state has been chosen.
   *
   * @returns {void}
   */
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

StateSelector.propTypes = {
  /** Callback fired with the selected state code when the user clicks Get Started. */
  onStateSelect: PropTypes.func.isRequired,
  /** Callback to change the active page in the parent App component. */
  navigateTo: PropTypes.func.isRequired
};

/**
 * @typedef {Object} StateSelectorProps
 * @property {function(string): void} onStateSelect - Receives the chosen state code.
 * @property {function(string): void} navigateTo    - Navigates to the given page key.
 */
