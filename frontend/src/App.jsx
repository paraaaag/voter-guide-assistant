import React, { useState } from 'react';
import PropTypes from 'prop-types';
import StateSelector from './components/StateSelector';
import ChatInterface from './components/ChatInterface';
import Checklist from './components/Checklist';
import BoothFinder from './components/BoothFinder';
import ErrorBoundary from './components/ErrorBoundary';
import styles from './App.module.css';

/**
 * Root application component for VoteEasy.
 * Manages the active page and the user's selected Indian state.
 * Wraps every page in an {@link ErrorBoundary} to prevent uncaught errors
 * from crashing the entire UI.
 *
 * @returns {JSX.Element}
 */
export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedState, setSelectedState] = useState(null);

  /**
   * Updates the currently active page in the single-page navigation system.
   *
   * @param {string} page - The page key to navigate to ('home' | 'chat' | 'checklist' | 'booth').
   * @returns {void}
   */
  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className={styles.appContainer}>
      <nav className={styles.navBar}>
        <div className={styles.navLogo}>VoteEasy</div>
        <div className={styles.navLinks}>
          <button
            className={`${styles.navButton} ${currentPage === 'home' ? styles.active : ''}`}
            onClick={() => navigateTo('home')}
            aria-label="Navigate to Home"
          >Home</button>
          <button
            className={`${styles.navButton} ${currentPage === 'chat' ? styles.active : ''}`}
            onClick={() => navigateTo('chat')}
            disabled={!selectedState}
            aria-label="Navigate to Chat"
          >Chat</button>
          <button
            className={`${styles.navButton} ${currentPage === 'checklist' ? styles.active : ''}`}
            onClick={() => navigateTo('checklist')}
            disabled={!selectedState}
            aria-label="Navigate to Checklist"
          >Checklist</button>
          <button
            className={`${styles.navButton} ${currentPage === 'booth' ? styles.active : ''}`}
            onClick={() => navigateTo('booth')}
            disabled={!selectedState}
            aria-label="Navigate to Booth Finder"
          >Booth Finder</button>
        </div>
      </nav>

      <main className={styles.mainContent}>
        <ErrorBoundary>
          {currentPage === 'home' && <StateSelector onStateSelect={setSelectedState} navigateTo={navigateTo} />}
          {currentPage === 'chat' && <ChatInterface selectedState={selectedState} />}
          {currentPage === 'checklist' && <Checklist selectedState={selectedState} />}
          {currentPage === 'booth' && <BoothFinder selectedState={selectedState} />}
        </ErrorBoundary>
      </main>
    </div>
  );
}
