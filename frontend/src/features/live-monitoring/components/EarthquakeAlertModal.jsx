import React from "react";

const EarthquakeAlertModal = ({ isOpen, earthquake, onClose }) => {
  if (!isOpen || !earthquake) {
    return null;
  }

  const magnitude = Number.parseFloat(earthquake.magnitude) || 0;
  const location = earthquake.location || "Unknown location";

  return (
    <div
      className="fixed inset-0 z-2000 flex items-center bg-slate-900/20 px-4"
      style={{ justifyContent: "center", marginLeft: "-55px" }}
    >
      <div
        className="relative w-full max-w-xs bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30"
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

        <div className="p-5 text-center">
          {/* Warning Icon */}
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
            <svg
              className="h-6 w-6 text-red-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-white text-lg font-bold mb-1">
            EARTHQUAKE ALERT
          </h2>
          <p className="text-white/70 text-xs mb-4">
            M{magnitude.toFixed(1)} •{" "}
            {location.length > 25
              ? location.substring(0, 25) + "..."
              : location}
          </p>

          {/* Actions - Simple Pills */}
          <div className="space-y-2 mb-4">
            <div className="bg-white/15 rounded-lg py-2.5">
              <h3 className="text-white text-xl font-black">DUCK</h3>
            </div>

            <div className="bg-white/15 rounded-lg py-2.5">
              <h3 className="text-white text-xl font-black">COVER</h3>
            </div>

            <div className="bg-white/15 rounded-lg py-2.5">
              <h3 className="text-white text-xl font-black">HOLD</h3>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-center gap-2 text-xs text-white/60">
            <div className="h-1.5 w-1.5 bg-red-400 rounded-full animate-pulse"></div>
            LIVE ALERT
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarthquakeAlertModal;
