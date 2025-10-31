import React from 'react'
import MapOverview from './MapOverview'
import { useScrollAnimation } from '../../../shared/hooks/useScrollAnimation'

const RealTimeOverview = () => {
  const [ref, isVisible] = useScrollAnimation()

  return (
    <section 
      ref={ref}
      className={`px-6 py-20 sm:py-28 bg-background transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
      }`} 
      id="live-map"
    >
      <div className="max-w-6xl mx-auto text-center">
        <h3 className={`text-primary-v2 text-3xl md:text-4xl lg:text-5xl font-bold transition-all duration-700 delay-100 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}>
          Track Seismic Events in Real-Time
        </h3>
        <p className={`mt-6 text-gray-600 text-lg md:text-xl max-w-3xl mx-auto transition-all duration-700 delay-200 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}>
          Our interactive map provides a live overview of seismic activity across the Philippines.
        </p>

        <div className={`transition-all duration-700 delay-300 ${
          isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-5 scale-95'
        }`}>
          <MapOverview />
        </div>

        <p className={`mt-8 text-base md:text-lg font-medium text-gray-600 transition-all duration-700 delay-400 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}>
          Data powered by{' '}
          <a 
            href="https://www.phivolcs.dost.gov.ph" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-primary-v2 hover:underline font-semibold"
          >
            DOST-PHIVOLCS
          </a>
        </p>
      </div>
    </section>
  )
}

export default RealTimeOverview
