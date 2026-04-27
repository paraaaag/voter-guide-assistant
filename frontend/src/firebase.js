// Firebase initialization for VoteEasy
// Provides Google Analytics tracking across all components
import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyD54I4UcIB8xQ8iX2dZL8URXjtWNSHfSyY",
  authDomain: "promptwar-project.firebaseapp.com",
  projectId: "promptwar-project",
  storageBucket: "promptwar-project.appspot.com",
  messagingSenderId: "360693077440",
  appId: "promptwar-project"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase Analytics
const analytics = getAnalytics(app);

export { analytics, logEvent };
