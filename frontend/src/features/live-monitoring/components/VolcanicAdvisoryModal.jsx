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

  // Helper functions for glassmorphism styling with volcanic urgency colors
  const getVolcanoIconBg = (level) => {
    switch (level) {
      case 5:
        return "bg-red-500/30";
      case 4:
        return "bg-red-500/25";
      case 3:
        return "bg-orange-500/25";
      case 2:
        return "bg-amber-500/25";
      case 1:
        return "bg-yellow-500/25";
      default:
        return "bg-gray-500/20";
    }
  };

  const getVolcanoIconColor = (level) => {
    switch (level) {
      case 5:
        return "text-red-300";
      case 4:
        return "text-red-400";
      case 3:
        return "text-orange-400";
      case 2:
        return "text-amber-400";
      case 1:
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  const getAlertLevelBadgeStyle = (level) => {
    switch (level) {
      case 5:
        return "bg-red-500/40";
      case 4:
        return "bg-red-500/35";
      case 3:
        return "bg-orange-500/35";
      case 2:
        return "bg-amber-500/35";
      case 1:
        return "bg-yellow-500/35";
      default:
        return "bg-gray-500/30";
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
        return "bg-red-400";
      case 4:
        return "bg-red-400";
      case 3:
        return "bg-orange-400";
      case 2:
        return "bg-amber-400";
      case 1:
        return "bg-yellow-400";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div
      className="fixed inset-0 z-2000 flex items-center bg-slate-900/20 px-4"
      style={{ justifyContent: "center", marginLeft: "-55px" }}
    >
      <div
        className="relative w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30"
        style={{ backgroundColor: "var(--color-secondary)" }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white focus:outline-none"
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
            className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${getVolcanoIconBg(
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
              className={`inline-block backdrop-blur-sm rounded-full px-4 py-2 ${getAlertLevelBadgeStyle(
                alertLevel
              )}`}
            >
              <span className="text-sm font-bold text-white">
                {getAlertLevelText(alertLevel)}
              </span>
            </div>
          </div>

          {/* Alert Status */}
          <p className="text-white/70 text-sm mb-4 leading-relaxed">
            {alertStatus}
          </p>

          {/* Issuance Date */}
          {advisory.issuanceDate && (
            <p className="text-white/50 text-xs mb-4">
              Issued: {new Date(advisory.issuanceDate).toLocaleString()}
            </p>
          )}

          {/* Action Button */}
          {advisory.bulletinLink && (
            <div className="flex justify-center mb-4">
              <button
                onClick={() => window.open(advisory.bulletinLink, "_blank")}
                className="bg-white/20 backdrop-blur-sm text-white font-medium py-2 px-6 rounded-lg hover:bg-white/30 transition-colors"
              >
                View Bulletin
              </button>
            </div>
          )}

          {/* Status Indicator */}
          <div className="flex items-center justify-center gap-2 text-xs text-white/60">
            <div
              className={`h-1.5 w-1.5 rounded-full animate-pulse ${getStatusIndicatorColor(
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
