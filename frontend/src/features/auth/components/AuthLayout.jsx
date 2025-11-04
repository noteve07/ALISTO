import React from "react";

/**
 * Modern two-section auth layout container
 * Card design with 90% zoom for better fit on smaller screens
 */
const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden isolate transform scale-90 origin-center">
        <div className="grid lg:grid-cols-2 min-h-[700px]">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
