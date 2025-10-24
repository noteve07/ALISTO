import React from 'react'

const UserLocation = () => {
  // Hardcoded data - easily replaceable with API call
  const locationData = {
    city: 'Manila',
    province: 'Metro Manila',
    region: 'National Capital Region',
    coordinates: '14.5995° N, 120.9842° E',
    lastUpdated: '2 minutes ago'
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="material-symbols-outlined text-primary text-xl">
              location_on
            </span>
            <h3 className="text-lg font-semibold text-gray-900">Your Location</h3>
          </div>
          
          <div className="space-y-1">
            <p className="text-base font-medium text-gray-800">{locationData.city}, {locationData.province}</p>
            <p className="text-sm text-gray-600">{locationData.region}</p>
            <p className="text-xs text-gray-500">{locationData.coordinates}</p>
          </div>
          
          <div className="flex items-center mt-3 pt-3 border-t border-gray-100">
            <span className="material-symbols-outlined text-green-500 text-sm mr-1">
              refresh
            </span>
            <p className="text-xs text-gray-500">Updated {locationData.lastUpdated}</p>
            <button className="ml-auto text-xs text-primary hover:text-primary/80 font-medium">
              Update Location
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserLocation
