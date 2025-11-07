import React from "react";
import "../../auth/styles/animations.css";

/**
 * Modern loading screen for dashboard data loading
 * Shows while dashboard content is being fetched
 */
const DashboardLoader = ({ isExiting = false }) => {
  return (
    <div className={`px-4 pt-4 pb-1 bg-[#f5f2ef] relative transition-opacity duration-700 ease-out ${
      isExiting ? 'opacity-0' : 'opacity-100'
    }`}>
      <div className="max-w-7xl mx-auto space-y-6 scale-90 origin-top pb-0 min-h-screen">
        {/* Loading Overlay */}
        <div className={`absolute inset-0 bg-[#f5f2ef]/70 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-500 ${
          isExiting ? 'opacity-0' : 'opacity-100'
        }`}>
          <div className="text-center relative z-10">
            {/* Modern Loading Animation - Same as DashboardLoadingScreen */}
            <div className="relative w-20 h-20 mx-auto mb-6">
              {/* Rotating rings */}
              <div
                className="absolute inset-0 border-4 border-[#ea772e]/30 rounded-full"
                style={{ animation: "spin 2s linear infinite" }}
              ></div>
              <div
                className="absolute inset-2 border-4 border-[#ea772e]/50 border-t-transparent rounded-full"
                style={{ animation: "spin 1.5s linear infinite reverse" }}
              ></div>
              <div
                className="absolute inset-4 border-4 border-[#ea772e] border-b-transparent rounded-full"
                style={{ animation: "spin 1s linear infinite" }}
              ></div>

              {/* Center house icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-[#ea772e]"
                  style={{ animation: "pulse 2s ease-in-out infinite" }}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              </div>
            </div>

            {/* Loading Message */}
            <p className="text-lg text-gray-700 font-medium mb-1">Loading personalized board</p>
            <p className="text-sm text-gray-500">
              Preparing your dashboard experience
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLoader;