// Firebase initialization for VoteEasy
// Provides Google Analytics and Firebase Performance Monitoring across all components.
import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent } from 'firebase/analytics';
import { getPerformance } from 'firebase/performance';

// Firebase client config is safe to expose per Google's security model
// API key is restricted to this domain only via Firebase Console
// See: https://firebase.google.com/docs/projects/api-keys
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

// Initialize Firebase Analytics — tracks page_view, question_asked,
// checklist_viewed, and booth_finder_used events across all components.
const analytics = getAnalytics(app);

// Initialize Firebase Performance Monitoring — automatically captures
// page load metrics and supports custom traces for AI response latency.
const perf = getPerformance(app);

export { analytics, logEvent, perf };
