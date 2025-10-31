import React from "react";

/**
 * Modern loading screen for dashboard transition
 * Shows after location setup before redirecting to dashboard
 */
const DashboardLoadingScreen = ({ message = "Loading your dashboard..." }) => {
  return (
    <div className="min-h-screen bg-linear-to-br from-primary-v2 via-primary to-[#b86e2a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div 
        className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"
        style={{ animation: 'float 6s ease-in-out infinite' }}
      ></div>
      <div 
        className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"
        style={{ animation: 'float 8s ease-in-out infinite reverse' }}
      ></div>

      <div className="text-center relative z-10">
        {/* Animated Logo/Brand */}
        <div className="mb-8" style={{ animation: 'fadeInSlide 0.5s ease-out' }}>
          <h1 className="text-6xl font-bold text-white mb-3">ALISTO</h1>
          <div className="w-40 h-1 bg-white/50 rounded mx-auto"></div>
        </div>

        {/* Modern Loading Animation */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          {/* Rotating rings */}
          <div 
            className="absolute inset-0 border-4 border-white/30 rounded-full"
            style={{ animation: 'spin 2s linear infinite' }}
          ></div>
          <div 
            className="absolute inset-2 border-4 border-white/50 border-t-transparent rounded-full"
            style={{ animation: 'spin 1.5s linear infinite reverse' }}
          ></div>
          <div 
            className="absolute inset-4 border-4 border-white border-b-transparent rounded-full"
            style={{ animation: 'spin 1s linear infinite' }}
          ></div>
          
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-white"
              style={{ animation: 'pulse 2s ease-in-out infinite' }}
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </div>
        </div>

        {/* Loading Message */}
        <p className="text-xl text-white font-semibold mb-2">{message}</p>
        <p className="text-sm text-white/80">Preparing your personalized experience</p>

        {/* Progress bar */}
        <div className="mt-8 max-w-xs mx-auto">
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full"
              style={{ animation: 'slideProgress 2s ease-in-out' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLoadingScreen;
