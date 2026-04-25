import React, { useState, useEffect } from 'react';
import styles from './BoothFinder.module.css';
import { fetchChecklist } from '../api';

export default function BoothFinder({ selectedState }) {
  const [epicNumber, setEpicNumber] = useState('');
  const [boothUrl, setBoothUrl] = useState('https://voters.eci.gov.in');
  
  useEffect(() => {
    if (selectedState) {
      fetchChecklist(selectedState)
        .then(response => setBoothUrl(response.boothUrl))
        .catch(error => {
          // Suppress error log or use try catch if needed, but fetchChecklist handles errors
        });
    }
  }, [selectedState]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (epicNumber.trim()) {
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
