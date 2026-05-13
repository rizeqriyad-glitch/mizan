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

const firebaseConfig = {
  apiKey: "AIzaSyBgs-w_mheV_TR3LakLFadI2Jp7WnrZz_Q",
  authDomain: "mizan-app-345ce.firebaseapp.com",
  projectId: "mizan-app-345ce",
  storageBucket: "mizan-app-345ce.firebasestorage.app",
  messagingSenderId: "393839997958",
  appId: "1:393839997958:web:62cf7444861a543fb27f87"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()

googleProvider.setCustomParameters({
  prompt: 'select_account'
})

export default app

