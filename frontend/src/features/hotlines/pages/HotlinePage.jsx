import React from "react";
import EmergencyHotlines from "../../dashboard/components/details/EmergencyHotlines";
import EvacuationSites from "../../dashboard/components/details/EvacuationSites";

const HotlinePage = () => {
  return (
    <div className="h-full bg-background overflow-auto">
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Emergency Hotlines Component */}
          <EmergencyHotlines />

          {/* Evacuation Sites Component */}
          <EvacuationSites />
        </div>
      </div>
    </div>
  );
};

export default HotlinePage;
