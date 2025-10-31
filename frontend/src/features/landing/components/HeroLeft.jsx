import React from "react";
import { useNavigate } from "react-router-dom";

const HeroLeft = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/signup");
  };

  return (
    <div className="space-y-12">
      {/* Modern Headline */}
      <div className="space-y-8">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-v2 leading-tight">
          Automated Live Information for Seismic Tracking and Observation
        </h1>

        {/* Modern Subheadline */}
        <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl font-light">
          Advanced monitoring technology providing real-time alerts and risk
          assessment.
        </p>
      </div>

      {/* Modern Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-8">
        <button
          onClick={handleGetStarted}
          className="group bg-primary-v2 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <span className="flex items-center justify-center">
            Get Started
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
          className="border-2 border-primary-v2/30 text-primary-v2 px-8 py-3 rounded-xl font-medium text-base hover:border-primary-v2 hover:bg-primary-v2/5 transition-all duration-300"
        >
          Learn More
        </button>
      </div>
    </div>
  );
};

export default HeroLeft;
