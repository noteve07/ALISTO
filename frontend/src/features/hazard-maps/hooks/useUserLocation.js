import { useEffect, useRef } from "react";
import L from "leaflet";

const useUserLocation = (map) => {
  const userMarkerRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    const addUserLocationMarker = (latLng) => {
      // Remove existing marker if it exists
      if (userMarkerRef.current) {
        try {
          map.removeLayer(userMarkerRef.current);
        } catch (error) {
          console.log("Error removing marker:", error);
        }
      }

      // Create new marker with proper error handling
      try {
        userMarkerRef.current = L.marker(latLng, {
          icon: L.divIcon({
            className: "user-location-marker",
            html: `
              <div style="
                width: 20px;
                height: 20px;
                background: #3388ff;
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              "></div>
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          }),
        });

        // Add to map only if map is still valid
        if (map && map.getContainer()) {
          userMarkerRef.current.addTo(map);
        }
      } catch (error) {
        console.error("Error creating user location marker:", error);
      }
    };

    // Try to get user's actual location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (map && map.getContainer()) {
            const userLatLng = [position.coords.latitude, position.coords.longitude];
            addUserLocationMarker(userLatLng);
          }
        },
        (error) => {
          console.log("Geolocation error:", error);
          if (map && map.getContainer()) {
            // Fallback to Manila
            const manilaLatLng = [14.5995, 120.9842];
            addUserLocationMarker(manilaLatLng);
          }
        }
      );
    } else {
      if (map && map.getContainer()) {
        // Geolocation not supported, use Manila
        const manilaLatLng = [14.5995, 120.9842];
        addUserLocationMarker(manilaLatLng);
      }
    }

    // Cleanup
    return () => {
      if (userMarkerRef.current && map) {
        try {
          map.removeLayer(userMarkerRef.current);
        } catch (error) {
          console.log("Error cleaning up marker:", error);
        }
        userMarkerRef.current = null;
      }
    };
  }, [map]);

  return userMarkerRef;
};

export default useUserLocation;