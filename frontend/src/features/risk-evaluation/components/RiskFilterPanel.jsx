import React from "react";

const RiskFilterPanel = ({ filters, onFilterChange }) => {
  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-1000 pointer-events-auto scale-90 origin-top">
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
        <div className="px-3 py-2 flex items-center gap-4">
          {/* Volcanoes Toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.showVolcanoes}
              onChange={(e) =>
                onFilterChange("showVolcanoes", e.target.checked)
              }
              className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
            />
            <span className="text-sm font-medium text-gray-700">
              Show Volcanoes
            </span>
          </label>

          {/* Fault Lines Toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.showFaultLines}
              onChange={(e) =>
                onFilterChange("showFaultLines", e.target.checked)
              }
              className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
            />
            <span className="text-sm font-medium text-gray-700">
              Show Fault Lines
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default RiskFilterPanel;
