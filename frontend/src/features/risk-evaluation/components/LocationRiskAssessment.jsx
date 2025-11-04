import React from "react";
import { useUserLocation } from "@/features/auth/context/UserLocationContext";

const LocationRiskAssessment = () => {
  const { location: userLocation } = useUserLocation();

  // Hardcoded for now - will be dynamic later
  const hazardAssessment = {
    landslide: "High Risk",
    tsunami: "Moderate Risk",
    volcanicEruption: "Low Risk",
    earthquake: "High Risk",
  };

  const emergencyResources = {
    evacuationCenter: "Barangay Covered Court, 0.8 km",
    hospital: "Metro Manila Medical Center, 2.3 km",
    openSpace: "Municipal Plaza, 1.2 km",
  };

  const getRiskColor = (risk) => {
    if (risk.includes("High")) return "text-red-600";
    if (risk.includes("Moderate")) return "text-orange-600";
    if (risk.includes("Low")) return "text-green-600";
    return "text-gray-600";
  };

  const getRiskBgColor = (risk) => {
    if (risk.includes("High")) return "bg-red-50 border-red-200";
    if (risk.includes("Moderate")) return "bg-orange-50 border-orange-200";
    if (risk.includes("Low")) return "bg-green-50 border-green-200";
    return "bg-gray-50 border-gray-200";
  };

  return (
    <div className="absolute bottom-3 right-3 z-1000 pointer-events-auto scale-90 origin-bottom-right">
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 overflow-hidden w-80">
        {/* Header */}
        <div className="bg-blue-50 border-b border-blue-100 px-3 py-2">
          <h3 className="text-gray-800 font-semibold text-sm flex items-center gap-1.5">
            <svg
              className="w-4 h-4 text-blue-600"
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
            Location Risk Assessment
          </h3>
          {userLocation && (
            <p className="text-xs text-gray-600 mt-0.5">
              {userLocation.municipality}, {userLocation.province}
            </p>
          )}
        </div>

        {/* Hazard Assessment Section */}
        <div className="px-3 py-2 border-b border-gray-200">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
            Hazard Assessment
          </p>
          <div className="space-y-2">
            <div
              className={`flex items-center justify-between px-2 py-1.5 rounded border ${getRiskBgColor(
                hazardAssessment.landslide
              )}`}
            >
              <span className="text-sm font-medium text-gray-700">
                Landslide
              </span>
              <span
                className={`text-xs font-semibold ${getRiskColor(
                  hazardAssessment.landslide
                )}`}
              >
                {hazardAssessment.landslide}
              </span>
            </div>
            <div
              className={`flex items-center justify-between px-2 py-1.5 rounded border ${getRiskBgColor(
                hazardAssessment.tsunami
              )}`}
            >
              <span className="text-sm font-medium text-gray-700">Tsunami</span>
              <span
                className={`text-xs font-semibold ${getRiskColor(
                  hazardAssessment.tsunami
                )}`}
              >
                {hazardAssessment.tsunami}
              </span>
            </div>
            <div
              className={`flex items-center justify-between px-2 py-1.5 rounded border ${getRiskBgColor(
                hazardAssessment.volcanicEruption
              )}`}
            >
              <span className="text-sm font-medium text-gray-700">
                Volcanic Eruption
              </span>
              <span
                className={`text-xs font-semibold ${getRiskColor(
                  hazardAssessment.volcanicEruption
                )}`}
              >
                {hazardAssessment.volcanicEruption}
              </span>
            </div>
            <div
              className={`flex items-center justify-between px-2 py-1.5 rounded border ${getRiskBgColor(
                hazardAssessment.earthquake
              )}`}
            >
              <span className="text-sm font-medium text-gray-700">
                Earthquake
              </span>
              <span
                className={`text-xs font-semibold ${getRiskColor(
                  hazardAssessment.earthquake
                )}`}
              >
                {hazardAssessment.earthquake}
              </span>
            </div>
          </div>
        </div>

        {/* Emergency Resources Section */}
        <div className="px-3 py-2">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
            Emergency Resources
          </p>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <svg
                className="w-4 h-4 text-blue-600 shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-700">
                  Nearest Evacuation Center
                </p>
                <p className="text-xs text-gray-600">
                  {emergencyResources.evacuationCenter}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <svg
                className="w-4 h-4 text-red-600 shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-700">
                  Nearest Hospital
                </p>
                <p className="text-xs text-gray-600">
                  {emergencyResources.hospital}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <svg
                className="w-4 h-4 text-green-600 shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-700">
                  Nearest Open Space
                </p>
                <p className="text-xs text-gray-600">
                  {emergencyResources.openSpace}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationRiskAssessment;
