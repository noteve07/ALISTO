import React from 'react'

const StrongestMagnitude = () => {
  // Hardcoded data - easily replaceable with API call
  const strongestData = {
    magnitude: 5.8,
    location: 'Mindanao, Philippines',
    time: '2 hours ago',
    depth: '12 km',
    severity: 'moderate' // low, moderate, high, severe
  }

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      moderate: 'bg-yellow-100 text-yellow-800', 
      high: 'bg-orange-100 text-orange-800',
      severe: 'bg-red-100 text-red-800'
    }
    return colors[severity] || colors.moderate
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">Strongest Magnitude</p>
          <div className="flex items-baseline space-x-1">
            <p className="text-3xl font-bold text-gray-900">{strongestData.magnitude}</p>
            <p className="text-lg text-gray-500">Mw</p>
          </div>
          <p className="text-sm text-gray-500 mt-1">{strongestData.location}</p>
          <div className="flex items-center space-x-2 mt-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(strongestData.severity)}`}>
              {strongestData.severity.toUpperCase()}
            </span>
            <span className="text-xs text-gray-400">{strongestData.time}</span>
          </div>
        </div>
        <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg">
          <span className="material-symbols-outlined text-2xl text-orange-600">
            trending_up
          </span>
        </div>
      </div>
    </div>
  )
}

export default StrongestMagnitude
