import { useEffect, useRef, useState } from "react";
import L from "leaflet";

const useFaultLineLayer = (map) => {
  const faultLayerRef = useRef(null);
  const [faultData, setFaultData] = useState(null);

  // Fetch GeoJSON data
  useEffect(() => {
    const faultDataUrl = new URL(
      "../../../assets/gis/fault_lines.geojson",
      import.meta.url
    );

    const controller = new AbortController();

    fetch(faultDataUrl, { signal: controller.signal })
      .then((response) => response.json())
      .then((data) => setFaultData(data))
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error("Error loading fault lines:", error);
        }
      });

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!map || !faultData || faultLayerRef.current) return;

    console.log("Adding fault lines to map...", faultData);

    // Wait for map to be ready before adding layers
    map.whenReady(() => {
      if (!map.getPane || !map.getPane("overlayPane")) {
        console.warn("Map panes not ready for fault lines.");
        return;
      }

      // Add fault lines to map
      const faultLayer = L.geoJSON(faultData, {
        style: {
          color: "#ff4c42",
          weight: 3,
          opacity: 0.8,
        },
        onEachFeature: (feature, layer) => {
          if (feature.properties && feature.properties.NAME) {
            layer.bindTooltip(feature.properties.NAME, {
              permanent: false,
              direction: "auto",
              className: "fault-tooltip",
            });
          }
        },
      }).addTo(map);

      faultLayerRef.current = faultLayer;

      console.log("Fault lines added successfully!");
    });

    // Cleanup
    return () => {
      if (faultLayerRef.current) {
        if (map && map.removeLayer && map.hasLayer && map.hasLayer(faultLayerRef.current)) {
          map.removeLayer(faultLayerRef.current);
        } else {
          faultLayerRef.current.remove();
        }
        faultLayerRef.current = null;
      }
    };
  }, [map, faultData]);

  return faultLayerRef;
};

export default useFaultLineLayer;
