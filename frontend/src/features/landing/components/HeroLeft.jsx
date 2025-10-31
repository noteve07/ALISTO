import React from "react";
import { useNavigate } from "react-router-dom";

const HeroLeft = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/signup");
  };

  return (
    <div className="space-y-10">
      {/* Headline - Exact from prototype */}
      <div className="space-y-6">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-v2 leading-tight">
          Automated Live Information for Seismic Tracking and Observation
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-2xl">
          Advanced monitoring technology providing real-time alerts and risk
          assessment.
        </p>
      </div>

      {/* Sign Up Button */}
      <div className="pt-4">
        <button
          onClick={handleGetStarted}
          className="bg-primary-v2 hover:bg-orange-600 text-white px-12 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default HeroLeft;
