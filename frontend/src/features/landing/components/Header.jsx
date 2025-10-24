import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if we're on terms or privacy pages
  const isTermsOrPrivacy = window.location.pathname === '/terms' || window.location.pathname === '/privacy';

  const navLinks = [
    { label: 'Home', href: 'home' },
    { label: 'Features', href: 'core-features' },
    { label: 'Developers', href: 'developers' },
    { label: 'About', href: 'latest-paper' }
  ];

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-12 lg:px-16 py-4 transition-all duration-700 ${
      isTermsOrPrivacy || isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg' 
        : 'bg-amber-700 shadow-md'
    }`}>
      {/* Logo */}
      <div className="inline-flex items-center gap-3 cursor-pointer select-none" onClick={() => navigate('/')}>
        <div className={`w-6 h-6 shrink-0 transition-colors duration-700 ${
          isTermsOrPrivacy || isScrolled ? 'text-primary' : 'text-white'
        }`} aria-hidden="true">
          <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z"/>
          </svg>
        </div>
        <h2 className={`font-black text-xl tracking-wide transition-colors duration-700 ${
          isTermsOrPrivacy || isScrolled ? 'text-primary' : 'text-white'
        }`}>ALISTO</h2>
      </div>

      <nav>
        <ul className="flex items-center space-x-8">
          {navLinks.map((link, index) => (
            <li key={index}>
              <button 
                onClick={() => scrollToSection(link.href)} 
                className={`relative py-2 text-lg font-semibold cursor-pointer select-none transition-colors duration-700 group ${
                  isTermsOrPrivacy || isScrolled 
                    ? 'text-gray-700 hover:text-primary' 
                    : 'text-white/90 hover:text-white'
                }`}
              >
                {link.label}
                {/* Bottom line animation */}
                <span className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-700 ease-out group-hover:w-full ${
                  isTermsOrPrivacy || isScrolled ? 'bg-primary' : 'bg-white'
                }`}></span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Auth Buttons */}
      <div className="flex items-center space-x-3">
        <button 
          onClick={() => navigate('/login')}
          className={`px-4 py-2 border text-sm font-bold rounded-lg transition-all duration-700 cursor-pointer select-none ${
            isTermsOrPrivacy || isScrolled 
              ? 'border-primary bg-transparent text-primary hover:bg-primary hover:text-white'
              : 'border-white/70 bg-transparent text-white hover:bg-white hover:text-primary'
          }`}
        >
          Log In
        </button>
        <button 
          onClick={() => navigate('/signup')}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all duration-700 cursor-pointer select-none ${
            isTermsOrPrivacy || isScrolled 
              ? 'bg-primary text-white hover:bg-[#d86f0f]'
              : 'bg-white text-primary hover:bg-white/90'
          }`}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default Header;
