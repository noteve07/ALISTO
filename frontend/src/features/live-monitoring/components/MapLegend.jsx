import React from "react";

const MapLegend = () => {
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

  return (
  <div
    className="absolute top-3 left-3 z-[1000] pointer-events-auto origin-top-left"
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
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
            <span>Latest earthquake</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapLegend;
