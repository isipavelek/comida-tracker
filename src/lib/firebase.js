import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

const hasFirebaseConfig = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

let app, auth, db, storage;

if (hasFirebaseConfig) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} else {
  // Mock implementations for rapid prototyping without Firebase configured
  auth = {
    onAuthStateChanged: () => { return () => {}; },
    signInWithEmailAndPassword: async () => ({ user: {} }),
    createUserWithEmailAndPassword: async () => ({ user: {} }),
    signOut: async () => {}
  };
  db = {};
  storage = {};
}

export { auth, db, storage, hasFirebaseConfig };
