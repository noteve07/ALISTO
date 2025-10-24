import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Component to add earthquake markers to the map
function EarthquakeMarker({ event, isLatest }) {
  const map = useMap()

  useEffect(() => {
    if (!map) return

    // Color based purely on magnitude (red->yellow->green scale)
    const getMagColor = (mag) => {
      if (mag >= 5) return '#B91C1C' // Deep red for high magnitude
      if (mag >= 4) return '#EA580C' // Vibrant orange for medium-high magnitude
      if (mag >= 3) return '#FACC15' // Warm yellow for medium magnitude
      if (mag >= 2) return '#10B981' // Green for low-medium magnitude
      return '#6B7280' // Gray for very low magnitude
    }

    const color = getMagColor(event.magnitude)
    
    // Calculate radius based on magnitude - larger for higher magnitudes
    const radius = event.magnitude * 2500
    
    // For all earthquakes, add a circle marker
    const circle = L.circle([event.latitude, event.longitude], {
      color: color,
      fillColor: color,
      fillOpacity: 0.5,
      radius: radius
    }).addTo(map)

    // Add popup to the circle marker
    const popupContent = `
      <div class="earthquake-popup">
        <h3 class="font-bold text-lg mb-2">Magnitude ${event.magnitude}</h3>
        <p class="mb-1"><strong>Time:</strong> ${event.dateTime}</p>
        <p class="mb-1"><strong>Depth:</strong> ${event.depth}km</p>
        <p class="mb-1"><strong>Location:</strong> ${event.location}</p>
        <p><strong>Coordinates:</strong> ${event.latitude.toFixed(4)}, ${event.longitude.toFixed(4)}</p>
      </div>
    `
    circle.bindPopup(popupContent)
    
    // Only add animation for the latest earthquake
    if (isLatest) {
      // Create signal animation
      const signalDiv = L.DomUtil.create('div')
      signalDiv.className = 'signal-circle'
      signalDiv.style.cssText = `
        width: ${event.magnitude * 20}px;
        height: ${event.magnitude * 20}px;
        background: ${color};
        border-radius: 50%;
        animation: pulse 2s infinite;
      `

      const signalIcon = L.divIcon({
        className: '',
        html: signalDiv,
        iconSize: [event.magnitude * 20, event.magnitude * 20],
        iconAnchor: [event.magnitude * 10, event.magnitude * 10]
      })
      
      const signalMarker = L.marker([event.latitude, event.longitude], {
        icon: signalIcon, 
        interactive: false
      }).addTo(map)
      
      return () => {
        map.removeLayer(circle)
        map.removeLayer(signalMarker)
      }
    } else {
      return () => {
        map.removeLayer(circle)
      }
    }
  }, [map, event, isLatest])

  return null
}

function LiveMonitoringPage() {
  const [earthquakeData, setEarthquakeData] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch earthquake data
  useEffect(() => {
    const fetchEarthquakes = async () => {
      try {
        setLoading(true)
        // Use the proxied path configured in vite.config.js
        const response = await fetch('/api/v1/live')
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`)
        }
        
        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error(`Expected JSON response but got ${contentType || 'unknown content type'}`)
        }
        
        const data = await response.json()
        
        if (data.success && data.data) {
          const getTimestamp = (dateValue) => {
            const parsed = Date.parse(dateValue)
            return Number.isNaN(parsed) ? 0 : parsed
          }

          // Transform data to our expected format and sort by newest first
          const transformedData = data.data
            .map((eq, index) => ({
              id: index,
              latitude: eq.latitude,
              longitude: eq.longitude,
              magnitude: eq.magnitude,
              depth: eq.depth,
              location: eq.location,
              dateTime: eq.date_time,
              timestamp: getTimestamp(eq.date_time)
            }))
            .sort((a, b) => b.timestamp - a.timestamp)
            .map(({ timestamp, ...rest }) => {
              void timestamp
              return rest
            })
          
          setEarthquakeData(transformedData)
        } else {
          throw new Error('Invalid data structure received from API')
        }
      } catch (err) {
        console.error("Error fetching earthquake data:", err)
        // Fallback data when API is not available
        const fallbackEvents = [
          { id: 1, latitude: 11.05, longitude: 124.08, magnitude: 2.0, depth: 29, location: '010km N 88° E of City Of Bogo (Cebu)', dateTime: '13 October 2025 - 07:39 AM', rawDateTime: '2025-10-13T07:39:00+08:00' },
          { id: 2, latitude: 10.98, longitude: 123.93, magnitude: 2.7, depth: 7, location: '009km S 35° W of City Of Bogo (Cebu)', dateTime: '13 October 2025 - 07:29 AM', rawDateTime: '2025-10-13T07:29:00+08:00' },
          { id: 3, latitude: 11.03, longitude: 123.99, magnitude: 2.1, depth: 2, location: '002km S 22° E of City Of Bogo (Cebu)', dateTime: '13 October 2025 - 07:12 AM', rawDateTime: '2025-10-13T07:12:00+08:00' },
          { id: 4, latitude: 11.02, longitude: 124.02, magnitude: 3.1, depth: 4, location: '005km S 64° E of City Of Bogo (Cebu)', dateTime: '13 October 2025 - 07:09 AM', rawDateTime: '2025-10-13T07:09:00+08:00' },
          { id: 5, latitude: 11.21, longitude: 124.13, magnitude: 2.4, depth: 33, location: '024km N 43° E of City Of Bogo (Cebu)', dateTime: '13 October 2025 - 07:04 AM', rawDateTime: '2025-10-13T07:04:00+08:00' }
        ]
          .map((event) => ({
            ...event,
            timestamp: Date.parse(event.rawDateTime)
          }))
          .sort((a, b) => b.timestamp - a.timestamp)
          .map(({ timestamp, rawDateTime, ...rest }) => {
            void timestamp
            void rawDateTime
            return rest
          })

        setEarthquakeData(fallbackEvents)
      } finally {
        setLoading(false)
      }
    }

    fetchEarthquakes()
    
    // Set up polling interval (every 30 seconds)
    const intervalId = setInterval(() => {
      fetchEarthquakes()
    }, 30000)

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId)
  }, [])
  
  return (
    <>
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { 
            transform: scale(1);
            opacity: 1;
          }
          50% { 
            transform: scale(1.5);
            opacity: 0.7;
          }
        }
      `}</style>
      
      <div className="h-full relative">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading earthquake data...</p>
            </div>
          </div>
        )}
        
        <MapContainer 
          center={[12.8797, 121.7740]} 
          zoom={6} 
          scrollWheelZoom={true} 
          style={{ width: "100%", height: "100%" }}
          minZoom={5}
          maxZoom={12}
          maxBounds={[[4.5, 116.0], [21.5, 127.5]]}
          maxBoundsViscosity={1.0}
          worldCopyJump={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            noWrap={true}
          />
          
          {earthquakeData.map((event, index) => (
            <React.Fragment key={event.id}>
              <EarthquakeMarker 
                event={event} 
                isLatest={index === 0} // First item is the latest earthquake
              />
            </React.Fragment>
          ))}
        </MapContainer>
      </div>
    </>
  )
}

export default LiveMonitoringPage