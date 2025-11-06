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
        className="inline-flex items-center gap-3 cursor-pointer select-none"
        onClick={() => navigate("/")}
      >
        <div className="relative">
          <img
            src="/logo/alisto_logo.png"
            alt="ALISTO Logo"
            className="w-10 h-10 object-contain select-none"
            draggable={false}
          />
        </div>
        <h2 className="font-black text-2xl tracking-wide text-primary-v2">
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
          className="group relative px-6 py-3 text-base font-medium text-gray-700 hover:text-primary-v2 transition-all duration-300 cursor-pointer select-none rounded-lg overflow-hidden"
        >
          <div className="absolute inset-0 bg-primary-v2/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
          <span className="relative">Login</span>
        </button>
        <button
          onClick={() => navigate("/signup")}
          className="group relative px-8 py-3 text-base font-bold rounded-lg bg-primary-v2 text-white hover:bg-primary-v2/90 transition-all duration-300 cursor-pointer select-none transform hover:scale-105 hover:-translate-y-0.5 shadow-md hover:shadow-lg overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 transform -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
          <span className="relative flex items-center">
            Sign Up
            <svg
              className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
};

export default Header;
