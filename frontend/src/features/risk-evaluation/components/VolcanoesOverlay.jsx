import React, { useMemo } from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import volcanoes from "../../../assets/gis/volcanoes.json";

// Custom SVG volcano icon (triangle)
const createVolcanoIcon = () => {
  const svgIcon = `
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1"/>
          <feOffset dx="0" dy="1" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <path 
        d="M 12 4 L 20 20 L 4 20 Z" 
        fill="#dc2626" 
        stroke="#991b1b" 
        stroke-width="1.5" 
        filter="url(#shadow)"
      />
      <circle cx="12" cy="5" r="1.5" fill="#fbbf24" opacity="0.9"/>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: "volcano-marker",
    iconSize: [24, 24],
    iconAnchor: [12, 20],
    popupAnchor: [0, -20],
  });
};

const VolcanoesOverlay = ({ visible = true }) => {
  const volcanoIcon = useMemo(() => createVolcanoIcon(), []);

  // Don't render if not visible
  if (!visible) return null;

  return (
    <>
      {volcanoes.map((volcano) => {
        if (!volcano.latitude || !volcano.longitude) return null;

        return (
          <Marker
            key={volcano.id}
            position={[volcano.latitude, volcano.longitude]}
            icon={volcanoIcon}
          >
            <Popup className="volcano-popup">
              <div className="text-sm">
                <h3 className="font-semibold text-gray-900 text-base mb-1">
                  {volcano.name}
                </h3>
                <div className="space-y-0.5 text-gray-600">
                  <p>
                    <span className="font-medium">Province:</span>{" "}
                    {volcano.province || "Unknown"}
                  </p>
                  <p>
                    <span className="font-medium">Coordinates:</span>
                  </p>
                  <p className="text-xs text-gray-500 ml-2">
                    Lat: {Number(volcano.latitude).toFixed(4)}°
                    <br />
                    Lon: {Number(volcano.longitude).toFixed(4)}°
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

export default VolcanoesOverlay;
