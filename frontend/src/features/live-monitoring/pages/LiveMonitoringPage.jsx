import React, { useState, useEffect, useMemo } from "react";
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

  // Filter states
  const [filters, setFilters] = useState({
    magnitude: "all",
    depth: "all",
    timePeriod: "7d", // Default to 7 days
  });

  // Check if navigation state has center and zoom
  useEffect(() => {
    if (location.state?.center && location.state?.zoom) {
      setInitialMapState({
        center: location.state.center,
        zoom: location.state.zoom,
      });
    }
  }, [location]);

  const handleEarthquakeClick = (earthquake) => {
    setTargetEarthquake(earthquake);
    // Clear the target after a short delay to allow re-clicking the same earthquake
    setTimeout(() => setTargetEarthquake(null), 2000);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  // Filter earthquake data based on selected filters
  const filteredEarthquakeData = useMemo(() => {
    let filtered = [...earthquakeData];

    // Time period filter
    const now = Date.now();
    const timeRanges = {
      "24h": 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
    };
    const timeRange = timeRanges[filters.timePeriod] || timeRanges["24h"];
    filtered = filtered.filter((eq) => now - eq.timestamp <= timeRange);

    // Magnitude filter
    if (filters.magnitude !== "all") {
      const [min, max] = filters.magnitude.includes("+")
        ? [parseFloat(filters.magnitude), Infinity]
        : filters.magnitude.split("-").map(parseFloat);

      filtered = filtered.filter((eq) => {
        const mag = eq.magnitude;
        return mag >= min && (max === Infinity || mag < max);
      });
    }

    // Depth filter
    if (filters.depth !== "all") {
      filtered = filtered.filter((eq) => {
        const depth = eq.depth;
        if (filters.depth === "shallow") return depth < 70;
        if (filters.depth === "intermediate")
          return depth >= 70 && depth <= 300;
        if (filters.depth === "deep") return depth > 300;
        return true;
      });
    }

    return filtered;
  }, [earthquakeData, filters]);

  return (
    <div className="h-full relative">
      {loading && <LoadingOverlay />}
      <EnhancedMapView
        earthquakeData={earthquakeData}
        filteredEarthquakeData={filteredEarthquakeData}
        targetEarthquake={targetEarthquake}
        initialMapState={initialMapState}
      />

      {/* Overlays */}
      <FilterPanel filters={filters} onFilterChange={handleFilterChange} />
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
