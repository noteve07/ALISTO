import React from "react";
import { RISK_LEVELS } from "../utils/riskUtils";

const CombinedLegend = () => {
  const riskLevels = ["high", "medium", "low"];

  return (
    <div className="absolute top-3 left-3 z-1000 pointer-events-auto scale-90 origin-top-left w-48">
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        {/* Single Header */}
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Legend
          </h3>
        </div>

        {/* Content with text subheaders */}
        <div className="px-3 py-2 space-y-3">
          {/* Risk Levels Section */}
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
              Risk Levels
            </p>
            <div className="space-y-1.5">
              {riskLevels.map((level) => (
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

          {/* Fault Lines Section */}
          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
              Fault Lines
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <div className="h-0.5 w-8 bg-orange-500 rounded-full"></div>
                <span className="text-sm font-medium">Fault Line</span>
              </div>
              <div className="flex items-center gap-3 pt-1 border-t border-slate-200">
                <div className="h-0.5 w-8 border-t-2 border-dashed border-purple-500"></div>
                <span className="text-xs text-slate-500">
                  Nearest Fault Line
                </span>
              </div>
            </div>
          </div>

          {/* Volcanoes Section */}
          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
              Volcanoes
            </p>
            <div className="space-y-1.5">
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
                <div className="h-0.5 w-8 border-t-2 border-dashed border-purple-500"></div>
                <span className="text-xs text-slate-500">Nearest Volcano</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CombinedLegend;
