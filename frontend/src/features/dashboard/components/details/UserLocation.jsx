import React from "react";
import { useDashboard } from "../../hooks/useDashboard";

const UserLocation = () => {
  const { userLocation, loading } = useDashboard();

  if (loading || !userLocation) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-6 h-6 bg-gray-200 rounded"></div>
              <div className="h-5 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="space-y-2">
              <div className="h-5 bg-gray-200 rounded w-48"></div>
              <div className="h-4 bg-gray-200 rounded w-40"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const [lat, lon] = userLocation.position;
  const coordinates = `${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E`;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="material-symbols-outlined text-primary text-xl">
              location_on
            </span>
            <h3 className="text-lg font-semibold text-gray-900">
              Your Location
            </h3>
            {userLocation.isFallback && (
              <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded">
                Default
              </span>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-base font-medium text-gray-800">
              {userLocation.municipality}, {userLocation.province}
            </p>
            <p className="text-xs text-gray-500">{coordinates}</p>
          </div>

          <div className="flex items-center mt-3 pt-3 border-t border-gray-100">
            <span className="material-symbols-outlined text-green-500 text-sm mr-1">
              {userLocation.isFallback ? "error" : "check_circle"}
            </span>
            <p className="text-xs text-gray-500">
              {userLocation.isFallback
                ? "Using fallback location"
                : "Location verified"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLocation;
