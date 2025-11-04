import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import * as turf from "@turf/turf";
import { useUserLocation } from "@/features/auth/context/UserLocationContext";
import volcanoes from "../../../assets/gis/volcanoes.json";

const NearestHazardLines = () => {
  const map = useMap();
  const { location: userLocation } = useUserLocation();
  const nearestVolcanoLineRef = useRef(null);
  const nearestFaultLineRef = useRef(null);
  const nearestFaultLayerRef = useRef(null);
  const volcanoLabelRef = useRef(null);
  const faultLabelRef = useRef(null);
  const faultDataRef = useRef(null);

  useEffect(() => {
    if (!map || !userLocation) return;

    let isMounted = true;

    const clearLines = () => {
      if (nearestVolcanoLineRef.current && map) {
        try {
          map.removeLayer(nearestVolcanoLineRef.current);
        } catch (error) {
          console.warn("Failed to remove volcano line", error);
        }
        nearestVolcanoLineRef.current = null;
      }

      if (nearestFaultLineRef.current && map) {
        try {
          map.removeLayer(nearestFaultLineRef.current);
        } catch (error) {
          console.warn("Failed to remove fault line", error);
        }
        nearestFaultLineRef.current = null;
      }

      if (nearestFaultLayerRef.current && map) {
        try {
          map.removeLayer(nearestFaultLayerRef.current);
        } catch (error) {
          console.warn("Failed to remove fault layer", error);
        }
        nearestFaultLayerRef.current = null;
      }

      if (volcanoLabelRef.current && map) {
        try {
          map.removeLayer(volcanoLabelRef.current);
        } catch (error) {
          console.warn("Failed to remove volcano label", error);
        }
        volcanoLabelRef.current = null;
      }

      if (faultLabelRef.current && map) {
        try {
          map.removeLayer(faultLabelRef.current);
        } catch (error) {
          console.warn("Failed to remove fault label", error);
        }
        faultLabelRef.current = null;
      }
    };

    const drawNearestVolcanoLine = () => {
      if (!isMounted || !userLocation) return;

      const userLatLng = userLocation.position; // [lat, lon]
      const userPoint = turf.point([userLatLng[1], userLatLng[0]]);

      // Find nearest volcano
      let nearestVolcano = null;
      let minDistance = Infinity;

      volcanoes.forEach((volcano) => {
        if (!volcano.latitude || !volcano.longitude) return;

        const volcanoPoint = turf.point([volcano.longitude, volcano.latitude]);
        const distance = turf.distance(userPoint, volcanoPoint, {
          units: "kilometers",
        });

        if (distance < minDistance) {
          minDistance = distance;
          nearestVolcano = volcano;
        }
      });

      if (nearestVolcano) {
        const volcanoLatLng = [
          nearestVolcano.latitude,
          nearestVolcano.longitude,
        ];

        try {
          nearestVolcanoLineRef.current = L.polyline(
            [userLatLng, volcanoLatLng],
            {
              color: "#a855f7", // Purple for unified distance style
              dashArray: "8, 10",
              weight: 3,
              opacity: 0.8,
            }
          ).addTo(map);

          nearestVolcanoLineRef.current.bindPopup(
            `
            <div style="font-family:'Inter',system-ui,sans-serif;font-size:11px;padding:2px;">
              <strong>${nearestVolcano.name}</strong><br/>
              <span style="color:#dc2626;font-weight:600;">Distance: ${minDistance.toFixed(
                1
              )} km</span>
            </div>
          `,
            {
              className: "hazard-distance-popup",
              closeButton: true,
              autoClose: false,
              closeOnClick: true,
            }
          );
        } catch (error) {
          console.error("Failed to draw nearest volcano line", error);
        }
      }
    };

    const drawNearestFaultLine = async () => {
      if (!isMounted || !userLocation) return;

      try {
        // Load fault data if not already loaded
        if (!faultDataRef.current) {
          const faultDataUrl = new URL(
            "../../../assets/gis/fault_lines.geojson",
            import.meta.url
          );
          const response = await fetch(faultDataUrl);
          if (!response.ok) {
            throw new Error(`Failed to load fault lines: ${response.status}`);
          }
          faultDataRef.current = await response.json();
        }

        if (!isMounted || !userLocation) return;

        const userLatLng = userLocation.position; // [lat, lon]
        const userPoint = turf.point([userLatLng[1], userLatLng[0]]);

        let nearestFaultInfo = null;
        let nearestFaultGeometry = null;
        let minDistance = Infinity;
        let nearestPointCoords = null;

        // Iterate through fault features (support LineString and MultiLineString)
        faultDataRef.current.features.forEach((feature) => {
          const geometry = feature.geometry;
          if (!geometry) return;

          if (geometry.type === "LineString") {
            const faultLine = turf.lineString(geometry.coordinates);
            const nearestPoint = turf.nearestPointOnLine(faultLine, userPoint);
            const distance = turf.distance(userPoint, nearestPoint, {
              units: "kilometers",
            });

            if (distance < minDistance) {
              minDistance = distance;
              nearestFaultInfo = feature.properties;
              nearestFaultGeometry = geometry; // LineString
              nearestPointCoords = nearestPoint.geometry.coordinates;
            }
          } else if (geometry.type === "MultiLineString") {
            // Check each segment and keep the closest segment
            geometry.coordinates.forEach((segmentCoords) => {
              const segmentLine = turf.lineString(segmentCoords);
              const nearestPoint = turf.nearestPointOnLine(
                segmentLine,
                userPoint
              );
              const distance = turf.distance(userPoint, nearestPoint, {
                units: "kilometers",
              });

              if (distance < minDistance) {
                minDistance = distance;
                nearestFaultInfo = feature.properties;
                nearestFaultGeometry = {
                  type: "LineString",
                  coordinates: segmentCoords,
                };
                nearestPointCoords = nearestPoint.geometry.coordinates;
              }
            });
          }
        });

        if (nearestFaultInfo && nearestPointCoords && nearestFaultGeometry) {
          const faultLatLng = [nearestPointCoords[1], nearestPointCoords[0]];

          try {
            // Highlight the nearest fault line itself
            const faultCoords = nearestFaultGeometry.coordinates.map(
              (coord) => [coord[1], coord[0]]
            );

            nearestFaultLayerRef.current = L.polyline(faultCoords, {
              color: "#fb923c",
              weight: 4,
              opacity: 1,
              className: "nearest-fault-highlight",
              pane: "overlayPane",
            }).addTo(map);

            console.log(
              "🔶 Drawing fault distance line from",
              userLatLng,
              "to",
              faultLatLng
            );
            console.log(
              "🔶 Nearest fault:",
              nearestFaultInfo.NAME,
              "Distance:",
              minDistance.toFixed(1),
              "km"
            );

            // Draw distance line from user to nearest point on fault
            nearestFaultLineRef.current = L.polyline(
              [userLatLng, faultLatLng],
              {
                color: "#a855f7", // Purple for unified distance style
                dashArray: "8, 10",
                weight: 3,
                opacity: 0.8,
                pane: "overlayPane",
              }
            ).addTo(map);

            nearestFaultLineRef.current.bindPopup(
              `
              <div style="font-family:'Inter',system-ui,sans-serif;font-size:11px;padding:2px;">
                <strong>${
                  nearestFaultInfo.NAME || "Unknown Fault"
                }</strong><br/>
                <span style="color:#f97316;font-weight:600;">Distance: ${minDistance.toFixed(
                  1
                )} km</span>
              </div>
            `,
              {
                className: "hazard-distance-popup",
                closeButton: true,
                autoClose: false,
                closeOnClick: true,
              }
            );
          } catch (error) {
            console.error("Failed to draw nearest fault line", error);
          }
        }
      } catch (error) {
        console.error("Failed to load or process fault lines", error);
      }
    };

    map.whenReady(() => {
      if (!isMounted) return;
      clearLines();
      drawNearestVolcanoLine();
      drawNearestFaultLine();
    });

    return () => {
      isMounted = false;
      clearLines();
    };
  }, [map, userLocation]);

  return null;
};

export default NearestHazardLines;
