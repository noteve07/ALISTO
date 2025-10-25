import React from 'react'

const VolcanicAdvisories = () => {
  // Hardcoded data - easily replaceable with API call
  const advisories = [
    {
      id: 1,
      volcano: 'Mayon Volcano',
      location: 'Albay, Philippines',
      alertLevel: 2,
      status: 'Increased Unrest',
      lastUpdate: '6 hours ago',
      description: 'Increased volcanic earthquake activity and steam emissions observed',
      recommendations: ['Stay outside 6km radius', 'Monitor official updates', 'Prepare evacuation plans'],
      severity: 'moderate',
      distance: '420 km from your location'
    },
    {
      id: 2,
      volcano: 'Taal Volcano',
      location: 'Batangas, Philippines',
      alertLevel: 1,
      status: 'Abnormal',
      lastUpdate: '2 hours ago',
      description: 'Weak steam emissions and volcanic tremors detected',
      recommendations: ['Entry to Volcano Island prohibited', 'Stay alert for updates'],
      severity: 'low',
      distance: '75 km from your location'
    },
    {
      id: 3,
      volcano: 'Kanlaon Volcano',
      location: 'Negros Island, Philippines',
      alertLevel: 1,
      status: 'Abnormal',
      lastUpdate: '12 hours ago',
      description: 'Slight increase in volcanic CO2 emissions',
      recommendations: ['4km radius restriction', 'Monitor air quality'],
      severity: 'low',
      distance: '612 km from your location'
    },
    {
      id: 4,
      volcano: 'Bulusan Volcano',
      location: 'Sorsogon, Philippines',
      alertLevel: 0,
      status: 'Normal',
      lastUpdate: '1 day ago',
      description: 'Background levels of volcanic activity',
      recommendations: ['Normal precautions', 'Stay informed'],
      severity: 'normal',
      distance: '385 km from your location'
    }
  ]

  const getAlertColor = (level) => {
    const colors = {
      0: 'text-green-700 bg-green-100 border-green-200',
      1: 'text-yellow-700 bg-yellow-100 border-yellow-200',
      2: 'text-orange-700 bg-orange-100 border-orange-200',
      3: 'text-red-700 bg-red-100 border-red-200',
      4: 'text-purple-700 bg-purple-100 border-purple-200',
      5: 'text-red-900 bg-red-200 border-red-300'
    }
    return colors[level] || colors[0]
  }

  const getStatusIcon = (severity) => {
    const icons = {
      'normal': 'check_circle',
      'low': 'warning',
      'moderate': 'error',
      'high': 'dangerous',
      'critical': 'emergency'
    }
    return icons[severity] || icons.normal
  }

  const getSeverityColor = (severity) => {
    const colors = {
      'normal': 'text-green-500',
      'low': 'text-yellow-500',
      'moderate': 'text-orange-500',
      'high': 'text-red-500',
      'critical': 'text-red-700'
    }
    return colors[severity] || colors.normal
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Volcanic Advisories</h3>
          <p className="text-sm text-gray-600">Active volcano monitoring • PHIVOLCS</p>
        </div>
        <span className="material-symbols-outlined text-red-500 text-xl">
          volcano
        </span>
      </div>

      <div className="space-y-4">
        {advisories.map((advisory) => (
          <div 
            key={advisory.id}
            className="p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border border-gray-100"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className={`material-symbols-outlined text-lg ${getSeverityColor(advisory.severity)}`}>
                    {getStatusIcon(advisory.severity)}
                  </span>
                  <h4 className="font-semibold text-gray-900">{advisory.volcano}</h4>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getAlertColor(advisory.alertLevel)}`}>
                    Alert Level {advisory.alertLevel}
                  </span>
                </div>
                
                <div className="space-y-1 mb-3">
                  <p className="text-sm font-medium text-gray-700">{advisory.status}</p>
                  <p className="text-sm text-gray-600">{advisory.location} • {advisory.distance}</p>
                  <p className="text-sm text-gray-600">{advisory.description}</p>
                </div>
                
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>Updated {advisory.lastUpdate}</span>
                  <span>•</span>
                  <span>{advisory.recommendations.length} recommendations</span>
                </div>
              </div>
              
              <button className="ml-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
                <span className="material-symbols-outlined text-gray-400">
                  chevron_right
                </span>
              </button>
            </div>
            
            <div className="flex flex-wrap gap-1 mt-2">
              {advisory.recommendations.slice(0, 2).map((rec, recIndex) => (
                <span key={recIndex} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700">
                  {rec}
                </span>
              ))}
              {advisory.recommendations.length > 2 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                  +{advisory.recommendations.length - 2} more
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center mt-6 pt-4 border-t border-gray-100">
        <div className="flex space-x-4">
          <button className="flex items-center space-x-2 text-sm text-primary hover:text-primary/80 font-medium">
            <span>View volcano map</span>
            <span className="material-symbols-outlined text-sm">
              map
            </span>
          </button>
          <span className="text-gray-300">|</span>
          <button className="flex items-center space-x-2 text-sm text-primary hover:text-primary/80 font-medium">
            <span>PHIVOLCS updates</span>
            <span className="material-symbols-outlined text-sm">
              open_in_new
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default VolcanicAdvisories
