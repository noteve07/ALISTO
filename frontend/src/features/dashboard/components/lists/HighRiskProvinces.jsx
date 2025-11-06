import React from 'react'

const HighRiskProvinces = () => {
  // Hardcoded data - easily replaceable with API call
  const provinces = [
    {
      id: 1,
      name: 'Surigao del Norte',
      region: 'Caraga',
      riskLevel: 'Very High',
      riskScore: 8.9,
      factors: ['Active fault lines', 'High seismic activity', 'Coastal area'],
      recentActivity: '5 earthquakes this week',
      population: '534,276',
      trend: 'increasing'
    },
    {
      id: 2,
      name: 'Batangas',
      region: 'Calabarzon',
      riskLevel: 'High',
      riskScore: 7.8,
      factors: ['Taal Volcano proximity', 'Dense population', 'Active faults'],
      recentActivity: '3 earthquakes this week',
      population: '2.9M',
      trend: 'stable'
    },
    {
      id: 3,
      name: 'Masbate',
      region: 'Bicol',
      riskLevel: 'High',
      riskScore: 7.5,
      factors: ['Philippine Sea Plate', 'Frequent tremors', 'Island geography'],
      recentActivity: '7 earthquakes this week',
      population: '834,650',
      trend: 'increasing'
    },
    {
      id: 4,
      name: 'Albay',
      region: 'Bicol',
      riskLevel: 'High',
      riskScore: 7.2,
      factors: ['Mayon Volcano', 'Pacific Ring of Fire', 'Fault systems'],
      recentActivity: '2 earthquakes this week',
      population: '1.37M',
      trend: 'decreasing'
    },
    {
      id: 5,
      name: 'Bohol',
      region: 'Central Visayas',
      riskLevel: 'Moderate',
      riskScore: 6.8,
      factors: ['East Bohol Fault', 'Limestone terrain', 'Historical events'],
      recentActivity: '1 earthquake this week',
      population: '1.31M',
      trend: 'stable'
    }
  ]

  const getRiskColor = (level) => {
    const colors = {
      'Very High': 'text-red-700 bg-red-100 border-red-200',
      'High': 'text-orange-700 bg-orange-100 border-orange-200',
      'Moderate': 'text-yellow-700 bg-yellow-100 border-yellow-200',
      'Low': 'text-green-700 bg-green-100 border-green-200'
    }
    return colors[level] || colors.Moderate
  }

  const getTrendIcon = (trend) => {
    const icons = {
      'increasing': { icon: 'trending_up', color: 'text-red-500' },
      'decreasing': { icon: 'trending_down', color: 'text-green-500' },
      'stable': { icon: 'trending_flat', color: 'text-gray-500' }
    }
    return icons[trend] || icons.stable
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">High Risk Provinces</h3>
          <p className="text-sm text-gray-600">Based on seismic activity & vulnerability</p>
        </div>
        <span className="material-symbols-outlined text-red-500 text-xl">
          warning
        </span>
      </div>

      <div className="space-y-4">
        {provinces.map((province, index) => (
          <div 
            key={province.id}
            className="p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border border-gray-100"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-sm font-bold text-gray-500">#{index + 1}</span>
                  <h4 className="font-semibold text-gray-900">{province.name}</h4>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRiskColor(province.riskLevel)}`}>
                    {province.riskLevel}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{province.region} • Population: {province.population}</p>
                
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <span className="font-medium text-gray-700">Risk Score:</span>
                    <span className="font-bold text-gray-900">{province.riskScore}/10</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className={`material-symbols-outlined text-sm ${getTrendIcon(province.trend).color}`}>
                      {getTrendIcon(province.trend).icon}
                    </span>
                    <span className="text-gray-600">{province.recentActivity}</span>
                  </div>
                </div>
              </div>
              
              <button className="ml-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
                <span className="material-symbols-outlined text-gray-400">
                  info
                </span>
              </button>
            </div>
            
            <div className="flex flex-wrap gap-1 mt-2">
              {province.factors.slice(0, 3).map((factor, factorIndex) => (
                <span key={factorIndex} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                  {factor}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center mt-6 pt-4 border-t border-gray-100">
        <button className="flex items-center space-x-2 text-sm text-primary hover:text-primary/80 font-medium">
          <span>View detailed risk assessment</span>
          <span className="material-symbols-outlined text-sm">
            assessment
          </span>
        </button>
      </div>
    </div>
  )
}

export default HighRiskProvinces
