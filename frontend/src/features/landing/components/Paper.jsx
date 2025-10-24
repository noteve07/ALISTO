import React from 'react'

const Paper = () => {
  return (
    <section className="px-4 py-16 sm:py-20 bg-white" id="latest-paper">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h3 className="text-center text-2xl sm:text-3xl font-bold text-[#1A2B48]">Our Latest Paper</h3>
          <p className="text-center text-base text-[#6C757D] mt-2">Pioneering work from the ALISTO Dev Team.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start max-w-5xl mx-auto"> 
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
            <h2 className="text-lg sm:text-xl font-bold text-[#1A2B48] leading-normal">
              Automated Live Information for Seismic Tracking and Observation (ALISTO)
            </h2>
            <div className="mt-4 space-y-3 text-[#6C757D]">
              <div className="space-y-1 text-sm">
                <p>© 2025 Nicko James E. Barata, Miguel Grant V. Bagtas,</p>
                <p className="pl-0">Michael Joseph M. Talabo, Jealla Rose M. Waje.</p>
                <p className="pt-2">All rights reserved by the Authors.</p>
              </div>
            </div>
            <div className="mt-6">
              <button className="inline-flex items-center justify-center h-12 px-8 rounded-lg bg-primary text-white font-bold transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:bg-primary/90 shadow-md">
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
