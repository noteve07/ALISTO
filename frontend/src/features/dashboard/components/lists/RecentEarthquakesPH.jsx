import React from 'react'

const RecentEarthquakesPH = () => {
  // Hardcoded data - easily replaceable with API call
  const earthquakes = [
    {
      id: 1,
      magnitude: 5.8,
      location: 'Surigao del Norte, Philippines',
      time: '2 hours ago',
      depth: '15 km',
      intensity: 'IV - Moderately Strong',
      felt: true
    },
    {
      id: 2,
      magnitude: 4.2,
      location: 'Batangas, Philippines',
      time: '4 hours ago',
      depth: '8 km',
      intensity: 'III - Weak',
      felt: true
    },
    {
      id: 3,
      magnitude: 3.7,
      location: 'Masbate, Philippines',
      time: '6 hours ago',
      depth: '12 km',
      intensity: 'II - Slightly Felt',
      felt: false
    },
    {
      id: 4,
      magnitude: 4.9,
      location: 'Davao del Sur, Philippines',
      time: '8 hours ago',
      depth: '22 km',
      intensity: 'IV - Moderately Strong',
      felt: true
    },
    {
      id: 5,
      magnitude: 3.1,
      location: 'Ilocos Norte, Philippines',
      time: '12 hours ago',
      depth: '5 km',
      intensity: 'II - Slightly Felt',
      felt: false
    }
  ]

  const getMagnitudeColor = (magnitude) => {
    if (magnitude >= 5.0) return 'text-red-600 bg-red-50'
    if (magnitude >= 4.0) return 'text-orange-600 bg-orange-50'
    if (magnitude >= 3.0) return 'text-yellow-600 bg-yellow-50'
    return 'text-green-600 bg-green-50'
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Recent Earthquakes</h3>
          <p className="text-sm text-gray-600">Philippines</p>
        </div>
        <button className="text-sm text-primary hover:text-primary/80 font-medium">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {earthquakes.map((earthquake) => (
          <div 
            key={earthquake.id}
            className="flex items-start justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
          >
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-semibold ${getMagnitudeColor(earthquake.magnitude)}`}>
                  {earthquake.magnitude} Mw
                </span>
                {earthquake.felt && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                    <span className="material-symbols-outlined text-xs mr-1">sensors</span>
                    Felt
                  </span>
                )}
              </div>
              
              <h4 className="font-medium text-gray-900 mb-1">{earthquake.location}</h4>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>{earthquake.time}</span>
                <span>•</span>
                <span>Depth: {earthquake.depth}</span>
                <span>•</span>
                <span>{earthquake.intensity}</span>
              </div>
            </div>
            
            <button className="ml-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
              <span className="material-symbols-outlined text-gray-400">
                chevron_right
              </span>
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center mt-6 pt-4 border-t border-gray-100">
        <button className="flex items-center space-x-2 text-sm text-primary hover:text-primary/80 font-medium">
          <span>Load more earthquakes</span>
          <span className="material-symbols-outlined text-sm">
            expand_more
          </span>
        </button>
      </div>
    </div>
  )
}

export default RecentEarthquakesPH
