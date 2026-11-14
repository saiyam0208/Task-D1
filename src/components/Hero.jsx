
import { useState } from "react";

function Hero() {
    const [showMessage, setShowMessage] = useState(false);

    const toggleMessage = () => {
        setShowMessage((previous) => !previous);
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleMessage();
        }
    };

    return (
        <>
            {/* Deakin University Hero Banner */}
            <section
                className={`banner ${showMessage ? "show-message" : ""}`}
                onClick={toggleMessage}
                onKeyDown={handleKeyDown}
                role="button"
                tabIndex={0}
                aria-label="Tap to reveal introduction"
                aria-expanded={showMessage}
            >
                <img
                    src="/images/Deakin University Entrance Conversation.png"
                    alt="Students walking in front of Deakin University"
                    className="banner-image"
                    fetchPriority="high"
                    decoding="async"
                />

                <div className="banner-message">
                    <span>Hey, I'm Saiyam Sharma</span>
                </div>
            </section>

            {/* Original Profile Section */}
            <section id="about" className="profile">
                <h1>My Profile</h1>

                <img
                    src="/images/Profile image.jpeg"
                    alt="Saiyam Sharma profile"
                    className="profile-image"
                />

                <p>
                    <b>
                        I am an aspiring Artificial Intelligence and Machine Learning
                        professional, passionate about programming, emerging technologies,
                        and continuously developing my technical skills.
                    </b>
                </p>

                <div className="line"></div>

                <h2>Here's what I've done so far</h2>
            </section>
        </>
    );
}

export default Hero;
