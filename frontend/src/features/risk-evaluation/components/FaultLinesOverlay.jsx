import { useEffect, useRef } from "react"
import { useMap } from "react-leaflet"
import L from "leaflet"
import * as turf from "@turf/turf"

const defaultFaultStyle = {
  color: "#f97316",
  weight: 2,
  opacity: 0.85,
  fillOpacity: 0,
  dashArray: null,
  lineCap: "round",
  lineJoin: "round"
}

const highlightedFaultStyle = {
  color: "#fb923c",
  weight: 3,
  opacity: 1
}

const userMarkerHtml = `
  <div style="
    width: 18px;
    height: 18px;
    background: #2563eb;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.45);
  "></div>
`

const FaultLinesOverlay = () => {
  const map = useMap()
  const faultLayerRef = useRef(null)
  const nearestLineRef = useRef(null)
  const selectedFaultRef = useRef(null)
  const userMarkerRef = useRef(null)

  useEffect(() => {
    if (!map) return

    let isMounted = true

    const addUserLocationMarker = (latLng, label) => {
      if (!isMounted || !map) return

      if (userMarkerRef.current) {
        try {
          map.removeLayer(userMarkerRef.current)
        } catch (error) {
          console.warn("Failed to remove existing user marker", error)
        }
      }

      try {
        userMarkerRef.current = L.marker(latLng, {
          icon: L.divIcon({
            className: "risk-user-location",
            html: userMarkerHtml,
            iconSize: [18, 18],
            iconAnchor: [9, 9]
          })
        })

        userMarkerRef.current.addTo(map)
        userMarkerRef.current.bindPopup(label).openPopup()
      } catch (error) {
        console.error("Failed to create user location marker", error)
      }
    }

    const locateUser = () => {
      if (!navigator?.geolocation) {
        addUserLocationMarker([14.5995, 120.9842], "<b>Default Location (Manila)</b>")
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!isMounted || !map) return
          const latLng = [position.coords.latitude, position.coords.longitude]
          addUserLocationMarker(latLng, "<b>Your Location</b>")
          map.setView(latLng, Math.max(map.getZoom(), 8))
        },
        () => {
          addUserLocationMarker([14.5995, 120.9842], "<b>Default Location (Manila)</b>")
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    }

    const clearNearestLine = () => {
      if (nearestLineRef.current && map) {
        try {
          map.removeLayer(nearestLineRef.current)
        } catch (error) {
          console.warn("Failed to remove nearest line", error)
        }
        nearestLineRef.current = null
      }
    }

    const resetSelectedFault = () => {
      if (selectedFaultRef.current) {
        try {
          selectedFaultRef.current.setStyle(defaultFaultStyle)
        } catch (error) {
          console.warn("Failed to reset fault style", error)
        }
        selectedFaultRef.current = null
      }
    }

    const handleFaultClick = (feature, layer) => {
      if (!userMarkerRef.current) {
        alert("User location not available yet.")
        return
      }

      resetSelectedFault()

      try {
        layer.setStyle(highlightedFaultStyle)
        selectedFaultRef.current = layer
      } catch (error) {
        console.warn("Failed to set selected fault style", error)
      }

      const userLatLng = userMarkerRef.current.getLatLng()
      const userPoint = turf.point([userLatLng.lng, userLatLng.lat])
      const faultLine = turf.lineString(feature.geometry.coordinates)
      const nearestPoint = turf.nearestPointOnLine(faultLine, userPoint)
      const distance = turf.distance(userPoint, nearestPoint, { units: "kilometers" })

      clearNearestLine()

      const faultLatLng = [nearestPoint.geometry.coordinates[1], nearestPoint.geometry.coordinates[0]]

      try {
        nearestLineRef.current = L.polyline([userLatLng, faultLatLng], {
          color: "#22c55e",
          dashArray: "6, 8",
          weight: 2.5
        }).addTo(map)

        nearestLineRef.current.bindPopup(`
          <div style="font-family:'Inter',system-ui,sans-serif;font-size:12px;">
            <strong>${feature.properties?.NAME || "Fault Line"}</strong><br/>
            ${feature.properties?.TYPE ? `<small>Type: ${feature.properties.TYPE}</small><br/>` : ""}
            ${feature.properties?.ACTIVITY ? `<small>Activity: ${feature.properties.ACTIVITY}</small><br/>` : ""}
            <span style="color:#f97316;font-weight:600;">
              Distance: ${distance.toFixed(2)} km
            </span>
          </div>
        `).openPopup()
      } catch (error) {
        console.error("Failed to draw nearest line", error)
      }
    }

    const highlightFault = (layer) => {
      if (layer === selectedFaultRef.current) return
      try {
        layer.setStyle({
          weight: 2.5,
          opacity: 1
        })
      } catch (error) {
        console.warn("Failed to highlight fault", error)
      }
    }

    const resetFaultHighlight = (layer) => {
      if (layer === selectedFaultRef.current) return
      try {
        layer.setStyle(defaultFaultStyle)
      } catch (error) {
        console.warn("Failed to reset fault highlight", error)
      }
    }

    const attachFaultInteractions = (feature, layer) => {
      if (!feature.properties) return

      const name = feature.properties.NAME
      if (name) {
        layer.bindTooltip(name, {
          permanent: false,
          direction: "auto",
          className: "fault-tooltip"
        })
      }

      layer.on({
        click: () => handleFaultClick(feature, layer),
        mouseover: () => highlightFault(layer),
        mouseout: () => resetFaultHighlight(layer)
      })
    }

    const loadFaultLines = async () => {
      try {
        const faultDataUrl = new URL("../../../assets/gis/fault_lines.geojson", import.meta.url)
        const response = await fetch(faultDataUrl)
        if (!response.ok) throw new Error(`Failed to load fault lines: ${response.status}`)
        const data = await response.json()
        if (!isMounted || !map) return

        faultLayerRef.current = L.geoJSON(data, {
          style: () => ({ ...defaultFaultStyle }),
          onEachFeature: attachFaultInteractions
        })

        faultLayerRef.current.addTo(map)
      } catch (error) {
        console.error("Failed to load fault lines", error)
      }
    }

    map.whenReady(() => {
      if (!isMounted) return
      locateUser()
      loadFaultLines()
    })

    return () => {
      isMounted = false

      if (faultLayerRef.current && map) {
        try {
          map.removeLayer(faultLayerRef.current)
        } catch (error) {
          console.warn("Failed to remove fault layer", error)
        }
        faultLayerRef.current = null
      }

      if (userMarkerRef.current && map) {
        try {
          map.removeLayer(userMarkerRef.current)
        } catch (error) {
          console.warn("Failed to remove user marker", error)
        }
        userMarkerRef.current = null
      }

      clearNearestLine()
      resetSelectedFault()
    }
  }, [map])

  return null
}

export default FaultLinesOverlay
