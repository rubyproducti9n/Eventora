import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getDatabase, Database } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCFZEcNnmf7FL1Oj_CxkalUd5yQyTQQz0",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "eventora-5a723.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://eventora-5a723-default-rtdb.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "eventora-5a723",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "eventora-5a723.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "518709192625",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:518709192625:web:e083c2537fe6851405ff90",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-B73K3RLZ06",
};

/**
 * Initializes and returns a singleton Firebase App instance (safe across hot-reloads and SSR).
 */
export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") {
    return null;
  }
  return !getApps().length ? initializeApp(firebaseConfig) : getApp();
}

/**
 * Returns Firebase Auth instance.
 */
export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseApp();
  return app ? getAuth(app) : null;
}

/**
 * Returns Firebase Realtime Database instance.
 */
export function getFirebaseDb(): Database | null {
  const app = getFirebaseApp();
  return app ? getDatabase(app) : null;
}
