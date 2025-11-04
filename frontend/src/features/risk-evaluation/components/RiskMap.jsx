import React, { useMemo, useRef, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import provincesGeoJson from "../../../assets/gis/provinces.json";
import {
  formatRiskScore,
  formatTimestamp,
  getRiskColor,
  getRiskLevelKey,
} from "../utils/riskUtils";
import RiskLegend from "./RiskLegend";
import FaultLinesOverlay from "./FaultLinesOverlay";
import FaultLinesLegend from "./FaultLinesLegend";
import VolcanoesOverlay from "./VolcanoesOverlay";
import VolcanoLegend from "./VolcanoLegend";
import NearestHazardLines from "./NearestHazardLines";
import UserLocationMarker from "../../live-monitoring/components/UserLocationMarker";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const mapCenter = [12.8797, 121.774];
const mapBounds = [
  [3.0, 111.0],
  [22.0, 140.0],
];

// Component to handle initial map view
const MapViewController = ({ initialMapState }) => {
  const map = useMap();
  const hasSetInitialView = useRef(false);

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

  return null;
};

const RiskMap = ({ riskByProvince, initialMapState }) => {
  const geoJsonRef = useRef(null);

  const darkenColor = (hex, amount = 0.15) => {
    try {
      const normalized = hex.replace("#", "");
      const r = parseInt(normalized.substring(0, 2), 16);
      const g = parseInt(normalized.substring(2, 4), 16);
      const b = parseInt(normalized.substring(4, 6), 16);
      const factor = 1 - amount;
      const toHex = (v) =>
        Math.max(0, Math.min(255, Math.round(v)))
          .toString(16)
          .padStart(2, "0");
      return `#${toHex(r * factor)}${toHex(g * factor)}${toHex(b * factor)}`;
    } catch {
      return "#1f2937"; // fallback slate-800
    }
  };

  const riskKey = useMemo(() => {
    const entries = Object.entries(riskByProvince)
      .map(
        ([provinceId, risk]) =>
          `${provinceId}:${risk?.riskLevel ?? "unknown"}:${
            risk?.dynamicRiskScore ?? "na"
          }`
      )
      .sort();

    return entries.join("|");
  }, [riskByProvince]);

  const styleFeature = (feature) => {
    const provinceId =
      feature.properties?.province_id ||
      feature.properties?.PROVINCE_ID ||
      feature.properties?.ID_1;
    const risk = riskByProvince[provinceId];
    const baseColor = getRiskColor(risk?.riskLevel);

    return {
      weight: 1,
      color: darkenColor(baseColor, 0.2),
      fillOpacity: risk ? 0.7 : 0.35,
      fillColor: baseColor,
      dashArray: risk ? "" : "4",
    };
  };

  const onEachFeature = (feature, layer) => {
    const provinceName =
      feature.properties?.PROVINCE ||
      feature.properties?.NAME_1 ||
      "Unknown Province";
    const provinceId =
      feature.properties?.province_id ||
      feature.properties?.PROVINCE_ID ||
      feature.properties?.ID_1;
    const risk = riskByProvince[provinceId];

    const riskLevelLabel = risk?.riskLevel
      ? risk.riskLevel.toUpperCase()
      : "NO DATA";
    const dynamicScore = formatRiskScore(risk?.dynamicRiskScore);
    const baseScore = formatRiskScore(risk?.baseRiskScore);
    const lastCalculated = formatTimestamp(risk?.calculatedAt);

    const tooltipHtml = `
      <div style="font-size:12px;color:#e2e8f0;">
        <p style="margin:0;font-weight:600;font-size:13px;color:#f8fafc;">${provinceName}</p>
        <p style="margin:2px 0 0;">Risk: <strong>${riskLevelLabel}</strong></p>
      </div>
    `;

    layer.bindTooltip(tooltipHtml, {
      sticky: true,
      direction: "top",
      opacity: 0.9,
      className: `risk-tooltip risk-tooltip--${getRiskLevelKey(
        risk?.riskLevel
      )}`,
    });

    layer.on({
      mouseover: (e) => {
        const target = e.target;
        const baseColor = getRiskColor(risk?.riskLevel);
        target.setStyle({
          weight: 3,
          color: darkenColor(baseColor, 0.4),
          fillColor: darkenColor(baseColor, 0.1),
          fillOpacity: 0.9,
        });
        target.openTooltip();
      },
      mouseout: (e) => {
        if (geoJsonRef.current) {
          geoJsonRef.current.resetStyle(e.target);
        }
        e.target.closeTooltip();
      },
      click: () => {},
    });
  };

  const setGeoJsonRef = (layer) => {
    if (layer) {
      geoJsonRef.current = layer;
    }
  };

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={mapCenter}
        zoom={6}
        scrollWheelZoom
        minZoom={6}
        maxZoom={10}
        maxBounds={mapBounds}
        maxBoundsViscosity={0.7}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          noWrap
        />
        <MapViewController initialMapState={initialMapState} />
        <GeoJSON
          key={riskKey}
          data={provincesGeoJson}
          style={styleFeature}
          onEachFeature={onEachFeature}
          ref={setGeoJsonRef}
        />
        <FaultLinesOverlay />
        <VolcanoesOverlay />
        <NearestHazardLines />
        <UserLocationMarker />
      </MapContainer>

      <RiskLegend />
      <FaultLinesLegend />
      <VolcanoLegend />
    </div>
  );
};

export default RiskMap;
