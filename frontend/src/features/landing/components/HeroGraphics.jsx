import React from 'react'

const HeroGraphics = () => {
  return (
    <div className="relative flex items-center justify-center h-full">
      {/* Background Circle */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-96 h-96 bg-white/10 rounded-full backdrop-blur-sm border border-white/20 animate-pulse"></div>
      </div>

      {/* Main Graphic Container */}
      <div className="relative z-10 w-80 h-80 flex items-center justify-center">
        
        {/* Central Hub */}
        <div className="absolute inset-5/12 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-20 h-20 bg-white rounded-2xl shadow-2xl flex items-center justify-center">
            <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>

        {/* Orbiting Elements */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
          <div className="w-16 h-16 bg-white/90 rounded-xl shadow-lg flex items-center justify-center animate-float">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>

        <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
          <div className="w-14 h-14 bg-white/90 rounded-xl shadow-lg flex items-center justify-center animate-float-delay-1">
            <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
          <div className="w-12 h-12 bg-white/90 rounded-xl shadow-lg flex items-center justify-center animate-float-delay-2">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        </div>

        <div className="absolute top-1/2 left-6 transform -translate-y-1/2">
          <div className="w-10 h-10 bg-white/90 rounded-lg shadow-lg flex items-center justify-center animate-float-delay-3">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        </div>

        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 320">
          <defs>
            <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
            </linearGradient>
          </defs>
          <line x1="160" y1="80" x2="160" y2="160" stroke="url(#line-gradient)" strokeWidth="2" className="animate-pulse" />
          <line x1="240" y1="160" x2="160" y2="160" stroke="url(#line-gradient)" strokeWidth="2" className="animate-pulse" />
          <line x1="160" y1="240" x2="160" y2="160" stroke="url(#line-gradient)" strokeWidth="2" className="animate-pulse" />
          <line x1="80" y1="160" x2="160" y2="160" stroke="url(#line-gradient)" strokeWidth="2" className="animate-pulse" />
        </svg>
      </div>

      {/* Data Points */}
      <div className="absolute top-10 right-95 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
      <div className="absolute bottom-20 right-80 w-2 h-2 bg-yellow-400 rounded-full animate-ping animation-delay-500"></div>
      <div className="absolute top-32 right-55 w-2 h-2 bg-green-400 rounded-full animate-ping animation-delay-1000"></div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-float-delay-1 {
          animation: float 3s ease-in-out infinite;
          animation-delay: 0.5s;
        }
        
        .animate-float-delay-2 {
          animation: float 3s ease-in-out infinite;
          animation-delay: 1s;
        }
        
        .animate-float-delay-3 {
          animation: float 3s ease-in-out infinite;
          animation-delay: 1.5s;
        }
        
        .animation-delay-500 {
          animation-delay: 0.5s;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  )
}

export default HeroGraphics
