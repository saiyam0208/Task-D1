import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../components/authContext.jsx";
import "./pricing.css";

export default function Pricing() {
  const { user, subscriptionPlan, upgradeToPaid, downgradeToFree } = useAuth();
  const navigate = useNavigate();

  // Modal popup state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states inside modal
  const [cardName, setCardName] = useState(user?.displayName || "");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [modalError, setModalError] = useState("");
  const [busy, setBusy] = useState(false);

  // Notification banners (success / warning / info)
  const [notification, setNotification] = useState(null);

  const freeFeatures = [
    "Access to Free community posts",
    "Publish up to 5 posts per month",
    "Image uploads up to 2 MB",
    "Standard community search & tags",
    "Basic account profile features",
  ];

  const paidFeatures = [
    "Access to ALL Free and Paid premium posts",
    "Unlimited post publishing and discussions",
    "High-resolution image uploads up to 10 MB",
    "Priority placement on post feeds",
    "Premium author badge on articles",
    "All available account and author features",
  ];

  // Helper to format credit card number with spaces
  function handleCardNumberChange(value) {
    const raw = value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.replace(/(.{4})/g, "$1 ").trim();
    setCardNumber(formatted);
  }

  // Helper to format MM/YY expiry
  function handleExpiryChange(value) {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    setExpiry(
      digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
    );
  }

  // Quick autofill demo test card helper for instant testing
  function handleAutofillDemo() {
    setCardName(user?.displayName || "Saiyam Sharma");
    setCardNumber("4242 4242 4242 4242");
    setExpiry("12/28");
    setCvv("123");
    setModalError("");
  }

  // Handle clicking the Upgrade Plan button (as per task sheet requirements)
  function handleUpgradeClick() {
    // 1. Only currently logged in users can activate the Upgrade Plan button
    if (!user) {
      setNotification({
        type: "warning",
        message: "Only currently logged in users can activate the Upgrade Plan button. Please log in first.",
      });
      return;
    }

    // 2. If the user is on a Paid plan, they cannot activate the Upgrade Plan button
    if (subscriptionPlan === "Paid") {
      setNotification({
        type: "info",
        message: "You are already subscribed to the Paid plan! Your membership is active.",
      });
      return;
    }

    // 3. If the user is on a Free plan, proceed with the Upgrade Plan modal popup
    setModalError("");
    setCardName(user.displayName || "");
    setIsModalOpen(true);
  }

  // Close modal
  function handleCloseModal() {
    setIsModalOpen(false);
    setModalError("");
  }

  // Form submission handler inside the modal
  async function handleModalSubmit(event) {
    event.preventDefault();
    setModalError("");

    if (!user) {
      setModalError("Please log in to upgrade.");
      return;
    }

    const digits = cardNumber.replace(/\s/g, "");
    const [month, year] = expiry.split("/");

    if (cardName.trim().length < 2) {
      setModalError("Please enter the name on the card.");
      return;
    }

    if (digits.length !== 16) {
      setModalError("Please enter a valid 16-digit credit card number.");
      return;
    }

    if (
      !month ||
      !year ||
      Number(month) < 1 ||
      Number(month) > 12 ||
      year.length !== 2
    ) {
      setModalError("Enter a valid expiry date in MM/YY format.");
      return;
    }

    const currentDate = new Date();
    const expiryYear = 2000 + Number(year);

    if (
      expiryYear < currentDate.getFullYear() ||
      (expiryYear === currentDate.getFullYear() &&
        Number(month) < currentDate.getMonth() + 1)
    ) {
      setModalError("The card expiry date must be in the future.");
      return;
    }

    if (!/^\d{3,4}$/.test(cvv)) {
      setModalError("Enter a valid 3 or 4-digit CVV.");
      return;
    }

    setBusy(true);

    try {
      // Upgrade user in Cloud Firestore: users/{uid}
      await upgradeToPaid({
        cardLastFour: digits.slice(-4),
        cardName: cardName.trim(),
      });

      setIsModalOpen(false);
      setNotification({
        type: "success",
        message: "🎉 Success! You have been upgraded to the Paid Plan. Your Firestore profile has been updated.",
      });
    } catch (err) {
      console.error("Upgrade error:", err);
      setModalError(err.message || "Failed to upgrade. Please check Firebase and try again.");
    } finally {
      setBusy(false);
    }
  }

  // Optional downgrade handler for testing / grading flexibility
  async function handleDowngrade() {
    if (!user) return;
    const confirm = window.confirm("Downgrade back to Free Plan?");
    if (!confirm) return;

    setBusy(true);
    try {
      await downgradeToFree();
      setNotification({
        type: "info",
        message: "Your subscription has been switched to the Free Plan.",
      });
    } catch (err) {
      setNotification({
        type: "warning",
        message: "Error downgrading: " + err.message,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="pricing-page">
      {/* Notification Toast Banner */}
      {notification && (
        <div className={`pricing-notification-banner ${notification.type}`} role="alert">
          <div className="notification-content">
            <span className="notification-icon">
              {notification.type === "success" && "🎉"}
              {notification.type === "warning" && "⚠️"}
              {notification.type === "info" && "ℹ️"}
            </span>
            <span>{notification.message}</span>
          </div>
          <div className="notification-actions">
            {notification.type === "warning" && !user && (
              <Link
                to="/login"
                state={{ redirectTo: "/pricing", action: "upgrade" }}
                className="btn-notification-login"
              >
                Log In Now
              </Link>
            )}
            <button
              type="button"
              className="notification-dismiss"
              onClick={() => setNotification(null)}
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <header className="pricing-header">
        <span className="pricing-badge">DEV@DEAKIN MEMBERSHIP</span>
        <h1>Choose Your Plan</h1>
        <p>
          Compare features offered between Free and Paid subscriptions. Upgrade anytime to unlock premium features.
        </p>
      </header>

      {/* User Session Status Bar */}
      <section className="pricing-user-status-bar">
        {user ? (
          <div className="status-bar-inner logged-in">
            <div className="status-user-info">
              <span className="status-avatar-circle">
                {user.displayName ? user.displayName[0].toUpperCase() : user.email[0].toUpperCase()}
              </span>
              <div>
                <strong>{user.displayName || "Logged-in User"}</strong>
                <span className="user-email-text">{user.email}</span>
              </div>
            </div>

            <div className="status-plan-display">
              <span className="status-label">Your Current Plan:</span>
              <span
                className={`plan-status-pill ${
                  subscriptionPlan === "Paid" ? "pill-paid" : "pill-free"
                }`}
              >
                {subscriptionPlan === "Paid" ? "★ PAID PLAN ($9.99/mo)" : "FREE PLAN ($0/mo)"}
              </span>
            </div>
          </div>
        ) : (
          <div className="status-bar-inner guest">
            <div className="status-guest-msg">
              <span className="guest-icon">ℹ️</span>
              <span>
                You are currently browsing as a <strong>Guest</strong>. Log in to activate the Upgrade Plan button.
              </span>
            </div>
            <div className="status-guest-actions">
              <Link
                to="/login"
                state={{ redirectTo: "/pricing" }}
                className="btn-status-login"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                state={{ redirectTo: "/pricing" }}
                className="btn-status-signup"
              >
                Sign Up Free
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Pricing Cards Comparison */}
      <section className="pricing-container">
        {/* FREE PLAN CARD */}
        <article
          className={`pricing-card free-card ${
            subscriptionPlan === "Free" && user ? "active-plan-card" : ""
          }`}
        >
          {subscriptionPlan === "Free" && user && (
            <span className="current-plan-badge">CURRENT PLAN</span>
          )}

          <h2>Free Plan</h2>
          <p className="plan-description">
            A good starting point for community contributors and readers.
          </p>

          <div className="plan-price">
            $0 <span>/ month</span>
          </div>

          <hr />

          <ul className="plan-features">
            {freeFeatures.map((feature) => (
              <li key={feature}>
                <span className="feature-check">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="card-action-wrapper">
            {!user ? (
              <Link to="/signup" className="pricing-button free-button">
                Get Started Free
              </Link>
            ) : subscriptionPlan === "Free" ? (
              <button
                type="button"
                className="pricing-button current-button"
                disabled
              >
                ✓ Current Plan
              </button>
            ) : (
              <button
                type="button"
                className="pricing-button downgrade-button"
                onClick={handleDowngrade}
                disabled={busy}
              >
                {busy ? "Updating..." : "Downgrade to Free"}
              </button>
            )}
          </div>
        </article>

        {/* PAID PLAN CARD */}
        <article
          className={`pricing-card paid-card ${
            subscriptionPlan === "Paid" ? "active-plan-card" : ""
          }`}
        >
          {subscriptionPlan === "Paid" ? (
            <span className="current-plan-badge paid-badge">★ ACTIVE PAID PLAN</span>
          ) : (
            <span className="recommended-badge">Recommended</span>
          )}

          <h2>Paid Plan</h2>
          <p className="plan-description">
            For active members who want premium access, larger uploads, and full features.
          </p>

          <div className="plan-price">
            $9.99 <span>/ month</span>
          </div>

          <hr />

          <ul className="plan-features">
            {paidFeatures.map((feature) => (
              <li key={feature}>
                <span className="feature-check paid-check">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="card-action-wrapper">
            {subscriptionPlan === "Paid" ? (
              <button
                type="button"
                className="pricing-button paid-active-button"
                onClick={handleUpgradeClick}
                title="You are already on the Paid plan"
              >
                ✓ Current Plan (Paid)
              </button>
            ) : (
              <button
                type="button"
                className="pricing-button paid-button"
                onClick={handleUpgradeClick}
              >
                Upgrade Plan
              </button>
            )}
          </div>
        </article>
      </section>

      {/* ==============================================================================
         MODAL POPUP: Payment Details for Upgrade Plan Feature (D1 Task Requirement)
         ============================================================================== */}
      {isModalOpen && (
        <div className="payment-modal-backdrop" onClick={handleCloseModal}>
          <div
            className="payment-modal-window"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* Modal Header */}
            <div className="modal-header">
              <div>
                <span className="modal-badge">MEMBERSHIP UPGRADE</span>
                <h2 id="modal-title">Upgrade to Paid Plan</h2>
                <p className="modal-price-line">
                  <strong>$9.99</strong> <span>/ month • Fictional test card</span>
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={handleCloseModal}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Error Message */}
            {modalError && (
              <div className="modal-error-alert" role="alert">
                ⚠️ {modalError}
              </div>
            )}

            {/* Visual Credit Card Preview */}
            <div className="modal-card-preview">
              <div className="credit-card-visual mini">
                <div className="card-top-row">
                  <div className="card-chip" />
                  <div className="card-contactless">) ) )</div>
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

            {/* Modal Payment Form */}
            <form className="modal-payment-form" onSubmit={handleModalSubmit}>
              <div className="modal-form-actions-top">
                <button
                  type="button"
                  className="btn-autofill-demo"
                  onClick={handleAutofillDemo}
                >
                  ⚡ Fill Demo Test Card
                </button>
              </div>

              <div className="modal-field">
                <label htmlFor="modal-card-name">Cardholder Name</label>
                <input
                  id="modal-card-name"
                  type="text"
                  placeholder="e.g. Saiyam Sharma"
                  autoComplete="off"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  required
                />
              </div>

              <div className="modal-field">
                <label htmlFor="modal-card-number">16-Digit Card Number</label>
                <input
                  id="modal-card-number"
                  type="text"
                  inputMode="numeric"
                  placeholder="4242 4242 4242 4242"
                  autoComplete="off"
                  value={cardNumber}
                  onChange={(e) => handleCardNumberChange(e.target.value)}
                  required
                />
              </div>

              <div className="modal-field-row">
                <div className="modal-field">
                  <label htmlFor="modal-card-expiry">Expiry Date (MM/YY)</label>
                  <input
                    id="modal-card-expiry"
                    type="text"
                    inputMode="numeric"
                    placeholder="12/28"
                    autoComplete="off"
                    maxLength={5}
                    value={expiry}
                    onChange={(e) => handleExpiryChange(e.target.value)}
                    required
                  />
                </div>

                <div className="modal-field">
                  <label htmlFor="modal-card-cvv">Security Code (CVV)</label>
                  <input
                    id="modal-card-cvv"
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

              <div className="modal-footer-buttons">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={handleCloseModal}
                  disabled={busy}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-modal-submit"
                  disabled={busy}
                >
                  {busy ? "Upgrading Plan..." : "Pay $9.99 & Upgrade"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
