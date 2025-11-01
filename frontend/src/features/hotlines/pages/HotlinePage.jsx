import React from "react";

const HotlinePage = () => {
  const emergencyNumbers = [
    {
      name: "National Emergency",
      number: "911",
      icon: "🚨",
      color: "bg-red-500",
    },
    { name: "PNP Hotline", number: "117", icon: "👮", color: "bg-blue-600" },
    { name: "BFP Fire", number: "116", icon: "🚒", color: "bg-orange-600" },
    { name: "Red Cross", number: "143", icon: "⚕️", color: "bg-red-600" },
    {
      name: "NDRRMC",
      number: "(02) 8911-1406",
      icon: "🆘",
      color: "bg-purple-600",
    },
    {
      name: "PHIVOLCS",
      number: "(02) 8426-1468",
      icon: "🌋",
      color: "bg-orange-700",
    },
    {
      name: "PAGASA",
      number: "(02) 8284-0800",
      icon: "🌤️",
      color: "bg-blue-500",
    },
    { name: "Coast Guard", number: "917", icon: "⚓", color: "bg-cyan-600" },
    { name: "MMDA", number: "136", icon: "🚦", color: "bg-yellow-600" },
    {
      name: "DOH",
      number: "(02) 8651-7800",
      icon: "🏥",
      color: "bg-green-600",
    },
    {
      name: "PGH Emergency",
      number: "(02) 8554-8400",
      icon: "🩺",
      color: "bg-teal-600",
    },
    {
      name: "Poison Control",
      number: "(02) 8924-6011",
      icon: "☠️",
      color: "bg-purple-700",
    },
  ];

  const handleCall = (number) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <div className="h-full bg-background overflow-auto">
      <div className="max-w-6xl mx-auto p-6">
        {/* Compact Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Emergency Hotlines
          </h1>
          <p className="text-sm text-gray-600">
            Philippines Emergency Contact Directory
          </p>
        </div>

        {/* Grid of Hotlines */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {emergencyNumbers.map((contact, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-12 h-12 ${contact.color} rounded-lg flex items-center justify-center text-2xl shrink-0 shadow-sm`}
                >
                  {contact.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm mb-1 truncate">
                    {contact.name}
                  </h3>
                  <a
                    href={`tel:${contact.number}`}
                    className="text-primary-v2 font-bold text-lg hover:text-primary transition-colors"
                  >
                    {contact.number}
                  </a>
                </div>
              </div>
              <button
                onClick={() => handleCall(contact.number)}
                className="w-full mt-3 bg-primary-v2 hover:bg-primary text-white py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-md"
              >
                Call Now
              </button>
            </div>
          ))}
        </div>

        {/* Quick Notice */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-red-800 font-semibold text-sm">
            ⚠️ For life-threatening emergencies, dial{" "}
            <span className="text-xl font-bold">911</span> immediately
          </p>
        </div>
      </div>
    </div>
  );
};

export default HotlinePage;
