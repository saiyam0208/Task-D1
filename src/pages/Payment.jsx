import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../components/authContext.jsx";
import { firebaseConfigured } from "../services/firebase.js";
import "./Payment.css";

export default function Payment() {
  const { user, subscriptionPlan, upgradeToPaid } = useAuth();
  const navigate = useNavigate();

  const [cardName, setCardName] = useState(user?.displayName || "");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [successNotice, setSuccessNotice] = useState("");

  useEffect(() => {
    if (user?.displayName && !cardName) {
      setCardName(user.displayName);
    }
  }, [user, cardName]);

  function handleCardNumber(value) {
    const raw = value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.replace(/(.{4})/g, "$1 ").trim();
    setCardNumber(formatted);
  }

  function handleExpiry(value) {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    setExpiry(
      digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
    );
  }

  // Quick autofill demo test card helper for testing
  function handleAutofillDemo() {
    setCardName(user?.displayName || "Saiyam Sharma");
    setCardNumber("4242 4242 4242 4242");
    setExpiry("12/28");
    setCvv("123");
    setError("");
  }

  async function handlePayment(event) {
    event.preventDefault();
    setError("");
    setSuccessNotice("");

    if (!user) {
      navigate("/login", {
        state: { redirectTo: "/payment", action: "upgrade" },
      });
      return;
    }

    const digits = cardNumber.replace(/\s/g, "");
    const [month, year] = expiry.split("/");

    if (cardName.trim().length < 2) {
      setError("Please enter the cardholder name.");
      return;
    }

    if (digits.length !== 16) {
      setError("Enter a valid 16-digit test card number (e.g. 4242 4242 4242 4242).");
      return;
    }

    if (
      !month ||
      !year ||
      Number(month) < 1 ||
      Number(month) > 12 ||
      year.length !== 2
    ) {
      setError("Enter a valid expiry date in MM/YY format.");
      return;
    }

    const currentDate = new Date();
    const expiryYear = 2000 + Number(year);

    if (
      expiryYear < currentDate.getFullYear() ||
      (expiryYear === currentDate.getFullYear() &&
        Number(month) < currentDate.getMonth() + 1)
    ) {
      setError("The card expiry date must be in the future.");
      return;
    }

    if (!/^\d{3,4}$/.test(cvv)) {
      setError("Enter a valid 3 or 4-digit test CVV code (e.g. 123).");
      return;
    }

    if (!firebaseConfigured) {
      setError("Firebase is not configured. Please check your Firebase settings.");
      return;
    }

    setBusy(true);

    try {
      // Update Cloud Firestore document users/{uid} with subscriptionPlan: "Paid"
      await upgradeToPaid({
        cardLastFour: digits.slice(-4),
        cardName: cardName.trim(),
      });

      setSuccessNotice("Success! Your subscription has been upgraded to the Paid Plan.");

      setTimeout(() => {
        navigate("/pricing", {
          replace: true,
        });
      }, 700);
    } catch (err) {
      console.error("Subscription upgrade failed:", err);
      setError(err.message || "Could not update your plan. Please check Firebase and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="payment-page">
      <div className="payment-container">
        <header className="payment-heading">
          <span className="payment-label">DEV@Deakin MEMBERSHIP UPGRADE</span>
          <h1>Payment & Subscription Upgrade</h1>
          <p>
            Upgrade your account to unlock the <strong>Paid Plan ($9.99/mo)</strong> and premium features.
          </p>
        </header>

        {/* User Authentication Status Banner */}
        {!user ? (
          <div className="payment-guest-banner" role="alert">
            <div className="guest-banner-icon">🔒</div>
            <div className="guest-banner-text">
              <h3>Login Required to Upgrade</h3>
              <p>
                You are currently viewing this form as a <strong>Guest</strong>. Only currently logged in users can upgrade to the Paid plan.
              </p>
              <div className="guest-banner-actions">
                <Link
                  to="/login"
                  state={{ redirectTo: "/payment", action: "upgrade" }}
                  className="btn-banner-login"
                >
                  Log In to Continue
                </Link>
                <Link
                  to="/signup"
                  state={{ redirectTo: "/payment", action: "upgrade" }}
                  className="btn-banner-signup"
                >
                  Create Free Account
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="payment-auth-status">
            <div className="auth-status-details">
              <span className="auth-status-badge">
                Signed In as: <strong>{user.displayName || user.email}</strong>
              </span>
              <span
                className={`plan-pill ${
                  subscriptionPlan === "Paid" ? "plan-paid" : "plan-free"
                }`}
              >
                Current Plan: {subscriptionPlan === "Paid" ? "★ Paid Member" : "Free Member"}
              </span>
            </div>
            {subscriptionPlan === "Paid" && (
              <p className="already-paid-note">
                ✓ You already have an active Paid Plan! You can update your payment details below.
              </p>
            )}
          </div>
        )}

        {/* Plan Summary Card */}
        <div className="payment-summary">
          <div>
            <span className="summary-label">Selected Membership Plan</span>
            <h2>DEV@Deakin Paid Plan</h2>
            <p>Full unlimited access to posts, 10MB image uploads, and priority author features.</p>
          </div>

          <div className="summary-price">
            <strong>$9.99</strong>
            <span>/ month</span>
          </div>
        </div>

        {/* Interactive Visual Credit Card Preview */}
        <div className="credit-card-preview-wrapper">
          <div className="credit-card-visual">
            <div className="card-top-row">
              <div className="card-chip" />
              <div className="card-contactless">
                <span>)</span>
                <span>)</span>
                <span>)</span>
              </div>
              <div className="card-brand-logo">DEV@DEAKIN</div>
            </div>

            <div className="card-number-display">
              {cardNumber || "•••• •••• •••• ••••"}
            </div>

            <div className="card-bottom-row">
              <div className="card-holder-group">
                <span className="card-field-caption">CARDHOLDER</span>
                <span className="card-holder-name">
                  {cardName ? cardName.toUpperCase() : "YOUR NAME"}
                </span>
              </div>
              <div className="card-expiry-group">
                <span className="card-field-caption">EXPIRES</span>
                <span className="card-expiry-date">{expiry || "MM/YY"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <form className="payment-form" onSubmit={handlePayment}>
          <div className="form-header-row">
            <h2>Payment Card Details</h2>
            <button
              type="button"
              className="btn-autofill-demo"
              onClick={handleAutofillDemo}
              title="Click to fill fictional test details"
            >
              ⚡ Fill Demo Test Card
            </button>
          </div>

          <p className="payment-demo-notice">
            Demo checkout for SIT313 Task. Use fictional test details. No real currency is charged.
          </p>

          {error && (
            <div className="payment-error" role="alert">
              ⚠️ {error}
            </div>
          )}

          {successNotice && (
            <div className="payment-success" role="alert">
              ✓ {successNotice}
            </div>
          )}

          <div className="payment-field">
            <label htmlFor="card-name">Cardholder Name</label>
            <input
              id="card-name"
              type="text"
              placeholder="e.g. Saiyam Sharma"
              autoComplete="off"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              required
            />
          </div>

          <div className="payment-field">
            <label htmlFor="card-number">16-Digit Card Number</label>
            <input
              id="card-number"
              type="text"
              inputMode="numeric"
              placeholder="4242 4242 4242 4242"
              autoComplete="off"
              value={cardNumber}
              onChange={(e) => handleCardNumber(e.target.value)}
              required
            />
          </div>

          <div className="payment-fields-row">
            <div className="payment-field">
              <label htmlFor="card-expiry">Expiry Date (MM/YY)</label>
              <input
                id="card-expiry"
                type="text"
                inputMode="numeric"
                placeholder="12/28"
                autoComplete="off"
                maxLength={5}
                value={expiry}
                onChange={(e) => handleExpiry(e.target.value)}
                required
              />
            </div>

            <div className="payment-field">
              <label htmlFor="card-cvv">Security Code (CVV)</label>
              <input
                id="card-cvv"
                type="password"
                inputMode="numeric"
                placeholder="123"
                autoComplete="off"
                maxLength={4}
                value={cvv}
                onChange={(e) =>
                  setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                required
              />
            </div>
          </div>

          <button
            className="payment-submit"
            type="submit"
            disabled={busy || !user}
          >
            {busy
              ? "Upgrading Plan..."
              : !user
              ? "Log In to Upgrade"
              : "Pay $9.99 & Upgrade to Paid Plan"}
          </button>
        </form>

        <div className="payment-footer-actions">
          <Link to="/pricing" className="payment-back">
            ← Back to Pricing Plans
          </Link>
        </div>
      </div>
    </main>
  );
}
