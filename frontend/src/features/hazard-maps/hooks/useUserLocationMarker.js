import { useEffect, useRef } from "react";
import L from "leaflet";

const useUserLocationMarker = (map) => {
  const userMarkerRef = useRef(null);

  useEffect(() => {
    if (!map || userMarkerRef.current) return;

    const createMarkerIcon = () => {
      return L.divIcon({
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
      });
    };

    // Wait for map to be ready before adding markers
    map.whenReady(() => {
      const isMapActive = () =>
        Boolean(map && map.getPane && map._panes && map.getPane("markerPane"));

      if (!isMapActive()) {
        console.warn("Map panes not ready for user marker.");
        return;
      }

      const addMarker = (latLng, popupLabel, openPopup = false) => {
        if (!isMapActive()) {
          return;
        }

        userMarkerRef.current = L.marker(latLng, {
          icon: createMarkerIcon(),
        }).addTo(map);

        if (popupLabel) {
          const popup = userMarkerRef.current.bindPopup(popupLabel);
          if (openPopup) {
            popup.openPopup();
          }
        }

        if (map.setView) {
          map.setView(latLng, 10);
        }
      };

      const setFallbackToManila = () => {
        const manilaLatLng = [14.5995, 120.9842];
        addMarker(manilaLatLng, "<b>Default Location (Manila)</b>", false);
      };

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLatLng = [
              position.coords.latitude,
              position.coords.longitude,
            ];
            addMarker(userLatLng, "<b>Your Location</b>", true);
          },
          (error) => {
            console.log("Geolocation error:", error);
            setFallbackToManila();
          }
        );
      } else {
        setFallbackToManila();
      }
    }); // Close whenReady callback

    // Cleanup
    return () => {
      if (userMarkerRef.current) {
        if (map && map.removeLayer && map.hasLayer && map.hasLayer(userMarkerRef.current)) {
          map.removeLayer(userMarkerRef.current);
        } else {
          userMarkerRef.current.remove();
        }
        userMarkerRef.current = null;
      }
    };
  }, [map]);

  return userMarkerRef;
};

export default useUserLocationMarker;
