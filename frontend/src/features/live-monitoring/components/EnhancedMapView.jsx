import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import EarthquakeMarker from "./EarthquakeMarker";
import MapLegend from "./MapLegend";
import UserLocationMarker from "./UserLocationMarker";
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
const MapController = ({ earthquakeData, targetEarthquake }) => {
  const map = useMap();
  const prevLatestEarthquakeRef = useRef(null);

  // Handle auto-pan for new earthquakes
  useEffect(() => {
    if (!earthquakeData.length) return;

    const latestEarthquake = earthquakeData[0]; // First item is latest
    const prevLatest = prevLatestEarthquakeRef.current;

    // Check if we have a new earthquake (different ID or timestamp) OR testing mode
    if (
      (prevLatest &&
        latestEarthquake &&
        (prevLatest.id !== latestEarthquake.id ||
          prevLatest.timestamp !== latestEarthquake.timestamp)) ||
      (!prevLatest && latestEarthquake) // First load - for testing
    ) {
      console.log(
        "🌍 New earthquake detected! Panning to location:",
        latestEarthquake.location
      );

      // Play sound notification for new earthquake
      try {
        // Create audio context for earthquake alert sound
        const audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();

        // Enhanced earthquake alert sound - proper warning sound, not too harsh
        const playEarthquakeAlert = () => {
          const beepCount = 3;
          const beepInterval = 1000; // 1 second between beeps for quicker sequence

          for (let i = 0; i < beepCount; i++) {
            setTimeout(() => {
              // Create proper WARNING sound - alertive but not annoying
              const oscillator = audioContext.createOscillator();
              const gainNode = audioContext.createGain();

              oscillator.connect(gainNode);
              gainNode.connect(audioContext.destination);

              // Warning frequency pattern - lower, deeper tones
              oscillator.frequency.setValueAtTime(
                440,
                audioContext.currentTime
              ); // A note (lower octave)
              oscillator.frequency.exponentialRampToValueAtTime(
                330,
                audioContext.currentTime + 0.3
              ); // E note (lower)
              oscillator.frequency.setValueAtTime(
                440,
                audioContext.currentTime + 0.5
              );
              oscillator.frequency.exponentialRampToValueAtTime(
                330,
                audioContext.currentTime + 0.8
              );

              // Clear, audible volume - warning level
              gainNode.gain.setValueAtTime(0.6, audioContext.currentTime);
              gainNode.gain.exponentialRampToValueAtTime(
                0.4,
                audioContext.currentTime + 0.4
              );
              gainNode.gain.exponentialRampToValueAtTime(
                0.01,
                audioContext.currentTime + 0.8
              );

              // Use sine wave for clean warning sound
              oscillator.type = "sine";

              oscillator.start(audioContext.currentTime);
              oscillator.stop(audioContext.currentTime + 0.8);

              console.log(`⚠️ Earthquake Warning Beep ${i + 1}/${beepCount}`);
            }, i * beepInterval);
          }
        };

        playEarthquakeAlert();
        console.log(
          "⚠️ EARTHQUAKE WARNING SOUND - Plays on new earthquake detection"
        );
      } catch (error) {
        console.log("🔇 Audio not supported or blocked:", error);
      }

      // Calculate appropriate zoom level based on magnitude
      const getZoomLevel = (magnitude) => {
        if (magnitude >= 6) return 9; // Major earthquakes - closer view
        if (magnitude >= 5) return 8; // Strong earthquakes
        if (magnitude >= 4) return 7; // Moderate earthquakes
        return 7; // Minor earthquakes
      };

      const targetZoom = getZoomLevel(latestEarthquake.magnitude);

      // Smooth pan and zoom to the latest earthquake
      map.flyTo(
        [latestEarthquake.latitude, latestEarthquake.longitude],
        targetZoom,
        {
          duration: 2, // 2 seconds animation
          easeLinearity: 0.25,
        }
      );

      // Optional: Show a brief notification or highlight
      setTimeout(() => {
        // You could add a temporary highlight or popup here
        console.log("🎯 Focused on latest earthquake");
      }, 2000);
    }

    // Update the reference
    prevLatestEarthquakeRef.current = latestEarthquake;
  }, [earthquakeData, map]);

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

const EnhancedMapView = ({ earthquakeData, targetEarthquake }) => {
  return (
    <MapContainer
      center={[12.8797, 121.774]}
      zoom={6}
      scrollWheelZoom
      style={{ width: "100%", height: "100%" }}
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
        attribution='&copy; <a href="https://www.esri.com/">Esri</a> &copy; <a href="https://www.arcgis.com/">ArcGIS</a> | Data Source: DOST-PHIVOLCS'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      />

      {/* Map Controller for auto-pan functionality */}
      <MapController
        earthquakeData={earthquakeData}
        targetEarthquake={targetEarthquake}
      />

      {/* User Location Marker */}
      <UserLocationMarker />

      {/* Earthquake Markers */}
      {earthquakeData.map((event, i) => (
        <EarthquakeMarker key={event.id} event={event} isLatest={i === 0} />
      ))}

      {/* Map Legend */}
      <MapLegend />
    </MapContainer>
  );
};

export default EnhancedMapView;
