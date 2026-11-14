
import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import NewPost from "./pages/NewPost";
import BrowsePosts from "./pages/BrowsePosts.jsx";
import Payment from "./pages/Payment.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import { AuthProvider } from "./components/authContext.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Pricing from "./pages/pricing.jsx";

import "./App.css";

export default function App() {
  const location = useLocation();

  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("dev-deakin-theme");
    return savedTheme === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    localStorage.setItem("dev-deakin-theme", theme);
  }, [theme]);

  // Smooth scroll to sections when hash changes (e.g. /#gallery, /#work, etc.)
  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace("#", "");
      const timer = setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, location.hash]);

  return (
    <AuthProvider>
      <div className="app-layout" data-theme={theme}>
        <Navbar
          theme={theme}
          onThemeChange={setTheme}
        />

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Signup />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/post" element={<NewPost />} />
            <Route path="/browse" element={<BrowsePosts />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </AuthProvider>
  );
}
