import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import LandingEarthquakeMarker from "./LandingEarthquakeMarker";
import useLandingEarthquakeData from "../hooks/useLandingEarthquakeData";
import { getEarthquakeStats } from "../utils/earthquakeUtils";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix leaflet default marker - exact same as live monitoring
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const LiveMapOverview = () => {
  const { earthquakeData, loading } = useLandingEarthquakeData();
  
  // Get accurate stats using same utils as live monitoring
  const stats = getEarthquakeStats(earthquakeData);

  if (loading) {
    return (
      <div className="relative w-full h-[720px] bg-gray-100 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-gray-600">
              Loading live earthquake data...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[720px] bg-gray-100 rounded-lg overflow-hidden">
      {/* Live Status Indicator */}
      <div className="absolute top-4 left-4 z-1000 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-700">Live Data</span>
        </div>
      </div>

      {/* Accurate Earthquake Count */}
      <div className="absolute top-4 right-4 z-1000 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
        <div className="text-sm">
          <span className="font-medium text-gray-700">
            {stats.total}
          </span>
          <span className="text-gray-500 ml-1">earthquakes (24h)</span>
        </div>
        {stats.recentCount > 0 && (
          <div className="text-xs text-red-600 mt-1">
            {stats.recentCount} recent (1h)
          </div>
        )}
      </div>

      <MapContainer
        center={[12.8797, 121.774]}
        zoom={6}
        scrollWheelZoom
        style={{ width: "100%", height: "100%" }}
        minZoom={6}
        maxZoom={10}
        maxBounds={[
          [5.5, 116.0],
          [19.0, 127.5],
        ]}
        maxBoundsViscosity={0.7}
        zoomControl={false}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          noWrap
        />
        {earthquakeData.map((event, i) => (
          <LandingEarthquakeMarker
            key={event.id}
            event={event}
            isLatest={i === 0}
          />
        ))}
      </MapContainer>
    </div>
  );
};

export default LiveMapOverview;
