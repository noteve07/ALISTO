import React, { useState } from 'react'

const LiveMonitoringPage = () => {
  const [activeTab, setActiveTab] = useState('earthquakes')

  const recentEvents = {
    earthquakes: [
      { id: 1, magnitude: '5.2', location: 'Bataan, Philippines', depth: '10 km', time: '2 min ago', coordinates: '14.65°N, 120.35°E' },
      { id: 2, magnitude: '3.8', location: 'Quezon, Philippines', depth: '15 km', time: '8 min ago', coordinates: '14.20°N, 121.15°E' },
      { id: 3, magnitude: '4.1', location: 'Mindoro, Philippines', depth: '25 km', time: '12 min ago', coordinates: '13.45°N, 120.85°E' }
    ],
    volcanoes: [
      { id: 1, name: 'Mayon Volcano', alertLevel: 'Alert Level 2', activity: 'Increased unrest', lastUpdate: '5 min ago' },
      { id: 2, name: 'Taal Volcano', alertLevel: 'Alert Level 1', activity: 'Background', lastUpdate: '15 min ago' },
      { id: 3, name: 'Kanlaon Volcano', alertLevel: 'Alert Level 1', activity: 'Background', lastUpdate: '1 hour ago' }
    ]
  }

  const monitoringStations = [
    { id: 1, name: 'PGP-001', type: 'Seismometer', status: 'Active', signal: '98%', location: 'Manila' },
    { id: 2, name: 'VLC-002', type: 'Volcanic Monitor', status: 'Active', signal: '95%', location: 'Albay' },
    { id: 3, name: 'SEA-003', type: 'Seismometer', status: 'Offline', signal: '0%', location: 'Bataan' },
    { id: 4, name: 'GPS-004', type: 'GPS Station', status: 'Active', signal: '89%', location: 'Quezon' }
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header with Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Real-time Monitoring</h2>
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('earthquakes')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'earthquakes'
                ? 'bg-primary text-white'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            Earthquakes
          </button>
          <button
            onClick={() => setActiveTab('volcanoes')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'volcanoes'
                ? 'bg-primary text-white'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            Volcanoes
          </button>
          <button
            onClick={() => setActiveTab('stations')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'stations'
                ? 'bg-primary text-white'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            Stations
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Live Map Placeholder */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Live Map</h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Live Updates</span>
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-gray-500">Interactive Map Loading...</p>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Recent {activeTab === 'earthquakes' ? 'Earthquakes' : activeTab === 'volcanoes' ? 'Volcanic Activity' : 'Station Status'}
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {activeTab === 'earthquakes' && recentEvents.earthquakes.map((event) => (
                <div key={event.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                          <span className="text-red-600 font-bold text-sm">M{event.magnitude}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{event.location}</p>
                          <p className="text-sm text-gray-600">Depth: {event.depth} • {event.coordinates}</p>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{event.time}</span>
                  </div>
                </div>
              ))}
              
              {activeTab === 'volcanoes' && recentEvents.volcanoes.map((volcano) => (
                <div key={volcano.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 2L3 7v11a2 2 0 002 2h10a2 2 0 002-2V7l-7-5z"/>
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{volcano.name}</p>
                          <p className="text-sm text-gray-600">{volcano.alertLevel} • {volcano.activity}</p>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{volcano.lastUpdate}</span>
                  </div>
                </div>
              ))}
              
              {activeTab === 'stations' && monitoringStations.map((station) => (
                <div key={station.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          station.status === 'Active' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <div className={`w-3 h-3 rounded-full ${
                            station.status === 'Active' ? 'bg-green-600' : 'bg-red-600'
                          }`}></div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{station.name} - {station.type}</p>
                          <p className="text-sm text-gray-600">{station.location} • Signal: {station.signal}</p>
                        </div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      station.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {station.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Current Alerts */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Active Alerts</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">Magnitude 5.2 Earthquake</p>
                  <p className="text-xs text-red-700">Bataan Province</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-900">Station Offline</p>
                  <p className="text-xs text-yellow-700">SEA-003 Seismometer</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Controls */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Controls</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Export Data
              </button>
              <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Filter Settings
              </button>
              <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                Alert Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LiveMonitoringPage