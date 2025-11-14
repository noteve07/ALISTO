import React, { useMemo, useRef, useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import provincesGeoJson from "../../../assets/gis/provinces.json";
import municipalitiesGeoJson from "../../../assets/gis/municities.json";
import { getRiskColor } from "../utils/riskUtils";
import FaultLinesOverlay from "./FaultLinesOverlay";
import VolcanoesOverlay from "./VolcanoesOverlay";
import NearestHazardLines from "./NearestHazardLines";
import UserLocationMarker from "../../live-monitoring/components/UserLocationMarker";
import RiskFilterPanel from "./RiskFilterPanel";
import ProvinceRiskList from "./ProvinceRiskList";
import CombinedLegend from "./CombinedLegend";
import LocationRiskAssessment from "./LocationRiskAssessment";
import MunicipalityOverlay from "./MunicipalityOverlay";
import EmergencyFacilityMarkers from "./EmergencyFacilityMarkers";

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

// Component to handle initial map view and zoom tracking
const MapViewController = ({ initialMapState, onZoomChange }) => {
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

  useEffect(() => {
    const handleZoomEnd = () => {
      const currentZoom = map.getZoom();
      if (onZoomChange) {
        onZoomChange(currentZoom);
      }
    };

    map.on("zoomend", handleZoomEnd);

    // Call initially to set current zoom
    handleZoomEnd();

    return () => {
      map.off("zoomend", handleZoomEnd);
    };
  }, [map, onZoomChange]);

  return null;
};

const RiskMap = ({
  riskByProvince,
  initialMapState,
  filters,
  onFilterChange,
}) => {
  const geoJsonRef = useRef(null);
  const mapRef = useRef(null);

  // State for zoom tracking and selection hierarchy
  const [currentZoom, setCurrentZoom] = useState(6);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedMunicipality, setSelectedMunicipality] = useState(null);

  // State for location assessment
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [assessmentData, setAssessmentData] = useState(null);
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  // Handle zoom changes
  const handleZoomChange = (zoom) => {
    setCurrentZoom(zoom);

    // Clear selections when zooming out
    if (zoom < 8 && selectedProvince) {
      setSelectedProvince(null);
      setSelectedMunicipality(null);
    }
    if (zoom < 10 && selectedMunicipality) {
      setSelectedMunicipality(null);
    }
  };

  // Handle municipality click
  const handleMunicipalityClick = (municipalityInfo) => {
    console.log(
      `🏛️ Municipality clicked: ${municipalityInfo.name}, ${municipalityInfo.province}`
    );
    setSelectedMunicipality(municipalityInfo.name);
  };

  // Handle user location click for zooming to clean street view
  const handleUserLocationClick = (locationInfo) => {
    const { position, currentZoom } = locationInfo;

    if (currentZoom >= 12 && mapRef.current) {
      console.log(`📍 Zooming to user location at street level (zoom 14)`);
      mapRef.current.flyTo(position, 14, {
        duration: 1.5,
        easeLinearity: 0.25,
      });
    }
  };

  // Handle starting location assessment
  const handleStartAssessment = (locationInfo) => {
    console.log("🔍 Starting location assessment for:", locationInfo);
    setAssessmentLoading(true);
    setLoadingStep(0);

    // Step-by-step loading simulation with hardcoded arbitrary delays (1-2 seconds each)
    const steps = [
      { delay: 1200, step: 0, message: "Analyzing landslide risk..." },
      { delay: 1800, step: 1, message: "Checking tsunami vulnerability..." },
      { delay: 1500, step: 2, message: "Evaluating liquefaction potential..." },
      { delay: 1100, step: 3, message: "Finding nearest school..." },
      { delay: 1700, step: 4, message: "Locating nearest hospital..." },
      { delay: 1300, step: 5, message: "Identifying evacuation center..." },
    ];

    let currentDelay = 0;
    steps.forEach(({ delay, step, message }) => {
      currentDelay += delay;
      setTimeout(() => {
        console.log(`📊 ${message}`);
        setLoadingStep(step + 1);
      }, currentDelay);
    });

    // Complete assessment
    setTimeout(() => {
      setAssessmentStarted(true);
      setAssessmentData(locationInfo);
      setAssessmentLoading(false);
      setLoadingStep(0);
    }, currentDelay + 500);
  };

  // Handle facility click to zoom to location
  const handleFacilityClick = (coordinates) => {
    if (mapRef.current && coordinates) {
      console.log("🏥 Zooming to facility at:", coordinates);
      mapRef.current.flyTo(coordinates, 16, {
        duration: 1.5,
        easeLinearity: 0.25,
      });
    }
  };

  // Filter municipalities for selected province
  const municipalitiesForProvince = useMemo(() => {
    if (!selectedProvince) return null;

    const filteredFeatures = municipalitiesGeoJson.features.filter(
      (feature) => {
        const provinceName =
          feature.properties?.NAME_1 || feature.properties?.PROVINCE;
        return (
          provinceName &&
          provinceName.toLowerCase() === selectedProvince.toLowerCase()
        );
      }
    );

    return {
      type: "FeatureCollection",
      features: filteredFeatures,
    };
  }, [selectedProvince]);

  // Determine visibility based on zoom level and selections
  const shouldShowProvinces = currentZoom < 14; // Hide provinces at zoom 14+ for clean street view
  const shouldShowMunicipalities =
    selectedProvince &&
    municipalitiesForProvince &&
    currentZoom > 10 &&
    currentZoom < 14;

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
        ([provinceId, risk]) => `${provinceId}:${risk?.riskLevel ?? "unknown"}`
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

    // Reduce opacity when municipalities are showing or at high zoom
    const baseOpacity = shouldShowProvinces
      ? risk
        ? 0.7
        : 0.35
      : risk
      ? 0.2
      : 0.1;
    const weight = shouldShowProvinces ? 1 : 0.5;

    return {
      weight: weight,
      color: darkenColor(baseColor, 0.2),
      fillOpacity: baseOpacity,
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
    const riskColor = getRiskColor(risk?.riskLevel);

    // Get light background color based on risk level
    const getHeaderStyle = () => {
      if (!risk?.riskLevel) {
        return { bg: "#f1f5f9", text: "#64748b" }; // Gray for no data
      }
      const level = risk.riskLevel.toLowerCase();
      if (level.includes("high")) {
        return { bg: "#fee2e2", text: "#991b1b" }; // Light red
      }
      if (level.includes("medium")) {
        return { bg: "#fef3c7", text: "#92400e" }; // Light yellow
      }
      if (level.includes("low")) {
        return { bg: "#dcfce7", text: "#166534" }; // Light green
      }
      return { bg: "#f1f5f9", text: "#64748b" }; // Default gray
    };
    const headerStyle = getHeaderStyle();

    const popupHtml = `
      <div style="min-width: 180px; font-family: system-ui, -apple-system, sans-serif;">
        <div style="background: ${headerStyle.bg}; padding: 8px 12px; margin: -12px -16px 8px -16px; border-radius: 4px 4px 0 0;">
          <p style="margin: 0; font-weight: 600; font-size: 14px; color: ${headerStyle.text}; letter-spacing: 0.3px;">${provinceName}</p>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
          <div style="width: 10px; height: 10px; border-radius: 50%; background: ${riskColor}; flex-shrink: 0;"></div>
          <div style="flex: 1;">
            <p style="margin: 0; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Risk Level</p>
            <p style="margin: 2px 0 0 0; font-size: 13px; font-weight: 600; color: #111827;">${riskLevelLabel}</p>
          </div>
        </div>
      </div>
    `;

    // Get province centroid
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

    // Bind popup to centroid but don't show on hover
    if (centroid) {
      layer.bindPopup(popupHtml, {
        closeButton: true,
        autoClose: false,
        closeOnClick: false,
        className: "province-risk-popup",
        maxWidth: 250,
        autoPan: false,
      });
    }

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

        // Show popup on hover
        if (centroid) {
          target.openPopup(centroid);

          // Add event listeners to popup to prevent closing when hovering over it
          setTimeout(() => {
            const popup = target.getPopup();
            if (popup && popup._container) {
              const popupElement = popup._container;

              popupElement.addEventListener("mouseenter", () => {
                target._hoveringPopup = true;
              });

              popupElement.addEventListener("mouseleave", () => {
                target._hoveringPopup = false;
                // Close popup when leaving popup area
                setTimeout(() => {
                  if (!target._hoveringPopup && !target._hoveringLayer) {
                    target.closePopup();
                    if (geoJsonRef.current) {
                      geoJsonRef.current.resetStyle(target);
                    }
                  }
                }, 100);
              });
            }
          }, 10);
        }

        target._hoveringLayer = true;
      },
      mouseout: (e) => {
        const target = e.target;
        target._hoveringLayer = false;

        // Delay closing to check if mouse moved to popup
        setTimeout(() => {
          if (!target._hoveringPopup && !target._hoveringLayer) {
            target.closePopup();
            if (geoJsonRef.current) {
              geoJsonRef.current.resetStyle(target);
            }
          }
        }, 100);
      },
      click: (e) => {
        const target = e.target;
        const baseColor = getRiskColor(risk?.riskLevel);

        // Highlight the province
        target.setStyle({
          weight: 3,
          color: darkenColor(baseColor, 0.4),
          fillColor: darkenColor(baseColor, 0.1),
          fillOpacity: 0.9,
        });

        // Select province and zoom
        console.log(
          `🗺️ Province clicked: ${provinceName}, selecting for municipalities`
        );
        setSelectedProvince(provinceName);

        // Zoom to province - municipalities will show automatically at zoom > 10
        if (mapRef.current && centroid) {
          mapRef.current.flyTo(centroid, 11, {
            duration: 1.5,
            easeLinearity: 0.25,
          });
        }

        // Open popup at centroid
        if (centroid) {
          target.openPopup(centroid);
        }
      },
    });
  };

  const setGeoJsonRef = (layer) => {
    if (layer) {
      geoJsonRef.current = layer;
    }
  };

  const handleProvinceClick = (center, name) => {
    if (mapRef.current) {
      console.log(`🗺️ Panning to ${name} at`, center);
      mapRef.current.flyTo(center, 8, {
        duration: 1.5,
        easeLinearity: 0.25,
      });
    }
  };

  return (
    <div className="relative w-full h-full">
      <style>
        {`
          .province-risk-popup .leaflet-popup-content-wrapper {
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
            padding: 0;
            overflow: hidden;
          }
          .province-risk-popup .leaflet-popup-content {
            margin: 12px 16px;
            line-height: 1.4;
          }
          .province-risk-popup .leaflet-popup-tip {
            box-shadow: 0 3px 14px rgba(0, 0, 0, 0.1);
          }
          .province-risk-popup .leaflet-popup-close-button {
            color: #6b7280 !important;
            font-size: 20px !important;
            padding: 4px 8px !important;
            width: auto !important;
            height: auto !important;
            top: 4px !important;
            right: 4px !important;
            font-weight: bold;
          }
          .province-risk-popup .leaflet-popup-close-button:hover {
            color: #111827 !important;
          }
        `}
      </style>
      <MapContainer
        center={mapCenter}
        zoom={6}
        scrollWheelZoom
        minZoom={6}
        maxZoom={18}
        maxBounds={mapBounds}
        maxBoundsViscosity={0.7}
        style={{ width: "100%", height: "100%", backgroundColor: "#aed2de" }}
        className="risk-map-background"
        zoomControl={false}
        ref={mapRef}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          noWrap
        />
        <MapViewController
          initialMapState={initialMapState}
          onZoomChange={handleZoomChange}
        />
        {shouldShowProvinces && (
          <GeoJSON
            key={`${riskKey}-${shouldShowProvinces}-${currentZoom}`}
            data={provincesGeoJson}
            style={styleFeature}
            onEachFeature={onEachFeature}
            ref={setGeoJsonRef}
            pane="tilePane"
          />
        )}
        <MunicipalityOverlay
          municipalitiesData={municipalitiesForProvince}
          visible={shouldShowMunicipalities}
          onMunicipalityClick={handleMunicipalityClick}
          selectedProvince={selectedProvince}
        />
        {filters.showFaultLines && <FaultLinesOverlay />}
        {filters.showVolcanoes && <VolcanoesOverlay />}
        <NearestHazardLines
          showVolcano={filters.showVolcanoes}
          showFault={filters.showFaultLines}
        />
        <UserLocationMarker
          onLocationClick={handleUserLocationClick}
          onStartAssessment={handleStartAssessment}
        />
        <EmergencyFacilityMarkers
          userLocation={assessmentData}
          assessmentStarted={assessmentStarted}
          assessmentLoading={assessmentLoading}
          loadingStep={loadingStep}
        />
      </MapContainer>

      <RiskFilterPanel filters={filters} onFilterChange={onFilterChange} />
      <ProvinceRiskList
        riskByProvince={riskByProvince}
        onProvinceClick={handleProvinceClick}
      />
      <CombinedLegend />
      <LocationRiskAssessment
        assessmentStarted={assessmentStarted}
        assessmentLoading={assessmentLoading}
        loadingStep={loadingStep}
        onFacilityClick={handleFacilityClick}
      />
    </div>
  );
};

export default RiskMap;
