import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import useEarthquakeData from "../hooks/useEarthquakeData";
import EnhancedMapView from "../components/EnhancedMapView";
import LoadingOverlay from "../components/LoadingOverlay";
import LiveChatWidget from "../components/LiveChatWidget";
import FilterPanel from "../components/FilterPanel";
import EnhancedRecentEarthquakesList from "../components/EnhancedRecentEarthquakesList";
import VolcanicAdvisories from "../components/VolcanicAdvisories";

const LiveMonitoringPage = () => {
  const { earthquakeData, loading } = useEarthquakeData();
  const [targetEarthquake, setTargetEarthquake] = useState(null);
  const location = useLocation();
  const [initialMapState, setInitialMapState] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Check if navigation state has center and zoom
  useEffect(() => {
    if (location.state?.center && location.state?.zoom) {
      setInitialMapState({
        center: location.state.center,
        zoom: location.state.zoom,
      });
    }
    
    // Show loading for 300ms to allow sidebar to collapse
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [location]);

  const handleEarthquakeClick = (earthquake) => {
    setTargetEarthquake(earthquake);
    // Clear the target after a short delay to allow re-clicking the same earthquake
    setTimeout(() => setTargetEarthquake(null), 2000);
  };

  return (
    <div className="h-full relative">
      {(loading || isInitializing) && <LoadingOverlay />}
      <EnhancedMapView
        earthquakeData={earthquakeData}
        targetEarthquake={targetEarthquake}
        initialMapState={initialMapState}
      />

      {/* Overlays */}
      <FilterPanel />
      <VolcanicAdvisories />
      <EnhancedRecentEarthquakesList
        earthquakeData={earthquakeData}
        onEarthquakeClick={handleEarthquakeClick}
      />
      <LiveChatWidget />
    </div>
  );
};

export default LiveMonitoringPage;
