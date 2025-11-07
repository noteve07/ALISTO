import React from "react";

const EarthquakeAlertModal = ({ isOpen, earthquake, onClose }) => {
  if (!isOpen || !earthquake) {
    return null;
  }

  const magnitude = Number.parseFloat(earthquake.magnitude) || 0;

  return (
    <div
      className="fixed inset-0 z-2000 flex items-center bg-slate-900/50 px-4"
      style={{ justifyContent: "center", marginLeft: "-55px" }}
    >
      <div
        className="relative w-full max-w-xs bg-red-600 rounded-2xl shadow-2xl border-4 border-red-800 ring-4 ring-red-500/30"
        style={{ 
          boxShadow: "0 25px 50px -12px rgba(220, 38, 38, 0.5), 0 0 0 1px rgba(220, 38, 38, 0.1)" 
        }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-800/80 text-white transition hover:bg-red-800 focus:outline-none ring-2 ring-white/20"
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
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 border-2 border-red-200 shadow-lg">
            <svg
              className="h-6 w-6 text-red-600"
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
          <p className="text-red-100 text-xs mb-2 font-medium">
            M{magnitude.toFixed(1)} • Balanga City (Bataan)
          </p>
          <p className="text-red-200/80 text-xs mb-4 font-mono">
            14.6760°N, 120.5367°E
          </p>

          {/* Actions - Strong Pills */}
          <div className="space-y-2 mb-4">
            <div className="bg-red-800 border-2 border-red-700 rounded-lg py-2.5 shadow-lg">
              <h3 className="text-white text-xl font-black">DUCK</h3>
            </div>

            <div className="bg-red-800 border-2 border-red-700 rounded-lg py-2.5 shadow-lg">
              <h3 className="text-white text-xl font-black">COVER</h3>
            </div>

            <div className="bg-red-800 border-2 border-red-700 rounded-lg py-2.5 shadow-lg">
              <h3 className="text-white text-xl font-black">HOLD</h3>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-center gap-2 text-xs text-red-100 font-semibold">
            <div className="h-1.5 w-1.5 bg-yellow-300 rounded-full animate-pulse shadow-sm"></div>
            LIVE ALERT
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarthquakeAlertModal;
