import React, { useMemo, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
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
  [5.5, 116.0],
  [19.0, 127.5],
];

const RiskMap = ({ riskByProvince }) => {
  const geoJsonRef = useRef(null);

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

    return {
      weight: 1,
      color: "#ffffff",
      fillOpacity: risk ? 0.7 : 0.35,
      fillColor: getRiskColor(risk?.riskLevel),
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

    const popupHtml = `
      <div style="font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
        <h3 style="margin:0 0 8px;font-size:16px;font-weight:600;color:#0f172a;">${provinceName}</h3>
        <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;font-size:13px;color:#334155;">
          <div>
            <p style="margin:0 0 2px;font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:#94a3b8;">Risk level</p>
            <p style="margin:0;font-weight:600;">${riskLevelLabel}</p>
          </div>
          <div>
            <p style="margin:0 0 2px;font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:#94a3b8;">Dynamic score</p>
            <p style="margin:0;font-weight:600;">${dynamicScore}</p>
          </div>
          <div>
            <p style="margin:0 0 2px;font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:#94a3b8;">Base score</p>
            <p style="margin:0;font-weight:600;">${baseScore}</p>
          </div>
          <div>
            <p style="margin:0 0 2px;font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:#94a3b8;">Updated</p>
            <p style="margin:0;font-weight:600;">${lastCalculated}</p>
          </div>
        </div>
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

    layer.bindPopup(popupHtml, {
      maxWidth: 260,
      className: "risk-popup",
    });

    layer.on({
      mouseover: (e) => {
        const target = e.target;
        target.setStyle({
          weight: 2,
          color: "#1f2937",
          fillOpacity: 0.85,
        });
        if (!target.isPopupOpen()) {
          target.openTooltip();
        }
      },
      mouseout: (e) => {
        if (geoJsonRef.current) {
          geoJsonRef.current.resetStyle(e.target);
        }
        e.target.closeTooltip();
      },
      click: () => {
        layer.openPopup();
      },
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
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          noWrap
        />
        <GeoJSON
          key={riskKey}
          data={provincesGeoJson}
          style={styleFeature}
          onEachFeature={onEachFeature}
          ref={setGeoJsonRef}
        />
      </MapContainer>

      <RiskLegend />
    </div>
  );
};

export default RiskMap;
