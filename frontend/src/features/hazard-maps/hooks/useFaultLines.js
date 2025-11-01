import { useEffect, useRef } from "react";
import L from "leaflet";
import * as turf from "@turf/turf";

const useFaultLines = (map, userMarkerRef) => {
  const faultLayerRef = useRef(null);
  const nearestLineRef = useRef(null);
  const selectedFaultRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    // Load fault lines with proper error handling
    fetch("/src/assets/gis/fault_lines.geojson")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fault data loaded:", data);

        // Check if map is still valid before adding layers
        if (!map || !map.getContainer()) {
          console.log("Map container not available");
          return;
        }

        try {
          // Store as leaflet layer
          faultLayerRef.current = L.geoJSON(data, {
            style: () => ({
              color: "#ff4c42",
              weight: 3,
              opacity: 0.8,
              fillOpacity: 0,
              interactive: true,
              // Remove default outline when selected
              dashArray: null,
              lineCap: "round",
              lineJoin: "round",
            }),
            onEachFeature: (feature, layer) => {
              if (feature.properties && feature.properties.NAME) {
                layer.bindTooltip(feature.properties.NAME, {
                  permanent: false,
                  direction: "auto",
                  className: "fault-tooltip",
                });

                // Add click handler to each fault line
                layer.on("click", (e) => {
                  if (!userMarkerRef?.current) {
                    alert("User location not available yet.");
                    return;
                  }

                  // Reset previous selected fault style
                  if (selectedFaultRef.current) {
                    try {
                      selectedFaultRef.current.setStyle({
                        color: "#ff4c42",
                        weight: 3,
                      });
                    } catch (error) {
                      console.log("Error resetting fault style:", error);
                    }
                  }

                  // Highlight selected fault (orange)
                  try {
                    layer.setStyle({
                      color: "#ff8c00",
                      weight: 4,
                    });
                    selectedFaultRef.current = layer;
                  } catch (error) {
                    console.log("Error setting fault style:", error);
                  }

                  // Get user location
                  const userLatLng = userMarkerRef.current.getLatLng();
                  const userPoint = turf.point([userLatLng.lng, userLatLng.lat]);

                  // Get clicked fault line coordinates
                  const faultLine = turf.lineString(feature.geometry.coordinates);
                  const nearestPointOnFault = turf.nearestPointOnLine(faultLine, userPoint);

                  // Calculate distance
                  const distance = turf.distance(userPoint, nearestPointOnFault, {
                    units: "kilometers",
                  });

                  // Clear previous line if any
                  if (nearestLineRef.current && map) {
                    try {
                      map.removeLayer(nearestLineRef.current);
                    } catch (error) {
                      console.log("Error removing previous line:", error);
                    }
                  }

                  // Draw line from user to nearest point on fault
                  const faultLatLng = [
                    nearestPointOnFault.geometry.coordinates[1],
                    nearestPointOnFault.geometry.coordinates[0],
                  ];

                  try {
                    nearestLineRef.current = L.polyline([userLatLng, faultLatLng], {
                      color: "#00ff00",
                      dashArray: "10, 10",
                      weight: 3,
                    });

                    if (map && map.getContainer()) {
                      nearestLineRef.current.addTo(map);
                    }
                  } catch (error) {
                    console.error("Error creating polyline:", error);
                  }

                  // Show popup with distance and fault info
                  if (nearestLineRef.current) {
                    const faultProperties = feature.properties;
                    const distanceText = `
                      <div style="font-family: sans-serif;">
                        <b>${faultProperties.NAME || "Fault Line"}</b><br>
                        ${faultProperties.TYPE ? `<small>Type: ${faultProperties.TYPE}</small><br>` : ""}
                        ${faultProperties.ACTIVITY ? `<small>Activity: ${faultProperties.ACTIVITY}</small><br>` : ""}
                        <span style="color: #ff4c42; font-weight: bold;">
                          Distance from you: ${distance.toFixed(2)} km
                        </span>
                      </div>
                    `;

                    try {
                      nearestLineRef.current.bindPopup(distanceText).openPopup();
                    } catch (error) {
                      console.log("Error binding popup:", error);
                    }
                  }

                  // Stop event propagation to prevent map click
                  L.DomEvent.stopPropagation(e);
                });

                // Add hover effects
                layer.on("mouseover", () => {
                  if (layer !== selectedFaultRef.current) {
                    try {
                      layer.setStyle({
                        weight: 4,
                        opacity: 1,
                      });
                    } catch (error) {
                      console.log("Error on mouseover:", error);
                    }
                  }
                });

                layer.on("mouseout", () => {
                  if (layer !== selectedFaultRef.current) {
                    try {
                      layer.setStyle({
                        color: "#ff4c42",
                        weight: 3,
                        opacity: 0.8,
                      });
                    } catch (error) {
                      console.log("Error on mouseout:", error);
                    }
                  }
                });
              }
            },
          });

          // Add to map only if map container is valid
          if (map && map.getContainer() && faultLayerRef.current) {
            faultLayerRef.current.addTo(map);
            console.log("Fault lines added to map!");
          }
        } catch (error) {
          console.error("Error creating fault layer:", error);
        }
      })
      .catch((err) => console.error("Error loading GeoJSON:", err));

    // Cleanup
    return () => {
      if (faultLayerRef.current && map) {
        try {
          map.removeLayer(faultLayerRef.current);
        } catch (error) {
          console.log("Error cleaning up fault layer:", error);
        }
        faultLayerRef.current = null;
      }
      if (nearestLineRef.current && map) {
        try {
          map.removeLayer(nearestLineRef.current);
        } catch (error) {
          console.log("Error cleaning up nearest line:", error);
        }
        nearestLineRef.current = null;
      }
    };
  }, [map]); // Remove userMarkerRef from dependencies to prevent re-fetching

  return { faultLayerRef, nearestLineRef };
};

export default useFaultLines;