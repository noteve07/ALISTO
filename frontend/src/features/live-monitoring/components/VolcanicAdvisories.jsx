import React, { useMemo, useEffect } from "react";
import { useVolcanicAdvisories } from "../hooks/useVolcanicAdvisories";

const VolcanicAdvisories = () => {
  const { advisories, loading, error } = useVolcanicAdvisories();

  // Debug log
  console.log("🌋 VolcanicAdvisories Component Render:", {
    advisories,
    loading,
    error,
    count: advisories.length,
    timestamp: new Date().toISOString(),
  });

  // Track advisories changes
  useEffect(() => {
    console.log(
      "🔔 Advisories state changed in VolcanicAdvisories component!",
      {
        count: advisories.length,
        advisories: advisories.map((a) => ({
          id: a.id,
          volcano: a.volcano,
          alertLevel: a.alertLevel,
        })),
      }
    );
  }, [advisories]);

  const displayRows = useMemo(() => {
    if (loading) {
      return Array(4).fill("loading");
    }

    const rows = [...advisories.slice(0, 4)];

    while (rows.length < 4) {
      rows.push(null);
    }

    return rows;
  }, [advisories, loading]);

  const getAlertLevelColor = (level) => {
    switch (level) {
      case 5:
        return "bg-red-600 text-white";
      case 4:
        return "bg-red-500 text-white";
      case 3:
        return "bg-red-500 text-white"; // Red for alert level 3
      case 2:
        return "bg-orange-500 text-white"; // Orange for alert level 2
      case 1:
        return "bg-yellow-500 text-white"; // Changed from green to yellow
      default:
        return "bg-amber-700 text-white"; // Brown for no alert level
    }
  };

  return (
    <div className="absolute bottom-3 right-3 z-[1000] pointer-events-auto scale-90 origin-top-right">
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
                d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                clipRule="evenodd"
              />
            </svg>
            Volcanic Advisories
          </h3>
          <p className="text-gray-600 text-xs mt-0.5">
            Active volcano monitoring
          </p>
        </div>

        {/* Content */}
        <div
          className="max-h-60 overflow-y-auto overflow-x-hidden"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <style>
            {`
                .volcanic-content::-webkit-scrollbar {
                  display: none;
                }
              `}
          </style>
          <div className="divide-y divide-gray-100 volcanic-content">
            {error && (
              <div className="px-3 py-2 text-xs text-red-600 bg-red-50">
                {error}
              </div>
            )}

            {displayRows.map((advisory, index) => {
              if (advisory === "loading") {
                return (
                  <div
                    key={`advisory-loading-${index}`}
                    className="px-2.5 py-2 animate-pulse"
                  >
                    <div className="h-9 rounded-md bg-gray-200/70" />
                  </div>
                );
              }

              if (!advisory) {
                return (
                  <div
                    key={`advisory-placeholder-${index}`}
                    className="px-2.5 py-2 h-11 flex items-center text-xs text-gray-300"
                  >
                    —
                  </div>
                );
              }

              return (
                <div
                  key={advisory.id}
                  className="px-2.5 py-2 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0 leading-tight">
                      <h4 className="font-semibold text-gray-900 text-xs truncate leading-tight">
                        {advisory.volcano}
                      </h4>
                      <p className="text-[11px] text-gray-600 leading-tight">
                        {advisory.alertStatus}
                      </p>
                      {advisory.issuanceDate && (
                        <p className="text-[10px] text-gray-400 leading-tight pt-1">
                          Issued {""}
                          {new Date(advisory.issuanceDate).toLocaleDateString(
                            "en-PH",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span
                        className={`px-1.5 py-0.5 rounded-md text-xs font-bold whitespace-nowrap ${getAlertLevelColor(
                          advisory.alertLevel
                        )}`}
                      >
                        Alert {advisory.alertLevel ?? "-"}
                      </span>
                      {advisory.bulletinLink && (
                        <a
                          href={advisory.bulletinLink}
                          target="_blank"
                          rel="noreferrer"
                          className="block text-[11px] text-blue-600 hover:underline mt-1"
                        >
                          Bulletin
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              Data from PHIVOLCS • {advisories.length} active advisories
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolcanicAdvisories;
