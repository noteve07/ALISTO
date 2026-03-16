import React from "react";

/**
 * Modern loading screen for auth processes
 * Shows during login/signup before location step
 */
const AuthLoadingScreen = ({ message = "Setting up your account..." }) => {
  return (
    <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center p-4">
      <div className="text-center">
        {/* Animated Logo/Brand */}
        <div className="mb-8" style={{ animation: "scaleIn 0.5s ease-out" }}>
          <h1 className="text-5xl font-bold text-primary-v2 mb-2">EPICENTRA</h1>
          <div className="w-32 h-1 bg-primary-v2/30 rounded mx-auto"></div>
        </div>

        {/* Loading Spinner */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          {/* Outer ring */}
          <div className="absolute inset-0 border-4 border-primary-v2/20 rounded-full"></div>
          {/* Spinning ring */}
          <div
            className="absolute inset-0 border-4 border-transparent border-t-primary-v2 rounded-full"
            style={{ animation: "spin 1s linear infinite" }}
          ></div>
          {/* Inner pulse */}
          <div
            className="absolute inset-3 bg-primary-v2/20 rounded-full"
            style={{ animation: "pulse 2s ease-in-out infinite" }}
          ></div>
        </div>

        {/* Loading Message */}
        <p className="text-lg text-gray-700 font-medium mb-2">{message}</p>
        <p className="text-sm text-gray-500">This will only take a moment</p>

        {/* Loading dots */}
        <div className="flex justify-center space-x-2 mt-6">
          <div
            className="w-2 h-2 bg-primary-v2 rounded-full"
            style={{ animation: "bounce 1.4s ease-in-out infinite" }}
          ></div>
          <div
            className="w-2 h-2 bg-primary-v2 rounded-full"
            style={{ animation: "bounce 1.4s ease-in-out 0.2s infinite" }}
          ></div>
          <div
            className="w-2 h-2 bg-primary-v2 rounded-full"
            style={{ animation: "bounce 1.4s ease-in-out 0.4s infinite" }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default AuthLoadingScreen;
