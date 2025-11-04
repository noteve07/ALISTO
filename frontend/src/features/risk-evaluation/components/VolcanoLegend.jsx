import React from "react";

const VolcanoLegend = () => {
  return (
    <div className="absolute top-[260px] left-3 z-1000 pointer-events-auto scale-90 origin-top-left w-44">
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-red-50 border-b border-red-100 px-3 py-2">
          <h3 className="text-gray-800 font-semibold text-sm flex items-center gap-1.5">
            <svg
              className="w-4 h-4 text-red-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 4L20 20H4L12 4Z" />
            </svg>
            Volcanoes
          </h3>
        </div>

        {/* Content */}
        <div className="px-3 py-2 space-y-1.5">
          <div className="flex items-center gap-3">
            <svg
              width="20"
              height="20"
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
            <span className="text-sm font-medium">Volcano Location</span>
          </div>
          <div className="flex items-center gap-3 pt-1 border-t border-slate-200">
            <div
              className="h-0.5 w-8 bg-purple-500 rounded-full"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, #a855f7 0, #a855f7 6px, transparent 6px, transparent 12px)",
              }}
            ></div>
            <span className="text-xs text-slate-500">Nearest Volcano</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolcanoLegend;
