import React from "react";

const FilterPanel = ({ filters, onFilterChange }) => {
  return (
    <div className="absolute top-3 left-11/25 -translate-x-1/2 z-1000 pointer-events-auto scale-90 origin-top">
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-orange-50 border-b border-orange-100 px-3 py-2">
          <h3 className="text-gray-800 font-semibold text-sm flex items-center gap-1.5">
            <svg
              className="w-4 h-4 text-primary-v2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
            Filters
          </h3>
        </div>

        {/* Content */}
        <div className="px-3 py-2 flex items-center gap-2.5">
          {/* Magnitude Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-700 whitespace-nowrap">
              Magnitude:
            </label>
            <select
              value={filters.magnitude}
              onChange={(e) => onFilterChange("magnitude", e.target.value)}
              className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
            >
              <option value="all">All</option>
              <option value="1-2">1.0 - 2.0</option>
              <option value="2-3">2.0 - 3.0</option>
              <option value="3-4">3.0 - 4.0</option>
              <option value="4-5">4.0 - 5.0</option>
              <option value="5+">5.0+</option>
            </select>
          </div>

          {/* Depth Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-700">Depth:</label>
            <select
              value={filters.depth}
              onChange={(e) => onFilterChange("depth", e.target.value)}
              className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
            >
              <option value="all">All</option>
              <option value="shallow">Shallow (&lt; 70km)</option>
              <option value="intermediate">Intermediate (70-300km)</option>
              <option value="deep">Deep (&gt; 300km)</option>
            </select>
          </div>

          {/* Time Period Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-700">Period:</label>
            <select
              value={filters.timePeriod}
              onChange={(e) => onFilterChange("timePeriod", e.target.value)}
              className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
