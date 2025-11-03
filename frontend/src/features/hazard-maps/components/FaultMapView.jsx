import React, { useEffect, useRef } from "react";
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

const FaultMapView = ({ onMapReady }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current && mapContainerRef.current) {
      // Create map centered on Philippines with same settings as LiveMonitoring
      const map = L.map(mapContainerRef.current, {
        center: [12.8797, 121.774],
        zoom: 6,
        scrollWheelZoom: true,
        minZoom: 5,
        maxZoom: 12,
        maxBounds: [
          [3.0, 115.0],
          [22.0, 135.0],
        ],
        maxBoundsViscosity: 0.1,
        zoomControl: false,
      });

      // Add OSM tiles (same as LiveMonitoring)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | Data Source: DOST-PHIVOLCS',
      }).addTo(map);

      mapRef.current = map;

      // Notify parent that map is ready with a small delay to ensure DOM is ready
      setTimeout(() => {
        if (onMapReady) {
          onMapReady(map);
        }
      }, 100);
    }

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Remove onMapReady from dependencies to prevent re-renders

  return (
    <div className="h-full w-full">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};

export default FaultMapView;
