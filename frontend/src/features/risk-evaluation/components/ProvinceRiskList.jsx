import React, { useMemo } from "react";
import { getRiskColor } from "../utils/riskUtils";
import provincesGeoJson from "../../../assets/gis/provinces.json";

const ProvinceRiskList = ({ riskByProvince, onProvinceClick }) => {
  // Create a map of province IDs to names and coordinates from GeoJSON
  const provinceData = useMemo(() => {
    const data = {};
    provincesGeoJson.features.forEach((feature) => {
      const id =
        feature.properties?.province_id ||
        feature.properties?.PROVINCE_ID ||
        feature.properties?.ID_1;
      const name =
        feature.properties?.PROVINCE ||
        feature.properties?.NAME_1 ||
        `Province ${id}`;

      // Get center coordinates from geometry
      let center = null;
      if (
        feature.geometry?.type === "Polygon" &&
        feature.geometry.coordinates?.[0]
      ) {
        const coords = feature.geometry.coordinates[0];
        const lats = coords.map((c) => c[1]);
        const lngs = coords.map((c) => c[0]);
        center = [
          (Math.min(...lats) + Math.max(...lats)) / 2,
          (Math.min(...lngs) + Math.max(...lngs)) / 2,
        ];
      } else if (
        feature.geometry?.type === "MultiPolygon" &&
        feature.geometry.coordinates?.[0]?.[0]
      ) {
        const coords = feature.geometry.coordinates[0][0];
        const lats = coords.map((c) => c[1]);
        const lngs = coords.map((c) => c[0]);
        center = [
          (Math.min(...lats) + Math.max(...lats)) / 2,
          (Math.min(...lngs) + Math.max(...lngs)) / 2,
        ];
      }

      if (id) data[id] = { name, center };
    });
    return data;
  }, []);

  // Sort provinces alphabetically by name
  const sortedProvinces = useMemo(() => {
    return Object.entries(riskByProvince)
      .map(([provinceId, risk]) => ({
        provinceId,
        name: provinceData[provinceId]?.name || `Province ${provinceId}`,
        center: provinceData[provinceId]?.center,
        riskLevel: risk?.riskLevel || "unknown",
        riskScore: risk?.dynamicRiskScore || 0,
        riskScoreOut10: risk?.dynamicRiskScore
          ? (risk.dynamicRiskScore * 10).toFixed(1)
          : "0.0",
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [riskByProvince, provinceData]);

  const totalProvinces = sortedProvinces.length;

  return (
    <div className="absolute top-3 right-3 z-1000 pointer-events-auto scale-90 origin-top-right max-h-[calc(100vh-200px)]">
      <div
        className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 overflow-hidden flex flex-col"
        style={{ minWidth: "320px" }}
      >
        {/* Header */}
        <div className="bg-orange-50 border-b border-orange-100 px-3 py-2 shrink-0">
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
            Province Risk Levels
          </h3>
          <p className="text-xs text-gray-600 mt-0.5">
            {totalProvinces} provinces
          </p>
        </div>

        {/* Scrollable List */}
        <div className="overflow-y-auto max-h-72">
          <div className="divide-y divide-gray-100">
            {sortedProvinces.map((province) => (
              <div
                key={province.provinceId}
                className="px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => {
                  if (province.center && onProvinceClick) {
                    onProvinceClick(province.center, province.name);
                  }
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      className="w-3 h-3 rounded-full shrink-0 border border-gray-300"
                      style={{
                        backgroundColor: getRiskColor(province.riskLevel),
                      }}
                    />
                    <span className="text-sm font-medium text-gray-800 truncate">
                      {province.name}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-gray-500 capitalize">
                      {province.riskLevel}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-3 py-1.5 bg-gray-50 shrink-0">
          <p className="text-xs text-gray-500 text-center">
            Risk levels based on seismic activity
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProvinceRiskList;
