import React, { useState } from 'react'

const AnalyticsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30days')

  const analyticsData = {
    overview: [
      { metric: 'Total Events', value: '1,247', change: '+12.3%', changeType: 'increase' },
      { metric: 'Alert Response Time', value: '2.4s', change: '-8.7%', changeType: 'decrease' },
      { metric: 'System Uptime', value: '99.8%', change: '+0.2%', changeType: 'increase' },
      { metric: 'Data Points Collected', value: '2.1M', change: '+15.6%', changeType: 'increase' }
    ],
    trends: [
      { category: 'Earthquakes', thisMonth: 89, lastMonth: 76, change: '+17%' },
      { category: 'Volcanic Activity', thisMonth: 12, lastMonth: 8, change: '+50%' },
      { category: 'System Alerts', thisMonth: 156, lastMonth: 203, change: '-23%' },
      { category: 'Station Maintenance', thisMonth: 28, lastMonth: 31, change: '-10%' }
    ]
  }

  const reports = [
    { id: 1, name: 'Seismic Activity Summary', type: 'Monthly Report', generated: '2024-10-20', size: '2.4 MB' },
    { id: 2, name: 'Risk Assessment Analysis', type: 'Quarterly Report', generated: '2024-10-15', size: '5.8 MB' },
    { id: 3, name: 'Station Performance Metrics', type: 'Weekly Report', generated: '2024-10-18', size: '1.2 MB' },
    { id: 4, name: 'Alert Response Statistics', type: 'Daily Report', generated: '2024-10-21', size: '856 KB' }
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header with Time Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <select 
          value={selectedPeriod} 
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2 text-sm"
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
          <option value="1year">Last Year</option>
        </select>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsData.overview.map((metric, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.metric}</p>
                <div className="flex items-baseline mt-1">
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  <p className={`ml-2 text-sm font-medium ${
                    metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.change}
                  </p>
                </div>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Trends Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Event Trends</h3>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-xs font-medium text-primary bg-primary/10 rounded-md">
                  Events
                </button>
                <button className="px-3 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded-md">
                  Alerts
                </button>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg h-64 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500">Interactive Chart Loading...</p>
              </div>
            </div>
          </div>

          {/* Geographic Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Geographic Distribution</h3>
            <div className="bg-gray-50 rounded-lg h-64 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-gray-500">Heat Map Loading...</p>
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Activity Trends */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Trends</h3>
            <div className="space-y-4">
              {analyticsData.trends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{trend.category}</p>
                    <p className="text-xs text-gray-600">{trend.thisMonth} this month</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      trend.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {trend.change}
                    </p>
                    <p className="text-xs text-gray-500">vs last month</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export Options */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Export Data</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                Export CSV
              </button>
              <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generate PDF
              </button>
              <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share Report
              </button>
            </div>
          </div>

          {/* Recent Reports */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Reports</h3>
            <div className="space-y-3">
              {reports.slice(0, 3).map((report) => (
                <div key={report.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                  <p className="text-sm font-medium text-gray-900">{report.name}</p>
                  <p className="text-xs text-gray-600">{report.type} • {report.size}</p>
                  <p className="text-xs text-gray-500 mt-1">{report.generated}</p>
                </div>
              ))}
            </div>
            <button className="w-full mt-3 text-sm font-medium text-primary hover:text-primary/80">
              View All Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage