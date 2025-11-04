import React, { useMemo } from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import volcanoes from "../../../assets/gis/volcanoes.json";
import { useVolcanicAdvisories } from "../hooks/useVolcanicAdvisories";

// Custom SVG volcano icon (triangle) with alert level colors
const createVolcanoIcon = (alertLevel) => {
  // Color based on alert level
  let fillColor = "#dc2626"; // Default red
  let strokeColor = "#991b1b";
  let lavaColor = "#fbbf24";

  if (alertLevel >= 4) {
    fillColor = "#7f1d1d"; // Very dark red for high alert
    strokeColor = "#450a0a";
    lavaColor = "#ef4444";
  } else if (alertLevel >= 3) {
    fillColor = "#dc2626"; // Red for elevated
    strokeColor = "#991b1b";
    lavaColor = "#f97316";
  } else if (alertLevel >= 2) {
    fillColor = "#ea580c"; // Orange for moderate
    strokeColor = "#c2410c";
    lavaColor = "#fbbf24";
  } else {
    fillColor = "#f59e0b"; // Amber for low
    strokeColor = "#d97706";
    lavaColor = "#fde047";
  }

  const svgIcon = `
    <svg width="28" height="28" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow-${alertLevel}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.2"/>
          <feOffset dx="0" dy="1" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.4"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <path 
        d="M 12 3 L 21 21 L 3 21 Z" 
        fill="${fillColor}" 
        stroke="${strokeColor}" 
        stroke-width="2" 
        filter="url(#shadow-${alertLevel})"
      />
      <circle cx="12" cy="4.5" r="2" fill="${lavaColor}" opacity="0.95">
        <animate attributeName="opacity" values="0.95;0.6;0.95" dur="2s" repeatCount="indefinite"/>
      </circle>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: "volcano-marker-live",
    iconSize: [28, 28],
    iconAnchor: [14, 24],
    popupAnchor: [0, -24],
  });
};

const getAlertLevelText = (level) => {
  if (level >= 5) return "ALERT LEVEL 5 - HAZARDOUS ERUPTION";
  if (level >= 4) return "ALERT LEVEL 4 - HAZARDOUS ERUPTION IMMINENT";
  if (level >= 3) return "ALERT LEVEL 3 - MAGMATIC UNREST";
  if (level >= 2) return "ALERT LEVEL 2 - MODERATE UNREST";
  if (level >= 1) return "ALERT LEVEL 1 - LOW LEVEL UNREST";
  return "NORMAL";
};

const getAlertLevelColor = (level) => {
  if (level >= 4) return "text-red-700";
  if (level >= 3) return "text-red-600";
  if (level >= 2) return "text-orange-600";
  if (level >= 1) return "text-amber-600";
  return "text-gray-600";
};

const VolcanoMarkers = () => {
  const { advisories, loading } = useVolcanicAdvisories();

  // Create a map of volcano_id to advisory
  const advisoryMap = useMemo(() => {
    const map = {};
    advisories.forEach((advisory) => {
      if (advisory.alertLevel > 0) {
        map[advisory.id] = advisory;
      }
    });
    return map;
  }, [advisories]);

  // Filter volcanoes that have active advisories
  const activeVolcanoes = useMemo(() => {
    return volcanoes.filter((volcano) => advisoryMap[volcano.id]);
  }, [advisoryMap]);

  if (loading || activeVolcanoes.length === 0) {
    return null;
  }

  return (
    <>
      {activeVolcanoes.map((volcano) => {
        const advisory = advisoryMap[volcano.id];
        const volcanoIcon = createVolcanoIcon(advisory.alertLevel);

        return (
          <Marker
            key={volcano.id}
            position={[volcano.latitude, volcano.longitude]}
            icon={volcanoIcon}
          >
            <Popup className="volcano-popup-live" maxWidth={300}>
              <div className="text-sm">
                <h3 className="font-bold text-gray-900 text-lg mb-2">
                  {volcano.name}
                </h3>

                <div className="space-y-2">
                  <div
                    className={`font-semibold ${getAlertLevelColor(
                      advisory.alertLevel
                    )}`}
                  >
                    {getAlertLevelText(advisory.alertLevel)}
                  </div>

                  <div className="text-gray-600 space-y-1">
                    <p>
                      <span className="font-medium">Province:</span>{" "}
                      {volcano.province || "Unknown"}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>{" "}
                      {advisory.alertStatus}
                    </p>
                    {advisory.issuanceDate && (
                      <p className="text-xs text-gray-500">
                        Issued:{" "}
                        {new Date(advisory.issuanceDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {advisory.bulletinLink && (
                    <a
                      href={advisory.bulletinLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-v2 font-medium mt-2"
                    >
                      <span>View Bulletin</span>
                      <span className="material-symbols-outlined text-sm">
                        open_in_new
                      </span>
                    </a>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

export default VolcanoMarkers;
