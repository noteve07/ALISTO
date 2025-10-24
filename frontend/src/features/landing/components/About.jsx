import React from 'react'
import { useScrollAnimation } from '../../../shared/hooks/useScrollAnimation'

const About = () => {
  const [ref, isVisible] = useScrollAnimation()

  return (
    <section 
      ref={ref}
      className={`px-4 py-16 sm:py-24 transition-all duration-600 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`} 
      id="about"
    >
      <div className="max-w-3xl mx-auto text-center">
        <h2 className={`text-[#1A2B48] text-4xl font-bold transition-all duration-600 delay-100 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}>
          About ALISTO
        </h2>
        <p className={`mt-4 text-[#1A2B48] text-lg leading-relaxed transition-all duration-600 delay-200 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}>
          Our mission is to provide accessible, real-time seismic risk assessment to empower communities across the Philippines. 
          ALISTO is powered by official data from DOST-PHIVOLCS and enhanced with advanced machine learning technology to deliver 
          timely and accurate seismic information.
        </p>
      </div>
    </section>
  )
}

export default About
