import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const handleLegalClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <footer className="bg-gray-900 text-white" role="contentinfo">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="inline-flex items-center gap-3">
              {/* Updated logo to match header */}
              <div className="w-10 h-10 bg-primary-v2 rounded-2xl flex items-center justify-center relative">
                {/* Outer ring */}
                <div className="absolute inset-0 border-2 border-primary-v2 rounded-2xl"></div>
                {/* Location pin with heartbeat */}
                <svg
                  className="w-6 h-6 text-white relative z-10"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                  <circle cx="12" cy="9" r="2.5" fill="white" />
                </svg>
              </div>
              <h4 className="font-black text-xl tracking-wide">ALISTO</h4>
            </div>

            <p className="mt-6 text-base text-gray-300 max-w-md leading-relaxed">
              Building a resilient Philippines through technology and real-time
              data for enhanced preparedness against seismic events.
            </p>

            <div className="mt-8">
              <p className="text-sm text-gray-400 mb-2">Data source:</p>
              <a
                href="https://www.phivolcs.dost.gov.ph"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary-v2 hover:text-orange-400 transition-colors duration-200"
              >
                DOST-PHIVOLCS
              </a>
            </div>
          </div>

          <div>
            <h5 className="font-semibold text-gray-100 text-lg">Quick Links</h5>
            <ul className="mt-6 space-y-3 text-base text-gray-300">
              <li>
                <a
                  className="hover:text-primary-v2 transition-colors duration-200"
                  href="#about"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  className="hover:text-primary-v2 transition-colors duration-200"
                  href="#"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-gray-100 text-lg">Legal</h5>
            <ul className="mt-6 space-y-3 text-base text-gray-300">
              <li>
                <Link
                  className="hover:text-primary-v2 transition-colors duration-200"
                  to="/terms"
                  onClick={handleLegalClick}
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-primary-v2 transition-colors duration-200"
                  to="/privacy"
                  onClick={handleLegalClick}
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-700 pt-8 text-center text-base text-gray-400">
          <p>
            © 2025 Automated Live Information for Seismic Tracking and
            Observation (ALISTO)
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
