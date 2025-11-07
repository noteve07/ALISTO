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
      Low: "bg-green-100 border-green-300",
      Moderate: "bg-orange-100 border-orange-300",
      High: "bg-red-100 border-red-300",
      "Very High": "bg-red-200 border-red-400",
    };
    return colors[level] || colors.Moderate;
  };

  const getRiskTextColor = (level) => {
    const colors = {
      Low: "text-green-800",
      Moderate: "text-orange-800",
      High: "text-red-800",
      "Very High": "text-red-900",
    };
    return colors[level] || colors.Moderate;
  };

  const getRiskHighlightColor = (level) => {
    const colors = {
      Low: "bg-green-500",
      Moderate: "bg-orange-500",
      High: "bg-red-500",
      "Very High": "bg-red-600",
    };
    return colors[level] || colors.Moderate;
  };

  const formatLastUpdated = (calculatedAt) => {
    if (!calculatedAt) return "No data";

    try {
      const date = new Date(calculatedAt);
      const now = new Date();
      const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

      if (diffInHours < 1) return "Just updated";
      if (diffInHours < 24) return `${diffInHours}h ago`;
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays}d ago`;
      return date.toLocaleDateString();
    } catch {
      return "Unknown";
    }
  };

  if (loading) {
    return (
      <div className="relative bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse group">
        {/* Bottom thick primary color highlight - 80% width, centered */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4/5 h-1 bg-[#ea772e] rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></div>

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
  const calculatedAt = riskLevel?.calculated_at;

  return (
    <div
      onClick={handleClick}
      className={`relative rounded-xl shadow-sm border p-6 hover:shadow-lg hover:scale-[1.01] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 active:shadow-sm transition-all duration-100 ease-out cursor-pointer group ${getRiskColor(
        level
      )}`}
    >
      {/* Bottom colored highlight - 80% width and normal thickness */}
      <div
        className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4/5 h-0.5 ${getRiskHighlightColor(
          level
        )} rounded-full transition-transform duration-300 ease-out ${
          level === "High" || level === "Very High"
            ? "scale-x-100"
            : "scale-x-0 group-hover:scale-x-100"
        }`}
      ></div>

      {/* Centered layout */}
      <div className="text-center">
        <p className="text-sm font-medium text-gray-600 mb-3">
          Risk Level (Bataan)
        </p>

        {/* Large prominent risk level text */}
        <div className="mb-3">
          <h2 className={`text-4xl font-bold ${getRiskTextColor(level)}`}>
            {level}
          </h2>
        </div>

        {/* Last updated info */}
        <p className="text-xs text-gray-500">
          Last Updated: {formatLastUpdated(calculatedAt)}
        </p>
      </div>
    </div>
  );
};

export default RiskLevel;
