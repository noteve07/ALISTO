import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  const handleLegalClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return (
    <footer className="bg-slate-900 text-white" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="inline-flex items-center gap-3">
              <div className="w-6 h-6 shrink-0" aria-hidden="true">
                <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z"/>
                </svg>
              </div>
              <h4 className="font-black text-xl tracking-wide">ALISTO</h4>
            </div>

            <p className="mt-4 text-sm text-gray-300 max-w-sm">
              Building a resilient Philippines through technology and real-time data for enhanced preparedness against seismic events.
            </p>

            <div className="mt-6">
              <p className="mr-14 text-xs text-gray-400">Data source:</p>
              <a 
                href="https://www.phivolcs.dost.gov.ph" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-semibold text-gray-200 hover:text-white transition-colors duration-200"
              >
                DOST-PHIVOLCS
              </a>
            </div>
          </div>

          <div>
            <h5 className="font-semibold text-gray-100">Quick Links</h5>
            <ul className="mt-4 space-y-2 text-sm text-gray-300">
              <li><a className="hover:text-primary active:text-[#d86f0f] transition-colors duration-200" href="#about">About</a></li>
              <li><a className="hover:text-primary active:text-[#d86f0f] transition-colors duration-200" href="#">Contact</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-gray-100">Legal</h5>
            <ul className="mt-4 space-y-2 text-sm text-gray-300">
              <li>
                <Link 
                  className="hover:text-primary active:text-[#d86f0f] transition-colors duration-200" 
                  to="/terms"
                  onClick={handleLegalClick}
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link 
                  className="hover:text-primary active:text-[#d86f0f] transition-colors duration-200" 
                  to="/privacy"
                  onClick={handleLegalClick}
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-700 pt-6 text-center text-sm text-gray-400">
          <p>© 2025 Automated Live Information for Seismic Tracking and Observation (ALISTO)</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer