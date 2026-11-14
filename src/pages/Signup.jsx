// ==============================================================================
// SIGNUP PAGE (Beginner-Friendly React + Firebase with Email & Google Signup)
// ==============================================================================

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// 1. Import Firebase Authentication methods
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from "firebase/auth";

// 2. Import Firestore database methods to save user information
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

// 3. Import our initialized Firebase auth and db instances
import { auth, db } from "../services/firebase.js";

// 4. Import the global CSS styles
import "../App.css";

export default function Signup() {
  // ----------------------------------------------------------------------------
  // STEP 1: State Variables
  // ----------------------------------------------------------------------------
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Error and loading states
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Hook to navigate the user
  const navigate = useNavigate();

  // ----------------------------------------------------------------------------
  // STEP 2: Email & Password Signup Handler
  // ----------------------------------------------------------------------------
  async function handleSignup(event) {
    event.preventDefault();
    setError("");

    // --- Basic Validation ---
    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create account in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const user = userCredential.user;

      // 2. Save user's display name to their Firebase profile
      await updateProfile(user, {
        displayName: fullName.trim(),
      });

      // 3. Save user record in Firestore "users" collection
      if (db) {
        await setDoc(doc(db, "users", user.uid), {
          fullName: fullName.trim(),
          displayName: fullName.trim(),
          email: email.trim(),
          subscriptionPlan: "Free",
          createdAt: serverTimestamp(),
        });
      }

      // 4. Redirect to login page with a success message
      navigate("/login", {
        state: { signupSuccess: true },
        replace: true,
      });
    } catch (err) {
      console.error("Signup error:", err);

      if (err.code === "auth/email-already-in-use") {
        setError("This email is already in use. Please log in instead.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak. Please use at least 6 characters.");
      } else {
        setError(err.message || "Failed to create an account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  // ----------------------------------------------------------------------------
  // STEP 3: Google Sign-Up Handler
  // ----------------------------------------------------------------------------
  async function handleGoogleSignup() {
    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;

      // Save user details into Firestore "users" collection
      if (db) {
        await setDoc(
          doc(db, "users", googleUser.uid),
          {
            fullName: googleUser.displayName || "Google User",
            displayName: googleUser.displayName || "Google User",
            email: googleUser.email,
            subscriptionPlan: "Free",
            createdAt: serverTimestamp(),
          },
          { merge: true }
        );
      }

      // Automatically redirect to browse posts
      navigate("/browse", { replace: true });
    } catch (err) {
      console.error("Google signup error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setError("Google sign-up popup was closed before completing.");
      } else {
        setError(err.message || "Failed to sign up with Google.");
      }
    } finally {
      setLoading(false);
    }
  }

  // ----------------------------------------------------------------------------
  // STEP 4: Render UI (JSX)
  // ----------------------------------------------------------------------------
  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={handleSignup}>
        <h1>Create Account</h1>
        <p>Sign up to start sharing posts on DEV@Deakin.</p>

        {/* Display error alert if any */}
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        {/* Full Name */}
        <div>
          <label htmlFor="signup-name">Full Name</label>
          <input
            id="signup-name"
            type="text"
            placeholder="e.g. Saiyam Sharma"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="signup-email">Email Address</label>
          <input
            id="signup-email"
            type="email"
            placeholder="e.g. saiyam@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            type="password"
            placeholder="Minimum 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="signup-confirm-password">Confirm Password</label>
          <input
            id="signup-confirm-password"
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {/* Email Signup Submit Button */}
        <button type="submit" disabled={loading}>
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        {/* Divider */}
        <div className="auth-divider">
          <span>OR</span>
        </div>

        {/* Google Signup Button */}
        <button
          type="button"
          className="btn-google-auth"
          onClick={handleGoogleSignup}
          disabled={loading}
        >
          <svg
            className="google-icon"
            viewBox="0 0 24 24"
            width="18"
            height="18"
          >
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Sign up with Google
        </button>

        {/* Link to Login */}
        <p className="auth-link">
          Already have an account? <Link to="/login">Log in here</Link>
        </p>
      </form>
    </section>
  );
}
