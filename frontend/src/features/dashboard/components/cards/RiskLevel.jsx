import React from 'react'

const RiskLevel = () => {
  // Hardcoded data - easily replaceable with API call
  const riskData = {
    level: 'Moderate',
    score: 6.2, // out of 10
    factors: ['Active fault lines', 'Population density', 'Building codes'],
    recommendation: 'Stay prepared and informed'
  }

  const getRiskColor = (level) => {
    const colors = {
      'Low': 'bg-green-500 text-white',
      'Moderate': 'bg-yellow-500 text-white',
      'High': 'bg-orange-500 text-white', 
      'Very High': 'bg-red-500 text-white'
    }
    return colors[level] || colors.Moderate
  }

  const getRiskIcon = (level) => {
    const icons = {
      'Low': 'shield_person',
      'Moderate': 'warning', 
      'High': 'error',
      'Very High': 'dangerous'
    }
    return icons[level] || icons.Moderate
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">Risk Level</p>
          <div className="flex items-center space-x-2 mb-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getRiskColor(riskData.level)}`}>
              {riskData.level}
            </span>
            <span className="text-lg font-bold text-gray-700">{riskData.score}/10</span>
          </div>
          <p className="text-xs text-gray-500 mb-1">{riskData.recommendation}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {riskData.factors.slice(0, 2).map((factor, index) => (
              <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                {factor}
              </span>
            ))}
          </div>
        </div>
        <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${getRiskColor(riskData.level).replace('text-white', 'text-white').replace('bg-', 'bg-').split(' ')[0]}/20`}>
          <span className={`material-symbols-outlined text-2xl ${getRiskColor(riskData.level).replace('text-white', 'text-white').replace('bg-', 'text-').split(' ')[0].replace('text-', '').replace('500', '600')}`}>
            {getRiskIcon(riskData.level)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default RiskLevel
