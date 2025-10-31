import React from "react";

const HeroGraphics = () => {
  return (
    <div className="relative flex items-center justify-center h-full">
      {/* Main Graphic Container */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {/* Philippines Map Silhouette */}
        <div className="relative">
          {/* Simplified Philippines Map Shape */}
          <svg
            width="400"
            height="500"
            viewBox="0 0 400 600"
            className="opacity-90"
          >
            {/* Main Luzon */}
            <path
              d="M180 80 L200 60 L220 70 L240 60 L250 80 L260 100 L270 140 L260 180 L250 200 L240 210 L220 200 L200 210 L180 200 L170 180 L160 140 L170 100 Z"
              fill="#FF8C42"
              stroke="#FF6B35"
              strokeWidth="2"
              className="animate-pulse"
            />

            {/* Visayas */}
            <path
              d="M190 230 L210 220 L230 225 L235 240 L230 255 L210 260 L190 255 Z"
              fill="#FF8C42"
              stroke="#FF6B35"
              strokeWidth="2"
              className="animate-pulse"
              style={{ animationDelay: "0.3s" }}
            />
            <path
              d="M245 235 L265 228 L280 240 L285 260 L275 275 L260 270 L250 260 Z"
              fill="#FF8C42"
              stroke="#FF6B35"
              strokeWidth="2"
              className="animate-pulse"
              style={{ animationDelay: "0.5s" }}
            />

            {/* Mindanao */}
            <path
              d="M200 290 L240 285 L270 300 L285 330 L290 370 L285 410 L275 440 L260 460 L240 470 L220 465 L200 455 L185 430 L180 395 L185 350 L190 320 Z"
              fill="#FF8C42"
              stroke="#FF6B35"
              strokeWidth="2"
              className="animate-pulse"
              style={{ animationDelay: "0.7s" }}
            />

            {/* Palawan */}
            <path
              d="M100 200 L110 180 L120 190 L125 220 L130 260 L125 290 L115 310 L105 300 L100 270 L95 230 Z"
              fill="#FF8C42"
              stroke="#FF6B35"
              strokeWidth="2"
              className="animate-pulse"
              style={{ animationDelay: "1s" }}
            />
          </svg>

          {/* Location Pin - Top (Luzon) */}
          <div
            className="absolute top-16 left-1/2 transform -translate-x-1/2 animate-bounce"
            style={{ animationDuration: "2s" }}
          >
            <div className="relative">
              <svg
                className="w-16 h-16 drop-shadow-xl"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                  fill="#EF4444"
                  stroke="#DC2626"
                  strokeWidth="1"
                />
                <circle cx="12" cy="9" r="2.5" fill="white" />
              </svg>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full animate-ping"></div>
            </div>
          </div>

          {/* Bell/Notification - Right side */}
          <div className="absolute top-32 right-8 animate-float-slow">
            <div className="relative">
              <div className="bg-yellow-400 p-4 rounded-2xl shadow-2xl transform rotate-12">
                <svg
                  className="w-12 h-12 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
            </div>
          </div>

          {/* Warning/Alert - Bottom right */}
          <div
            className="absolute bottom-24 right-16 animate-float-slow"
            style={{ animationDelay: "1s" }}
          >
            <div className="relative">
              <div className="bg-red-500 p-4 rounded-2xl shadow-2xl transform -rotate-6">
                <svg
                  className="w-12 h-12 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
            </div>
          </div>
        </div>

        {/* Floating particles */}
        <div
          className="absolute top-20 left-10 w-2 h-2 bg-orange-400 rounded-full animate-ping"
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

        .animation-delay-500 {
          animation-delay: 0.5s;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};

export default HeroGraphics;
