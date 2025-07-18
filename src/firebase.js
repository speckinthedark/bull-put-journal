import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// YOUR FIREBASE CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyDElXKW7yR7kmgT3yExjbYjWsaaEUsfKxU",
  authDomain: "trade-journal-app-eddea.firebaseapp.com",
  projectId: "trade-journal-app-eddea",
  storageBucket: "trade-journal-app-eddea.firebasestorage.app",
  messagingSenderId: "391761585126",
  appId: "1:391761585126:web:d91e8481a13589f5d5ec27"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = firebaseConfig.appId; // Use appId from your config

export { db, auth, appId, signInAnonymously, onAuthStateChanged, signInWithCustomToken };