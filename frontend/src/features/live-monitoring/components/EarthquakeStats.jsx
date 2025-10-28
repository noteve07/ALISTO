import React from 'react'
import { getEarthquakeStats } from '../utils/earthquakeUtils'

const EarthquakeStats = ({ earthquakeData }) => {
  const stats = getEarthquakeStats(earthquakeData)

  if (!earthquakeData.length) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Earthquake Statistics</h3>
        <p className="text-gray-600">No earthquake data available</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Live Earthquake Statistics</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total (24h)</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{stats.maxMagnitude}</div>
          <div className="text-sm text-gray-600">Max Magnitude</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.avgMagnitude}</div>
          <div className="text-sm text-gray-600">Avg Magnitude</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.recentCount}</div>
          <div className="text-sm text-gray-600">Recent (1h)</div>
        </div>
      </div>
      <div className="mt-3 text-xs text-gray-500 text-center">
        🔴 Live updates from Supabase
      </div>
    </div>
  )
}

export default EarthquakeStats
