import React from 'react'
import { useScrollAnimation } from '../../../shared/hooks/useScrollAnimation'

const Paper = () => {
  const [ref, isVisible] = useScrollAnimation()

  return (
    <section 
      ref={ref}
      className={`px-6 py-20 sm:py-28 bg-background transition-all duration-700 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`} 
      id="latest-paper"
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <h3 className={`text-center text-3xl md:text-4xl lg:text-5xl font-bold text-primary-v2 transition-all duration-700 delay-100 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}>
            Our Latest Paper
          </h3>
          <p className={`text-center text-lg md:text-xl text-gray-600 mt-6 max-w-3xl mx-auto transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}>
            Pioneering work from the ALISTO Dev Team.
          </p>
        </div>

        <div className={`flex flex-col md:flex-row gap-8 items-start max-w-5xl mx-auto transition-all duration-700 delay-300 ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5'
        }`}> 
          {/* Paper cover image */}
          <div className="flex-shrink-0 flex justify-center md:w-1/3"> 
            <div className="w-40 sm:w-48 md:w-56">
              <img 
                src="/paper_cover.png" 
                alt="Cover of the paper Automated Live Information for Seismic Tracking and Observation (ALISTO)" 
                className="w-full h-auto rounded-lg border border-gray-300 shadow-lg object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
          </div>

          {/* Paper text */}
          <div className="flex-grow pl-0 md:pl-8 text-left">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 leading-normal">
              Automated Live Information for Seismic Tracking and Observation (ALISTO)
            </h2>
            <div className="mt-6 space-y-3 text-gray-600">
              <div className="space-y-1 text-base md:text-lg">
                <p>© 2025 Nicko James E. Barata, Miguel Grant V. Bagtas,</p>
                <p className="pl-0">Michael Joseph M. Talabo, Jealla Rose M. Waje.</p>
                <p className="pt-2">All rights reserved by the Authors.</p>
              </div>
            </div>
            <div className="mt-8">
              <button className="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-primary-v2 text-white font-bold transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:bg-orange-600 shadow-md">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Paper (PDF)
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Paper
