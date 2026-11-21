// ==============================================================================
// NAVBAR COMPONENT (Responsive, Accessible, Smooth Scroll, Paid Status & Profile)
// SIT313 D1 Subscription Task
// ==============================================================================

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./authContext.jsx";

export default function Navbar({
  theme = "light",
  onThemeChange = () => {},
}) {
  const { user, subscriptionPlan, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Mobile navigation menu toggle state
  const [menuOpen, setMenuOpen] = useState(false);

  // Profile dropdown menu toggle state
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef(null);

  // Close all open menus
  const closeMenus = () => {
    setMenuOpen(false);
    setProfileOpen(false);
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    closeMenus();
  }, [location.pathname, location.hash]);

  // Logout handler
  const handleLogout = async () => {
    try {
      await logout();
      closeMenus();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Theme toggle handler (light / dark)
  const toggleTheme = () => {
    onThemeChange(theme === "dark" ? "light" : "dark");
  };

  // Smooth scroll handler for section links (About Me, My Work, Articles, Tutorials, Gallery)
  const handleSectionClick = (sectionId, event) => {
    closeMenus();

    // If currently on Home page ("/"), scroll smoothly directly
    if (location.pathname === "/") {
      if (event) event.preventDefault();
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.pushState(null, "", `/#${sectionId}`);
      }
    }
    // If on another page (/pricing, /post, etc.), the Link to={`/#${sectionId}`} navigates to Home,
    // and the hash listener in App.jsx scrolls to the section automatically.
  };

  // Logo click handler
  const handleLogoClick = (e) => {
    closeMenus();
    if (location.pathname === "/" && !location.hash) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header className="site-header">
      <nav className="navbar" aria-label="Main Navigation">
        {/* DEV@Deakin Brand Logo */}
        <Link to="/" className="navbar-logo" onClick={handleLogoClick}>
          <span className="logo-dev">DEV</span>
          <span className="logo-at">@</span>
          <span className="logo-deakin">Deakin</span>
          <span className="logo-dot">.</span>
        </Link>

        {/* Mobile menu toggle hamburger button */}
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        {/* Desktop Navigation Links */}
        <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
          <Link
            to="/#about"
            onClick={(e) => handleSectionClick("about", e)}
          >
            About Me
          </Link>
          <Link
            to="/#work"
            onClick={(e) => handleSectionClick("work", e)}
          >
            My Work
          </Link>
          <Link
            to="/#articles"
            onClick={(e) => handleSectionClick("articles", e)}
          >
            Articles
          </Link>
          <Link
            to="/#tutorials"
            onClick={(e) => handleSectionClick("tutorials", e)}
          >
            Tutorials
          </Link>
          <Link
            to="/#gallery"
            onClick={(e) => handleSectionClick("gallery", e)}
          >
            Gallery
          </Link>
          <Link to="/pricing" onClick={closeMenus}>
            Pricing
          </Link>

          {/* Additional mobile-drawer controls displayed only on smaller screens */}
          <div className="mobile-drawer-extra">
            <button
              type="button"
              className="theme-toggle mobile-theme-btn"
              onClick={toggleTheme}
            >
              {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>

            <div className="mobile-drawer-actions">
              <Link
                to="/pricing"
                className={`upgrade-button ${subscriptionPlan === "Paid" ? "paid-active-badge" : ""}`}
                onClick={closeMenus}
              >
                {subscriptionPlan === "Paid" ? "★ Paid Member" : "Upgrade Plan"}
              </Link>
              <Link to="/post" className="post-button" onClick={closeMenus}>
                + New Post
              </Link>
              {!loading && (
                user ? (
                  <button
                    type="button"
                    className="signin-button"
                    onClick={handleLogout}
                  >
                    Sign Out
                  </button>
                ) : (
                  <>
                    <Link to="/login" className="signin-button" onClick={closeMenus}>
                      Login
                    </Link>
                    <Link to="/signup" className="signin-button signup-button-link" onClick={closeMenus}>
                      Sign Up
                    </Link>
                  </>
                )
              )}
            </div>
          </div>
        </div>

        {/* Right-side tools: Theme toggle, Action buttons & Profile Dropdown */}
        <div className="navbar-tools">
          {/* Light / Dark Mode Toggle */}
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>

          {/* Action Links */}
          <div className="navbar-actions">
            <Link
              to="/pricing"
              className={`upgrade-button ${subscriptionPlan === "Paid" ? "paid-active-badge" : ""}`}
              onClick={closeMenus}
              title={subscriptionPlan === "Paid" ? "View your active Paid Plan" : "Upgrade to Paid Plan"}
            >
              {subscriptionPlan === "Paid" ? "★ Paid Plan" : "Upgrade"}
            </Link>

            <Link
              to="/post"
              className="post-button"
              onClick={closeMenus}
              title="Create a new post"
            >
              + Post
            </Link>

            {!loading && (
              user ? (
                <button
                  type="button"
                  className="signin-button"
                  onClick={handleLogout}
                  title="Sign out of your account"
                >
                  Sign Out
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="signin-button"
                    onClick={closeMenus}
                  >
                    Login
                  </Link>

                  <Link
                    to="/signup"
                    className="signin-button signup-button-link"
                    onClick={closeMenus}
                  >
                    Sign Up
                  </Link>
                </>
              )
            )}
          </div>

          {/* Profile Menu Dropdown */}
          <div className="navbar-profile-container" ref={profileRef}>
            <button
              type="button"
              className="navbar-profile-btn"
              onClick={() => setProfileOpen((prev) => !prev)}
              aria-label="User Profile Menu"
              aria-expanded={profileOpen}
            >
              {user ? (
                user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User Profile"}
                    className="nav-avatar-img"
                  />
                ) : (
                  <div className="nav-avatar-circle initial-avatar">
                    {user.displayName
                      ? user.displayName[0].toUpperCase()
                      : user.email
                      ? user.email[0].toUpperCase()
                      : "U"}
                  </div>
                )
              ) : (
                <div className="nav-avatar-circle guest-avatar" title="Guest User">
                  <svg
                    className="guest-icon"
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="currentColor"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
            </button>

            {/* Profile Dropdown Menu */}
            {profileOpen && (
              <div className="navbar-profile-dropdown" role="menu">
                {user ? (
                  <div className="profile-dropdown-content">
                    <div className="profile-dropdown-header">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt="Profile"
                          className="dropdown-avatar-img"
                        />
                      ) : (
                        <div className="dropdown-avatar-circle">
                          {user.displayName
                            ? user.displayName[0].toUpperCase()
                            : user.email
                            ? user.email[0].toUpperCase()
                            : "U"}
                        </div>
                      )}
                      <div className="dropdown-user-details">
                        <strong>{user.displayName || "Logged-in User"}</strong>
                        <span className="dropdown-email">{user.email}</span>
                        <span
                          className={`dropdown-plan-badge ${
                            subscriptionPlan === "Paid" ? "plan-paid" : "plan-free"
                          }`}
                        >
                          {subscriptionPlan === "Paid" ? "★ Paid Member ($9.99)" : "Free Member ($0)"}
                        </span>
                      </div>
                    </div>

                    <div className="dropdown-divider" />

                    <Link
                      to="/pricing"
                      className="dropdown-item"
                      onClick={closeMenus}
                    >
                      Pricing Plans
                    </Link>

                    <Link
                      to="/post"
                      className="dropdown-item"
                      onClick={closeMenus}
                    >
                      Create Post
                    </Link>

                    <div className="dropdown-divider" />

                    <button
                      type="button"
                      className="dropdown-item dropdown-logout-btn"
                      onClick={handleLogout}
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="profile-dropdown-content guest-content">
                    <div className="profile-dropdown-header">
                      <div className="dropdown-avatar-circle guest">
                        <svg
                          viewBox="0 0 24 24"
                          width="20"
                          height="20"
                          fill="currentColor"
                        >
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                      <div className="dropdown-user-details">
                        <strong>Guest User</strong>
                        <span>Not signed in</span>
                      </div>
                    </div>

                    <p className="dropdown-guest-note">
                      Sign in or create an account to upgrade your subscription plan and share posts.
                    </p>

                    <div className="dropdown-divider" />

                    <div className="dropdown-guest-actions">
                      <Link
                        to="/login"
                        className="dropdown-btn-login"
                        onClick={closeMenus}
                      >
                        Login
                      </Link>
                      <Link
                        to="/signup"
                        className="dropdown-btn-signup"
                        onClick={closeMenus}
                      >
                        Sign Up
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
