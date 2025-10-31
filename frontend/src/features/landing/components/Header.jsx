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
        <div
          className="w-8 h-8 shrink-0 bg-primary-v2 rounded-full flex items-center justify-center"
          aria-hidden="true"
        >
          <svg
            fill="white"
            viewBox="0 0 24 24"
            className="w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" fill="white" />
          </svg>
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
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-2.5 text-sm font-medium text-gray-700 hover:text-primary-v2 transition-all duration-300 cursor-pointer select-none"
        >
          Login
        </button>
        <button
          onClick={() => navigate("/signup")}
          className="px-8 py-2.5 text-sm font-bold rounded-lg bg-primary-v2 text-white hover:bg-orange-600 transition-all duration-300 cursor-pointer select-none"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default Header;
