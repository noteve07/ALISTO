import React from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../../hooks/useDashboard";

const RiskLevel = () => {
  const { riskLevel, userLocation, loading } = useDashboard();
  const navigate = useNavigate();

  const handleClick = () => {
    // Navigate to risk evaluation page with user location
    if (userLocation) {
      navigate("/app/risk-evaluation", {
        state: {
          center: userLocation.position,
          zoom: 9,
        },
      });
    } else {
      navigate("/app/risk-evaluation");
    }
  };

  const getRiskColor = (level) => {
    const colors = {
      Low: "bg-green-500",
      Moderate: "bg-yellow-500",
      High: "bg-orange-500",
      "Very High": "bg-red-500",
    };
    return colors[level] || colors.Moderate;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  // Use risk level from API or fallback
  const level = riskLevel?.level || "Moderate";
  const score = riskLevel?.score || 6.2;

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">Risk Level</p>
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold text-white ${getRiskColor(
                level
              )}`}
            >
              {level}
            </span>
            <span className="text-2xl font-bold text-gray-900">{score}/10</span>
          </div>
        </div>
        <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg">
          <span className="material-symbols-outlined text-2xl text-orange-700">
            warning
          </span>
        </div>
      </div>
    </div>
  );
};

export default RiskLevel;
