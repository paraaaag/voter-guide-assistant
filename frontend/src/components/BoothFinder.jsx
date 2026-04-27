import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './BoothFinder.module.css';
import { fetchChecklist } from '../api';
import { analytics, logEvent } from '../firebase';

/**
 * BoothFinder lets the user enter their Voter ID (EPIC) number and redirects
 * them to the state-specific ECI booth locator page. Fires a `booth_finder_used`
 * analytics event each time the form is successfully submitted.
 *
 * @param {BoothFinderProps} props
 * @returns {JSX.Element}
 */
export default function BoothFinder({ selectedState }) {
  const [epicNumber, setEpicNumber] = useState('');
  const [boothUrl, setBoothUrl] = useState('https://voters.eci.gov.in');

  /** Load the state-specific ECI booth URL when the selected state changes. */
  useEffect(() => {
    if (selectedState) {
      fetchChecklist(selectedState)
        .then(response => setBoothUrl(response.boothUrl))
        .catch(() => {
          // Keep the default ECI URL if the request fails
        });
    }
  }, [selectedState]);

  /**
   * Validates the EPIC number, logs the analytics event, and opens the
   * ECI booth locator portal in a new tab.
   *
   * @param {React.FormEvent<HTMLFormElement>} event - The form submit event.
   * @returns {void}
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    if (epicNumber.trim()) {
      logEvent(analytics, 'booth_finder_used', { state: selectedState });
      window.open(boothUrl, '_blank');
    }
  };

  if (!selectedState) {
    return (
      <div className={styles.card}>
        <p className={styles.emptyState}>Please select a state on the Home screen first.</p>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Find Your Polling Booth</h2>
      <p className={styles.description}>
        Enter your Voter ID (EPIC) number below. You will be redirected to the official Election Commission portal to view your exact polling station details.
      </p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="epicInput" className={styles.label}>EPIC Number (Voter ID)</label>
          <input
            id="epicInput"
            type="text"
            className={styles.inputField}
            placeholder="e.g. ABC1234567"
            value={epicNumber}
            onChange={(event) => setEpicNumber(event.target.value)}
          />
        </div>

        <button
          type="submit"
          className={styles.primaryButton}
          disabled={!epicNumber.trim()}
          aria-label="Search polling booth"
        >
          Search Polling Booth
        </button>
      </form>

      <div className={styles.footer}>
        <p>Official Portal: <a href={boothUrl} target="_blank" rel="noreferrer" className={styles.link}>{boothUrl}</a></p>
      </div>
    </div>
  );
}

BoothFinder.propTypes = {
  /** The two-letter ECI state code used to load the correct booth locator URL. */
  selectedState: PropTypes.string
};

BoothFinder.defaultProps = {
  selectedState: null
};

/**
 * @typedef {Object} BoothFinderProps
 * @property {string|null} selectedState - Active state code, or null before selection.
 */
