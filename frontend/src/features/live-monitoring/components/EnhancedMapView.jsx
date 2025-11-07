import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import EarthquakeMarker from "./EarthquakeMarker";
import VolcanoMarkers from "./VolcanoMarkers";
import MapLegend from "./MapLegend";
import UserLocationMarker from "./UserLocationMarker";
import {
  playEarthquakeSound,
  getEarthquakeUrgency,
} from "@/shared/utils/earthquakeSounds";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// fix leaflet default marker
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Component to handle map pan when new earthquake is detected
const ALERT_PROVINCES = [
  "bataan",
  "pampanga",
  "batangas",
  "zambales",
  "bulacan",
];

const shouldTriggerAlert = (earthquake) => {
  if (!earthquake) {
    return false;
  }

  const magnitude = Number.parseFloat(earthquake.magnitude);
  if (!Number.isFinite(magnitude) || magnitude < 4) {
    return false;
  }

  const location = (earthquake.location || "").toLowerCase();
  if (!location) {
    return false;
  }

  return ALERT_PROVINCES.some((province) => location.includes(province));
};

const MapController = ({
  earthquakeData,
  targetEarthquake,
  targetVolcanicAdvisory,
  initialMapState,
  onEarthquakeAlert,
}) => {
  const map = useMap();
  const prevLatestEarthquakeRef = useRef(null);
  const hasSetInitialView = useRef(false);

  // Handle initial map state from navigation
  useEffect(() => {
    if (initialMapState && !hasSetInitialView.current) {
      console.log(
        "🎯 Setting initial map view from navigation:",
        initialMapState
      );
      map.setView(initialMapState.center, initialMapState.zoom);
      hasSetInitialView.current = true;
    }
  }, [initialMapState, map]);

  // Handle auto-pan for new earthquakes - ONLY for real latest earthquake
  useEffect(() => {
    if (!earthquakeData.length) return;

    const latestEarthquake = earthquakeData[0]; // First item is latest from RAW data
    const prevLatest = prevLatestEarthquakeRef.current;

    // Check if we have a new earthquake (different ID or timestamp)
    if (
      prevLatest &&
      latestEarthquake &&
      (prevLatest.id !== latestEarthquake.id ||
        prevLatest.timestamp !== latestEarthquake.timestamp)
    ) {
      console.log(
        "🌍 New earthquake detected! Panning to location:",
        latestEarthquake.location
      );

      // Play sound notification for new earthquake
      try {
        // Extract and validate magnitude
        const magnitude = parseFloat(latestEarthquake.magnitude) || 0;
        console.log(
          `🌍 New earthquake detected - Magnitude: ${magnitude} (raw: ${latestEarthquake.magnitude})`
        );

        // Determine urgency based on magnitude
        const urgency = getEarthquakeUrgency(magnitude);
        console.log(`📊 Urgency level: ${urgency} (magnitude ${magnitude})`);

        if (shouldTriggerAlert(latestEarthquake)) {
          console.log(
            "🚨 Triggering protective action modal after 1 second delay"
          );
          setTimeout(() => {
            onEarthquakeAlert?.(latestEarthquake);
          }, 0); // 1 second delay
        }

        // Play appropriate sound based on magnitude
        playEarthquakeSound(magnitude, {
          urgency,
          source: "website",
        });
      } catch (error) {
        console.error("🔇 Error playing earthquake sound:", error);
      }

      // Calculate appropriate zoom level based on magnitude
      const getZoomLevel = (magnitude) => {
        if (magnitude >= 6) return 9; // Major earthquakes - closer view (+1 zoom)
        if (magnitude >= 5) return 9; // Strong earthquakes (+1 zoom)
        if (magnitude >= 4) return 9; // Moderate earthquakes
        return 9; // Minor earthquakes
      };

      const targetZoom = getZoomLevel(latestEarthquake.magnitude);

      // Calculate offset coordinates - move center slightly to the right
      const latOffset = 0; // No vertical offset
      const lngOffset = 0.2; // Move right by ~2km (adjust longitude eastward)
      const offsetLat = latestEarthquake.latitude + latOffset;
      const offsetLng = latestEarthquake.longitude + lngOffset;

      // Smooth pan and zoom to the latest earthquake with right offset
      map.flyTo([offsetLat, offsetLng], targetZoom, {
        duration: 2, // 2 seconds animation
        easeLinearity: 0.25,
      });

      // Optional: Show a brief notification or highlight
      setTimeout(() => {
        // You could add a temporary highlight or popup here
        console.log("🎯 Focused on latest earthquake");
      }, 1000);
    }

    // Update the reference
    prevLatestEarthquakeRef.current = latestEarthquake;
  }, [earthquakeData, map, onEarthquakeAlert]);

  // Handle auto-pan for volcanic advisory alerts
  useEffect(() => {
    if (!targetVolcanicAdvisory?.coordinates) return;

    console.log(
      "🌋 New volcanic advisory detected! Panning to volcano location:",
      targetVolcanicAdvisory.volcano
    );

    const [lat, lng] = targetVolcanicAdvisory.coordinates;

    // Calculate appropriate zoom level based on alert level
    const getVolcanoZoomLevel = (alertLevel) => {
      if (alertLevel >= 4) return 10; // Critical - closer view
      if (alertLevel >= 3) return 9; // High unrest - close view
      if (alertLevel >= 2) return 8; // Moderate unrest - medium view
      return 8; // Low level unrest
    };

    const targetZoom = getVolcanoZoomLevel(targetVolcanicAdvisory.alertLevel);

    // Pan to volcano location without animation for immediate focus
    map.setView([lat, lng], targetZoom);

    console.log(
      `🎯 Focused on volcano: ${targetVolcanicAdvisory.volcano} (Alert Level ${targetVolcanicAdvisory.alertLevel})`
    );
  }, [targetVolcanicAdvisory, map]);

  // Handle manual earthquake click (from list)
  useEffect(() => {
    if (targetEarthquake) {
      console.log(
        "🎯 Panning to clicked earthquake:",
        targetEarthquake.location
      );

      map.flyTo([targetEarthquake.latitude, targetEarthquake.longitude], 8, {
        duration: 1.5,
        easeLinearity: 0.25,
      });

      // Find and open the popup for this earthquake after pan completes
      setTimeout(() => {
        map.eachLayer((layer) => {
          if (
            layer instanceof L.Circle &&
            Math.abs(layer.getLatLng().lat - targetEarthquake.latitude) <
              0.001 &&
            Math.abs(layer.getLatLng().lng - targetEarthquake.longitude) < 0.001
          ) {
            layer.openPopup();
          }
        });
      }, 1600); // Wait for pan animation to complete
    }
  }, [targetEarthquake, map]);

  // Handle map clicks to close popups
  useEffect(() => {
    const handleMapClick = (e) => {
      // Check if the click target is not a marker or popup
      if (
        !e.originalEvent.target.closest(".leaflet-marker-icon") &&
        !e.originalEvent.target.closest(".leaflet-popup")
      ) {
        map.closePopup();
      }
    };

    map.on("click", handleMapClick);

    // Cleanup
    return () => {
      map.off("click", handleMapClick);
    };
  }, [map]);

  return null; // This component doesn't render anything
};

const EnhancedMapView = ({
  earthquakeData, // Raw data for alert detection
  filteredEarthquakeData, // Filtered data for displaying markers
  targetEarthquake,
  targetVolcanicAdvisory,
  initialMapState,
  onEarthquakeAlert,
}) => {
  return (
    <MapContainer
      center={[12.8797, 121.774]}
      zoom={6}
      scrollWheelZoom
      style={{ width: "100%", height: "100%", backgroundColor: "#15384d" }}
      className="ocean-blue-background"
      minZoom={5}
      maxZoom={12}
      maxBounds={[
        [3.0, 115.0],
        [22.0, 135.0],
      ]}
      maxBoundsViscosity={0.1}
      zoomControl={false}
    >
      <TileLayer
        attribution='Imagery © <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics, and the GIS User Community | Data Source: DOST-PHIVOLCS'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      />

      {/* Map Controller for auto-pan functionality - uses RAW data for real latest detection */}
      <MapController
        earthquakeData={earthquakeData}
        targetEarthquake={targetEarthquake}
        targetVolcanicAdvisory={targetVolcanicAdvisory}
        initialMapState={initialMapState}
        onEarthquakeAlert={onEarthquakeAlert}
      />

      {/* User Location Marker */}
      <UserLocationMarker />

      {/* Earthquake Markers - uses FILTERED data */}
      {filteredEarthquakeData.map((event) => (
        <EarthquakeMarker
          key={event.id}
          event={event}
          isLatest={earthquakeData[0]?.id === event.id} // Check against raw data's latest
        />
      ))}

      {/* Volcano Markers - Only with active advisories */}
      <VolcanoMarkers />

      {/* Map Legend - uses FILTERED data for stats */}
      <MapLegend earthquakeData={filteredEarthquakeData} />
    </MapContainer>
  );
};

export default EnhancedMapView;
