import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { useAuth } from "../components/authContext.jsx";
import { db, firebaseConfigured } from "../services/firebase.js";
import "./Payment.css";

export default function Payment() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [cardName, setCardName] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvv, setCvv] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    function handleCardNumber(value) {
        setCardNumber(
            value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim()
        );
    }

    function handleExpiry(value) {
        const digits = value.replace(/\D/g, "").slice(0, 4);
        setExpiry(
            digits.length > 2
                ? `${digits.slice(0, 2)}/${digits.slice(2)}`
                : digits
        );
    }

    async function handlePayment(event) {
        event.preventDefault();
        setError("");

        if (!user) {
            navigate("/login", {
                state: { redirectTo: "/payment", action: "upgrade" },
            });
            return;
        }

        const digits = cardNumber.replace(/\s/g, "");
        const [month, year] = expiry.split("/");

        if (cardName.trim().length < 2) {
            setError("Please enter the name on the card.");
            return;
        }

        if (digits.length !== 16) {
            setError("Enter a 16-digit test card number.");
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
            setError("Enter a valid 3 or 4-digit test CVV.");
            return;
        }

        if (!firebaseConfigured || !db) {
            setError(
                "Firebase is not configured. Configure Firebase before completing the demo upgrade."
            );
            return;
        }

        setBusy(true);

        try {
            // Demo subscription only. No real payment is processed.
            // Never save the full card number, expiry date, or CVV.
            await setDoc(
                doc(db, "users", user.uid),
                {
                    subscriptionPlan: "Paid",
                    subscriptionPrice: 9.99,
                    subscriptionCurrency: "USD",
                    subscriptionStatus: "active",
                    subscriptionUpdatedAt: new Date().toISOString(),
                    cardLastFour: digits.slice(-4),
                },
                { merge: true }
            );

            navigate("/pricing", {
                replace: true,
                state: { paymentSuccess: true },
            });
        } catch (err) {
            console.error("Demo subscription update failed:", err);
            setError("Could not update your plan. Please check Firebase and try again.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <main className="payment-page">
            <div className="payment-container">
                <header className="payment-heading">
                    <span className="payment-label">DEV@Deakin MEMBERSHIP</span>
                    <h1>Complete Your Upgrade</h1>
                    <p>Upgrade your account to unlock the Paid Plan.</p>
                </header>

                <div className="payment-summary">
                    <div>
                        <span className="summary-label">Selected plan</span>
                        <h2>Paid Plan</h2>
                        <p>Unlimited access to available posts and features.</p>
                    </div>

                    <div className="summary-price">
                        <strong>$9.99</strong>
                        <span>/ month</span>
                    </div>
                </div>

                <form className="payment-form" onSubmit={handlePayment}>
                    <h2>Payment Details</h2>

                    <p className="payment-demo-notice">
                        Demo only. Use fictional test details. No real payment will be
                        processed.
                    </p>

                    {error && (
                        <div className="payment-error" role="alert">
                            {error}
                        </div>
                    )}

                    <div className="payment-field">
                        <label htmlFor="card-name">Name on card</label>
                        <input
                            id="card-name"
                            type="text"
                            placeholder="Test User"
                            autoComplete="off"
                            value={cardName}
                            onChange={(event) => setCardName(event.target.value)}
                            required
                        />
                    </div>

                    <div className="payment-field">
                        <label htmlFor="card-number">Test card number</label>
                        <input
                            id="card-number"
                            type="text"
                            inputMode="numeric"
                            placeholder="4242 4242 4242 4242"
                            autoComplete="off"
                            value={cardNumber}
                            onChange={(event) => handleCardNumber(event.target.value)}
                            required
                        />
                    </div>

                    <div className="payment-fields-row">
                        <div className="payment-field">
                            <label htmlFor="card-expiry">Expiry date</label>
                            <input
                                id="card-expiry"
                                type="text"
                                inputMode="numeric"
                                placeholder="MM/YY"
                                autoComplete="off"
                                maxLength={5}
                                value={expiry}
                                onChange={(event) => handleExpiry(event.target.value)}
                                required
                            />
                        </div>

                        <div className="payment-field">
                            <label htmlFor="card-cvv">Test CVV</label>
                            <input
                                id="card-cvv"
                                type="password"
                                inputMode="numeric"
                                placeholder="123"
                                autoComplete="off"
                                maxLength={4}
                                value={cvv}
                                onChange={(event) =>
                                    setCvv(event.target.value.replace(/\D/g, "").slice(0, 4))
                                }
                                required
                            />
                        </div>
                    </div>

                    <button
                        className="payment-submit"
                        type="submit"
                        disabled={busy}
                    >
                        {busy ? "Processing demo..." : "Upgrade to Paid"}
                    </button>
                </form>

                <Link to="/pricing" className="payment-back">
                    Back to Pricing
                </Link>

                <p className="payment-footer">
                    This is a demonstration flow. No payment details are saved.
                </p>
            </div>
        </main>
    );
}