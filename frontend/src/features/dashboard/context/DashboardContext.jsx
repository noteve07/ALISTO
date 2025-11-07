import { createContext, useEffect, useState, useRef } from "react";
import useUserLocation from "@/features/auth/hooks/useUserLocation";
import { dashboardService } from "../services/dashboardService";

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const { location, loading: locationLoading } = useUserLocation();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);
  const lastLocationKey = useRef(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Keep loader visible while waiting for location
      if (locationLoading) {
        setLoading(true);
        return;
      }

      // Fallback location still surfaces, but we skip fetch until we have coordinates
      if (
        !location ||
        !Array.isArray(location.position) ||
        location.position.length < 2
      ) {
        console.warn("No valid location available for dashboard data fetch");
        hasFetched.current = false;
        lastLocationKey.current = null;
        setLoading(false);
        return;
      }

      const locationKey = location.position.join(",");
      if (lastLocationKey.current !== locationKey) {
        hasFetched.current = false;
        lastLocationKey.current = locationKey;
      }

      if (hasFetched.current) {
        return;
      }

      hasFetched.current = true;
      setLoading(true);
      setError(null);

      try {
        const [lat, lon] = location.position;
        console.log(`📊 Fetching dashboard data for location: ${lat}, ${lon}`);

        const result = await dashboardService.getDashboardData(lat, lon);

        if (result.success) {
          setDashboardData(result.data);
          console.log("✅ Dashboard data loaded successfully");
        } else {
          setError(result.error);
          console.error("❌ Failed to load dashboard data:", result.error);
        }
      } catch (err) {
        setError(err.message);
        console.error("❌ Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [location, locationLoading]);

  const value = {
    // Data
    dashboardData,
    loading,
    error,

    // Computed values for easy access
    todayEarthquakes: dashboardData?.today_earthquakes || null,
    strongestMagnitude: dashboardData?.strongest_magnitude || null,
    nearbyEarthquakes: dashboardData?.nearby_earthquakes || null,
    riskLevel: dashboardData?.risk_level || null,
    charts: dashboardData?.charts || null,
    lists: dashboardData?.lists || null,

    // User location info
    userLocation: location,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export default DashboardContext;
