import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useEarthquakeData from "../../../live-monitoring/hooks/useEarthquakeData";

const RecentEarthquakesPH = () => {
  const navigate = useNavigate();
  const { earthquakeData, loading } = useEarthquakeData();
  const [showAll, setShowAll] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const getMagnitudeColor = (magnitude) => {
    if (magnitude >= 5.0) return "text-red-600 bg-red-50";
    if (magnitude >= 4.0) return "text-orange-600 bg-orange-50";
    if (magnitude >= 3.0) return "text-yellow-600 bg-yellow-50";
    return "text-green-600 bg-green-50";
  };

  const formatTimeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;

    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  const handleLoadMore = () => {
    console.log("Load more clicked:", {
      showAll,
      earthquakeDataLength: earthquakeData.length,
    });
    setLoadingMore(true);
    setTimeout(() => {
      setShowAll(true);
      setLoadingMore(false);
    }, 500);
  };

  // Show 4 initially, or all if showAll is true
  const displayCount = showAll ? earthquakeData.length : 4;
  const earthquakes = earthquakeData.slice(0, displayCount).map((eq) => ({
    id: eq.id,
    magnitude: eq.magnitude,
    location: eq.location,
    time: formatTimeAgo(eq.timestamp),
    depth: `${eq.depth} km`,
    felt: eq.magnitude >= 3.0,
  }));

  // Debug logging
  console.log("Dashboard Earthquakes Debug:", {
    totalEarthquakes: earthquakeData.length,
    showAll,
    displayCount,
    displayedEarthquakes: earthquakes.length,
    shouldShowLoadMore: !showAll && earthquakeData.length > 4,
  });

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Recent Earthquakes
            </h3>
            <p className="text-sm text-gray-600">Philippines • Live</p>
          </div>
          <span className="flex items-center gap-2 text-sm text-green-600">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            Live
          </span>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Recent Earthquakes
          </h3>
          <p className="text-sm text-gray-600">Philippines • Live</p>
        </div>
        <span className="flex items-center gap-2 text-sm text-green-600">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          Live
        </span>
      </div>

      <div
        className={`space-y-4 mb-4 ${
          showAll
            ? "max-h-[480px] overflow-y-auto scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-orange-50"
            : "overflow-hidden"
        }`}
      >
        {earthquakes.map((earthquake) => (
          <div
            key={earthquake.id}
            className="flex items-start justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
          >
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-semibold ${getMagnitudeColor(
                    earthquake.magnitude
                  )}`}
                >
                  {earthquake.magnitude} Mw
                </span>
                {earthquake.felt && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                    <span className="material-symbols-outlined text-xs mr-1">
                      sensors
                    </span>
                    Felt
                  </span>
                )}
              </div>

              <h4 className="text-sm font-medium text-gray-900 mb-1">
                {earthquake.location}
              </h4>

              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>{earthquake.time}</span>
                <span>•</span>
                <span>Depth: {earthquake.depth}</span>
              </div>
            </div>

            <button
              onClick={() => navigate("/app/live-monitoring")}
              className="ml-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined text-gray-400">
                chevron_right
              </span>
            </button>
          </div>
        ))}
      </div>

      {!showAll && earthquakeData.length > 4 && (
        <div className="flex items-center justify-center mb-4 pt-4 border-t border-gray-100">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("Button clicked!", {
                showAll,
                earthquakeDataLength: earthquakeData.length,
              });
              handleLoadMore();
            }}
            disabled={loadingMore}
            className="flex items-center space-x-2 text-sm text-primary hover:text-primary/80 font-medium disabled:opacity-50 cursor-pointer"
          >
            {loadingMore ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                <span>Loading...</span>
              </>
            ) : (
              <>
                <span>Load more earthquakes ({earthquakeData.length})</span>
                <span className="material-symbols-outlined text-sm">
                  expand_more
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Footer Links */}
      <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
        <button
          onClick={() => navigate("/app/live-monitoring")}
          className="flex items-center gap-1.5 text-gray-600 hover:text-gray-800 font-medium"
        >
          <span className="material-symbols-outlined text-base">map</span>
          View Monitoring Map
        </button>
        <a
          href="https://earthquake.phivolcs.dost.gov.ph/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
        >
          <span>Data Source: DOST-PHIVOLCS</span>
          <span className="material-symbols-outlined text-sm">open_in_new</span>
        </a>
      </div>
    </div>
  );
};

export default RecentEarthquakesPH;
