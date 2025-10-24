import React from 'react'
import { useNavigate } from 'react-router-dom'

const ErrorPage = () => {
  const navigate = useNavigate()

  const handleGoHome = () => {
    navigate('/')
  }

  const handleGoToDashboard = () => {
    navigate('/app')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* Error Icon */}
          <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>

          {/* Error Message */}
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleGoHome}
              className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Go to Home
            </button>
            <button 
              onClick={handleGoToDashboard}
              className="border-2 border-primary text-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors"
            >
              Go to Dashboard
            </button>
          </div>

          {/* Additional Help */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need help? Contact support or check our system status
            </p>
            <div className="flex justify-center space-x-4 mt-2">
              <button className="text-sm text-primary hover:text-primary/80 font-medium">
                System Status
              </button>
              <span className="text-gray-300">•</span>
              <button className="text-sm text-primary hover:text-primary/80 font-medium">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ErrorPage
