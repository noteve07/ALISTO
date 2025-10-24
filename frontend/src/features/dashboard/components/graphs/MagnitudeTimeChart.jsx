import React from 'react'

const MagnitudeTimeChart = () => {
  // Hardcoded data - easily replaceable with API call
  const chartData = {
    title: 'Last 7 Days - Magnitude vs Time',
    subtitle: 'Your Location Area',
    data: [
      { day: 0, magnitude: 3.2, time: '12:30', location: 'Laguna' },
      { day: 1, magnitude: 4.1, time: '08:45', location: 'Batangas' },
      { day: 1.5, magnitude: 2.8, time: '20:15', location: 'Cavite' },
      { day: 2, magnitude: 3.7, time: '15:20', location: 'Rizal' },
      { day: 3, magnitude: 4.5, time: '06:10', location: 'Manila' },
      { day: 4, magnitude: 3.1, time: '14:30', location: 'Quezon' },
      { day: 5, magnitude: 3.9, time: '11:45', location: 'Bulacan' },
      { day: 6, magnitude: 2.9, time: '19:20', location: 'Laguna' }
    ],
    maxMagnitude: 5.0,
    minMagnitude: 2.0
  }

  const getMagnitudeColor = (magnitude) => {
    if (magnitude >= 4.5) return 'bg-red-500'
    if (magnitude >= 3.5) return 'bg-orange-500'
    if (magnitude >= 3.0) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getPointSize = (magnitude) => {
    if (magnitude >= 4.5) return 'w-4 h-4'
    if (magnitude >= 3.5) return 'w-3 h-3'
    return 'w-2 h-2'
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{chartData.title}</h3>
          <p className="text-sm text-gray-600">{chartData.subtitle}</p>
        </div>
        <span className="material-symbols-outlined text-primary text-xl">
          scatter_plot
        </span>
      </div>

      {/* Plot Chart Visualization */}
      <div className="relative">
        <div className="relative h-40 bg-gray-50 rounded border">
          {/* Grid lines */}
          <div className="absolute inset-0">
            {[1, 2, 3, 4, 5, 6].map((line) => (
              <div 
                key={line}
                className="absolute border-l border-gray-200"
                style={{ left: `${(line / 7) * 100}%`, height: '100%' }}
              ></div>
            ))}
            {[3, 3.5, 4, 4.5].map((mag) => (
              <div 
                key={mag}
                className="absolute border-t border-gray-200"
                style={{ 
                  top: `${100 - ((mag - chartData.minMagnitude) / (chartData.maxMagnitude - chartData.minMagnitude)) * 100}%`,
                  width: '100%' 
                }}
              ></div>
            ))}
          </div>

          {/* Data points */}
          {chartData.data.map((point, index) => (
            <div
              key={index}
              className={`absolute rounded-full ${getMagnitudeColor(point.magnitude)} ${getPointSize(point.magnitude)} opacity-80 hover:opacity-100 transition-opacity cursor-pointer group`}
              style={{
                left: `${(point.day / 7) * 100}%`,
                bottom: `${((point.magnitude - chartData.minMagnitude) / (chartData.maxMagnitude - chartData.minMagnitude)) * 100}%`,
                transform: 'translate(-50%, 50%)'
              }}
            >
              {/* Tooltip */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {point.magnitude} Mw • {point.location} • {point.time}
              </div>
            </div>
          ))}
        </div>

        {/* Axes labels */}
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Day 1</span>
          <span>Day 3</span>
          <span>Day 5</span>
          <span>Day 7</span>
        </div>
        
        <div className="absolute left-0 top-0 h-40 flex flex-col justify-between text-xs text-gray-500 -ml-8">
          <span>5.0</span>
          <span>4.0</span>
          <span>3.0</span>
          <span>2.0</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-4 mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs text-gray-600">3.0</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <span className="text-xs text-gray-600">3.0-3.5</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <span className="text-xs text-gray-600">3.5-4.5</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          <span className="text-xs text-gray-600">4.5</span>
        </div>
      </div>
    </div>
  )
}

export default MagnitudeTimeChart
