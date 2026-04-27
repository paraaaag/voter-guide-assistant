import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './Checklist.module.css';
import { fetchChecklist } from '../api';
import { analytics, logEvent } from '../firebase';

/**
 * Checklist fetches and displays the state-specific voting document requirements
 * from the `/checklist/:stateCode` endpoint. Each document is rendered as a
 * toggleable checkbox. Fires a `checklist_viewed` analytics event on successful load.
 *
 * @param {ChecklistProps} props
 * @returns {JSX.Element}
 */
export default function Checklist({ selectedState }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shareText, setShareText] = useState('Share');

  /** Fetch checklist data whenever the selected state changes. */
  useEffect(() => {
    if (!selectedState) return;

    setIsLoading(true);
    fetchChecklist(selectedState)
      .then(response => {
        setData(response);
        setError(null);
        logEvent(analytics, 'checklist_viewed', { state: selectedState });
      })
      .catch(error => setError(error.message))
      .finally(() => setIsLoading(false));
  }, [selectedState]);

  /**
   * Shares the checklist via the Web Share API if available,
   * otherwise copies a plain-text version to the clipboard.
   *
   * @returns {Promise<void>}
   */
  const handleShare = async () => {
    if (!data) return;

    const textToShare =
      `Voting Documents for ${data.state}:\n` +
      data.documents.map(documentItem => `- ${documentItem}`).join('\n') +
      `\nHelpline: ${data.helpline}\nMore info: ${data.boothUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: `Voter Guide - ${data.state}`, text: textToShare });
      } catch (shareError) {
        // User cancelled share sheet — no action needed
      }
    } else {
      try {
        await navigator.clipboard.writeText(textToShare);
        setShareText('Copied!');
        setTimeout(() => setShareText('Share'), 2000);
      } catch (clipboardError) {
        // Clipboard write failed silently
      }
    }
  };

  if (!selectedState) {
    return (
      <div className={styles.card}>
        <p className={styles.emptyState}>Please select a state on the Home screen first.</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className={styles.card}><p>Loading checklist...</p></div>;
  }

  if (error) {
    return <div className={styles.card}><p className={styles.errorText}>{error}</p></div>;
  }

  if (!data) return null;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>Required Documents for {data.state}</h2>
        <button
          className={styles.secondaryButton}
          onClick={handleShare}
          aria-label="Share checklist"
        >
          {shareText}
        </button>
      </div>

      <p className={styles.description}>
        Please bring AT LEAST ONE of the following original documents to the polling booth to cast your vote.
      </p>

      <div className={styles.listContainer}>
        {data.documents.map((documentItem, index) => (
          <label key={index} className={styles.checkboxRow}>
            <input type="checkbox" className={styles.nativeCheckbox} />
            <span className={styles.customCheckbox}></span>
            <span className={styles.docText}>{documentItem}</span>
          </label>
        ))}
      </div>

      <div className={styles.footer}>
        <p><strong>State Helpline:</strong> <a href={`tel:${data.helpline}`} className={styles.link}>{data.helpline}</a></p>
      </div>
    </div>
  );
}

Checklist.propTypes = {
  /** The two-letter ECI state code used to fetch the correct checklist. */
  selectedState: PropTypes.string
};

Checklist.defaultProps = {
  selectedState: null
};

/**
 * @typedef {Object} ChecklistProps
 * @property {string|null} selectedState - Active state code, or null before selection.
 */
