import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

// Debug: Log all env variables and check for Firebase-specific ones
// console.log('All Vite Env Variables:', import.meta.env);
// console.log('Firebase-Specific Env Variables:', {
//   apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//   authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
//   databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
//   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
//   storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
//   appId: import.meta.env.VITE_FIREBASE_APP_ID
// });

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};


// Validate required fields
if (!firebaseConfig.apiKey || !firebaseConfig.databaseURL || !firebaseConfig.projectId) {
  console.error('Missing required Firebase config fields:', {
    apiKey: !!firebaseConfig.apiKey,
    databaseURL: !!firebaseConfig.databaseURL,
    projectId: !!firebaseConfig.projectId
  });
  throw new Error('Firebase configuration is incomplete. Check your .env file.');
}

try {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  } else {
    firebase.app();
  }
} catch (error) {
  console.error('Firebase Initialization Failed:', error);
}

const database = firebase.database();
const ServerValue = firebase.database.ServerValue;

export { database, ServerValue };