import React, { useState } from 'react';
import StateSelector from './components/StateSelector';
import ChatInterface from './components/ChatInterface';
import Checklist from './components/Checklist';
import BoothFinder from './components/BoothFinder';
import styles from './App.module.css';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedState, setSelectedState] = useState(null);

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
            aria-label="Navigate to Home">Home</button>
          <button 
            className={`${styles.navButton} ${currentPage === 'chat' ? styles.active : ''}`} 
            onClick={() => navigateTo('chat')}
            disabled={!selectedState}
            aria-label="Navigate to Chat">Chat</button>
          <button 
            className={`${styles.navButton} ${currentPage === 'checklist' ? styles.active : ''}`} 
            onClick={() => navigateTo('checklist')}
            disabled={!selectedState}
            aria-label="Navigate to Checklist">Checklist</button>
          <button 
            className={`${styles.navButton} ${currentPage === 'booth' ? styles.active : ''}`} 
            onClick={() => navigateTo('booth')}
            disabled={!selectedState}
            aria-label="Navigate to Booth Finder">Booth Finder</button>
        </div>
      </nav>

      <main className={styles.mainContent}>
        {currentPage === 'home' && <StateSelector onStateSelect={setSelectedState} navigateTo={navigateTo} />}
        {currentPage === 'chat' && <ChatInterface selectedState={selectedState} />}
        {currentPage === 'checklist' && <Checklist selectedState={selectedState} />}
        {currentPage === 'booth' && <BoothFinder selectedState={selectedState} />}
      </main>
    </div>
  );
}
