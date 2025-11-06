import React from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../../hooks/useDashboard";

const NearbyEarthquakes = () => {
  const { nearbyEarthquakes, userLocation, loading } = useDashboard();
  const navigate = useNavigate();

  const handleClick = () => {
    // Navigate to live monitoring with user location
    if (userLocation) {
      navigate("/app/live-monitoring", {
        state: {
          center: userLocation.position,
          zoom: 9,
        },
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 animate-pulse">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const count = nearbyEarthquakes?.count ?? 0;
  const radius = nearbyEarthquakes?.radius_km ?? 100;
  const events = nearbyEarthquakes?.events ?? [];

  // Find strongest magnitude from events
  const strongest =
    events.length > 0 ? Math.max(...events.map((e) => e.magnitude)) : null;

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">
            Nearby ({radius}km)
          </p>
          <p className="text-3xl font-bold text-gray-900">{count}</p>
          {strongest && (
            <p className="text-sm text-gray-500 mt-1">
              Strongest: {strongest} Mw
            </p>
          )}
        </div>
        <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg shrink-0">
          <span className="material-symbols-outlined text-2xl text-orange-700 leading-none">
            my_location
          </span>
        </div>
      </div>
    </div>
  );
};

export default NearbyEarthquakes;
