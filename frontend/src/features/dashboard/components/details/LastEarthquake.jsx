import React from 'react'

const LastEarthquake = () => {
  // Hardcoded data - easily replaceable with API call
  const lastEarthquake = {
    magnitude: 4.7,
    location: 'Batangas, Philippines',
    date: 'October 24, 2025',
    time: '14:23 PST',
    depth: '15 km',
    distance: '75 km from your location',
    intensity: 'III - Weak',
    felt: true
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-3">
            <span className="material-symbols-outlined text-orange-500 text-xl">
              earthquake
            </span>
            <h3 className="text-lg font-semibold text-gray-900">Last Earthquake</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Magnitude</p>
              <p className="text-lg font-bold text-gray-900">{lastEarthquake.magnitude} Mw</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Intensity</p>
              <p className="text-sm font-medium text-gray-800">{lastEarthquake.intensity}</p>
            </div>
          </div>
          
          <div className="mt-3 space-y-1">
            <p className="text-sm font-medium text-gray-800">{lastEarthquake.location}</p>
            <p className="text-sm text-gray-600">{lastEarthquake.date} at {lastEarthquake.time}</p>
            <p className="text-xs text-gray-500">Depth: {lastEarthquake.depth} • {lastEarthquake.distance}</p>
          </div>
          
          <div className="flex items-center mt-3 pt-3 border-t border-gray-100">
            {lastEarthquake.felt ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                <span className="material-symbols-outlined text-xs mr-1">sensors</span>
                Felt by users
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                Not widely felt
              </span>
            )}
            <button className="ml-auto text-xs text-primary hover:text-primary/80 font-medium">
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LastEarthquake
