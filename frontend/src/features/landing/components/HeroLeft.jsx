import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const HeroLeft = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  const handleGetStarted = () => {
    navigate("/signup");
  };

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="space-y-12 relative">
      {/* Animated Background Gradient */}
      <div className="absolute -inset-4 bg-gradient-to-r from-orange-50/30 via-transparent to-transparent rounded-3xl blur-3xl animate-pulse-slow opacity-60"></div>

      {/* Modern Headline with Staggered Animation */}
      <div className="space-y-6 relative">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
          <span
            className={`inline-block text-primary-v2 transform transition-all duration-700 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
            style={{ transitionDelay: "0ms" }}
          >
            Automated Live
          </span>
          <br />
          <span
            className={`inline-block text-primary-v2 transform transition-all duration-700 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            Information for
          </span>
          <br />
          <span
            className={`inline-block bg-gradient-to-r from-primary-v2 to-orange-600 bg-clip-text text-transparent transform transition-all duration-700 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
            style={{ transitionDelay: "400ms" }}
          >
            Seismic Tracking
          </span>
          <br />
          <span
            className={`inline-block text-primary-v2 transform transition-all duration-700 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
            style={{ transitionDelay: "600ms" }}
          >
            and Observation
          </span>
        </h1>

        {/* Enhanced Subheadline with Icon */}
        <div
          className={`space-y-4 transform transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          style={{ transitionDelay: "800ms" }}
        >
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl font-light mt-4">
            A web platform with{" "}
            <span className="text-primary-v2 font-semibold relative">
              AI-powered
              <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-primary-v2 to-orange-400 rounded-full"></div>
            </span>{" "}
            earthquake monitoring, provincial risk analysis, chatbot, and alert
            system.
          </p>
        </div>
      </div>

      {/* Enhanced Action Buttons */}
      <div
        className={`flex flex-col sm:flex-row gap-4 pt-8 transform transition-all duration-700 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
        style={{ transitionDelay: "1000ms" }}
      >
        <button
          onClick={handleGetStarted}
          className="group relative bg-primary-v2 hover:bg-gradient-to-r hover:from-primary-v2 hover:to-orange-500 text-white px-6 py-4 rounded-2xl font-bold text-base transition-all duration-500 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 overflow-hidden w-fit"
        >
          <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          <span className="relative flex items-center justify-center">
            <svg
              className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Get Started Now
            <svg
              className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300"
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
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-v2/20 to-orange-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>

        <button
          onClick={() => {
            const aboutSection = document.getElementById("about");
            if (aboutSection) {
              aboutSection.scrollIntoView({ behavior: "smooth" });
            }
          }}
          className="group border-2 border-primary-v2/30 text-primary-v2 px-8 py-4 rounded-2xl font-medium text-base hover:border-primary-v2 hover:bg-primary-v2/10 transition-all duration-300 backdrop-blur-sm hover:shadow-lg transform hover:scale-105 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-v2/5 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <span className="relative flex items-center justify-center">
            <svg
              className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Learn More
          </span>
        </button>
      </div>

      {/* Custom Animation Styles */}
      <style jsx>{`
        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.02);
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default HeroLeft;
