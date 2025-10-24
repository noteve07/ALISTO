import React from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm flex items-center justify-between px-8 py-4">
      {/* Logo */}
      <div className="inline-flex items-center gap-3 cursor-pointer select-none" onClick={() => scrollToSection('home')}>
        <div className="w-6 h-6 shrink-0 text-primary" aria-hidden="true">
          <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z"/>
          </svg>
        </div>
        <h2 className="font-black text-xl tracking-wide text-primary">ALISTO</h2>
      </div>

      <nav>
        <ul className="flex items-center space-x-8 text-sm font-medium text-gray-700">
          <li><button onClick={() => scrollToSection('home')} className="hover:text-primary transition-colors cursor-pointer select-none">Home</button></li>
          <li><button onClick={() => scrollToSection('features')} className="hover:text-primary transition-colors cursor-pointer select-none">Features</button></li>
          <li><button onClick={() => scrollToSection('developers')} className="hover:text-primary transition-colors cursor-pointer select-none">Developers</button></li>
          <li><button onClick={() => scrollToSection('about')} className="hover:text-primary transition-colors cursor-pointer select-none">About</button></li>
        </ul>
      </nav>

      {/* Auth Buttons */}
      <div className="flex items-center space-x-3">
        <button 
          onClick={() => navigate('/login')}
          className="px-4 py-2 border border-primary bg-transparent text-primary text-sm font-bold rounded-lg hover:bg-primary hover:text-white transition-all duration-200 cursor-pointer select-none"
        >
          Log In
        </button>
        <button 
          onClick={() => navigate('/signup')}
          className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-[#d86f0f] transition-all duration-200 cursor-pointer select-none"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default Header;
