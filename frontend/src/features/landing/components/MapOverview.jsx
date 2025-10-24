import React, { useEffect, useRef } from 'react'

const MapOverview = () => {
  const mapRef = useRef(null)

  useEffect(() => {
    // Check if Leaflet is available
    if (typeof window !== 'undefined' && window.L) {
      // Initialize map with ALL interactions disabled
      const map = window.L.map(mapRef.current, {
        center: [12.8797, 121.7740], // Philippines center
        zoom: 6,
        minZoom: 6,             // Lock minimum zoom
        maxZoom: 6,             // Lock maximum zoom  
        dragging: false,        // Disable dragging/panning
        touchZoom: false,       // Disable touch zoom
        doubleClickZoom: false, // Disable double click zoom
        scrollWheelZoom: false, // Disable scroll wheel zoom
        boxZoom: false,         // Disable box zoom
        keyboard: false,        // Disable keyboard navigation
        zoomControl: false,     // Remove zoom controls
        attributionControl: true, // Keep attribution
        tap: false,             // Disable tap interactions
        bounceAtZoomLimits: false, // Disable zoom bounce
        wheelPxPerZoomLevel: 0,    // Disable wheel zoom completely
        zoomSnap: 0,            // Disable zoom snapping
        zoomDelta: 0            // Disable zoom delta
      })
      
      // Additional disabling after map creation
      map.touchZoom.disable()
      map.doubleClickZoom.disable()
      map.scrollWheelZoom.disable()
      map.boxZoom.disable()
      map.keyboard.disable()
      if (map.tap) map.tap.disable()

      // Add OpenStreetMap tiles
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map)

      // Add some sample earthquake markers
      const earthquakeData = [
        { lat: 14.5995, lng: 120.9842, magnitude: 5.2, location: 'Manila' },
        { lat: 10.3157, lng: 123.8854, magnitude: 4.8, location: 'Cebu' },
        { lat: 7.0731, lng: 125.6128, magnitude: 6.1, location: 'Davao' },
        { lat: 16.4023, lng: 120.5960, magnitude: 4.5, location: 'Baguio' }
      ]

      earthquakeData.forEach(eq => {
        const color = eq.magnitude >= 6 ? '#ef4444' : eq.magnitude >= 5 ? '#f97316' : '#eab308'
        const size = Math.max(8, eq.magnitude * 2)
        
        window.L.circleMarker([eq.lat, eq.lng], {
          color: color,
          fillColor: color,
          fillOpacity: 0.7,
          radius: size,
          weight: 2
        })
        .addTo(map)
        .bindPopup(`<strong>${eq.location}</strong><br>Magnitude: ${eq.magnitude}`)
      })

      return () => {
        map.remove()
      }
    }
  }, [])

  return (
    <div className="mt-6 w-full aspect-[16/9] rounded-lg border border-gray-300 overflow-hidden relative bg-slate-200">
      <div 
        ref={mapRef} 
        className="w-full h-full pointer-events-none"
        style={{ 
          minHeight: '400px',
          cursor: 'default'
        }}
      />
      {/* Re-enable pointer events only for markers */}
      <style jsx>{`
        .leaflet-marker-icon,
        .leaflet-marker-shadow,
        .leaflet-popup {
          pointer-events: auto !important;
        }
        .leaflet-control-container {
          pointer-events: none !important;
        }
      `}</style>
      
      {/* Loading fallback */}
      <div className="absolute inset-0 bg-slate-200 flex items-center justify-center" style={{ zIndex: -1 }}>
        <div className="text-center text-gray-600">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-500">Loading Philippine Map...</p>
          <p className="text-sm text-gray-400 mt-1">Powered by OpenStreetMap</p>
        </div>
      </div>
    </div>
  )
}

export default MapOverview
