import React from 'react'

const Features = () => {
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
    <section id="core-features" className="px-4 py-16 sm:py-24 bg-gray-50 border-y border-gray-200">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h3 className="text-[#1A2B48] text-3xl font-bold">Core Features</h3>
          <p className="text-[#6C757D] mt-2">
            Explore the features that make ALISTO an essential tool for seismic awareness and preparedness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <article 
              key={feature.id}
              className="bg-white/95 rounded-lg p-6 text-center shadow-sm transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-xl group"
            >
              <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white mb-4">
                <span className="material-symbols-outlined text-2xl">
                  {feature.icon}
                </span>
              </div>
              <h4 className="text-lg font-bold text-[#1A2B48] mb-2 transition-colors duration-300 group-hover:text-primary">
                {feature.title}
              </h4>
              <p className="text-sm text-[#1A2B48]/80">
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
