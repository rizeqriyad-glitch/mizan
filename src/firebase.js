// ============================================================
// MIZAN — Firebase Configuration
// ============================================================
// 1. Go to https://console.firebase.google.com
// 2. Create a new project called "mizan-app"
// 3. Enable Authentication → Google Sign-In
// 4. Enable Firestore Database
// 5. Copy your config values below
// 6. Set up Firestore security rules (see README.md)
// ============================================================

import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Firebase web config values are public client identifiers (not secrets) —
// security is enforced by Firestore rules + Auth, not by hiding these. They are
// read from Vite env vars (VITE_FIREBASE_*) so Railway/CI can inject them at
// build time, with the project's own values as a safe fallback for local dev.
const env = import.meta.env
const firebaseConfig = {
  apiKey:            env.VITE_FIREBASE_API_KEY             || "AIzaSyBgs-w_mheV_TR3LakLFadI2Jp7WnrZz_Q",
  authDomain:        env.VITE_FIREBASE_AUTH_DOMAIN         || "mizan-app-345ce.firebaseapp.com",
  projectId:         env.VITE_FIREBASE_PROJECT_ID          || "mizan-app-345ce",
  storageBucket:     env.VITE_FIREBASE_STORAGE_BUCKET      || "mizan-app-345ce.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "393839997958",
  appId:             env.VITE_FIREBASE_APP_ID              || "1:393839997958:web:62cf7444861a543fb27f87"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()

googleProvider.setCustomParameters({
  prompt: 'select_account'
})

export default app

