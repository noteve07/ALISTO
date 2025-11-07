import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useLocation } from "react-router-dom";
import useEarthquakeData from "../hooks/useEarthquakeData";
import { useVolcanicAdvisoryAlerts } from "../hooks/useVolcanicAdvisoryAlerts";
import EnhancedMapView from "../components/EnhancedMapView";
import LiveChatWidget from "../components/LiveChatWidget";
import FilterPanel from "../components/FilterPanel";
import EnhancedRecentEarthquakesList from "../components/EnhancedRecentEarthquakesList";
import VolcanicAdvisories from "../components/VolcanicAdvisories";
import EarthquakeAlertModal from "../components/EarthquakeAlertModal";
import VolcanicAdvisoryModal from "../components/VolcanicAdvisoryModal";
import {
  playVolcanicAdvisorySound,
  getVolcanicAdvisoryUrgency,
} from "@/shared/utils/earthquakeSounds";

const LiveMonitoringPage = () => {
  const { earthquakeData } = useEarthquakeData();
  const [targetEarthquake, setTargetEarthquake] = useState(null);
  const [targetVolcanicAdvisory, setTargetVolcanicAdvisory] = useState(null);
  const location = useLocation();
  const [initialMapState, setInitialMapState] = useState(null);

  // Earthquake alert states
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertEarthquake, setAlertEarthquake] = useState(null);
  const lastAlertIdRef = useRef(null);
  const alertTimeoutRef = useRef(null);

  // Volcanic advisory alert states
  const [isVolcanicAlertOpen, setIsVolcanicAlertOpen] = useState(false);
  const [alertVolcanicAdvisory, setAlertVolcanicAdvisory] = useState(null);
  const lastVolcanicAlertIdRef = useRef(null);
  const volcanicAlertTimeoutRef = useRef(null);

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

  // Initialize audio context on first user interaction
  useEffect(() => {
    const initializeAudioOnInteraction = () => {
      // Create and resume audio context when user first interacts with page
      if (window.AudioContext || window.webkitAudioContext) {
        try {
          const audioContext = new (window.AudioContext ||
            window.webkitAudioContext)();
          if (audioContext.state === "suspended") {
            audioContext.resume();
            console.log(
              "🔊 Audio context initialized and resumed for earthquake sounds"
            );
          }
        } catch (error) {
          console.log("🔇 Audio context initialization failed:", error);
        }
      }

      // Remove event listeners after first interaction
      document.removeEventListener("click", initializeAudioOnInteraction);
      document.removeEventListener("keydown", initializeAudioOnInteraction);
      document.removeEventListener("touchstart", initializeAudioOnInteraction);
    };

    // Add event listeners for user interactions
    document.addEventListener("click", initializeAudioOnInteraction);
    document.addEventListener("keydown", initializeAudioOnInteraction);
    document.addEventListener("touchstart", initializeAudioOnInteraction);

    return () => {
      // Cleanup event listeners
      document.removeEventListener("click", initializeAudioOnInteraction);
      document.removeEventListener("keydown", initializeAudioOnInteraction);
      document.removeEventListener("touchstart", initializeAudioOnInteraction);
    };
  }, []);

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

  const handleEarthquakeAlert = useCallback((earthquake) => {
    if (!earthquake) {
      return;
    }

    const quakeId =
      earthquake.id ??
      `${earthquake.latitude}-${earthquake.longitude}-${earthquake.timestamp}`;
    if (lastAlertIdRef.current === quakeId) {
      return;
    }

    lastAlertIdRef.current = quakeId;
    setAlertEarthquake(earthquake);

    if (alertTimeoutRef.current) {
      clearTimeout(alertTimeoutRef.current);
    }

    setIsAlertOpen(false);

    alertTimeoutRef.current = setTimeout(() => {
      setIsAlertOpen(true);
    }, 3000);
  }, []);

  const handleAlertDismiss = useCallback(() => {
    setIsAlertOpen(false);
    setAlertEarthquake(null);
  }, []);

  // Volcanic advisory alert handler
  const handleVolcanicAdvisoryAlert = useCallback((advisory) => {
    if (!advisory) {
      return;
    }

    const advisoryId = `${advisory.id}-${advisory.alertLevel}`;
    if (lastVolcanicAlertIdRef.current === advisoryId) {
      return;
    }

    console.log("🌋 Triggering volcanic advisory alert:", advisory);

    lastVolcanicAlertIdRef.current = advisoryId;
    setAlertVolcanicAdvisory(advisory);
    setTargetVolcanicAdvisory(advisory);

    // Play volcanic advisory sound
    try {
      const urgency = getVolcanicAdvisoryUrgency(advisory.alertLevel);
      console.log(
        `🌋 Playing volcanic advisory sound - Alert Level: ${advisory.alertLevel}, Urgency: ${urgency}`
      );

      playVolcanicAdvisorySound(advisory.alertLevel, urgency);
    } catch (error) {
      console.error("🔇 Error playing volcanic advisory sound:", error);
    }

    if (volcanicAlertTimeoutRef.current) {
      clearTimeout(volcanicAlertTimeoutRef.current);
    }

    setIsVolcanicAlertOpen(false);

    // Show modal after a short delay
    volcanicAlertTimeoutRef.current = setTimeout(() => {
      setIsVolcanicAlertOpen(true);
    }, 2000);

    // Clear target after map pan is complete
    setTimeout(() => setTargetVolcanicAdvisory(null), 5000);
  }, []);

  const handleVolcanicAlertDismiss = useCallback(() => {
    setIsVolcanicAlertOpen(false);
    setAlertVolcanicAdvisory(null);
  }, []);

  // Use the volcanic advisory alerts hook
  useVolcanicAdvisoryAlerts(handleVolcanicAdvisoryAlert);

  useEffect(() => {
    return () => {
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }
      if (volcanicAlertTimeoutRef.current) {
        clearTimeout(volcanicAlertTimeoutRef.current);
      }
    };
  }, []);

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
      <EnhancedMapView
        earthquakeData={earthquakeData}
        filteredEarthquakeData={filteredEarthquakeData}
        targetEarthquake={targetEarthquake}
        targetVolcanicAdvisory={targetVolcanicAdvisory}
        initialMapState={initialMapState}
        onEarthquakeAlert={handleEarthquakeAlert}
      />

      {/* Overlays */}
      <FilterPanel filters={filters} onFilterChange={handleFilterChange} />
      <VolcanicAdvisories />
      <EnhancedRecentEarthquakesList
        earthquakeData={earthquakeData}
        onEarthquakeClick={handleEarthquakeClick}
      />
      <LiveChatWidget />

      {/* Alert Modals */}
      <EarthquakeAlertModal
        isOpen={isAlertOpen}
        earthquake={alertEarthquake}
        onClose={handleAlertDismiss}
      />

      <VolcanicAdvisoryModal
        isOpen={isVolcanicAlertOpen}
        advisory={alertVolcanicAdvisory}
        onClose={handleVolcanicAlertDismiss}
      />
    </div>
  );
};

export default LiveMonitoringPage;
