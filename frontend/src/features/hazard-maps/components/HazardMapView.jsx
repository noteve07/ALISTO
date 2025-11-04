import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const HazardMapView = ({ onMapReady }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    let isCancelled = false;

    if (!mapRef.current && mapContainerRef.current) {
      // Initialize map centered on Philippines
      const map = L.map(mapContainerRef.current, {
        center: [12.8797, 121.774],
        zoom: 6,
        zoomControl: true,
      });

      // Add ArcGIS Satellite imagery
      L.tileLayer(
        "https://stamen-tiles.a.ssl.fastly.net/terrain-background/{z}/{x}/{y}.jpg",
        {
          attribution:
            "&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
          maxZoom: 19,
        }
      ).addTo(map);

      mapRef.current = map;

      // Wait for map to be fully ready before notifying parent
      map.whenReady(() => {
        if (!isCancelled && onMapReady) {
          onMapReady(map);
        }
      });
    }

    // Cleanup
    return () => {
      isCancelled = true;

      if (onMapReady) {
        onMapReady(null);
      }

      if (mapRef.current) {
        mapRef.current.off();
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [onMapReady]);

  return (
    <div className="h-full w-full">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};

export default HazardMapView;
