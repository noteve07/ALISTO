import React from 'react'

const Developer = () => {
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
    <section className="px-4 py-16 sm:py-24 bg-gray-50" id="developers">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h3 className="text-[#1A2B48] text-3xl font-bold">Meet the Team</h3>
          <p className="text-[#6C757D] mt-2">
            The dedicated developers and designers behind ALISTO
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {developers.map((developer) => (
            <div key={developer.id} className="text-center group">
              {/* Avatar placeholder */}
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-300 rounded-full flex items-center justify-center text-2xl font-bold text-gray-600 transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                {developer.initials}
              </div>
              
              {/* Developer info */}
              <h4 className="text-lg font-bold text-[#1A2B48] mb-2 transition-colors duration-300 group-hover:text-primary">
                {developer.name}
              </h4>
              <p className="text-sm text-[#6C757D] font-medium">
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
