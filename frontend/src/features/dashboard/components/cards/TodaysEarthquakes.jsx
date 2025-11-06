import React from "react";
import { useDashboard } from "../../hooks/useDashboard";

const TodaysEarthquakes = () => {
  const { todayEarthquakes, loading } = useDashboard();

  const count = todayEarthquakes?.count ?? 0;

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:scale-[1.01] hover:-translate-y-0.5 hover:border-b-2 hover:border-b-gray-300 active:scale-[0.98] active:translate-y-0 active:shadow-sm transition-all duration-100 ease-out">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">
            Today's Earthquakes
          </p>
          <p className="text-3xl font-bold text-gray-900">{count}</p>
        </div>
        <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg">
          <span className="material-symbols-outlined text-2xl text-orange-700">
            today
          </span>
        </div>
      </div>
    </div>
  );
};

export default TodaysEarthquakes;
