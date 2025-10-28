import React, { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { getMagnitudeColor, calculateEarthquakeRadius, getMagnitudeDescription } from '../utils/earthquakeUtils'

const EarthquakeMarker = ({event, isLatest}) => {
  const map = useMap()

  useEffect(() => {
    if (!map) return

    const color = getMagnitudeColor(event.magnitude)
    const radius = calculateEarthquakeRadius(event.magnitude)
    const magnitudeDesc = getMagnitudeDescription(event.magnitude)
    
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
        <h3 class="font-bold text-lg mb-2">Magnitude ${event.magnitude} (${magnitudeDesc})</h3>
        <p class="mb-1"><strong>Time:</strong> ${event.dateTime}</p>
        <p class="mb-1"><strong>Depth:</strong> ${event.depth}km</p>
        <p class="mb-1"><strong>Location:</strong> ${event.location}</p>
        <p><strong>Coordinates:</strong> ${event.latitude.toFixed(4)}, ${event.longitude.toFixed(4)}</p>
        ${isLatest ? '<div class="mt-2 text-red-600 font-semibold">🔴 Latest Earthquake</div>' : ''}
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

export default EarthquakeMarker

