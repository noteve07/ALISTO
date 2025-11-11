import React from "react";
import { Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";

// Custom icons for different facility types
const schoolIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64," +
    btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none">
      <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3z" fill="#3B82F6" stroke="#ffffff" stroke-width="2"/>
      <circle cx="12" cy="13.5" r="2.5" fill="#ffffff"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const hospitalIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64," +
    btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" fill="#EF4444" stroke="#ffffff" stroke-width="2"/>
      <path d="M11 7h2v10h-2V7zM7 11h10v2H7v-2z" fill="#ffffff"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const evacuationIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64," +
    btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#10B981" stroke="#ffffff" stroke-width="2"/>
      <path d="M2 17l10 5 10-5M2 12l10 5 10-5" fill="#10B981" stroke="#ffffff" stroke-width="2"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const EmergencyFacilityMarkers = ({ userLocation, assessmentStarted, assessmentLoading, loadingStep }) => {
  if ((!assessmentStarted && !assessmentLoading) || !userLocation) {
    return null;
  }

  const facilities = [
    {
      id: 'school',
      name: 'Pto. Rivas Elementary School',
      type: 'Public School',
      distance: '0.204 km',
      position: [14.696054, 120.559775],
      icon: schoolIcon,
      color: '#3B82F6',
      loadingStepRequired: 4 // Shows when loadingStep >= 4 (after step 3 completes)
    },
    {
      id: 'hospital',
      name: 'Bataan Doctors Hospital',
      type: 'Hospital',
      distance: '2.35 km',
      position: [14.68303379321277, 120.54269795305377],
      icon: hospitalIcon,
      color: '#EF4444',
      loadingStepRequired: 5 // Shows when loadingStep >= 5 (after step 4 completes)
    },
    {
      id: 'evacuation',
      name: 'Pto. Rivas Ibaba Covered Court',
      type: 'Evacuation Center',
      distance: '0.235 km',
      position: [14.692644594318134, 120.55769043372517],
      icon: evacuationIcon,
      color: '#10B981',
      loadingStepRequired: 6 // Shows when loadingStep >= 6 (after step 5 completes)
    }
  ];

  // Filter facilities based on loading progress or show all if assessment is complete
  const visibleFacilities = assessmentStarted 
    ? facilities 
    : facilities.filter(facility => loadingStep >= facility.loadingStepRequired);

  return (
    <>
      {visibleFacilities.map((facility) => (
        <React.Fragment key={facility.id}>
          {/* Facility Marker */}
          <Marker position={facility.position} icon={facility.icon}>
            <Popup>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: facility.color }}
                  />
                  <strong className="text-[11px] text-gray-900">
                    {facility.type}
                  </strong>
                </div>
                <p className="text-[11px] font-medium text-gray-800 mb-1">
                  {facility.name}
                </p>
                <p className="text-[10px] text-gray-600">
                  Distance: {facility.distance}
                </p>
                <p className="text-[10px] text-gray-500">
                  {facility.position[0].toFixed(4)}, {facility.position[1].toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
          
          {/* Distance Line */}
          <Polyline
            positions={[userLocation.position, facility.position]}
            pathOptions={{
              color: facility.color,
              weight: 3,
              opacity: 0.7,
              dashArray: '5, 10'
            }}
            pane="overlayPane"
          />
        </React.Fragment>
      ))}
    </>
  );
};

export default EmergencyFacilityMarkers;
