import React, { useState } from "react";

const EarthquakeInfoPage = () => {
  const [activeCard, setActiveCard] = useState(0);

  const earthquakeCards = [
    {
      id: 1,
      title: "What is an Earthquake?",
      icon: "🌍",
      content: (
        <div className="space-y-4">
          <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
            <h3 className="text-base font-bold text-gray-800 mb-2">
              Definition
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              An earthquake is the sudden release of energy stored in the
              Earth's crust, creating seismic waves that cause ground shaking.
              This happens when tectonic plates move and create stress along
              fault lines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-yellow-50 rounded-lg p-3">
              <h4 className="font-semibold text-yellow-800 mb-1 text-sm">
                🏔️ Tectonic Plates
              </h4>
              <p className="text-yellow-700 text-xs">
                The Earth's surface is broken into large pieces that move slowly
                over time
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <h4 className="font-semibold text-red-800 mb-1 text-sm">
                ⚡ Energy Release
              </h4>
              <p className="text-red-700 text-xs">
                When plates get stuck and suddenly slip, energy is released as
                seismic waves
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: "Earthquake Magnitude & Intensity",
      icon: "📊",
      content: (
        <div className="space-y-4">
          <div className="bg-linear-to-r from-green-50 to-emerald-50 rounded-lg p-4">
            <h3 className="text-base font-bold text-gray-800 mb-2">
              Magnitude vs Intensity
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed mb-3">
              Magnitude measures the energy released, while intensity measures
              the effects felt at a location.
            </p>
          </div>

          <div className="space-y-3">
            <div className="border-l-4 border-blue-500 pl-3">
              <h4 className="font-semibold text-gray-800 text-sm">
                Richter Scale (Magnitude)
              </h4>
              <p className="text-xs text-gray-600">
                Logarithmic scale from 1-10 measuring energy
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center justify-between bg-green-100 p-2 rounded-lg">
                <span className="font-medium text-sm">1.0-2.9</span>
                <span className="text-green-700 text-xs">
                  Micro - Usually not felt
                </span>
              </div>
              <div className="flex items-center justify-between bg-yellow-100 p-2 rounded-lg">
                <span className="font-medium text-sm">3.0-3.9</span>
                <span className="text-yellow-700 text-xs">
                  Minor - Often felt
                </span>
              </div>
              <div className="flex items-center justify-between bg-orange-100 p-2 rounded-lg">
                <span className="font-medium text-sm">4.0-4.9</span>
                <span className="text-orange-700 text-xs">
                  Light - Noticeable shaking
                </span>
              </div>
              <div className="flex items-center justify-between bg-red-100 p-2 rounded-lg">
                <span className="font-medium text-sm">5.0-5.9</span>
                <span className="text-red-700 text-xs">
                  Moderate - Slight damage
                </span>
              </div>
              <div className="flex items-center justify-between bg-red-200 p-2 rounded-lg">
                <span className="font-medium text-sm">6.0+</span>
                <span className="text-red-800 text-xs">
                  Strong to Great - Serious damage
                </span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: "Types of Earthquakes",
      icon: "🏔️",
      content: (
        <div className="space-y-4">
          <div className="bg-linear-to-r from-purple-50 to-pink-50 rounded-lg p-4">
            <h3 className="text-base font-bold text-gray-800 mb-2">
              Classification by Origin
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-start space-x-2">
                <span className="text-xl">🌋</span>
                <div>
                  <h4 className="font-bold text-gray-800 mb-1 text-sm">
                    Tectonic Earthquakes
                  </h4>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    Most common type caused by movement of tectonic plates along
                    fault lines. Can occur at plate boundaries or within plates.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-start space-x-2">
                <span className="text-xl">🌋</span>
                <div>
                  <h4 className="font-bold text-gray-800 mb-1 text-sm">
                    Volcanic Earthquakes
                  </h4>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    Caused by magma movement beneath volcanoes. Often precede or
                    accompany volcanic eruptions. Common in the Philippines due
                    to volcanic activity.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-start space-x-2">
                <span className="text-xl">🏗️</span>
                <div>
                  <h4 className="font-bold text-gray-800 mb-1 text-sm">
                    Induced Earthquakes
                  </h4>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    Caused by human activities like mining, reservoir-induced
                    seismicity from large dams, or hydraulic fracturing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      title: "Philippines & Ring of Fire",
      icon: "🇵🇭",
      content: (
        <div className="space-y-4">
          <div className="bg-linear-to-r from-red-50 to-orange-50 rounded-lg p-4">
            <h3 className="text-base font-bold text-gray-800 mb-2">
              Why Philippines is Earthquake-Prone
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              The Philippines sits on the Pacific Ring of Fire, where 90% of the
              world's earthquakes occur.
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-white border-l-4 border-red-500 p-3 rounded-r-lg">
              <h4 className="font-semibold text-gray-800 mb-1 text-sm">
                🌊 Philippine Sea Plate
              </h4>
              <p className="text-gray-600 text-xs">
                The country lies between the Philippine Sea Plate, Eurasian
                Plate, and Indo-Australian Plate
              </p>
            </div>

            <div className="bg-white border-l-4 border-orange-500 p-3 rounded-r-lg">
              <h4 className="font-semibold text-gray-800 mb-1 text-sm">
                🌋 Active Volcanoes
              </h4>
              <p className="text-gray-600 text-xs">
                Over 50 active volcanoes contribute to seismic activity across
                the archipelago
              </p>
            </div>

            <div className="bg-white border-l-4 border-yellow-500 p-3 rounded-r-lg">
              <h4 className="font-semibold text-gray-800 mb-1 text-sm">
                🗻 Major Fault Lines
              </h4>
              <p className="text-gray-600 text-xs">
                Including the Philippine Fault, Marikina Valley Fault, and West
                Valley Fault
              </p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-3">
            <h4 className="font-semibold text-blue-600 mb-1 text-sm">
              📈 Earthquake Statistics
            </h4>
            <ul className="text-blue-700 text-xs space-y-0.5">
              <li>• 20+ earthquakes occur daily in the Philippines</li>
              <li>• Most are magnitude 2-4 (barely noticeable)</li>
              <li>• 1-2 destructive earthquakes every year</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      title: "Earthquake Safety Tips",
      icon: "🛡️",
      content: (
        <div className="space-y-6">
          <div className="bg-linear-to-r from-green-50 to-teal-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">
              Drop, Cover, and Hold On
            </h3>
            <p className="text-gray-700 leading-relaxed">
              The internationally recommended action during earthquake shaking.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-red-50 rounded-lg p-4">
              <h4 className="font-bold text-red-800 mb-3 flex items-center">
                <span className="mr-2">⬇️</span> DROP
              </h4>
              <p className="text-red-700 text-sm">
                Drop to your hands and knees immediately. Don't run during
                shaking.
              </p>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <h4 className="font-bold text-orange-800 mb-3 flex items-center">
                <span className="mr-2">🏠</span> COVER
              </h4>
              <p className="text-orange-700 text-sm">
                Take cover under a sturdy desk or table. Cover your head and
                neck with your arms.
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-bold text-green-800 mb-3 flex items-center">
                <span className="mr-2">✊</span> HOLD ON
              </h4>
              <p className="text-green-700 text-sm">
                Hold on to your shelter. Be prepared to move with it until
                shaking stops.
              </p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">
              📋 Emergency Kit Essentials
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
              <div>• Water (3 days supply)</div>
              <div>• First aid kit</div>
              <div>• Non-perishable food</div>
              <div>• Flashlight & batteries</div>
              <div>• Battery-powered radio</div>
              <div>• Emergency contacts</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 6,
      title: "Seismic Monitoring Technology",
      icon: "📡",
      content: (
        <div className="space-y-6">
          <div className="bg-linear-to-r from-indigo-50 to-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">
              How We Monitor Earthquakes
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Modern technology helps us detect, measure, and analyze seismic
              activity in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">📊</span>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Seismographs</h4>
                  <p className="text-gray-600 text-sm">
                    Sensitive instruments that detect and record ground motion.
                    Modern digital seismographs can detect earthquakes thousands
                    of kilometers away.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🛰️</span>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">
                    GPS & Satellite Data
                  </h4>
                  <p className="text-gray-600 text-sm">
                    GPS networks monitor tiny movements in the Earth's crust,
                    helping predict potential earthquake zones and track plate
                    movements.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🤖</span>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">
                    AI & Machine Learning
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Advanced algorithms analyze seismic patterns to improve
                    earthquake detection, location accuracy, and risk assessment
                    like EPICENTRA's system.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="font-semibold text-purple-800 mb-2">
              🇵🇭 PHIVOLCS Network
            </h4>
            <p className="text-purple-700 text-sm">
              The Philippine Institute of Volcanology and Seismology operates
              over 100 seismic monitoring stations across the country, providing
              24/7 earthquake monitoring.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const nextCard = () => {
    setActiveCard((prev) => (prev + 1) % earthquakeCards.length);
  };

  const prevCard = () => {
    setActiveCard(
      (prev) => (prev - 1 + earthquakeCards.length) % earthquakeCards.length
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Card Navigation */}
        <div className="flex items-center justify-center mb-6">
          <div className="bg-white rounded-full shadow-lg p-1.5 flex items-center space-x-3">
            <button
              onClick={prevCard}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors duration-200"
            >
              <svg
                className="w-4 h-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <div className="flex space-x-1.5">
              {earthquakeCards.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveCard(index)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                    index === activeCard
                      ? "bg-blue-500 w-6"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextCard}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors duration-200"
            >
              <svg
                className="w-4 h-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Card Display */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-linear-to-r from-orange-200 to-orange-300 px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-white/30 p-2 rounded-lg">
                <span className="text-2xl">
                  {earthquakeCards[activeCard].icon}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-orange-800">
                  {earthquakeCards[activeCard].title}
                </h2>
                <p className="text-orange-600 text-xs">
                  Card {activeCard + 1} of {earthquakeCards.length}
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-6">{earthquakeCards[activeCard].content}</div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() =>
              window.open("https://earthquake.phivolcs.dost.gov.ph/", "_blank")
            }
            className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100"
          >
            <div className="flex items-center space-x-2">
              <div className="bg-blue-50 p-1.5 rounded-lg">
                <span className="text-blue-600 text-sm">🇵🇭</span>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800 text-sm">
                  PHIVOLCS
                </h3>
                <p className="text-xs text-gray-600">Official data</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => window.open("/app/live-monitoring", "_self")}
            className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100"
          >
            <div className="flex items-center space-x-2">
              <div className="bg-green-100 p-1.5 rounded-lg">
                <span className="text-green-600 text-sm">📡</span>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800 text-sm">
                  Seismic Monitoring
                </h3>
                <p className="text-xs text-gray-600">Real-time data</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => window.open("/app/risk-evaluation", "_self")}
            className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100"
          >
            <div className="flex items-center space-x-2">
              <div className="bg-orange-100 p-1.5 rounded-lg">
                <span className="text-orange-600 text-sm">⚠️</span>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800 text-sm">
                  Risk Assessment
                </h3>
                <p className="text-xs text-gray-600">Evaluate risks</p>
              </div>
            </div>
          </button>
        </div>

        {/* Swipe instruction for mobile */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            💡 Use the navigation buttons or swipe left/right to explore
            different topics
          </p>
        </div>
      </div>
    </div>
  );
};

export default EarthquakeInfoPage;
