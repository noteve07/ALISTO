import React from 'react'

const NearbyEarthquakes = () => {
  // Hardcoded data - easily replaceable with API call
  const nearbyData = {
    count: 4,
    radius: '100km',
    strongest: 4.2,
    lastOccurred: '45 minutes ago'
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">Nearby ({nearbyData.radius})</p>
          <p className="text-3xl font-bold text-gray-900">{nearbyData.count}</p>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-gray-500">Strongest: {nearbyData.strongest} Mw</p>
            <p className="text-xs text-gray-400">Last: {nearbyData.lastOccurred}</p>
          </div>
        </div>
        <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
          <span className="material-symbols-outlined text-2xl text-purple-600">
            my_location
          </span>
        </div>
      </div>
    </div>
  )
}

export default NearbyEarthquakes
