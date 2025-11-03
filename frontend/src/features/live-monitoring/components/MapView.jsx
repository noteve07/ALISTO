import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import EarthquakeMarker from "./EarthquakeMarker";
import MapLegend from "./MapLegend";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// fix leaflet default marker
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const MapView = ({ earthquakeData }) => (
  <MapContainer
    center={[12.8797, 121.774]}
    zoom={6}
    scrollWheelZoom
    style={{ width: "100%", height: "100%" }}
    minZoom={6}
    maxZoom={10}
    maxBounds={[
      [6.5, 120.0],
      [20.0, 131.5],
    ]}
    maxBoundsViscosity={0.7}
    zoomControl={false}
  >
    <TileLayer
      attribution="&copy; OpenStreetMap contributors"
      url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      url="url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    {earthquakeData.map((event, i) => (
      <EarthquakeMarker key={event.id} event={event} isLatest={i === 0} />
    ))}
    <MapLegend />
  </MapContainer>
);

export default MapView;
