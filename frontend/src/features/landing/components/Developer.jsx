import React from 'react'
import { useScrollAnimation } from '../../../shared/hooks/useScrollAnimation'

const Developer = () => {
  const [sectionRef, isVisible] = useScrollAnimation(0.2)
  const developers = [
    {
      id: 1,
      name: 'Nicko James E. Barata',
      role: 'Full Stack Developer',
      initials: 'NB'
    },
    {
      id: 2,
      name: 'Jealla Rose M. Waje',
      role: 'UI/UX Designer',
      initials: 'JW'
    },
    {
      id: 3,
      name: 'Miguel Grant V. Bagtas',
      role: 'Backend Developer',
      initials: 'MB'
    },
    {
      id: 4,
      name: 'Michale Joseph M. Talabo',
      role: 'Backend Developer',
      initials: 'MT'
    }
  ]

  return (
    <section 
      ref={sectionRef}
      className={`px-4 py-16 sm:py-24 bg-gray-50 transition-all duration-600 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      }`} 
      id="developers"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h3 className={`text-[#1A2B48] text-4xl font-bold transition-all duration-600 delay-100 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}>
            Meet the Team
          </h3>
          <p className={`text-[#6C757D] mt-2 text-lg transition-all duration-600 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}>
            The dedicated developers and designers behind ALISTO
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {developers.map((developer, index) => (
            <div 
              key={developer.id} 
              className={`text-center group transition-all duration-600 ${
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
              }`}
              style={{ transitionDelay: `${300 + index * 75}ms` }}
            >
              {/* Avatar placeholder */}
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-300 rounded-full flex items-center justify-center text-2xl font-bold text-gray-600 transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                {developer.initials}
              </div>
              
              {/* Developer info */}
              <h4 className="text-xl font-bold text-[#1A2B48] mb-2 transition-colors duration-300 group-hover:text-primary">
                {developer.name}
              </h4>
              <p className="text-base text-[#6C757D] font-medium">
                {developer.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Developer
