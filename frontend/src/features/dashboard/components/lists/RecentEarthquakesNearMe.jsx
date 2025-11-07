import React from "react";

const RecentEarthquakesNearMe = () => {
  // Hardcoded data - easily replaceable with API call
  const nearbyEarthquakes = [
    {
      id: 1,
      magnitude: 4.2,
      location: "Batangas, Philippines",
      time: "45 minutes ago",
      distance: "75 km",
      direction: "Southwest",
      depth: "8 km",
      felt: true,
    },
    {
      id: 2,
      magnitude: 3.7,
      location: "Laguna, Philippines",
      time: "2 hours ago",
      distance: "42 km",
      direction: "Southeast",
      depth: "12 km",
      felt: true,
    },
    {
      id: 3,
      magnitude: 3.1,
      location: "Rizal, Philippines",
      time: "5 hours ago",
      distance: "38 km",
      direction: "East",
      depth: "6 km",
      felt: false,
    },
    {
      id: 4,
      magnitude: 2.8,
      location: "Cavite, Philippines",
      time: "8 hours ago",
      distance: "67 km",
      direction: "South",
      depth: "15 km",
      felt: false,
    },
  ];

  const getMagnitudeColor = (magnitude) => {
    if (magnitude >= 4.0) return "text-orange-900 bg-orange-100"; // Darkest primary variation
    if (magnitude >= 3.0) return "text-orange-600 bg-orange-50"; // Medium primary variation
    return "text-orange-400 bg-orange-25"; // Light primary variation
  };

  const getDirectionIcon = (direction) => {
    const icons = {
      North: "north",
      Northeast: "north_east",
      East: "east",
      Southeast: "south_east",
      South: "south",
      Southwest: "south_west",
      West: "west",
      Northwest: "north_west",
    };
    return icons[direction] || "my_location";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Nearby Earthquakes
          </h3>
          <p className="text-sm text-gray-600">Within 100km radius</p>
        </div>
        <span className="material-symbols-outlined text-primary text-xl">
          my_location
        </span>
      </div>

      <div className="space-y-4">
        {nearbyEarthquakes.map((earthquake) => (
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
                <div className="flex items-center space-x-1 text-xs text-gray-600">
                  <span className="material-symbols-outlined text-sm">
                    {getDirectionIcon(earthquake.direction)}
                  </span>
                  <span>
                    {earthquake.distance} {earthquake.direction}
                  </span>
                </div>
                {earthquake.felt && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary-v2/10 text-primary-v2">
                    <span className="material-symbols-outlined text-xs mr-1">
                      sensors
                    </span>
                    Felt
                  </span>
                )}
              </div>

              <h4 className="font-medium text-gray-900 mb-1">
                {earthquake.location}
              </h4>

              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>{earthquake.time}</span>
                <span>•</span>
                <span>Depth: {earthquake.depth}</span>
              </div>
            </div>

            <button className="ml-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
              <span className="material-symbols-outlined text-gray-400">
                chevron_right
              </span>
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center mt-6 pt-4 border-t border-gray-100">
        <button className="flex items-center space-x-2 text-sm text-primary hover:text-primary/80 font-medium">
          <span>View earthquake map</span>
          <span className="material-symbols-outlined text-sm">map</span>
        </button>
      </div>
    </div>
  );
};

export default RecentEarthquakesNearMe;
