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
      <div className="relative bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse group">
        {/* Left side light orange highlight */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ea772e]/80 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></div>

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
      className="relative bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:scale-[1.01] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 active:shadow-sm transition-all duration-100 ease-out cursor-pointer group"
    >
      {/* Left side light orange highlight */}
      <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#ea772e]/50 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></div>

      <div className="flex items-start justify-between">
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
        <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg shrink-0 mt-1.5">
          <span className="material-symbols-outlined text-2xl text-orange-700 leading-none">
            my_location
          </span>
        </div>
      </div>
    </div>
  );
};

export default NearbyEarthquakes;
