import React from "react";

const EmergencyHotlines = () => {
  // Hardcoded data - easily replaceable with API call
  const hotlines = {
    emergency: [
      {
        name: "National Emergency Hotline",
        number: "911",
        description: "24/7 Emergency Response",
      },
      {
        name: "Philippine Red Cross",
        number: "143",
        description: "Disaster Response & Relief",
      },
    ],
    disaster: [
      {
        name: "NDRRMC",
        number: "(02) 8911-1406",
        description: "National Disaster Risk Reduction",
      },
      {
        name: "PHIVOLCS",
        number: "(02) 8426-1468",
        description: "Earthquake & Volcano Monitoring",
      },
      {
        name: "PAGASA",
        number: "(02) 8284-0800",
        description: "Weather & Climate Services",
      },
    ],
    local: [
      {
        name: "Balanga CDRRMO",
        number: "(047) 237-0687",
        description: "Balanga Disaster Response",
      },
      {
        name: "Bataan PDRRMO",
        number: "0909-507-7158",
        description: "Provincial Disaster Response",
      },
      {
        name: "OCD Region III",
        number: "(045) 455-1145",
        description: "Regional Office of Civil Defense",
      },
      {
        name: "BFP Balanga Fire Station",
        number: "(047) 935-0500",
        description: "Balanga Fire Protection",
      },
      {
        name: "Health Emergency Medical System",
        number: "0921-958-9798",
        description: "Emergency Medical Services",
      },
      {
        name: "City Health Office",
        number: "(047) 237-2711",
        description: "Local Health Services",
      },
    ],
  };

  const copyToClipboard = (number) => {
    navigator.clipboard.writeText(number);
    // Add toast notification here if needed
  };

  const callNumber = (number) => {
    window.open(`tel:${number}`, "_self");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Emergency Hotlines
          </h3>
          <p className="text-sm text-gray-600">
            Important contacts for disaster response
          </p>
        </div>
        <span className="material-symbols-outlined text-red-500 text-xl">
          call
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* First Column - Emergency Response & Disaster Management */}
        <div className="space-y-6">
          {/* Emergency Hotlines */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
              <span className="material-symbols-outlined text-red-500 text-sm mr-2">
                emergency
              </span>
              Emergency Response
            </h4>
            <div className="space-y-2">
              {hotlines.emergency.map((hotline, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{hotline.name}</p>
                    <p className="text-sm text-gray-600">
                      {hotline.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-red-600 text-lg">
                      {hotline.number}
                    </span>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => callNumber(hotline.number)}
                        className="p-2 hover:bg-red-100 rounded-full transition-colors"
                        title="Call now"
                      >
                        <span className="material-symbols-outlined text-red-500 text-sm">
                          call
                        </span>
                      </button>
                      <button
                        onClick={() => copyToClipboard(hotline.number)}
                        className="p-2 hover:bg-red-100 rounded-full transition-colors"
                        title="Copy number"
                      >
                        <span className="material-symbols-outlined text-red-500 text-sm">
                          content_copy
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Disaster Management */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
              <span className="material-symbols-outlined text-orange-500 text-sm mr-2">
                shield
              </span>
              Disaster Management
            </h4>
            <div className="space-y-2">
              {hotlines.disaster.map((hotline, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{hotline.name}</p>
                    <p className="text-sm text-gray-600">
                      {hotline.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-orange-600">
                      {hotline.number}
                    </span>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => callNumber(hotline.number)}
                        className="p-2 hover:bg-orange-100 rounded-full transition-colors"
                        title="Call now"
                      >
                        <span className="material-symbols-outlined text-orange-500 text-sm">
                          call
                        </span>
                      </button>
                      <button
                        onClick={() => copyToClipboard(hotline.number)}
                        className="p-2 hover:bg-orange-100 rounded-full transition-colors"
                        title="Copy number"
                      >
                        <span className="material-symbols-outlined text-orange-500 text-sm">
                          content_copy
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Second Column - Local Response Teams */}
        <div>
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
              <span className="material-symbols-outlined text-blue-500 text-sm mr-2">
                location_city
              </span>
              Local Response Teams
            </h4>
            <div className="space-y-2">
              {hotlines.local.map((hotline, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{hotline.name}</p>
                    <p className="text-sm text-gray-600">
                      {hotline.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-blue-600">
                      {hotline.number}
                    </span>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => callNumber(hotline.number)}
                        className="p-2 hover:bg-blue-100 rounded-full transition-colors"
                        title="Call now"
                      >
                        <span className="material-symbols-outlined text-blue-500 text-sm">
                          call
                        </span>
                      </button>
                      <button
                        onClick={() => copyToClipboard(hotline.number)}
                        className="p-2 hover:bg-blue-100 rounded-full transition-colors"
                        title="Copy number"
                      >
                        <span className="material-symbols-outlined text-blue-500 text-sm">
                          content_copy
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center mt-6 pt-4 border-t border-gray-100">
        <button className="flex items-center space-x-2 text-sm text-primary hover:text-primary/80 font-medium">
          <span>View all emergency contacts</span>
          <span className="material-symbols-outlined text-sm">
            contact_phone
          </span>
        </button>
      </div>
    </div>
  );
};

export default EmergencyHotlines;
