/**
 * Firebase Configuration
 * Firestore database initialization
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration - replace with your own config
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.FIREBASE_APP_ID || '1:123456789:web:abc123'
};

// Initialize Firebase
let app;
let db;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.log('Firebase initialization failed, using mock mode:', error.message);
  // Create mock db for development
  db = {
    collection: (name) => ({
      add: async (data) => ({ id: 'mock-' + Date.now(), ...data }),
      doc: (id) => ({
        get: async () => ({ exists: false, data: () => ({}) }),
        update: async () => ({}),
        delete: async () => ({})
      }),
      where: () => ({
        orderBy: () => ({
          limit: () => ({
            offset: () => ({
              get: async () => ({ docs: [], size: 0 })
            })
          }),
          get: async () => ({ docs: [], size: 0 })
        }),
        get: async () => ({ docs: [], size: 0 })
      }),
      orderBy: () => ({
        limit: () => ({
          get: async () => ({ docs: [], size: 0 })
        }),
        get: async () => ({ docs: [], size: 0 })
      }),
      get: async () => ({ docs: [], size: 0 })
    })
  };
}

export { app, db };
export default { app, db };