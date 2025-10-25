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
          <div className="flex items-center mt-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
              todaysData.isIncreasing 
                ? 'bg-red-100 text-red-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {todaysData.isIncreasing ? '↗' : '↘'} {todaysData.trend} from yesterday
            </span>
          </div>
        </div>
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
          <span className="material-symbols-outlined text-2xl text-blue-600">
            waves
          </span>
        </div>
      </div>
    </div>
  )
}

export default TodaysEarthquakes
