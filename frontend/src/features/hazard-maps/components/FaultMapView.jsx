import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const FaultMapView = ({ onMapReady }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current && mapContainerRef.current) {
      // Create map centered on Philippines
      const map = L.map(mapContainerRef.current).setView([12.8797, 121.774], 6);

      // Add ArcGIS Satellite basemap
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 19,
          attribution:
            "&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
        }
      ).addTo(map);

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