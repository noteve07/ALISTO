import React from "react";
import EmergencyHotlines from "../../dashboard/components/details/EmergencyHotlines";

const HotlinePage = () => {
  return (
    <div className="h-full bg-background overflow-auto">
      <div className="max-w-7xl mx-auto p-6">
        <div className="w-full">
          {/* Emergency Hotlines Component - Full Width */}
          <EmergencyHotlines />
        </div>
      </div>
    </div>
  );
};

export default HotlinePage;
