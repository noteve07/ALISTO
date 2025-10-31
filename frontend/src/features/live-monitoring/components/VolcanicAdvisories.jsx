import React, { useState } from 'react'

const VolcanicAdvisories = () => {
  const [isExpanded, setIsExpanded] = useState(true)

  // Hardcoded volcanic advisories data
  const advisories = [
    {
      id: 1,
      volcano: 'Mayon Volcano',
      location: 'Albay',
      alertLevel: 2,
      status: 'Moderate Level of Unrest',
      lastUpdate: '2 hours ago',
      description: 'Increased seismic activity detected'
    },
    {
      id: 2,
      volcano: 'Taal Volcano',
      location: 'Batangas',
      alertLevel: 1,
      status: 'Low Level of Unrest',
      lastUpdate: '5 hours ago',
      description: 'Weak steam emissions observed'
    },
    {
      id: 3,
      volcano: 'Kanlaon Volcano',
      location: 'Negros Island',
      alertLevel: 1,
      status: 'Low Level of Unrest',
      lastUpdate: '12 hours ago',
      description: 'Volcanic earthquake swarms recorded'
    }
  ]

  const getAlertLevelColor = (level) => {
    switch (level) {
      case 5:
        return 'bg-red-600 text-white'
      case 4:
        return 'bg-red-500 text-white'
      case 3:
        return 'bg-orange-500 text-white'
      case 2:
        return 'bg-yellow-500 text-white'
      case 1:
        return 'bg-green-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  return (
    <div className="absolute top-4 left-4 z-[1000] pointer-events-auto w-80">
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div 
          className="bg-[#D2691E] px-4 py-3 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold text-lg flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
              Volcanic Advisories
            </h3>
            <button className="text-white/80 hover:text-white transition-colors">
              <svg 
                className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          <p className="text-white/80 text-xs mt-0.5">Active volcano monitoring</p>
        </div>

        {/* Content */}
        {isExpanded && (
          <div className="max-h-96 overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style>
              {`
                .volcanic-content::-webkit-scrollbar {
                  display: none;
                }
              `}
            </style>
            <div className="divide-y divide-gray-100 volcanic-content">
              {advisories.map((advisory) => (
                <div key={advisory.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm truncate">
                        {advisory.volcano}
                      </h4>
                      <p className="text-xs text-gray-600">{advisory.location}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-md text-xs font-bold whitespace-nowrap ${getAlertLevelColor(advisory.alertLevel)}`}>
                      Alert {advisory.alertLevel}
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <p className="text-sm text-gray-700 font-medium">{advisory.status}</p>
                    <p className="text-xs text-gray-600 mt-1">{advisory.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      {advisory.lastUpdate}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-600 text-center">
                Data from PHIVOLCS • {advisories.length} active advisories
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VolcanicAdvisories
