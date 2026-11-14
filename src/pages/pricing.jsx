
import React from "react";
import { Link } from "react-router-dom";
import "./pricing.css";

export default function Pricing() {
    const freeFeatures = [
        "Access to free posts",
        "Up to 5 posts per month",
        "Image uploads up to 2 MB",
        "Basic account features",
    ];

    const paidFeatures = [
        "Access to free and paid posts",
        "Unlimited post access",
        "Image uploads up to 10 MB",
        "All available account features",
    ];

    return (
        <main className="pricing-page">
            <header className="pricing-header">
                <h1>Choose Your Plan</h1>
                <p>Select the plan that suits your needs.</p>
            </header>

            <section className="pricing-container">
                {/* Free Plan */}
                <article className="pricing-card free-card">
                    <h2>Free Plan</h2>
                    <p className="plan-description">
                        A good starting point for new users.
                    </p>

                    <div className="plan-price">$0</div>

                    <hr />

                    <ul className="plan-features">
                        {freeFeatures.map((feature) => (
                            <li key={feature}>
                                <span className="feature-check">✓</span>
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>

                    <Link to="/register" className="pricing-button free-button">
                        Get Started
                    </Link>
                </article>

                {/* Paid Plan */}
                <article className="pricing-card paid-card">
                    <span className="recommended-badge">Recommended</span>

                    <h2>Paid Plan</h2>
                    <p className="plan-description">
                        More features for regular users.
                    </p>

                    <div className="plan-price">
                        $9.99 <span>/ month</span>
                    </div>

                    <hr />

                    <ul className="plan-features">
                        {paidFeatures.map((feature) => (
                            <li key={feature}>
                                <span className="feature-check">✓</span>
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>

                    <Link to="/payment" className="pricing-button paid-button">
                        Upgrade Plan
                    </Link>
                </article>
            </section>
        </main>
    );
}
