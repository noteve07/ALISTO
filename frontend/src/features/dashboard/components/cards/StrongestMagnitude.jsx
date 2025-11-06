import React from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../../hooks/useDashboard";

const StrongestMagnitude = () => {
  const { strongestMagnitude, loading } = useDashboard();
  const navigate = useNavigate();

  const handleClick = () => {
    // Navigate to live monitoring with earthquake location
    if (strongestMagnitude?.latitude && strongestMagnitude?.longitude) {
      navigate("/app/live-monitoring", {
        state: {
          center: [strongestMagnitude.latitude, strongestMagnitude.longitude],
          zoom: 8,
        },
      });
    } else {
      navigate("/app/live-monitoring");
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!strongestMagnitude) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">
              Strongest Magnitude
            </p>
            <p className="text-sm text-gray-400 mt-2">No data available</p>
          </div>
          <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg">
            <span className="material-symbols-outlined text-2xl text-orange-700">
              trending_up
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">
            Strongest Magnitude
          </p>
          <div className="flex items-baseline space-x-1">
            <p className="text-3xl font-bold text-gray-900">
              {strongestMagnitude.magnitude}
            </p>
            <p className="text-lg text-gray-500">Mw</p>
          </div>
        </div>
        <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg">
          <span className="material-symbols-outlined text-2xl text-orange-700">
            trending_up
          </span>
        </div>
      </div>
    </div>
  );
};

export default StrongestMagnitude;
