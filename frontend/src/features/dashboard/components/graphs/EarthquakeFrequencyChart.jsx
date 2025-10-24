import React from 'react'

const EarthquakeFrequencyChart = () => {
  // Hardcoded data - easily replaceable with API call
  const chartData = {
    title: 'Last 7 Days - Earthquake Frequency (Mag > 3.0)',
    subtitle: 'Philippines',
    data: [
      { day: 'Oct 18', count: 8, label: 'Thu' },
      { day: 'Oct 19', count: 12, label: 'Fri' },
      { day: 'Oct 20', count: 6, label: 'Sat' },
      { day: 'Oct 21', count: 15, label: 'Sun' },
      { day: 'Oct 22', count: 9, label: 'Mon' },
      { day: 'Oct 23', count: 11, label: 'Tue' },
      { day: 'Oct 24', count: 7, label: 'Wed' }
    ],
    maxCount: 15
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{chartData.title}</h3>
          <p className="text-sm text-gray-600">{chartData.subtitle}</p>
        </div>
        <span className="material-symbols-outlined text-primary text-xl">
          bar_chart
        </span>
      </div>

      {/* Bar Chart Visualization */}
      <div className="relative">
        <div className="flex items-end justify-between h-40 px-2">
          {chartData.data.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="relative w-8 bg-gray-100 rounded-t">
                <div 
                  className="bg-primary rounded-t transition-all duration-500 hover:bg-primary/80"
                  style={{ 
                    height: `${(item.count / chartData.maxCount) * 140}px`,
                    minHeight: '4px'
                  }}
                ></div>
                {/* Tooltip on hover */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap">
                  {item.count} earthquakes
                </div>
              </div>
              <div className="mt-2 text-center">
                <p className="text-xs font-medium text-gray-700">{item.label}</p>
                <p className="text-xs text-gray-500">{item.day.split(' ')[1]}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-40 flex flex-col justify-between text-xs text-gray-500 -ml-4">
          <span>{chartData.maxCount}</span>
          <span>{Math.floor(chartData.maxCount / 2)}</span>
          <span>0</span>
        </div>
      </div>

      {/* Statistics */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900">{chartData.data.reduce((sum, item) => sum + item.count, 0)}</p>
          <p className="text-xs text-gray-500">Total this week</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900">{Math.round(chartData.data.reduce((sum, item) => sum + item.count, 0) / 7)}</p>
          <p className="text-xs text-gray-500">Daily average</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900">{Math.max(...chartData.data.map(item => item.count))}</p>
          <p className="text-xs text-gray-500">Peak day</p>
        </div>
      </div>
    </div>
  )
}

export default EarthquakeFrequencyChart
