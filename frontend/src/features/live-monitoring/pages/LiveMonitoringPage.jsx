import React, { useState } from "react";
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

  const handleEarthquakeClick = (earthquake) => {
    setTargetEarthquake(earthquake);
    // Clear the target after a short delay to allow re-clicking the same earthquake
    setTimeout(() => setTargetEarthquake(null), 2000);
  };

  return (
    <div className="h-full relative">
      {loading && <LoadingOverlay />}
      <EnhancedMapView earthquakeData={earthquakeData} targetEarthquake={targetEarthquake} />

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
