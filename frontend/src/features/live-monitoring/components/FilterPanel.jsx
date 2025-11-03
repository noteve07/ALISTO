import React from "react";

const FilterPanel = () => {
  return (
    <div className="absolute top-3 left-1/2 translate-y-2 -translate-x-1/2 z-[1000] pointer-events-auto scale-95">
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 px-5 py-2.5">
        <div className="flex items-center gap-3.5">
          {/* Magnitude Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-700">
              Magnitude:
            </label>
            <select className="px-2.5 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white">
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
            <select className="px-2.5 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white">
              <option value="all">All</option>
              <option value="shallow">Shallow (&lt; 70km)</option>
              <option value="intermediate">Intermediate (70-300km)</option>
              <option value="deep">Deep (&gt; 300km)</option>
            </select>
          </div>

          {/* Time Period Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-700">Period:</label>
            <select className="px-2.5 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white">
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
