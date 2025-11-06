import React from "react";
import { useNavigate } from "react-router-dom";

const HeroLeft = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/signup");
  };

  return (
    <div className="space-y-10">
      {/* Modern Headline */}
      <div className="space-y-6">
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
            Automated Live Information for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-v2 to-orange-500">
              Seismic Tracking
            </span>{" "}
            and Observation
          </h1>
        </div>

        {/* Modern Subheadline */}
        <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl font-normal">
          Advanced monitoring technology providing real-time earthquake alerts, volcanic activity tracking, and comprehensive risk assessment for the Philippines.
        </p>
      </div>

      {/* Key Statistics */}
      <div className="flex flex-wrap gap-6 py-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-700">24/7 Live Monitoring</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }}></div>
          <span className="text-sm font-medium text-gray-700">Nationwide Coverage</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: "1s" }}></div>
          <span className="text-sm font-medium text-gray-700">Instant Alerts</span>
        </div>
      </div>

      {/* Enhanced Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <button
          onClick={handleGetStarted}
          className="group relative bg-gradient-to-r from-primary-v2 to-orange-500 hover:from-orange-600 hover:to-red-500 text-white px-8 py-4 rounded-2xl font-bold text-base transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          <span className="relative flex items-center justify-center">
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
        </button>

        <button
          onClick={() => {
            const aboutSection = document.getElementById("about");
            if (aboutSection) {
              aboutSection.scrollIntoView({ behavior: "smooth" });
            }
          }}
          className="group border-2 border-gray-300 hover:border-primary-v2 text-gray-700 hover:text-primary-v2 px-8 py-4 rounded-2xl font-semibold text-base hover:bg-primary-v2/5 transition-all duration-300 backdrop-blur-sm"
        >
          <span className="flex items-center justify-center">
            Learn More
            <svg
              className="w-5 h-5 ml-2 group-hover:translate-y-[-2px] transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
};

export default HeroLeft;
