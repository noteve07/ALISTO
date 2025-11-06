import React from "react";

const HeroGraphics = () => {
  return (
    <div className="relative flex items-center justify-center h-full">
      {/* Main Graphic Container */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {/* Central Philippines Map */}
        <div className="relative flex items-center justify-center -mt-24">
          {/* Philippines Map PNG - Larger Size */}
          <div className="relative w-lg h-lg flex items-center justify-center">
            <img
              src="/hero/hero_map.png"
              alt="Philippines Map"
              className="w-full h-full object-contain animate-pulse-slow drop-shadow-lg"
              style={{
                filter: "drop-shadow(0 10px 25px rgba(0,0,0,0.1))",
              }}
            />
          </div>

          {/* Location Pin - Top Left (Closer to map, tilted right) */}
          <div
            className="absolute top-18 left-18 animate-bounce"
            style={{ animationDuration: "2.5s", animationDelay: "0s" }}
          >
            <div className="relative">
              <img
                src="/hero/hero_location.png"
                alt="Location Pin"
                className="w-28 h-28 drop-shadow-lg hover:scale-110 transition-transform duration-300 transform -rotate-30"
                style={{
                  filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.15))",
                }}
              />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
            </div>
          </div>

          {/* Warning Alert - Top Right (Closer and Larger) */}
          <div
            className="absolute top-16 right-30 animate-float-slow"
            style={{ animationDelay: "0.5s" }}
          >
            <div className="relative">
              <img
                src="/hero/hero_warning.png"
                alt="Warning"
                className="w-24 h-24 drop-shadow-lg hover:scale-110 transition-transform duration-300 transform rotate-10"
                style={{
                  filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.15))",
                }}
              />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
            </div>
          </div>

          {/* Notification Bell - Bottom Left (Moved Upwards) */}
          <div
            className="absolute bottom-34 left-10 animate-float-slow"
            style={{ animationDelay: "1s" }}
          >
            <div className="relative">
              <img
                src="/hero/hero_notification.png"
                alt="Notification"
                className="w-18 h-18 drop-shadow-lg hover:scale-110 transition-transform duration-300 transform rotate-12"
                style={{
                  filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.15))",
                }}
              />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-ping"></div>
            </div>
          </div>

          {/* Announcement - Bottom Right (Higher and Bigger) */}
          <div
            className="absolute bottom-32 right-4 animate-float-slow"
            style={{ animationDelay: "1.5s" }}
          >
            <div className="relative">
              <img
                src="/hero/hero_announcement.png"
                alt="Announcement"
                className="w-26 h-26 drop-shadow-lg hover:scale-110 transition-transform duration-300 transform rotate-30"
                style={{
                  filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.15))",
                }}
              />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
            </div>
          </div>
        </div>

        {/* Floating Particles Around the Map */}
        <div
          className="absolute top-16 left-8 w-2 h-2 bg-orange-500 rounded-full animate-ping opacity-60"
          style={{ animationDelay: "0s", animationDuration: "3s" }}
        ></div>
        <div
          className="absolute top-32 right-12 w-3 h-3 bg-red-400 rounded-full animate-ping opacity-50"
          style={{ animationDelay: "1s", animationDuration: "2.5s" }}
        ></div>
        <div
          className="absolute bottom-24 left-20 w-2 h-2 bg-yellow-500 rounded-full animate-ping opacity-70"
          style={{ animationDelay: "2s", animationDuration: "3.5s" }}
        ></div>
        <div
          className="absolute bottom-40 right-8 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-60"
          style={{ animationDelay: "0.8s", animationDuration: "2.8s" }}
        ></div>
        <div
          className="absolute top-48 left-4 w-1 h-1 bg-orange-400 rounded-full animate-ping opacity-40"
          style={{ animationDelay: "1.7s", animationDuration: "4s" }}
        ></div>
        <div
          className="absolute top-64 right-20 w-2 h-2 bg-purple-400 rounded-full animate-ping opacity-50"
          style={{ animationDelay: "2.3s", animationDuration: "3.2s" }}
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
            transform: translateY(-12px) rotate(3deg);
          }
        }

        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.8;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.02);
          }
        }

        .animate-float-slow {
          animation: float-slow 4s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }

        .w-18 {
          width: 4.5rem;
        }

        .h-18 {
          height: 4.5rem;
        }

        .-right-18 {
          right: -4.5rem;
        }

        .-left-18 {
          left: -4.5rem;
        }

        /* Hover effects for interactive elements */
        img:hover {
          filter: brightness(1.1) contrast(1.05);
        }
      `}</style>
    </div>
  );
};

export default HeroGraphics;
