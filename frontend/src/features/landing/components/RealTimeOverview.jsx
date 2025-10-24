import React from 'react'
import MapOverview from './MapOverview'
import { useScrollAnimation } from '../../../shared/hooks/useScrollAnimation'

const RealTimeOverview = () => {
  const [ref, isVisible] = useScrollAnimation()

  return (
    <section 
      ref={ref}
      className={`px-4 py-16 sm:py-24 transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
      }`} 
      id="live-map"
    >
      <div className="max-w-5xl mx-auto text-center">
        <h3 className={`text-[#1A2B48] text-4xl font-bold transition-all duration-700 delay-100 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}>
          Track Seismic Events in Real-Time
        </h3>
        <p className={`mt-2 text-[#6C757D] text-lg transition-all duration-700 delay-200 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}>
          Our interactive map provides a live overview of seismic activity across the Philippines.
        </p>

        <div className={`transition-all duration-700 delay-300 ${
          isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-5 scale-95'
        }`}>
          <MapOverview />
        </div>

        <p className={`mt-4 text-base font-semibold text-[#6C757D] transition-all duration-700 delay-400 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}>
          Data powered by{' '}
          <a 
            href="https://www.phivolcs.dost.gov.ph" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-primary hover:underline"
          >
            DOST-PHIVOLCS
          </a>
        </p>
      </div>
    </section>
  )
}

export default RealTimeOverview
