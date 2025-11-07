import React, { useState, useEffect } from "react";
import { useUserLocation } from "../../auth/context/UserLocationContext";
import { useDashboard } from "../hooks/useDashboard";

// Card Components
import TodaysEarthquakes from "../components/cards/TodaysEarthquakes";
import StrongestMagnitude from "../components/cards/StrongestMagnitude";
import NearbyEarthquakes from "../components/cards/NearbyEarthquakes";
import RiskLevel from "../components/cards/RiskLevel";

// Details Components
import UserLocation from "../components/details/UserLocation";
import EmergencyHotlines from "../components/details/EmergencyHotlines";
import EvacuationSites from "../components/details/EvacuationSites";

// Graph Components
import EarthquakeFrequencyChart from "../components/graphs/EarthquakeFrequencyChart";
import MagnitudeTimeChart from "../components/graphs/MagnitudeTimeChart";
import ProvinceActivityChart from "../components/graphs/ProvinceActivityChart";

// List Components
import RecentEarthquakesPH from "../components/lists/RecentEarthquakesPH";
import HighRiskProvinces from "../components/lists/HighRiskProvinces";
import VolcanicAdvisories from "../components/lists/VolcanicAdvisories";

// Loading Component with smooth transition
const DashboardLoader = ({ isExiting = false }) => {
  return (
    <div
      className={`px-4 pt-4 pb-1 bg-[#f5f2ef] relative transition-opacity duration-700 ease-out ${
        isExiting ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="max-w-7xl mx-auto space-y-6 scale-90 origin-top pb-0 min-h-screen">
        {/* Loading Overlay */}
        <div
          className={`absolute inset-0 bg-[#f5f2ef]/70 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-500 ${
            isExiting ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="text-center space-y-4">
            {/* Loading Animation */}
            <div className="flex justify-center">
              <div
                className={`w-8 h-8 border-4 border-[#ea772e] border-t-transparent rounded-full transition-all duration-300 ${
                  isExiting
                    ? "animate-none opacity-60"
                    : "animate-spin opacity-100"
                }`}
              ></div>
            </div>

            {/* Simple Loading Text */}
            <p className="text-gray-700 font-medium">
              Loading personalized board
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const { location } = useUserLocation();
  const { loading, error } = useDashboard();

  // Transition states for smooth loading to content animation
  const [isLoadingExiting, setIsLoadingExiting] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [forceShowContent, setForceShowContent] = useState(false);

  // Auto-show content after maximum 2 seconds, regardless of loading state
  useEffect(() => {
    const maxWaitTimer = setTimeout(() => {
      setForceShowContent(true);
      setIsLoadingExiting(true);
      setTimeout(() => {
        setShowContent(true);
      }, 300);
    }, 2000); // Show content after 2 seconds max

    return () => clearTimeout(maxWaitTimer);
  }, []);

  // Handle transition from loading to content when data is ready
  useEffect(() => {
    if (!loading && !error && !showContent && !forceShowContent) {
      // Start exit animation for loader
      setIsLoadingExiting(true);

      // After loader starts fading out, show content
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [loading, error, showContent, forceShowContent]);

  // Show loading screen while data is being fetched or during transition
  if ((loading && !forceShowContent) || (!showContent && !error)) {
    return <DashboardLoader isExiting={isLoadingExiting} />;
  }

  // Show error state if something went wrong
  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f2ef] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-white text-2xl">
              error
            </span>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">
            Failed to Load Dashboard
          </h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#ea772e] text-white rounded-lg hover:bg-[#d66a2a] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`px-4 pt-4 pb-1 bg-[#f5f2ef] transition-all duration-700 ease-out ${
        showContent
          ? "opacity-100 transform translate-y-0"
          : "opacity-0 transform translate-y-4"
      }`}
    >
      <div className="max-w-7xl mx-auto space-y-6 scale-90 origin-top pb-0">
        {/* Location Info */}
        {location && (
          <div
            className={`flex items-center justify-end gap-2 text-sm transition-all duration-500 delay-100 ${
              showContent
                ? "opacity-100 transform translate-y-0"
                : "opacity-0 transform translate-y-2"
            }`}
          >
            <span className="material-symbols-outlined text-primary-v2 text-lg">
              location_on
            </span>
            <span className="font-medium text-gray-800">Your Location</span>
            <span className="text-gray-600">
              {location.municipality}, {location.province}
            </span>
            <span className="text-gray-400 text-xs">
              {location.position[0].toFixed(4)}° N,{" "}
              {location.position[1].toFixed(4)}° E
            </span>
          </div>
        )}

        {/* Dashboard Cards */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-700 delay-200 ${
            showContent
              ? "opacity-100 transform translate-y-0"
              : "opacity-0 transform translate-y-4"
          }`}
        >
          <TodaysEarthquakes />
          <StrongestMagnitude />
          <NearbyEarthquakes />
          <RiskLevel />
        </div>

        {/* Charts Section */}
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 transition-all duration-700 delay-300 ${
            showContent
              ? "opacity-100 transform translate-y-0"
              : "opacity-0 transform translate-y-4"
          }`}
        >
          <div className="xl:col-span-2">
            <EarthquakeFrequencyChart />
          </div>
          <ProvinceActivityChart />
        </div>

        {/* <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <MagnitudeTimeChart />
        </div> */}

        {/* Top Details Section */}
        {/* <div className="grid grid-cols-1 gap-6">
          <UserLocation />
        </div> */}

        {/* Lists Section */}
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transition-all duration-700 delay-400 ${
            showContent
              ? "opacity-100 transform translate-y-0"
              : "opacity-0 transform translate-y-4"
          }`}
        >
          <RecentEarthquakesPH />
          <VolcanicAdvisories />
        </div>

        <div
          className={`grid grid-cols-1 gap-6 mb-0 transition-all duration-700 delay-500 ${
            showContent
              ? "opacity-100 transform translate-y-0"
              : "opacity-0 transform translate-y-4"
          }`}
        >
          <HighRiskProvinces />
        </div>

        {/* Emergency Section - Combined Hotlines and Evacuation Sites
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EmergencyHotlines />
          <EvacuationSites />
        </div> */}
      </div>
    </div>
  );
};

export default DashboardPage;
