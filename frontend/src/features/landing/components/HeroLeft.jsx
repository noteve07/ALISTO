import React from 'react'
import { useNavigate } from 'react-router-dom'

const HeroLeft = () => {
  const navigate = useNavigate()

  const handleGetStarted = () => {
    navigate('/signup')
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="space-y-6">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight">
          <span className="block bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">ALISTO</span>
        </h1>
        
        {/* Subtitle */}
        <div className="space-y-4">
          <p className="text-xl md:text-2xl text-blue-100 font-semibold leading-relaxed tracking-wide">
            Automated Live Information for Seismic Tracking and Observation
          </p>
          <p className="text-lg text-blue-200 leading-relaxed max-w-2xl font-light">
            Advanced monitoring technology providing real-time disaster alerts and risk assessment for Philippine communities.
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <button 
          onClick={handleGetStarted}
          className="group bg-gradient-to-r from-white to-blue-50 text-slate-800 px-10 py-4 rounded-2xl font-bold text-lg hover:from-blue-50 hover:to-white transition-all duration-300 shadow-2xl hover:shadow-white/20 transform hover:-translate-y-1 border border-white/20"
        >
          <span className="flex items-center justify-center">
            Get Started
            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </button>
        
        <button 
          onClick={() => {
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
              aboutSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="border-2 border-blue-200/80 text-blue-100 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-blue-100/10 hover:border-blue-100 transition-all duration-300 backdrop-blur-sm"
        >
          Learn More
        </button>
      </div>

    </div>
  )
}

export default HeroLeft
