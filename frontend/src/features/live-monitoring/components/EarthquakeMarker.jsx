import React, { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { getMagnitudeColor, calculateEarthquakeRadius, getMagnitudeOpacity } from '../utils/earthquakeUtils'

const EarthquakeMarker = ({event, isLatest}) => {
  const map = useMap()

  useEffect(() => {
    if (!map) return

    const color = getMagnitudeColor(event.magnitude)
    const radius = calculateEarthquakeRadius(event.magnitude)
    const opacity = getMagnitudeOpacity(event.magnitude)
    
    // For all earthquakes, add a circle marker
    const circle = L.circle([event.latitude, event.longitude], {
      color: color,
      fillColor: color,
      fillOpacity: opacity,
      weight: 0, // Remove border
      radius: radius
    }).addTo(map)

    // Add popup to the circle marker using our custom component
    const getMagnitudeColorForPopup = (magnitude) => {
      if (magnitude >= 6) return "text-red-600 bg-red-50 border-red-200";
      if (magnitude >= 5) return "text-orange-600 bg-orange-50 border-orange-200";
      if (magnitude >= 4) return "text-[#D2691E] bg-orange-50 border-orange-200";
      if (magnitude >= 3) return "text-yellow-600 bg-yellow-50 border-yellow-200";
      return "text-green-600 bg-green-50 border-green-200";
    };



    const formatTimeAgo = (timestamp) => {
      if (!timestamp) return '';
      const now = Date.now();
      const diff = now - timestamp;
      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(diff / (1000 * 60 * 60));
      
      if (minutes < 1) return "Just now";
      if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    };

    const popupContent = `
      <div class="bg-white rounded-lg shadow-lg overflow-hidden">
        <!-- Header with magnitude-based color -->
        <div class="${getMagnitudeColorForPopup(event.magnitude).replace('text-', 'bg-').replace('bg-red-600', 'bg-red-100').replace('bg-orange-600', 'bg-orange-100').replace('bg-[#D2691E]', 'bg-orange-100').replace('bg-yellow-600', 'bg-yellow-100').replace('bg-green-600', 'bg-green-100')} px-4 py-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
              </svg>
              <h3 class="text-sm font-semibold text-gray-800">${isLatest ? 'Earthquake Alert' : 'Earthquake'}</h3>
            </div>
            <div class="text-xs text-gray-600">${formatTimeAgo(event.timestamp)}</div>
          </div>
        </div>

        <!-- Content -->
        <div class="p-4 space-y-3">
          <!-- Magnitude and Location -->
          <div class="flex items-center gap-3">
            <div class="px-2 py-1 rounded border ${getMagnitudeColorForPopup(event.magnitude)}">
              <div class="text-sm font-bold">M ${event.magnitude}</div>
            </div>
            <div class="flex-1">
              <div class="text-sm font-medium text-gray-900 leading-tight">${event.location || 'Unknown location'}</div>
            </div>
          </div>

          <!-- Depth -->
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600">Depth:</span>
            <span class="font-semibold text-gray-900">${event.depth || 'N/A'} km</span>
          </div>

          <!-- Date/Time -->
          <div class="pt-2 border-t border-gray-100">
            <div class="text-xs text-gray-600">${event.dateTime || 'Unknown time'}</div>
          </div>
          
          ${isLatest ? '<div class="mt-2 px-2 py-1 bg-blue-50 border border-blue-200 rounded"><span class="text-xs font-semibold text-blue-600">🔴 Latest Earthquake</span></div>' : ''}
        </div>
      </div>
    `
    
    circle.bindPopup(popupContent, {
      closeButton: false,
      autoPan: false,
      maxWidth: 280,
      className: 'custom-earthquake-popup'
    })
    
    // Only add animation for the latest earthquake
    let cleanup = () => {
      map.removeLayer(circle)
    }

    if (isLatest) {
      const pulseLayers = []
      const cancelAnimations = []
      const duration = 3000
      const maxScale = 15.0           // radius of the animation
      const delays = [0, 900, 1500]

      const startPulseAnimation = (layer, baseRadius, layerColor, delay = 0) => {
        let frameId
        let cancelled = false
        const startTime = performance.now() + delay

        const step = () => {
          if (cancelled) return

          const now = performance.now()

          if (now < startTime) {
            frameId = requestAnimationFrame(step)
            return
          }

          const elapsed = (now - startTime) % duration
          const progress = elapsed / duration

          const scale = 1 + (maxScale - 1) * progress
          const currentRadius = baseRadius * scale
          const fade = Math.max(0, 0.45 * (1 - progress))

          layer.setRadius(currentRadius)
          layer.setStyle({
            color: layerColor,
            fillColor: layerColor,
            fillOpacity: fade,
            opacity: fade,
            weight: 0
          })

          frameId = requestAnimationFrame(step)
        }

        frameId = requestAnimationFrame(step)

        return () => {
          cancelled = true
          if (frameId) cancelAnimationFrame(frameId)
        }
      }

      const createPulseLayer = (delay) => {
        const pulseLayer = L.circle([event.latitude, event.longitude], {
          color: color,
          fillColor: color,
          fillOpacity: 0,
          opacity: 0,
          weight: 0,
          interactive: false,
          radius
        }).addTo(map)

        pulseLayers.push(pulseLayer)
        cancelAnimations.push(startPulseAnimation(pulseLayer, radius, color, delay))
      }

      delays.forEach(createPulseLayer)

      cleanup = () => {
        cancelAnimations.forEach(cancel => cancel && cancel())
        pulseLayers.forEach(layer => map.removeLayer(layer))
        map.removeLayer(circle)
      }
    }

    return cleanup
  }, [map, event, isLatest])

  return null
}

export default EarthquakeMarker

