import React, { useEffect } from "react";

const VolcanicAdvisoryModal = ({ isOpen, advisory, onClose }) => {
  // Auto-close modal after 12 seconds (longer than the 5x sound repetition)
  useEffect(() => {
    if (isOpen && advisory) {
      const timer = setTimeout(() => {
        onClose();
      }, 12000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, advisory, onClose]);
  if (!isOpen || !advisory) {
    return null;
  }

  const alertLevel = advisory.alertLevel || 0;
  const volcano = advisory.volcano || "Unknown volcano";

  // Helper functions for solid alert styling with toned down colors and 3D shadows
  const getVolcanoModalBg = (level) => {
    // Use single dark background for all levels - no bright colors
    return "bg-slate-800";
  };

  const getVolcanoShadow = (level) => {
    // Strong 3D shadow effect instead of bright colors
    return "0 8px 0 0 #334155, 0 12px 0 0 #1e293b, 0 16px 20px -8px rgba(0,0,0,0.8)";
  };
  const getVolcanoIconBg = () => {
    return "bg-orange-500"; // Single accent color for all levels
  };

  const getVolcanoIconColor = (level) => {
    return "text-white"; // White for all levels
  };

  const getAlertLevelBadgeStyle = () => {
    return "bg-slate-700 border-2 border-slate-600";
  };

  const getAlertLevelText = (level) => {
    switch (level) {
      case 5:
        return "ALERT LEVEL 5 - HAZARDOUS ERUPTION";
      case 4:
        return "ALERT LEVEL 4 - ERUPTION IMMINENT";
      case 3:
        return "ALERT LEVEL 3 - MAGMATIC UNREST";
      case 2:
        return "ALERT LEVEL 2 - MODERATE UNREST";
      case 1:
        return "ALERT LEVEL 1 - LOW LEVEL UNREST";
      default:
        return "NORMAL";
    }
  };

  return (
    <div
      className="fixed inset-0 z-2000 flex items-center bg-slate-900/60 px-4"
      style={{ justifyContent: "center", marginLeft: "-55px" }}
    >
      <div
        className={`relative w-full max-w-md rounded-2xl border-2 border-slate-600 ${getVolcanoModalBg()}`}
        style={{
          boxShadow: getVolcanoShadow(),
        }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-700 text-gray-300 transition hover:bg-slate-600 hover:text-white focus:outline-none"
          aria-label="Dismiss"
        >
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 6l12 12M6 18L18 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="p-6 text-center">
          {/* Volcano Icon with 3D effect */}
          <div
            className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-orange-600 ${getVolcanoIconBg()}`}
            style={{
              boxShadow: "0 4px 0 0 #c2410c, 0 6px 8px -2px rgba(0,0,0,0.6)"
            }}
          >
            <svg
              className={`h-8 w-8 ${getVolcanoIconColor()}`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 3L21 21H3L12 3Z" />
              <circle cx="12" cy="6" r="2" fill="currentColor" opacity="0.8">
                <animate
                  attributeName="opacity"
                  values="0.8;0.4;0.8"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-white text-xl font-bold mb-2">
            VOLCANIC ADVISORY
          </h2>

          {/* Simplified Info - Just Volcano Name and Alert Level */}
          <h3 className="text-gray-300 text-lg font-semibold mb-3">{volcano}</h3>

          {/* Alert Level Badge with 3D effect */}
          <div className="mb-6">
            <div
              className={`inline-block rounded-full px-4 py-2 ${getAlertLevelBadgeStyle()}`}
              style={{
                boxShadow: "0 4px 0 0 #475569, 0 6px 8px -2px rgba(0,0,0,0.6)"
              }}
            >
              <span className="text-sm font-bold text-white">
                {getAlertLevelText(alertLevel)}
              </span>
            </div>
          </div>

          {/* Action Button with 3D effect */}
          {advisory.bulletinLink && (
            <div className="flex justify-center mb-4">
              <button
                onClick={() => window.open(advisory.bulletinLink, "_blank")}
                className="bg-slate-700 text-white font-semibold py-2 px-6 rounded-lg hover:bg-slate-600 transition-colors border-2 border-slate-600"
                style={{
                  boxShadow: "0 4px 0 0 #475569, 0 6px 8px -2px rgba(0,0,0,0.6)"
                }}
              >
                View Bulletin
              </button>
            </div>
          )}

          {/* Status Indicator */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400 font-medium">
            <div className="h-1.5 w-1.5 bg-orange-400 rounded-full animate-pulse"></div>
            VOLCANIC ALERT
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolcanicAdvisoryModal;
