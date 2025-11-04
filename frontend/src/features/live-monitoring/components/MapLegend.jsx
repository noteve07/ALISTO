import React from "react";
import { useMap } from "react-leaflet";

const MapLegend = ({ earthquakeData }) => {
  const map = useMap();
  const magnitudeLegend = [
    { range: "5.0+", color: "bg-red-500", size: "w-5 h-5", label: "Major" },
    {
      range: "4.0-4.9",
      color: "bg-[#D2691E]",
      size: "w-4 h-4",
      label: "Moderate",
    },
    {
      range: "3.0-3.9",
      color: "bg-yellow-500",
      size: "w-3.5 h-3.5",
      label: "Light",
    },
    {
      range: "<3.0",
      color: "bg-green-500",
      size: "w-3 h-3",
      label: "Minor",
    },
  ];

  // Test function to simulate the earthquake alert functionality
  const testEarthquakeAlert = () => {
    if (!earthquakeData.length) {
      alert("No earthquake data available for testing");
      return;
    }

    const latestEarthquake = earthquakeData[0];

    console.log("🧪 Testing earthquake alert for:", latestEarthquake.location);

    // Play sound notification
    try {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      const playEarthquakeAlert = () => {
        // Play 3 rounds of 3 beeps each with 2 second intervals
        for (let round = 0; round < 3; round++) {
          setTimeout(() => {
            // Play 3 beeps per round
            for (let beep = 0; beep < 3; beep++) {
              setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                // Earthquake alert frequency - deep and urgent
                oscillator.frequency.setValueAtTime(
                  400,
                  audioContext.currentTime
                );
                oscillator.frequency.exponentialRampToValueAtTime(
                  200,
                  audioContext.currentTime + 0.3
                );

                gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(
                  0.01,
                  audioContext.currentTime + 0.3
                );

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
              }, beep * 400); // 400ms between beeps
            }
          }, round * 2000); // 2 second interval between rounds
        }
      };

      playEarthquakeAlert();
    } catch (error) {
      console.log("🔇 Audio not supported or blocked:", error);
    }

    // Calculate appropriate zoom level based on magnitude
    const getZoomLevel = (magnitude) => {
      if (magnitude >= 6) return 9; // Major earthquakes - closer view
      if (magnitude >= 5) return 8; // Strong earthquakes
      if (magnitude >= 4) return 7; // Moderate earthquakes
      return 7; // Minor earthquakes
    };

    const targetZoom = getZoomLevel(latestEarthquake.magnitude);

    // Smooth pan and zoom to the latest earthquake
    map.flyTo(
      [latestEarthquake.latitude, latestEarthquake.longitude],
      targetZoom,
      {
        duration: 2, // 2 seconds animation
        easeLinearity: 0.25,
      }
    );

    // Show brief notification
    setTimeout(() => {
      console.log("🎯 Test completed - focused on latest earthquake");
    }, 2000);
  };

  return (
    <div
      className="absolute top-3 left-3 z-1000 pointer-events-auto origin-top-left"
      style={{ transform: "scale(0.85)" }}
    >
      {/* Legend */}
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-3 w-48">
        <h4 className="font-semibold text-gray-800 text-sm mb-2.5 flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path
              fillRule="evenodd"
              d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
              clipRule="evenodd"
            />
          </svg>
          Magnitude Scale
        </h4>

        <div className="space-y-2">
          {magnitudeLegend.map((item, index) => (
            <div key={index} className="flex items-center gap-2.5">
              <div
                className={`${item.size} ${item.color} rounded-full shadow-sm shrink-0`}
              />
              <div className="flex items-center justify-between flex-1 text-sm">
                <span className="font-medium text-gray-700">{item.range}</span>
                <span className="text-gray-500">{item.label}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 pt-2.5 border-t border-gray-200">
          <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-2">
            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
            <span>Latest earthquake</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              className="shrink-0"
            >
              <path
                d="M 12 4 L 20 20 L 4 20 Z"
                fill="#dc2626"
                stroke="#991b1b"
                strokeWidth="1.5"
              />
              <circle cx="12" cy="5" r="1.5" fill="#fbbf24" opacity="0.9" />
            </svg>
            <span>Active volcano</span>
          </div>

          {/* Test Button */}
          <button
            onClick={testEarthquakeAlert}
            className="w-full mt-2 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium rounded transition-colors duration-200 flex items-center justify-center gap-1.5"
            title="Test earthquake alert sound and auto-pan functionality"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
            Test Alert
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapLegend;
