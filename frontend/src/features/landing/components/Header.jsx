import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if we're on terms or privacy pages
  const isTermsOrPrivacy =
    window.location.pathname === "/terms" ||
    window.location.pathname === "/privacy";

  const navLinks = [
    { label: "Home", href: "home" },
    { label: "Features", href: "core-features" },
    { label: "Developers", href: "developers" },
    { label: "About", href: "latest-paper" },
  ];

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-12 lg:px-16 py-4 transition-all duration-700 ${
        isTermsOrPrivacy || isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      {/* Logo */}
      <div
        className="inline-flex items-center gap-4 cursor-pointer select-none"
        onClick={() => navigate("/")}
      >
        <div className="relative">
          {/* Circular background with concentric rings */}
          <div className="w-12 h-12 bg-primary-v2 rounded-full flex items-center justify-center relative">
            {/* Outer ring */}
            <div className="absolute inset-0 border-2 border-primary-v2 rounded-full"></div>
            {/* Middle ring */}
            <div className="absolute inset-1 border border-primary-v2/60 rounded-full"></div>
            {/* Inner ring */}
            <div className="absolute inset-2 border border-primary-v2/30 rounded-full"></div>

            {/* Location pin with heartbeat */}
            <svg
              className="w-7 h-7 text-white relative z-10"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" fill="white" />
              {/* Heartbeat line */}
              <path
                d="M8 9h1l1-2 2 4 1-2h1"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
              />
            </svg>
          </div>
        </div>
        <h2 className="font-black text-xl tracking-wide text-primary-v2">
          ALISTO
        </h2>
      </div>

      <nav>
        <ul className="flex items-center space-x-8">
          {navLinks.map((link, index) => (
            <li key={index}>
              <button
                onClick={() => scrollToSection(link.href)}
                className="relative py-2 text-base font-medium cursor-pointer select-none text-gray-700 hover:text-primary-v2 transition-colors duration-300 group"
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Auth Buttons */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-3 text-base font-medium text-gray-700 hover:text-primary-v2 transition-all duration-300 cursor-pointer select-none"
        >
          Login
        </button>
        <button
          onClick={() => navigate("/signup")}
          className="px-8 py-3 text-base font-bold rounded-lg bg-primary-v2 text-white hover:bg-orange-600 transition-all duration-300 cursor-pointer select-none"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default Header;
