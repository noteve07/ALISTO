import { useEffect, useRef } from "react";
import L from "leaflet";
import * as turf from "@turf/turf";

const useDistanceCalculator = (map, faultLayerRef, userMarkerRef) => {
  const distanceLineRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    const handleMapClick = (e) => {
      if (!map || !map.getPane || !map._panes) {
        return;
      }

      const faultLayer = faultLayerRef?.current;
      const userMarker = userMarkerRef?.current;

      if (!faultLayer || !userMarker) {
        console.log("Missing fault layer or user marker");
        return;
      }

      const clickPoint = turf.point([e.latlng.lng, e.latlng.lat]);
      const userLatLng = userMarker.getLatLng();
      const allFeatures = faultLayer.toGeoJSON();

      // Find nearest fault segment
      let nearestDist = Infinity;
      let nearestFeature = null;
      let nearestPointOnLine = null;

      allFeatures.features.forEach((feature) => {
        if (!feature.geometry || !feature.geometry.coordinates) return;

        const line = turf.lineString(feature.geometry.coordinates);
        const snapped = turf.nearestPointOnLine(line, clickPoint);
        const distKm = turf.distance(clickPoint, snapped, { units: "kilometers" });

        if (distKm < nearestDist) {
          nearestDist = distKm;
          nearestFeature = feature;
          nearestPointOnLine = snapped;
        }
      });

      if (nearestFeature && nearestPointOnLine) {
        // Remove previous distance line if exists
        if (distanceLineRef.current) {
          if (map.hasLayer && map.hasLayer(distanceLineRef.current)) {
            map.removeLayer(distanceLineRef.current);
          } else {
            distanceLineRef.current.remove();
          }
        }

        // Draw line from user location to nearest fault point
        const faultLatLng = [
          nearestPointOnLine.geometry.coordinates[1],
          nearestPointOnLine.geometry.coordinates[0],
        ];

        distanceLineRef.current = L.polyline([userLatLng, faultLatLng], {
          color: "#00ff00",
          weight: 3,
          dashArray: "10, 10",
          opacity: 0.8,
        }).addTo(map);

        // Calculate distance from user to fault
        const userPoint = turf.point([userLatLng.lng, userLatLng.lat]);
        const distanceFromUser = turf.distance(userPoint, nearestPointOnLine, {
          units: "kilometers",
        });

        // Show popup with distance info
        const popupContent = `
          <div style="font-family: sans-serif;">
            <b>${nearestFeature.properties.NAME || "Fault Line"}</b><br>
            <span style="color: #ff4c42; font-weight: bold;">
              Distance from you: ${distanceFromUser.toFixed(2)} km
            </span>
          </div>
        `;

        distanceLineRef.current.bindPopup(popupContent).openPopup();
      }
    };

    // Add click event listener
    map.on("click", handleMapClick);

    // Cleanup
    return () => {
      map.off("click", handleMapClick);
      if (distanceLineRef.current && map) {
        if (map.hasLayer && map.hasLayer(distanceLineRef.current)) {
          map.removeLayer(distanceLineRef.current);
        } else {
          distanceLineRef.current.remove();
        }
        distanceLineRef.current = null;
      }
    };
  }, [map, faultLayerRef, userMarkerRef]);

  return null;
};

export default useDistanceCalculator;
