import React from "react";

const FaultLinesLegend = () => {
  return (
    <div className="absolute top-[140px] left-3 z-1000 pointer-events-auto scale-90 origin-top-left w-44">
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
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            Fault Lines
          </h3>
        </div>

        {/* Content */}
        <div className="px-3 py-2 space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="h-0.5 w-8 bg-orange-500 rounded-full"></div>
            <span className="text-sm font-medium">Fault Line</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-1 w-8 bg-purple-500 rounded-full"></div>
            <span className="text-sm font-medium">Nearest Fault</span>
          </div>
          <div className="flex items-center gap-3 pt-1 border-t border-slate-200">
            <div
              className="h-0.5 w-8 bg-purple-500 rounded-full"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, #a855f7 0, #a855f7 6px, transparent 6px, transparent 12px)",
              }}
            ></div>
            <span className="text-xs text-slate-500">Distance Line</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaultLinesLegend;
