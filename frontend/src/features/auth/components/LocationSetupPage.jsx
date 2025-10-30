import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LocationPermissionModal from "./LocationPermissionModal";

/**
 * Page component that can be shown after successful signup/login
 * to handle location setup before redirecting to the main app
 */
const LocationSetupPage = () => {
  const [showLocationModal, setShowLocationModal] = useState(true);
  const [locationSetupComplete, setLocationSetupComplete] = useState(false);
  const navigate = useNavigate();

  const handleLocationSet = (locationData) => {
    console.log("Location set:", locationData);
    setLocationSetupComplete(true);
    
    // You can store location data in context or state management here
    // For example: setUserLocation(locationData);
  };

  const handleSkipLocation = () => {
    setShowLocationModal(false);
    setLocationSetupComplete(true);
  };

  const handleContinueToApp = () => {
    navigate("/app"); // or wherever your main app is
  };

  // Auto-redirect to app after location setup
  useEffect(() => {
    if (locationSetupComplete && !showLocationModal) {
      const timer = setTimeout(() => {
        handleContinueToApp();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [locationSetupComplete, showLocationModal]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome to ALISTO!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Let's set up your location for personalized disaster monitoring
          </p>
        </div>
      </div>

      {!showLocationModal && locationSetupComplete && (
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Setup Complete!
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Redirecting you to the app...
            </p>
            
            <button
              onClick={handleContinueToApp}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Continue to App
            </button>
          </div>
        </div>
      )}

      <LocationPermissionModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onLocationSet={handleLocationSet}
      />
    </div>
  );
};

export default LocationSetupPage;
