import React, { useRef, useCallback } from "react";
import { GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";

const MunicipalityOverlay = ({
  municipalitiesData,
  visible = true,
  onMunicipalityClick,
  selectedProvince,
}) => {
  const geoJsonRef = useRef(null);
  const map = useMap();

  const getMunicipalityCentroid = useCallback((feature) => {
    let centroid;
    if (feature.geometry.type === "Polygon") {
      const coords = feature.geometry.coordinates[0];
      const lats = coords.map((c) => c[1]);
      const lngs = coords.map((c) => c[0]);
      centroid = [
        (Math.min(...lats) + Math.max(...lats)) / 2,
        (Math.min(...lngs) + Math.max(...lngs)) / 2,
      ];
    } else if (feature.geometry.type === "MultiPolygon") {
      const allCoords = feature.geometry.coordinates.flatMap((poly) => poly[0]);
      const lats = allCoords.map((c) => c[1]);
      const lngs = allCoords.map((c) => c[0]);
      centroid = [
        (Math.min(...lats) + Math.max(...lats)) / 2,
        (Math.min(...lngs) + Math.max(...lngs)) / 2,
      ];
    }
    return centroid;
  }, []);

  const styleFeature = useCallback(() => {
    return {
      weight: 2,
      color: "#3b82f6", // blue-500
      fillOpacity: 0.1,
      fillColor: "#3b82f6",
      dashArray: "",
    };
  }, []);

  const onEachFeature = useCallback(
    (feature, layer) => {
      const municipalityName =
        feature.properties?.NAME_2 || "Unknown Municipality";
      const provinceName =
        feature.properties?.NAME_1 ||
        feature.properties?.PROVINCE ||
        "Unknown Province";
      const municipalityType = feature.properties?.ENGTYPE_2 || "Municipality";
      const region = feature.properties?.REGION || "Unknown Region";

      const popupHtml = `
      <div style="min-width: 200px; font-family: system-ui, -apple-system, sans-serif;">
        <div style="background: #f0f9ff; padding: 8px 12px; margin: -12px -16px 8px -16px; border-radius: 4px 4px 0 0;">
          <p style="margin: 0; font-weight: 600; font-size: 14px; color: #1e40af; letter-spacing: 0.3px;">${municipalityName}</p>
          <p style="margin: 2px 0 0 0; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">${municipalityType}</p>
        </div>
        <div style="margin-bottom: 6px;">
          <p style="margin: 0; font-size: 11px; color: #6b7280;">Province: <strong style="color: #111827;">${provinceName}</strong></p>
          <p style="margin: 2px 0 0 0; font-size: 11px; color: #6b7280;">Region: <strong style="color: #111827;">${region}</strong></p>
        </div>
      </div>
    `;

      const centroid = getMunicipalityCentroid(feature);

      if (centroid) {
        layer.bindPopup(popupHtml, {
          closeButton: true,
          autoClose: true,
          closeOnClick: false,
          className: "municipality-popup",
          maxWidth: 250,
        });
      }

      layer.on({
        mouseover: (e) => {
          const target = e.target;
          target.setStyle({
            weight: 3,
            color: "#1d4ed8", // blue-700
            fillColor: "#3b82f6",
            fillOpacity: 0.3,
          });
        },
        mouseout: (e) => {
          if (geoJsonRef.current) {
            geoJsonRef.current.resetStyle(e.target);
          }
        },
        click: (e) => {
          const target = e.target;

          // Highlight the municipality
          target.setStyle({
            weight: 3,
            color: "#1d4ed8",
            fillColor: "#2563eb",
            fillOpacity: 0.4,
          });

          // Get municipality info
          const municipalityInfo = {
            name: municipalityName,
            province: provinceName,
            centroid: centroid,
            bounds: target.getBounds(),
          };

          // Call the click handler
          if (onMunicipalityClick) {
            onMunicipalityClick(municipalityInfo);
          }

          // Zoom to municipality
          if (centroid) {
            map.flyTo(centroid, 12, {
              duration: 1.5,
              easeLinearity: 0.25,
            });
          }

          // Open popup
          if (centroid) {
            target.openPopup(centroid);
          }
        },
      });
    },
    [getMunicipalityCentroid, onMunicipalityClick, map]
  );

  const setGeoJsonRef = useCallback((layer) => {
    if (layer) {
      geoJsonRef.current = layer;
    }
  }, []);

  if (!visible || !municipalitiesData || !municipalitiesData.features?.length) {
    return null;
  }

  return (
    <>
      <style>
        {`
          .municipality-popup .leaflet-popup-content-wrapper {
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
            padding: 0;
            overflow: hidden;
          }
          .municipality-popup .leaflet-popup-content {
            margin: 12px 16px;
            line-height: 1.4;
          }
          .municipality-popup .leaflet-popup-tip {
            box-shadow: 0 3px 14px rgba(0, 0, 0, 0.1);
          }
          .municipality-popup .leaflet-popup-close-button {
            color: #6b7280 !important;
            font-size: 20px !important;
            padding: 4px 8px !important;
            width: auto !important;
            height: auto !important;
            top: 4px !important;
            right: 4px !important;
            font-weight: bold;
          }
          .municipality-popup .leaflet-popup-close-button:hover {
            color: #111827 !important;
          }
        `}
      </style>
      <GeoJSON
        key={`municipalities-${selectedProvince || "none"}`}
        data={municipalitiesData}
        style={styleFeature}
        onEachFeature={onEachFeature}
        ref={setGeoJsonRef}
        pane="overlayPane"
      />
    </>
  );
};

export default MunicipalityOverlay;
