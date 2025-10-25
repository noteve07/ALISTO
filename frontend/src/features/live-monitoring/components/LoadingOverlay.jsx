import React from 'react'

const LoadingOverlay = () => {
  return (
    <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading earthquake data...</p>
      </div>
    </div>
  )
}


export default LoadingOverlay