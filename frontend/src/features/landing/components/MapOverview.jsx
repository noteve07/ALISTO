import React from 'react'

const MapOverview = () => {
  return (
    <div className="mt-6 w-full aspect-[16/9] rounded-lg border border-gray-300 bg-slate-200 bg-cover bg-center relative overflow-hidden">
      {/* Placeholder map background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-300"></div>
      
      {/* Philippines map outline placeholder */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-gray-600">
          <svg className="w-24 h-24 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-lg font-semibold text-gray-500">Interactive Seismic Map</p>
          <p className="text-sm text-gray-400 mt-1">Philippines Live Data Visualization</p>
        </div>
      </div>

      {/* Sample data points */}
      <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-yellow-500 rounded-full animate-pulse delay-300"></div>
      <div className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-orange-500 rounded-full animate-pulse delay-700"></div>
      <div className="absolute top-2/3 left-1/4 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse delay-1000"></div>
    </div>
  )
}

export default MapOverview
