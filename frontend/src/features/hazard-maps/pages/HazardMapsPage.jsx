import React, { useState, useCallback } from "react";
import FaultMapView from "../components/FaultMapView";
import useUserLocation from "../hooks/useUserLocation";
import useFaultLines from "../hooks/useFaultLines";

const HazardMapsPage = () => {
  const [map, setMap] = useState(null);

  const handleMapReady = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  // Use hooks for user location and fault lines
  const userMarkerRef = useUserLocation(map);
  useFaultLines(map, userMarkerRef);

  return (
    <div className="h-full w-full">
      <FaultMapView onMapReady={handleMapReady} />
    </div>
  );
};

export default HazardMapsPage;
