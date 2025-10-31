import React from 'react'

const RecentEarthquakesList = () => {
  // Hardcoded data for design purposes
  const recentEarthquakes = [
    {
      id: 1,
      magnitude: 5.2,
      location: 'Mindanao, Philippines',
      depth: 45,
      time: '11:59 AM',
      timeAgo: '2 minutes ago',
      intensity: 'Moderate'
    },
    {
      id: 2,
      magnitude: 3.8,
      location: 'Leyte Gulf',
      depth: 10,
      time: '11:44 AM',
      timeAgo: '15 minutes ago',
      intensity: 'Minor'
    },
    {
      id: 3,
      magnitude: 4.5,
      location: 'Zambales, Luzon',
      depth: 120,
      time: '11:27 AM',
      timeAgo: '32 minutes ago',
      intensity: 'Light'
    },
    {
      id: 4,
      magnitude: 2.9,
      location: 'Batangas',
      depth: 8,
      time: '10:59 AM',
      timeAgo: '1 hour ago',
      intensity: 'Minor'
    },
    {
      id: 5,
      magnitude: 4.1,
      location: 'Surigao del Norte',
      depth: 35,
      time: '9:59 AM',
      timeAgo: '2 hours ago',
      intensity: 'Light'
    },
    {
      id: 6,
      magnitude: 3.2,
      location: 'Benguet',
      depth: 15,
      time: '8:59 AM',
      timeAgo: '3 hours ago',
      intensity: 'Minor'
    }
  ]

  const getMagnitudeColor = (magnitude) => {
    if (magnitude >= 5) return 'text-red-600 bg-red-50'
    if (magnitude >= 4) return 'text-[#D2691E] bg-orange-50'
    if (magnitude >= 3) return 'text-yellow-600 bg-yellow-50'
    return 'text-green-600 bg-green-50'
  }

  return (
    <div className="absolute top-4 right-4 z-[1000] pointer-events-auto w-[500px]">
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#D2691E] px-4 py-3">
          <h3 className="text-white font-semibold text-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            Recent Earthquakes
          </h3>
          <p className="text-white/80 text-xs mt-0.5">Last 24 hours</p>
        </div>

        {/* List */}
        <div className="overflow-y-auto max-h-[calc(100vh-180px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {recentEarthquakes.map((quake) => (
            <div
              key={quake.id}
              className="px-4 py-2.5 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className={`font-bold text-base px-2.5 py-0.5 rounded ${getMagnitudeColor(quake.magnitude)} whitespace-nowrap`}>
                    M {quake.magnitude}
                  </span>
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {quake.location}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-1.5 text-xs text-gray-600 ml-1">
                <span className="font-medium">{quake.time}</span>
                <span>{quake.timeAgo}</span>
                <span className="px-2 py-0.5 bg-gray-100 rounded-full font-medium">
                  {quake.intensity}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            🔴 Live updates • Total: {recentEarthquakes.length} events
          </p>
        </div>
      </div>
    </div>
  )
}

export default RecentEarthquakesList
