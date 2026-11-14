// ==============================================================================
// FIREBASE CONFIGURATION (Beginner-Friendly)
// ==============================================================================
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDcDRjTnmsSlzlTi4WyhmvjbRHNcqYtJsY",
  authDomain: "myreactfirebase-bb03e.firebaseapp.com",
  projectId: "myreactfirebase-bb03e",
  storageBucket: "myreactfirebase-bb03e.firebasestorage.app",
  messagingSenderId: "775558197276",
  appId: "1:775558197276:web:649bdf55cc79ca6f58efd9",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const firebaseConfigured = true;

export default app;
