import React from 'react'
import { useScrollAnimation } from '../../../shared/hooks/useScrollAnimation'

const Features = () => {
  const [sectionRef, isVisible] = useScrollAnimation(0.2)
  const features = [
    {
      id: 1,
      title: 'Live Monitoring',
      description: 'Access real-time data feeds from seismic sensors deployed across the Philippines.',
      icon: 'sensors'
    },
    {
      id: 2,
      title: 'Interactive Dashboards',
      description: 'Utilize dynamic and intuitive data visualization tools to understand seismic patterns.',
      icon: 'dashboard'
    },
    {
      id: 3,
      title: 'Risk Evaluation',
      description: 'Leverage predictive analytics to evaluate potential risks for specific areas.',
      icon: 'security'
    }
  ]

  return (
    <section 
      ref={sectionRef}
      id="core-features" 
      className={`px-4 py-16 sm:py-24 bg-gray-50 border-y border-gray-200 transition-all duration-600 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
      }`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h3 className={`text-[#1A2B48] text-4xl font-bold transition-all duration-600 delay-100 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}>
            Core Features
          </h3>
          <p className={`text-[#6C757D] mt-2 text-lg transition-all duration-600 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}>
            Explore the features that make ALISTO an essential tool for seismic awareness and preparedness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <article 
              key={feature.id}
              className={`bg-white/95 rounded-lg p-6 text-center shadow-sm transition-all duration-600 hover:transform hover:-translate-y-2 hover:shadow-xl group ${
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
              }`}
              style={{ transitionDelay: `${300 + index * 100}ms` }}
            >
              <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white mb-4">
                <span className="material-symbols-outlined text-2xl">
                  {feature.icon}
                </span>
              </div>
              <h4 className="text-xl font-bold text-[#1A2B48] mb-2 transition-colors duration-300 group-hover:text-primary">
                {feature.title}
              </h4>
              <p className="text-base text-[#1A2B48]/80">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
