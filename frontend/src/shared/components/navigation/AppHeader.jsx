import React from 'react'
import { useLocation } from 'react-router-dom'

const AppHeader = () => {
  const location = useLocation()

  // Get page title based on current path
  const getPageTitle = () => {
    const path = location.pathname
    if (path === '/app' || path === '/app/dashboard') return 'Dashboard'
    if (path === '/app/live-monitoring') return 'Live Monitoring'
    if (path === '/app/risk-evaluation') return 'Risk Evaluation'
    if (path === '/app/analytics') return 'Analytics'
    if (path === '/app/chatbot') return 'AI Assistant'
    if (path === '/app/account') return 'Account Settings'
    return 'ALISTO'
  }

  const getPageDescription = () => {
    const path = location.pathname
    if (path === '/app' || path === '/app/dashboard') return 'Monitor and manage your disaster response operations'
    if (path === '/app/live-monitoring') return 'Real-time monitoring of seismic and volcanic activity'
    if (path === '/app/risk-evaluation') return 'Assess and evaluate potential disaster risks'
    if (path === '/app/analytics') return 'Data insights and reporting for better decision making'
    if (path === '/app/chatbot') return 'Get help and insights from your AI assistant'
    if (path === '/app/account') return 'Manage your account settings and preferences'
    return 'Advanced Land Information System for Territorial Operations'
  }

  return (
    <header className="bg-white shadow-2xs border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Page Title */}
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{getPageTitle()}</h1>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-500 transition-colors">
            <span className="sr-only">View notifications</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {/* Notification badge */}
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400"></span>
          </button>

          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary text-sm"
            />
          </div>

          {/* User Profile */}
          <div className="relative">
            <button className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">U</span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-700">User Name</p>
                <p className="text-xs text-gray-500">user@alisto.com</p>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default AppHeader
