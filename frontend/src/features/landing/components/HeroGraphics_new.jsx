import React from "react";

const HeroGraphics = () => {
  return (
    <div className="relative flex items-center justify-center h-full">
      {/* Main Graphic Container */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {/* Central Circle with Philippines-like layout */}
        <div className="relative">
          {/* Main Central Circle */}
          <div className="w-80 h-80 relative">
            {/* Central Hub */}
            <div className="absolute inset-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-16 h-16 bg-primary-v2 rounded-full shadow-2xl flex items-center justify-center animate-pulse">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                  <circle cx="12" cy="9" r="2.5" fill="white" />
                </svg>
              </div>
            </div>

            {/* Orbiting Circles around Central Hub */}
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
              <div
                className="w-12 h-12 bg-red-500 rounded-full shadow-lg flex items-center justify-center animate-bounce"
                style={{ animationDuration: "2s" }}
              >
                <svg
                  className="w-6 h-6 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                </svg>
              </div>
            </div>

            <div className="absolute top-1/2 right-8 transform -translate-y-1/2">
              <div className="w-14 h-14 bg-yellow-500 rounded-full shadow-lg flex items-center justify-center animate-float-slow">
                <svg
                  className="w-7 h-7 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                </svg>
              </div>
            </div>

            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
              <div
                className="w-10 h-10 bg-orange-500 rounded-full shadow-lg flex items-center justify-center animate-float-slow"
                style={{ animationDelay: "1s" }}
              >
                <svg
                  className="w-5 h-5 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                </svg>
              </div>
            </div>

            <div className="absolute top-1/2 left-8 transform -translate-y-1/2">
              <div
                className="w-8 h-8 bg-green-500 rounded-full shadow-lg flex items-center justify-center animate-float-slow"
                style={{ animationDelay: "2s" }}
              >
                <svg
                  className="w-4 h-4 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>

            {/* Connection Lines */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 320 320"
            >
              <defs>
                <linearGradient
                  id="line-gradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="rgba(210, 105, 30, 0.3)" />
                  <stop offset="100%" stopColor="rgba(210, 105, 30, 0.1)" />
                </linearGradient>
              </defs>
              <line
                x1="160"
                y1="50"
                x2="160"
                y2="160"
                stroke="url(#line-gradient)"
                strokeWidth="2"
                className="animate-pulse"
              />
              <line
                x1="270"
                y1="160"
                x2="160"
                y2="160"
                stroke="url(#line-gradient)"
                strokeWidth="2"
                className="animate-pulse"
              />
              <line
                x1="160"
                y1="270"
                x2="160"
                y2="160"
                stroke="url(#line-gradient)"
                strokeWidth="2"
                className="animate-pulse"
              />
              <line
                x1="50"
                y1="160"
                x2="160"
                y2="160"
                stroke="url(#line-gradient)"
                strokeWidth="2"
                className="animate-pulse"
              />
            </svg>
          </div>
        </div>

        {/* Floating particles */}
        <div
          className="absolute top-20 left-10 w-2 h-2 bg-primary-v2 rounded-full animate-ping"
          style={{ animationDelay: "0s" }}
        ></div>
        <div
          className="absolute top-40 right-20 w-2 h-2 bg-yellow-400 rounded-full animate-ping"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-32 left-16 w-2 h-2 bg-red-400 rounded-full animate-ping"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/3 right-10 w-1.5 h-1.5 bg-orange-400 rounded-full animate-ping"
          style={{ animationDelay: "1.5s" }}
        ></div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(5deg);
          }
        }

        .animate-float-slow {
          animation: float-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default HeroGraphics;
