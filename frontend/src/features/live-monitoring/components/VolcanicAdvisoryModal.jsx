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

  // Get alert level description and colors
  const getAlertLevelInfo = (level) => {
    switch (level) {
      case 5:
        return {
          text: "ALERT LEVEL 5 - HAZARDOUS ERUPTION",
          bgColor: "bg-red-900",
          textColor: "text-red-200",
          iconColor: "text-red-300",
        };
      case 4:
        return {
          text: "ALERT LEVEL 4 - HAZARDOUS ERUPTION IMMINENT",
          bgColor: "bg-red-800",
          textColor: "text-red-200",
          iconColor: "text-red-300",
        };
      case 3:
        return {
          text: "ALERT LEVEL 3 - MAGMATIC UNREST",
          bgColor: "bg-orange-800",
          textColor: "text-orange-200",
          iconColor: "text-orange-300",
        };
      case 2:
        return {
          text: "ALERT LEVEL 2 - MODERATE UNREST",
          bgColor: "bg-amber-800",
          textColor: "text-amber-200",
          iconColor: "text-amber-300",
        };
      case 1:
        return {
          text: "ALERT LEVEL 1 - LOW LEVEL UNREST",
          bgColor: "bg-yellow-800",
          textColor: "text-yellow-200",
          iconColor: "text-yellow-300",
        };
      default:
        return {
          text: "NORMAL",
          bgColor: "bg-gray-800",
          textColor: "text-gray-200",
          iconColor: "text-gray-300",
        };
    }
  };

  const alertInfo = getAlertLevelInfo(alertLevel);

  return (
    <div
      className="fixed inset-0 z-2000 flex items-center bg-slate-900/20 px-4"
      style={{ justifyContent: "center", marginLeft: "-55px" }}
    >
      <div
        className={`relative w-full max-w-md backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 ${alertInfo.bgColor}`}
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
          {/* Volcano Icon */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <svg
              className={`h-8 w-8 ${alertInfo.iconColor}`}
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
          <h2 className={`text-xl font-bold mb-2 ${alertInfo.textColor}`}>
            Volcanic Advisory
          </h2>

          {/* Volcano Name */}
          <h3 className={`text-lg font-semibold mb-3 ${alertInfo.textColor}`}>
            {volcano}
          </h3>

          {/* Alert Level Badge */}
          <div className="mb-4">
            <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <span className={`text-sm font-bold ${alertInfo.textColor}`}>
                {alertInfo.text}
              </span>
            </div>
          </div>

          {/* Alert Status */}
          <p
            className={`text-sm mb-4 ${alertInfo.textColor} opacity-90 leading-relaxed`}
          >
            {alertStatus}
          </p>

          {/* Issuance Date */}
          {advisory.issuanceDate && (
            <p className={`text-xs ${alertInfo.textColor} opacity-75 mb-4`}>
              Issued: {new Date(advisory.issuanceDate).toLocaleString()}
            </p>
          )}

          {/* Action Button */}
          {advisory.bulletinLink && (
            <div className="flex justify-center">
              <button
                onClick={() => window.open(advisory.bulletinLink, "_blank")}
                className="bg-white/20 backdrop-blur-sm text-white font-medium py-2 px-6 rounded-lg hover:bg-white/30 transition-colors"
              >
                View Bulletin
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VolcanicAdvisoryModal;
