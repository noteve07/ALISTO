import React from "react";
import useUserLocation from "@/features/auth/hooks/useUserLocation";

const LocationRiskAssessment = ({ assessmentStarted = false, assessmentLoading = false, onFacilityClick, loadingStep = 0 }) => {
  const { location: userLocation } = useUserLocation();

  // Hardcoded assessment results - shown only when assessment is started
  const hazardAssessment = {
    landslide: "Safe",
    tsunami: "Prone", 
    liquefaction: "Safe",
  };

  const emergencyResources = {
    school: {
      name: "Pto. Rivas Elementary School",
      distance: "0.204 km",
      coordinates: [14.696054, 120.559775]
    },
    hospital: {
      name: "Bataan Doctors Hospital", 
      distance: "2.35 km",
      coordinates: [14.68303379321277, 120.54269795305377]
    },
    evacuationCenter: {
      name: "Pto. Rivas Ibaba Covered Court",
      distance: "0.235 km", 
      coordinates: [14.692644594318134, 120.55769043372517]
    }
  };

  const getRiskColor = (risk) => {
    if (risk === "Prone") return "text-red-600";
    if (risk === "Safe") return "text-green-600";
    return "text-gray-600";
  };

  const getRiskBgColor = (risk) => {
    if (risk === "Prone") return "bg-red-50 border-red-200";
    if (risk === "Safe") return "bg-green-50 border-green-200";
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

        {assessmentLoading ? (
          /* Step-by-step Loading State */
          <div className="px-3 py-2">

            {/* Hazard Assessment Loading */}
            <div className="py-3 border-b border-gray-200">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Hazard Assessment
              </p>
              <div className="space-y-2">
                {['Landslide', 'Tsunami', 'Liquefaction'].map((hazard, index) => (
                  <div key={hazard} className="flex items-center justify-between px-2 py-1.5 rounded border bg-gray-50 border-gray-200">
                    <span className="text-sm font-medium text-gray-700">{hazard}</span>
                    {loadingStep > index ? (
                      <span className={`text-xs font-semibold ${
                        hazard === 'Tsunami' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {hazard === 'Tsunami' ? 'Prone' : 'Safe'}
                      </span>
                    ) : loadingStep === index ? (
                      <div className="w-12 h-3 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      <div className="w-12 h-3 bg-gray-100 rounded"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Resources Loading */}
            <div className="py-3">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Emergency Resources
              </p>
              <div className="space-y-2">
                {[
                  { name: 'Public School', icon: 'school', distance: '0.204 km', facility: 'Pto. Rivas Elementary School' },
                  { name: 'Hospital', icon: 'hospital', distance: '2.35 km', facility: 'Bataan Doctors Hospital' },
                  { name: 'Evacuation Center', icon: 'evacuation', distance: '0.235 km', facility: 'Pto. Rivas Ibaba Covered Court' }
                ].map((resource, index) => {
                  const resourceIndex = index + 3; // After hazard assessments
                  const isLoaded = loadingStep > resourceIndex;
                  const isLoading = loadingStep === resourceIndex;
                  
                  return (
                    <div key={resource.name} className="flex items-start gap-2 p-2 rounded bg-gray-50">
                      <div className={`w-4 h-4 shrink-0 mt-0.5 rounded ${
                        resource.icon === 'school' ? 'bg-blue-600' : 
                        resource.icon === 'hospital' ? 'bg-red-600' : 'bg-green-600'
                      }`}></div>
                      <div className="flex-1">
                        {isLoaded ? (
                          <>
                            <p className="text-xs font-medium text-gray-700">
                              Nearest {resource.name} ({resource.distance})
                            </p>
                            <p className="text-xs text-gray-600">
                              {resource.facility}
                            </p>
                          </>
                        ) : isLoading ? (
                          <>
                            <div className="h-3 bg-gray-200 rounded animate-pulse mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                          </>
                        ) : (
                          <>
                            <div className="h-3 bg-gray-100 rounded mb-1"></div>
                            <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : !assessmentStarted ? (
          /* Assessment Prompt */
          <div className="px-3 py-8 text-center">
            <svg
              className="w-12 h-12 text-gray-400 mx-auto mb-3"
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
            <p className="text-sm font-medium text-gray-700 mb-1">
              Location Assessment
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Click on your location marker and press "Start Location Assessment" to analyze hazard risks and find nearby emergency facilities.
            </p>
          </div>
        ) : (
          <>
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
                    hazardAssessment.liquefaction
                  )}`}
                >
                  <span className="text-sm font-medium text-gray-700">
                    Liquefaction
                  </span>
                  <span
                    className={`text-xs font-semibold ${getRiskColor(
                      hazardAssessment.liquefaction
                    )}`}
                  >
                    {hazardAssessment.liquefaction}
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
                <button
                  onClick={() => onFacilityClick && onFacilityClick(emergencyResources.school.coordinates)}
                  className="w-full flex items-start gap-2 p-2 rounded hover:bg-blue-50 transition-colors duration-200 text-left"
                >
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
                      d="M12 14l9-5-9-5-9 5 9 5z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                    />
                  </svg>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-700">
                      Nearest Public School ({emergencyResources.school.distance})
                    </p>
                    <p className="text-xs text-gray-600">
                      {emergencyResources.school.name}
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => onFacilityClick && onFacilityClick(emergencyResources.hospital.coordinates)}
                  className="w-full flex items-start gap-2 p-2 rounded hover:bg-red-50 transition-colors duration-200 text-left"
                >
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
                      Nearest Hospital ({emergencyResources.hospital.distance})
                    </p>
                    <p className="text-xs text-gray-600">
                      {emergencyResources.hospital.name}
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => onFacilityClick && onFacilityClick(emergencyResources.evacuationCenter.coordinates)}
                  className="w-full flex items-start gap-2 p-2 rounded hover:bg-green-50 transition-colors duration-200 text-left"
                >
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
                      Nearest Evacuation Center ({emergencyResources.evacuationCenter.distance})
                    </p>
                    <p className="text-xs text-gray-600">
                      {emergencyResources.evacuationCenter.name}
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LocationRiskAssessment;
