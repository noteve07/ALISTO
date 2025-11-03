import React from "react";

const EnhancedRecentEarthquakesList = ({ earthquakeData = [], onEarthquakeClick }) => {
  // Take the latest 20 earthquakes for storage, show 6 visible
  const recentEarthquakes = earthquakeData.slice(0, 20);

  const getMagnitudeColor = (magnitude) => {
    if (magnitude >= 5) return "text-red-600 bg-red-50";
    if (magnitude >= 4) return "text-[#D2691E] bg-orange-50";
    if (magnitude >= 3) return "text-yellow-600 bg-yellow-50";
    return "text-green-600 bg-green-50";
  };

  const getIntensityFromMagnitude = (magnitude) => {
    if (magnitude >= 7) return "Major";
    if (magnitude >= 6) return "Strong";
    if (magnitude >= 5) return "Moderate";
    if (magnitude >= 4) return "Light";
    if (magnitude >= 3) return "Minor";
    return "Very Minor";
  };

  const formatTimeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleEarthquakeClick = (earthquake) => {
    // Only pan to earthquake location - no modal!
    if (onEarthquakeClick) {
      onEarthquakeClick(earthquake);
    }
    // Modal is removed - popup will show automatically when marker is focused
  };

  if (!recentEarthquakes.length) {
    return (
  <div className="absolute top-3 right-3 z-[1000] pointer-events-auto scale-90 origin-top-right">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 overflow-hidden w-[360px]">
          {/* Header */}
          <div className="bg-orange-50 border-b border-orange-100 px-3 py-2">
            <h3 className="text-gray-800 font-semibold text-sm flex items-center gap-1.5">
              <svg
                className="w-5 h-5 text-[#D2691E]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              Recent Earthquakes
            </h3>
            <p className="text-gray-600 text-xs mt-0.5">Last 24 hours</p>
          </div>
          
          {/* No data message */}
          <div className="px-3 py-4 text-center">
            <p className="text-gray-500 text-sm">No recent earthquakes to display</p>
          </div>
        </div>
      </div>
    );
  }

  return (
  <div className="absolute top-3 right-3 z-[1000] pointer-events-auto scale-90 origin-top-right">
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 overflow-hidden w-[360px]">
        {/* Header */}
        <div className="bg-orange-50 border-b border-orange-100 px-3 py-2">
          <h3 className="text-gray-800 font-semibold text-sm flex items-center gap-1.5">
            <svg
              className="w-5 h-5 text-[#D2691E]"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            Recent Earthquakes
          </h3>
          <p className="text-gray-600 text-xs mt-0.5">Last 24 hours • Live updates</p>
        </div>

        {/* List - Fixed height showing 6 items */}
        <div className="h-80 overflow-y-auto scrollbar-none">
          {recentEarthquakes.map((quake, index) => (
            <div
              key={quake.id}
              onClick={() => handleEarthquakeClick(quake)}
              className={`px-3 py-2 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                index === 0 ? 'bg-blue-50 border-blue-100' : ''
              }`}
            >
              {/* First Line: Magnitude + Location + Intensity */}
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span
                    className={`font-bold text-xs px-1.5 py-0.5 rounded ${getMagnitudeColor(
                      quake.magnitude
                    )} whitespace-nowrap`}
                  >
                    M {quake.magnitude}
                  </span>
                  <span className="text-xs font-medium text-gray-900 truncate">
                    {quake.location}
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {index === 0 && (
                    <span className="text-xs bg-blue-600 text-white px-1 py-0.5 rounded-full font-medium">
                      Latest
                    </span>
                  )}
                  <span className="px-1.5 py-0.5 bg-gray-100 rounded-full font-medium text-xs whitespace-nowrap">
                    {getIntensityFromMagnitude(quake.magnitude)}
                  </span>
                </div>
              </div>

              {/* Second Line: Time + (time ago) + depth - lat - lon */}
              <div className="flex items-center justify-between mt-1 text-xs text-gray-600">
                <span className="font-medium">
                  {formatTime(quake.timestamp)} ({formatTimeAgo(quake.timestamp)})
                </span>
                <span className="text-gray-500">
                  {quake.depth}km
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            🔴 Live updates • Total: {earthquakeData.length} events
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedRecentEarthquakesList;