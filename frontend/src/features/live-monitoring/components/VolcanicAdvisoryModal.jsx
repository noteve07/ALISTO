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
  const alertStatus = advisory.alertStatus || "Status unavailable";

  // Helper functions for solid alert styling with volcanic urgency colors
  const getVolcanoModalBg = (level) => {
    switch (level) {
      case 5:
        return "bg-red-700"; // Most urgent - deep red
      case 4:
        return "bg-red-600";
      case 3:
        return "bg-orange-600";
      case 2:
        return "bg-amber-600";
      case 1:
        return "bg-yellow-600";
      default:
        return "bg-gray-600";
    }
  };

  const getVolcanoBorderColor = (level) => {
    switch (level) {
      case 5:
        return "border-red-900";
      case 4:
        return "border-red-800";
      case 3:
        return "border-orange-800";
      case 2:
        return "border-amber-800";
      case 1:
        return "border-yellow-800";
      default:
        return "border-gray-800";
    }
  };

  const getVolcanoRingColor = (level) => {
    switch (level) {
      case 5:
        return "ring-red-600/40";
      case 4:
        return "ring-red-500/40";
      case 3:
        return "ring-orange-500/40";
      case 2:
        return "ring-amber-500/40";
      case 1:
        return "ring-yellow-500/40";
      default:
        return "ring-gray-500/40";
    }
  };

  const getVolcanoShadowColor = (level) => {
    switch (level) {
      case 5:
        return "rgba(185, 28, 28, 0.6)"; // red-700
      case 4:
        return "rgba(220, 38, 38, 0.5)"; // red-600
      case 3:
        return "rgba(234, 88, 12, 0.5)"; // orange-600
      case 2:
        return "rgba(217, 119, 6, 0.5)"; // amber-600
      case 1:
        return "rgba(202, 138, 4, 0.5)"; // yellow-600
      default:
        return "rgba(75, 85, 99, 0.5)"; // gray-600
    }
  };
  const getVolcanoIconBg = (level) => {
    switch (level) {
      case 5:
        return "bg-white/90";
      case 4:
        return "bg-white/90";
      case 3:
        return "bg-white/90";
      case 2:
        return "bg-white/90";
      case 1:
        return "bg-white/90";
      default:
        return "bg-white/90";
    }
  };

  const getVolcanoIconColor = (level) => {
    switch (level) {
      case 5:
        return "text-red-700";
      case 4:
        return "text-red-600";
      case 3:
        return "text-orange-600";
      case 2:
        return "text-amber-600";
      case 1:
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const getAlertLevelBadgeStyle = (level) => {
    switch (level) {
      case 5:
        return "bg-red-800 border-2 border-red-900";
      case 4:
        return "bg-red-700 border-2 border-red-800";
      case 3:
        return "bg-orange-700 border-2 border-orange-800";
      case 2:
        return "bg-amber-700 border-2 border-amber-800";
      case 1:
        return "bg-yellow-700 border-2 border-yellow-800";
      default:
        return "bg-gray-700 border-2 border-gray-800";
    }
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

  const getStatusIndicatorColor = (level) => {
    switch (level) {
      case 5:
        return "bg-yellow-300";
      case 4:
        return "bg-yellow-300";
      case 3:
        return "bg-yellow-300";
      case 2:
        return "bg-yellow-300";
      case 1:
        return "bg-yellow-300";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div
      className="fixed inset-0 z-2000 flex items-center bg-slate-900/50 px-4"
      style={{ justifyContent: "center", marginLeft: "-55px" }}
    >
      <div
        className={`relative w-full max-w-md rounded-2xl shadow-2xl border-4 ring-4 ${getVolcanoModalBg(
          alertLevel
        )} ${getVolcanoBorderColor(alertLevel)} ${getVolcanoRingColor(
          alertLevel
        )}`}
        style={{
          boxShadow: `0 25px 50px -12px ${getVolcanoShadowColor(
            alertLevel
          )}, 0 0 0 1px ${getVolcanoShadowColor(alertLevel)}`,
        }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30 focus:outline-none ring-2 ring-white/20"
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
          {/* Volcano Icon with urgency color */}
          <div
            className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/30 shadow-lg ${getVolcanoIconBg(
              alertLevel
            )}`}
          >
            <svg
              className={`h-8 w-8 ${getVolcanoIconColor(alertLevel)}`}
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

          {/* Volcano Name */}
          <h3 className="text-white text-lg font-semibold mb-3">{volcano}</h3>

          {/* Alert Level Badge */}
          <div className="mb-4">
            <div
              className={`inline-block rounded-full px-4 py-2 shadow-lg ${getAlertLevelBadgeStyle(
                alertLevel
              )}`}
            >
              <span className="text-sm font-bold text-white">
                {getAlertLevelText(alertLevel)}
              </span>
            </div>
          </div>

          {/* Alert Status */}
          <p className="text-white/90 text-sm mb-4 leading-relaxed font-medium">
            {alertStatus}
          </p>

          {/* Issuance Date */}
          {advisory.issuanceDate && (
            <p className="text-white/70 text-xs mb-4">
              Issued: {new Date(advisory.issuanceDate).toLocaleString()}
            </p>
          )}

          {/* Action Button */}
          {advisory.bulletinLink && (
            <div className="flex justify-center mb-4">
              <button
                onClick={() => window.open(advisory.bulletinLink, "_blank")}
                className="bg-white/90 text-gray-800 font-semibold py-2 px-6 rounded-lg hover:bg-white transition-colors border-2 border-white/30 shadow-lg"
              >
                View Bulletin
              </button>
            </div>
          )}

          {/* Status Indicator */}
          <div className="flex items-center justify-center gap-2 text-xs text-white font-semibold">
            <div
              className={`h-1.5 w-1.5 rounded-full animate-pulse shadow-sm ${getStatusIndicatorColor(
                alertLevel
              )}`}
            ></div>
            VOLCANIC ALERT
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolcanicAdvisoryModal;
