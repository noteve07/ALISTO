import React from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import useUserLocation from "@/features/auth/hooks/useUserLocation";

// Custom user location icon - normal marker style
const userLocationIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64," +
    btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#3B82F6" stroke="#ffffff" stroke-width="2"/>
      <circle cx="12" cy="9" r="3" fill="#ffffff"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const UserLocationMarker = ({ onLocationClick, onStartAssessment }) => {
  const { location, loading } = useUserLocation();
  const map = useMap();

  if (loading || !location) {
    return null; // Still loading or no location
  }

  const { position, municipality, province } = location;

  const handleMarkerClick = () => {
    const currentZoom = map.getZoom();

    // If at zoom 12+, zoom to street level (14) for clean view
    if (currentZoom >= 12 && onLocationClick) {
      console.log(
        `📍 User location clicked at zoom ${currentZoom}, zooming to clean street view...`
      );
      onLocationClick({
        position,
        municipality,
        province,
        currentZoom,
      });
    }
  };

  return (
    <Marker
      position={position}
      icon={userLocationIcon}
      eventHandlers={{
        click: handleMarkerClick,
      }}
    >
      <Popup opacity={0.6}>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <svg
              className="w-3 h-3 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            <strong className="text-[11px] text-gray-900">Your Location</strong>
          </div>
          <p className="text-[11px] text-gray-600">
            {municipality}, {province}
          </p>
          <p className="text-[10px] text-gray-500">
            {position[0].toFixed(4)}, {position[1].toFixed(4)}
          </p>
          <button
            onClick={() => onStartAssessment && onStartAssessment(location)}
            className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-medium rounded transition-colors duration-200"
          >
            Start Location Assessment
          </button>
        </div>
      </Popup>
    </Marker>
  );
};

export default UserLocationMarker;
