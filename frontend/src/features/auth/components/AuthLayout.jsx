import React from "react";

/**
 * Modern two-section auth layout container
 * Handles the split-screen design with smooth animations
 */
const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="grid lg:grid-cols-2 min-h-[600px]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
