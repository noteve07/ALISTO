import React from 'react'

const ProvincesPieChart = () => {
  // Hardcoded data - easily replaceable with API call
  const chartData = {
    title: 'Last 24 Hours - Earthquakes by Province',
    subtitle: 'Philippines',
    data: [
      { province: 'Batangas', count: 8, percentage: 32, color: 'bg-red-500' },
      { province: 'Mindanao', count: 6, percentage: 24, color: 'bg-primary-v2' },
      { province: 'Luzon', count: 5, percentage: 20, color: 'bg-yellow-500' },
      { province: 'Visayas', count: 4, percentage: 16, color: 'bg-green-500' },
      { province: 'Others', count: 2, percentage: 8, color: 'bg-gray-400' }
    ],
    total: 25
  }

  // Calculate cumulative percentages for pie slices
  let cumulativePercentage = 0
  const dataWithAngles = chartData.data.map(item => {
    const startAngle = cumulativePercentage
    cumulativePercentage += item.percentage
    return {
      ...item,
      startAngle,
      endAngle: cumulativePercentage
    }
  })

  const createPieSlice = (startAngle, endAngle, color) => {
    const startAngleRad = (startAngle - 90) * (Math.PI / 180)
    const endAngleRad = (endAngle - 90) * (Math.PI / 180)
    
    const x1 = 50 + 40 * Math.cos(startAngleRad)
    const y1 = 50 + 40 * Math.sin(startAngleRad)
    const x2 = 50 + 40 * Math.cos(endAngleRad)
    const y2 = 50 + 40 * Math.sin(endAngleRad)
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0
    
    const pathData = [
      `M 50 50`,
      `L ${x1} ${y1}`,
      `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ')
    
    return pathData
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{chartData.title}</h3>
          <p className="text-sm text-gray-600">{chartData.subtitle}</p>
        </div>
        <span className="material-symbols-outlined text-primary-v2 text-xl">
          pie_chart
        </span>
      </div>

      <div className="flex items-center justify-between">
        {/* Pie Chart */}
        <div className="relative w-32 h-32">
          <svg width="100%" height="100%" viewBox="0 0 100 100" className="transform -rotate-90">
            {dataWithAngles.map((item, index) => (
              <path
                key={index}
                d={createPieSlice(item.startAngle * 3.6, item.endAngle * 3.6, item.color)}
                fill={`rgb(${
                  item.color === 'bg-red-500' ? '239 68 68' :
                  item.color === 'bg-primary-v2' ? '234 119 46' :
                  item.color === 'bg-yellow-500' ? '234 179 8' :
                  item.color === 'bg-green-500' ? '34 197 94' :
                  '156 163 175'
                })`}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            ))}
            {/* Center circle */}
            <circle cx="50" cy="50" r="15" fill="white" />
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{chartData.total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 ml-6 space-y-2">
          {chartData.data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-sm ${item.color}`}></div>
                <span className="text-sm font-medium text-gray-700">{item.province}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-gray-900">{item.count}</span>
                <span className="text-xs text-gray-500 ml-1">({item.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900">{chartData.data[0].province}</p>
          <p className="text-xs text-gray-500">Most active</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900">{chartData.data[0].percentage}%</p>
          <p className="text-xs text-gray-500">of total activity</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900">{chartData.data.length}</p>
          <p className="text-xs text-gray-500">provinces affected</p>
        </div>
      </div>
    </div>
  )
}

export default ProvincesPieChart
