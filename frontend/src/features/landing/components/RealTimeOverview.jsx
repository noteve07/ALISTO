import React from 'react'
import MapOverview from './MapOverview'

const RealTimeOverview = () => {
  return (
    <section className="px-4 py-16 sm:py-24" id="live-map">
      <div className="max-w-5xl mx-auto text-center">
        <h3 className="text-[#1A2B48] text-3xl font-bold">Track Seismic Events in Real-Time</h3>
        <p className="mt-2 text-[#6C757D]">
          Our interactive map provides a live overview of seismic activity across the Philippines.
        </p>

        <MapOverview />

        <p className="mt-4 text-sm font-semibold text-[#6C757D]">
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
