// ==============================================================================
// FIREBASE CONFIGURATION (Beginner-Friendly)
// ==============================================================================
// 1. Import initializeApp from Firebase to connect our app to the Firebase project.
import { initializeApp } from "firebase/app";

// 2. Import Authentication and Firestore services from Firebase SDK.
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 3. Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDcDRjTnmsSlzlTi4WyhmvjbRHNcqYtJsY",
  authDomain: "myreactfirebase-bb03e.firebaseapp.com",
  projectId: "myreactfirebase-bb03e",
  storageBucket: "myreactfirebase-bb03e.firebasestorage.app",
  messagingSenderId: "775558197276",
  appId: "1:775558197276:web:649bdf55cc79ca6f58efd9",
};

// 4. Initialize Firebase with the configuration
const app = initializeApp(firebaseConfig);

// 5. Export Firebase Auth and Firestore Database so other pages can use them easily
export const auth = getAuth(app);
export const db = getFirestore(app);
export const firebaseConfigured = true;

// Default export of the initialized app
export default app;
