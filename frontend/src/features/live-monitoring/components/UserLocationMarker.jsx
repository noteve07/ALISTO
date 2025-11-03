import React, { useEffect, useState } from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

const UserLocationMarker = () => {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setPosition([position.coords.latitude, position.coords.longitude]);
        setError(null);
      },
      (error) => {
        setError(`Error getting location: ${error.message}`);
        console.error("Geolocation error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // Cache for 1 minute
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Create custom user location icon (blue pin style)
  const userIcon = L.divIcon({
    html: `
      <div style="
        width: 32px; 
        height: 32px; 
        display: flex; 
        align-items: center; 
        justify-content: center;
      ">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#3B82F6">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
    `,
    className: "user-location-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  if (error) {
    console.warn("UserLocationMarker:", error);
    return null;
  }

  if (!position) {
    return null;
  }

  return (
    <Marker position={position} icon={userIcon}>
      <Popup>
        <div className="text-sm">
          <strong>Your Location</strong>
          <br />
          Lat: {position[0].toFixed(6)}
          <br />
          Lng: {position[1].toFixed(6)}
        </div>
      </Popup>
    </Marker>
  );
};

export default UserLocationMarker;
