import React from 'react'

const TodaysEarthquakes = () => {
  // Hardcoded data - easily replaceable with API call
  const todaysData = {
    count: 12,
    trend: '+3', // compared to yesterday
    isIncreasing: true
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">Today's Earthquakes</p>
          <p className="text-3xl font-bold text-gray-900">{todaysData.count}</p>
        </div>
        <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg">
          <span className="material-symbols-outlined text-2xl text-yellow-800">
            today
          </span>
        </div>
      </div>
    </div>
  )
}

export default TodaysEarthquakes
