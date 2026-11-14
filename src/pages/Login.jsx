// ==============================================================================
// LOGIN PAGE (Beginner-Friendly with Email/Password & Google Login)
// ==============================================================================

import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

// 1. Import Firebase Authentication methods
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from "firebase/auth";

// 2. Import Firestore methods to record user details on login
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

// 3. Import Firebase instances from our configuration service
import { auth, db, firebaseConfigured } from "../services/firebase.js";
import { useAuth } from "../components/authContext.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Destination to redirect to after successful login
  const redirectTo = location.state?.redirectTo || "/";

  // If user is already logged in, show a welcome message with a Continue button
  if (user) {
    return (
      <section className="auth-page">
        <div className="auth-card">
          <h1>You are signed in</h1>
          <p>Welcome back, {user.displayName || user.email || "Community Member"}!</p>

          <button
            type="button"
            onClick={() =>
              navigate(redirectTo, {
                state: location.state,
                replace: true,
              })
            }
          >
            Continue
          </button>
        </div>
      </section>
    );
  }

  // ----------------------------------------------------------------------------
  // METHOD 1: Regular Email & Password Login
  // ----------------------------------------------------------------------------
  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!firebaseConfigured || !auth) {
      setError("Firebase is not configured. Please check your setup.");
      return;
    }

    setBusy(true);

    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      // Return to the previous page or home
      navigate(redirectTo, {
        state: location.state,
        replace: true,
      });
    } catch (err) {
      console.error("Login error:", err);
      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-not-found"
      ) {
        setError("Email or password is incorrect. Please try again or sign up.");
      } else {
        setError(err.message || "Unable to sign in. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  // ----------------------------------------------------------------------------
  // METHOD 2: Google Sign-In with Popup
  // ----------------------------------------------------------------------------
  async function handleGoogleSignIn() {
    setError("");
    setBusy(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;

      // Save or update user profile in Firestore database
      if (db) {
        await setDoc(
          doc(db, "users", googleUser.uid),
          {
            fullName: googleUser.displayName || "Google User",
            displayName: googleUser.displayName || "Google User",
            email: googleUser.email,
            subscriptionPlan: "Free",
            lastLogin: serverTimestamp(),
          },
          { merge: true }
        );
      }

      // Return to destination
      navigate(redirectTo, {
        state: location.state,
        replace: true,
      });
    } catch (err) {
      console.error("Google sign-in error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setError("Google sign-in popup was closed before completing.");
      } else {
        setError(err.message || "Failed to sign in with Google.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Login</h1>
        <p>Sign in to your DEV@Deakin account.</p>

        {/* Success message if redirected from Signup */}
        {location.state?.signupSuccess && (
          <p
            className="form-success"
            style={{
              color: "#166534",
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              padding: "10px",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          >
            Account created successfully! Please log in with your credentials.
          </p>
        )}

        {/* Error message */}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <div>
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {/* Email/Password Login Button */}
        <button type="submit" disabled={busy}>
          {busy ? "Signing in..." : "Login"}
        </button>

        {/* Divider */}
        <div className="auth-divider">
          <span>OR</span>
        </div>

        {/* Google Login Button */}
        <button
          type="button"
          className="btn-google-auth"
          onClick={handleGoogleSignIn}
          disabled={busy}
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
          Continue with Google
        </button>

        <p className="auth-link">
          Don't have an account? <Link to="/signup">Sign up here</Link>
        </p>
      </form>
    </section>
  );
}
