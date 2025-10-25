import React from 'react'

const EvacuationSites = () => {
  // Hardcoded data - easily replaceable with API call
  const evacuationSites = [
    {
      id: 1,
      name: 'Rizal Memorial Stadium',
      type: 'Primary Evacuation Center',
      address: 'Pablo Ocampo Sr. St, Malate, Manila',
      distance: '2.3 km',
      capacity: '15,000 people',
      facilities: ['Medical station', 'Food distribution', 'Restrooms', 'Communication center'],
      status: 'Available',
      contact: '(02) 8525-9401',
      coordinates: '14.5764° N, 120.9969° E'
    },
    {
      id: 2,
      name: 'Marikina Sports Center',
      type: 'Secondary Evacuation Center',
      address: 'Marikina-Infanta Highway, Marikina City',
      distance: '8.7 km',
      capacity: '8,000 people',
      facilities: ['First aid', 'Potable water', '24/7 security', 'Parking area'],
      status: 'Available',
      contact: '(02) 8646-2436',
      coordinates: '14.6507° N, 121.1029° E'
    },
    {
      id: 3,
      name: 'UP Diliman Amphitheater',
      type: 'Temporary Shelter',
      address: 'University of the Philippines, Diliman, Quezon City',
      distance: '12.1 km',
      capacity: '5,000 people',
      facilities: ['Basic amenities', 'Generator power', 'Medical tent'],
      status: 'Available',
      contact: '(02) 8981-8500',
      coordinates: '14.6537° N, 121.0685° E'
    },
    {
      id: 4,
      name: 'Manila Bay Beach Resort',
      type: 'Emergency Shelter',
      address: 'Roxas Boulevard, Pasay City',
      distance: '15.2 km',
      capacity: '3,500 people',
      facilities: ['Temporary housing', 'Food service', 'Basic utilities'],
      status: 'Under maintenance',
      contact: '(02) 8832-4567',
      coordinates: '14.5378° N, 120.9847° E'
    }
  ]

  const getStatusColor = (status) => {
    const colors = {
      'Available': 'text-green-700 bg-green-100 border-green-200',
      'Limited capacity': 'text-yellow-700 bg-yellow-100 border-yellow-200',
      'Full': 'text-red-700 bg-red-100 border-red-200',
      'Under maintenance': 'text-gray-700 bg-gray-100 border-gray-200'
    }
    return colors[status] || colors['Available']
  }

  const getTypeIcon = (type) => {
    const icons = {
      'Primary Evacuation Center': 'home_pin',
      'Secondary Evacuation Center': 'apartment',
      'Temporary Shelter': 'camping',
      'Emergency Shelter': 'emergency_home'
    }
    return icons[type] || 'location_on'
  }

  const openDirections = (coordinates, name) => {
    const [lat, lng] = coordinates.split(', ')
    const cleanLat = lat.replace('° N', '')
    const cleanLng = lng.replace('° E', '')
    const url = `https://www.google.com/maps/dir/?api=1&destination=${cleanLat},${cleanLng}&destination_place_id=${encodeURIComponent(name)}`
    window.open(url, '_blank')
  }

  const callSite = (contact) => {
    window.open(`tel:${contact}`, '_self')
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Nearest Evacuation Sites</h3>
          <p className="text-sm text-gray-600">Safe locations near your area</p>
        </div>
        <span className="material-symbols-outlined text-blue-500 text-xl">
          home_pin
        </span>
      </div>

      <div className="space-y-4">
        {evacuationSites.map((site) => (
          <div 
            key={site.id}
            className="p-4 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="material-symbols-outlined text-blue-500 text-lg">
                    {getTypeIcon(site.type)}
                  </span>
                  <div>
                    <h4 className="font-semibold text-gray-900">{site.name}</h4>
                    <p className="text-sm text-blue-600">{site.type}</p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(site.status)}`}>
                    {site.status}
                  </span>
                </div>
                
                <div className="space-y-1 mb-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    <span>{site.address}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <span className="material-symbols-outlined text-sm">social_distance</span>
                      <span>{site.distance}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="material-symbols-outlined text-sm">groups</span>
                      <span>{site.capacity}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {site.facilities.slice(0, 3).map((facility, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700">
                      {facility}
                    </span>
                  ))}
                  {site.facilities.length > 3 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                      +{site.facilities.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span className="material-symbols-outlined text-sm">call</span>
                <span>{site.contact}</span>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => callSite(site.contact)}
                  className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">call</span>
                  <span>Call</span>
                </button>
                <button 
                  onClick={() => openDirections(site.coordinates, site.name)}
                  className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">directions</span>
                  <span>Directions</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center mt-6 pt-4 border-t border-gray-100">
        <div className="flex space-x-4">
          <button className="flex items-center space-x-2 text-sm text-primary hover:text-primary/80 font-medium">
            <span>View evacuation map</span>
            <span className="material-symbols-outlined text-sm">
              map
            </span>
          </button>
          <span className="text-gray-300">|</span>
          <button className="flex items-center space-x-2 text-sm text-primary hover:text-primary/80 font-medium">
            <span>Emergency procedures</span>
            <span className="material-symbols-outlined text-sm">
              help
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default EvacuationSites
