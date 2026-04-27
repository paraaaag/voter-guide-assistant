import React, { useState, Suspense, lazy } from 'react';
import PropTypes from 'prop-types';
import ErrorBoundary from './components/ErrorBoundary';
import styles from './App.module.css';

const StateSelector = lazy(() => import('./components/StateSelector'));
const ChatInterface = lazy(() => import('./components/ChatInterface'));
const Checklist = lazy(() => import('./components/Checklist'));
const BoothFinder = lazy(() => import('./components/BoothFinder'));

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
      <a href="#main-content" className={styles.skipLink}>Skip to main content</a>
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

      <main id="main-content" className={styles.mainContent}>
        <ErrorBoundary>
          <Suspense fallback={<div aria-live="polite">Loading...</div>}>
            {currentPage === 'home' && <StateSelector onStateSelect={setSelectedState} navigateTo={navigateTo} />}
            {currentPage === 'chat' && <ChatInterface selectedState={selectedState} />}
            {currentPage === 'checklist' && <Checklist selectedState={selectedState} />}
            {currentPage === 'booth' && <BoothFinder selectedState={selectedState} />}
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}
