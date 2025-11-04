import React from "react";
import { RISK_LEVELS } from "../utils/riskUtils";

const RiskLegend = () => {
  const levels = ["high", "medium", "low"];

  return (
    <div className="absolute top-3 left-3 z-1000 pointer-events-auto scale-90 origin-top-left w-44">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            Risk Levels
          </h3>
        </div>

        {/* Content */}
        <div className="px-3 py-2 space-y-1.5">
          {levels.map((level) => (
            <div key={level} className="flex items-center gap-3">
              <span
                className="inline-block h-3 w-8 rounded-full border border-slate-300"
                style={{ backgroundColor: RISK_LEVELS[level].color }}
                aria-hidden="true"
              />
              <span className="text-sm font-medium capitalize">
                {RISK_LEVELS[level].label}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-3 pt-1 border-t border-slate-200">
            <span
              className="inline-block h-3 w-8 rounded-full border border-dashed border-slate-300"
              style={{ backgroundColor: RISK_LEVELS.unknown.color }}
              aria-hidden="true"
            />
            <span className="text-xs uppercase tracking-wide text-slate-500">
              No data
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskLegend;
