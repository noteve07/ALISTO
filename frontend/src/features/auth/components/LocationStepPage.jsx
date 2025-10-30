import React, { useState } from "react";
import { useLocation } from "../hooks/useLocation";

/**
 * Location step component that matches the signup page UI style
 * Designed to look like a continuation of the signup/login flow
 */
const LocationStepPage = ({ onLocationSet, onSkip }) => {
  const { loading, error, requestLocation, locationData, isUsingFallback } = useLocation();
  const [showDetails, setShowDetails] = useState(false);

  const handleEnableLocation = async () => {
    console.log("Requesting location permission...");
    
    const result = await requestLocation();
    console.log("Location result:", result);
    
    if (result.success && onLocationSet) {
      onLocationSet(result.data);
    }
  };

  const handleSkipLocation = () => {
    console.log("Skipping location setup");
    if (onSkip) {
      onSkip();
    }
  };

  // If location is already set, show success state
  if (locationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Location Enabled!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {isUsingFallback 
                ? "Using default location for your safety"
                : "Your location has been saved successfully"
              }
            </p>
          </div>
        </div>

        {/* Success Card */}
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
            {/* Success Icon */}
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 rounded-full mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Success Message */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isUsingFallback ? "Fallback Location Set" : "Location Successfully Enabled"}
              </h3>
              <p className="text-sm text-gray-600">
                {isUsingFallback 
                  ? "We're using Balanga City, Bataan as your default location for disaster monitoring."
                  : "ALISTO can now provide personalized disaster alerts for your area."
                }
              </p>
            </div>

            {/* Location Details Toggle */}
            {locationData && (
              <div className="mb-6">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="w-full text-sm text-primary hover:text-primary/80 underline"
                >
                  {showDetails ? "Hide" : "Show"} Location Details
                </button>

                {showDetails && (
                  <div className="mt-3 text-xs text-gray-600 bg-gray-50 p-3 rounded">
                    <p><strong>Latitude:</strong> {locationData.latitude.toFixed(6)}</p>
                    <p><strong>Longitude:</strong> {locationData.longitude.toFixed(6)}</p>
                    {locationData.accuracy && (
                      <p><strong>Accuracy:</strong> {Math.round(locationData.accuracy)}m</p>
                    )}
                    {isUsingFallback && locationData.fallbackReason && (
                      <p className="text-yellow-600 mt-2">
                        <strong>Note:</strong> {locationData.fallbackReason}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Continue Button */}
            <button
              onClick={() => onLocationSet && onLocationSet(locationData)}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              Continue to ALISTO
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main location permission UI
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Enable Location Services
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Help us provide personalized disaster monitoring for your area
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Form Card */}
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          {/* Location Icon */}
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-blue-100 rounded-full mb-6">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {error}
                  </h3>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600">
              ALISTO works better when we know your location. This helps us provide:
            </p>
            <ul className="mt-3 text-sm text-gray-600 text-left space-y-1">
              <li>• Personalized earthquake alerts</li>
              <li>• Local volcanic activity updates</li>
              <li>• Nearby emergency information</li>
              <li>• Community-specific advisories</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Enable Location Button */}
            <button
              onClick={handleEnableLocation}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                "Enable Location Services"
              )}
            </button>

            {/* Skip Button */}
            <button
              onClick={handleSkipLocation}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50"
            >
              Use Default Location (Balanga City)
            </button>
          </div>

          {/* Privacy Note */}
          <div className="mt-6">
            <p className="text-xs text-gray-400 text-center">
              Your location data is kept private and only used for disaster monitoring. 
              You can change this setting later in your profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationStepPage;
