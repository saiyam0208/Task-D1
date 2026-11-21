// ==============================================================================
// FIREBASE CONFIGURATION (Beginner-Friendly & Robust)
// ==============================================================================
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || "AIzaSyDcDRjTnmsSlzlTi4WyhmvjbRHNcqYtJsY",
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || "myreactfirebase-bb03e.firebaseapp.com",
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || "myreactfirebase-bb03e",
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || "myreactfirebase-bb03e.firebasestorage.app",
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "775558197276",
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || "1:775558197276:web:649bdf55cc79ca6f58efd9",
};

// Initialize or reuse Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const firebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

export default app;
