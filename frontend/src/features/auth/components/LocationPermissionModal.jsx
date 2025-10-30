import React, { useState } from "react";
import { useLocation } from "../hooks/useLocation";

/**
 * Modal component for requesting location permission after signup/login
 */
const LocationPermissionModal = ({ isOpen, onClose, onLocationSet }) => {
  const { loading, error, requestLocation, locationData, isUsingFallback } = useLocation();
  const [showDetails, setShowDetails] = useState(false);

  if (!isOpen) return null;

  const handleRequestLocation = async () => {
    console.log("handleRequestLocation called"); // Debug log
    
    // Test direct browser geolocation API
    console.log("Testing direct geolocation API...");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Direct geolocation success:", position.coords);
        },
        (error) => {
          console.log("Direct geolocation error:", error);
        }
      );
    } else {
      console.log("Geolocation not supported");
    }
    
    const result = await requestLocation();
    
    console.log("Location request result:", result); // Debug log
    
    if (result.success) {
      // Call parent callback with location data
      if (onLocationSet) {
        onLocationSet(result.data);
      }
      
      // Auto-close modal after successful location set
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  const handleSkip = () => {
    // Use fallback location
    handleRequestLocation(); // This will use fallback if permission is denied
  };

  const handleContinue = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>

          <h3 className="text-lg font-medium text-gray-900 text-center mb-4">
            Enable Location Services
          </h3>

          {!locationData && (
            <>
              <p className="text-sm text-gray-500 text-center mb-6">
                ALISTO works better when we know your location. This helps us provide personalized disaster monitoring and alerts for your area.
              </p>

              {error && (
                <div className="rounded-md bg-red-50 p-4 mb-4">
                  <div className="text-sm text-red-800">
                    {error}
                  </div>
                </div>
              )}

              <div className="flex flex-col space-y-3">
                <button
                  onClick={handleRequestLocation}
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Getting Location...
                    </>
                  ) : (
                    "Enable Location"
                  )}
                </button>

                <button
                  onClick={handleSkip}
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Skip for Now
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center mt-4">
                Don't worry - you can change this setting later in your profile.
              </p>
            </>
          )}

          {locationData && (
            <div className="text-center">
              <div className="rounded-md bg-green-50 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Location {isUsingFallback ? "Set (Fallback)" : "Enabled"}!
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>
                        {isUsingFallback 
                          ? "Using default location (Balanga City, Bataan) for your safety."
                          : "Your location has been saved successfully."
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {locationData && (
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-blue-600 hover:text-blue-800 underline mb-4"
                >
                  {showDetails ? "Hide" : "Show"} Details
                </button>
              )}

              {showDetails && locationData && (
                <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded mb-4">
                  <p><strong>Latitude:</strong> {locationData.latitude.toFixed(6)}</p>
                  <p><strong>Longitude:</strong> {locationData.longitude.toFixed(6)}</p>
                  {locationData.accuracy && (
                    <p><strong>Accuracy:</strong> {Math.round(locationData.accuracy)}m</p>
                  )}
                  {isUsingFallback && (
                    <p className="text-yellow-600 mt-2">
                      <strong>Note:</strong> {locationData.fallbackReason || "Using fallback location"}
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={handleContinue}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Continue to App
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationPermissionModal;
