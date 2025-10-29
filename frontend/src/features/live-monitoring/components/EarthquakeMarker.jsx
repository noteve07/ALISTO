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

    // Add popup to the circle marker
    const popupContent = `
      <div class="earthquake-popup">
        <h3 class="font-bold text-lg mb-2">Magnitude ${event.magnitude}</h3>
        <p class="mb-1"><strong>Time:</strong> ${event.dateTime}</p>
        <p class="mb-1"><strong>Depth:</strong> ${event.depth}km</p>
        <p class="mb-1"><strong>Location:</strong> ${event.location}</p>
        <p><strong>Coordinates:</strong> ${event.latitude.toFixed(4)}, ${event.longitude.toFixed(4)}</p>
        ${isLatest ? '<div class="mt-2 text-red-600 font-semibold">🔴 Latest Earthquake</div>' : ''}
      </div>
    `
    circle.bindPopup(popupContent)
    
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

