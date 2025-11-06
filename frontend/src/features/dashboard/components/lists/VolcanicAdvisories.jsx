import React from "react";
import { useNavigate } from "react-router-dom";
import { useVolcanicAdvisories } from "../../../live-monitoring/hooks/useVolcanicAdvisories";

const VolcanicAdvisories = () => {
  const navigate = useNavigate();
  const { advisories: rawAdvisories, loading } = useVolcanicAdvisories();

  // Filter out alert level 0
  const advisories = rawAdvisories.filter(
    (advisory) => advisory.alertLevel > 0
  );

  const getAlertColor = (level) => {
    const colors = {
      0: "text-green-700 bg-green-100 border-green-200",
      1: "text-yellow-700 bg-yellow-100 border-yellow-200",
      2: "text-orange-700 bg-orange-100 border-orange-200",
      3: "text-red-700 bg-red-100 border-red-200",
      4: "text-purple-700 bg-purple-100 border-purple-200",
      5: "text-red-900 bg-red-200 border-red-300",
    };
    return colors[level] || colors[0];
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Volcanic Advisories
            </h3>
            <p className="text-sm text-gray-600">
              Active volcano monitoring • Live
            </p>
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
            Volcanic Advisories
          </h3>
          <p className="text-sm text-gray-600">
            Active volcano monitoring • Live
          </p>
        </div>
        <span className="flex items-center gap-2 text-sm text-green-600">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          Live
        </span>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pr-2 min-h-0">
        {advisories.map((advisory) => (
          <a
            key={advisory.id}
            href={advisory.bulletinLink || "#"}
            target={advisory.bulletinLink ? "_blank" : "_self"}
            rel={advisory.bulletinLink ? "noopener noreferrer" : undefined}
            onClick={(e) => {
              if (!advisory.bulletinLink) {
                e.preventDefault();
                navigate("/app/live-monitoring");
              }
            }}
            className="block p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border border-gray-100"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-semibold text-gray-900">
                    {advisory.volcano}
                  </h4>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getAlertColor(
                      advisory.alertLevel
                    )}`}
                  >
                    Alert Level {advisory.alertLevel}
                  </span>
                </div>

                <p className="text-sm font-medium text-gray-700 mb-1">
                  {advisory.alertStatus}
                </p>
                {advisory.issuanceDate && (
                  <p className="text-xs text-gray-500">
                    Updated{" "}
                    {new Date(advisory.issuanceDate).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}
                  </p>
                )}
              </div>

              <button className="ml-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
                <span className="material-symbols-outlined text-gray-400">
                  {advisory.bulletinLink ? "open_in_new" : "chevron_right"}
                </span>
              </button>
            </div>
          </a>
        ))}
      </div>

      {/* Footer Links */}
      <div className="flex items-center justify-between text-xs mt-auto pt-4 border-t border-gray-100">
        <button
          onClick={() => navigate("/app/live-monitoring")}
          className="flex items-center gap-1.5 text-gray-600 hover:text-gray-800 font-medium"
        >
          <span className="material-symbols-outlined text-base">map</span>
          View Monitoring Map
        </button>
        <a
          href="https://wovodat.phivolcs.dost.gov.ph/bulletin/list-of-bulletin"
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

export default VolcanicAdvisories;
