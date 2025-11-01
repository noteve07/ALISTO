import React, { useEffect, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Custom user location icon - normal marker style
const userLocationIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#3B82F6" stroke="#ffffff" stroke-width="2"/>
      <circle cx="12" cy="9" r="3" fill="#ffffff"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const UserLocationMarker = () => {
  const [position, setPosition] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000, // Cache position for 1 minute
    };

    const handleSuccess = (location) => {
      const { latitude, longitude, accuracy } = location.coords;
      setPosition([latitude, longitude]);
      setAccuracy(Math.round(accuracy));
      setError(null);
    };

    const handleError = (err) => {
      console.warn('Geolocation error:', err);
      switch (err.code) {
        case err.PERMISSION_DENIED:
          setError('Location access denied by user.');
          break;
        case err.POSITION_UNAVAILABLE:
          setError('Location information is unavailable.');
          break;
        case err.TIMEOUT:
          setError('Location request timed out.');
          break;
        default:
          setError('An unknown error occurred.');
          break;
      }
    };

    // Get initial position
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);

    // Watch position changes
    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, options);

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  if (error) {
    console.warn('User location error:', error);
    return null; // Don't render anything if location is not available
  }

  if (!position) {
    return null; // Still loading position
  }

  return (
    <Marker position={position} icon={userLocationIcon}>
      <Popup>
        <div className="text-center">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <strong className="text-gray-900">Your Location</strong>
          </div>
          <div className="text-sm text-gray-600">
            <p>Lat: {position[0].toFixed(4)}</p>
            <p>Lng: {position[1].toFixed(4)}</p>
            {accuracy && (
              <p className="text-xs text-gray-500 mt-1">
                Accuracy: ±{accuracy}m
              </p>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default UserLocationMarker;