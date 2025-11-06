import React from "react";

const HeroGraphics = () => {
  return (
    <div className="relative flex items-center justify-center h-full min-h-[600px]">
      {/* Main Central Logo */}
      <div className="relative z-10 flex items-center justify-center">
        {/* ALISTO Map - Central Element */}
        <div className="relative">
          <div className="w-80 h-80 flex items-center justify-center animate-pulse">
            <img
              src="/ALISTO_Map.svg"
              alt="ALISTO Map"
              className="w-full h-full object-contain drop-shadow-2xl map-transparent"
              style={{ 
                filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.1))'
              }}
            />
          </div>
          
          {/* Glowing ring around map */}
          <div className="absolute inset-0 border-4 border-primary-v2/20 rounded-full animate-spin-slow"></div>
          <div className="absolute inset-4 border-2 border-orange-300/30 rounded-full animate-spin-reverse"></div>
        </div>

        {/* Floating SVG Icons around the logo */}
        
        {/* Location Icon - Top Left */}
        <div 
          className="absolute -top-12 -left-16 animate-float-slow"
          style={{ animationDelay: "0s" }}
        >
          <div className="relative group">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-2xl transform rotate-12 group-hover:rotate-0 transition-transform duration-500">
              <img
                src="/ALISTO_Location.svg"
                alt="Location"
                className="w-full h-full object-contain p-3"
              />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full animate-ping"></div>
          </div>
        </div>

        {/* Warning Icon - Bottom Left */}
        <div 
          className="absolute -bottom-16 -left-12 animate-float-slow"
          style={{ animationDelay: "2s" }}
        >
          <div className="relative group">
            <div className="w-26 h-26 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-2xl transform rotate-6 group-hover:rotate-0 transition-transform duration-500">
              <img
                src="/ALISTO_Warning.svg"
                alt="Warning"
                className="w-full h-full object-contain p-3"
              />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full animate-ping"></div>
          </div>
        </div>

        {/* Announcement Icon - Bottom Right */}
        <div 
          className="absolute -bottom-12 -right-16 animate-float-slow"
          style={{ animationDelay: "1.5s" }}
        >
          <div className="relative group">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-2xl transform -rotate-12 group-hover:rotate-0 transition-transform duration-500">
              <img
                src="/ALISTO_Announcement.svg"
                alt="Announcement"
                className="w-full h-full object-contain p-3"
              />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
          </div>
        </div>

        {/* Notification Icon - Left Side */}
        <div 
          className="absolute -left-32 top-8 animate-float-slow"
          style={{ animationDelay: "0.5s" }}
        >
          <div className="relative group">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-2xl transform rotate-3 group-hover:rotate-0 transition-transform duration-500">
              <img
                src="/ALISTO_Notification.svg"
                alt="Notification"
                className="w-full h-full object-contain p-2"
              />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-400 rounded-full animate-ping"></div>
          </div>
        </div>

        {/* Orbiting particles */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-primary-v2 rounded-full animate-orbit"></div>
          <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-orange-400 rounded-full animate-orbit-reverse"></div>
          <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-blue-400 rounded-full animate-orbit" style={{ animationDelay: "2s" }}></div>
        </div>

        {/* Connecting lines/rays */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 600 600">
            <defs>
              <linearGradient id="rayGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff6b35" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#ff6b35" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <path d="M300,300 L150,150" stroke="url(#rayGradient)" strokeWidth="2" className="animate-pulse"/>
            <path d="M300,300 L450,150" stroke="url(#rayGradient)" strokeWidth="2" className="animate-pulse" style={{ animationDelay: "0.5s" }}/>
            <path d="M300,300 L150,450" stroke="url(#rayGradient)" strokeWidth="2" className="animate-pulse" style={{ animationDelay: "1s" }}/>
            <path d="M300,300 L450,450" stroke="url(#rayGradient)" strokeWidth="2" className="animate-pulse" style={{ animationDelay: "1.5s" }}/>
          </svg>
        </div>
      </div>

      {/* Background animated elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-v2/5 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-300/10 rounded-full filter blur-2xl animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      {/* Custom CSS for enhanced animations */}
      <style jsx>{`
        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0px) rotate(var(--rotate-start, 0deg));
          }
          50% {
            transform: translateY(-20px) rotate(var(--rotate-end, 5deg));
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        @keyframes orbit {
          0% {
            transform: rotate(0deg) translateX(150px) rotate(0deg);
          }
          100% {
            transform: rotate(360deg) translateX(150px) rotate(-360deg);
          }
        }

        @keyframes orbit-reverse {
          0% {
            transform: rotate(0deg) translateX(120px) rotate(0deg);
          }
          100% {
            transform: rotate(-360deg) translateX(120px) rotate(360deg);
          }
        }

        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        .animate-spin-reverse {
          animation: spin-reverse 15s linear infinite;
        }

        .animate-orbit {
          animation: orbit 25s linear infinite;
        }

        .animate-orbit-reverse {
          animation: orbit-reverse 30s linear infinite;
        }

        /* REMOVE ALL WHITE BACKGROUNDS FROM ALISTO SVGs */
        img[src*="ALISTO_"] {
          background: transparent !important;
          background-color: transparent !important;
          
          /* Multiple approaches to remove white backgrounds */
          mix-blend-mode: multiply !important;
          
          /* Enhanced filters to remove white and improve visibility */
          filter: 
            contrast(1.3) 
            brightness(1.2) 
            saturate(1.2)
            drop-shadow(0 8px 25px rgba(0,0,0,0.15));
            
          /* Make sure no white shows through */
          opacity: 0.95;
        }
        
        /* Special handling for the central map */
        .map-transparent,
        img[src*="ALISTO_Map.svg"] {
          mix-blend-mode: multiply !important;
          filter: 
            contrast(1.2) 
            brightness(1.1) 
            saturate(1.1)
            drop-shadow(0 10px 30px rgba(0,0,0,0.2));
          opacity: 0.9;
        }
        
        /* Extra aggressive white removal */
        img[src*="ALISTO_"]:before {
          content: '';
          background: transparent;
        }
      `}</style>
    </div>
  );
};

export default HeroGraphics;
