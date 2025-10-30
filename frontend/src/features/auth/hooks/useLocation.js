import { useState, useEffect } from "react";
import { locationService } from "../services/locationService";
import { userService } from "../services/userService";

/**
 * Custom hook for handling user location functionality
 * @param {boolean} autoRequest - Whether to automatically request location on mount
 */
export const useLocation = (autoRequest = false) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState(null);

  /**
   * Request location permission and get coordinates
   */
  const requestLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get location using locationService
      const locationResult = await locationService.requestLocationPermission();

      if (locationResult.success) {
        const coords = locationResult.data;
        setLocationData(coords);

        // Determine permission status
        if (coords.isFallback) {
          setPermissionStatus("denied");
        } else {
          setPermissionStatus("granted");
        }

        // Update user location in backend
        const updateResult = await userService.updateLocation(
          coords.latitude,
          coords.longitude,
          !coords.isFallback // location_enabled = true if not fallback
        );

        if (updateResult.success) {
          console.log("Location updated successfully:", updateResult.data);
          return {
            success: true,
            data: {
              coordinates: coords,
              profile: updateResult.data,
              isFallback: coords.isFallback
            }
          };
        } else {
          console.warn("Failed to update location in backend:", updateResult.error);
          // Still return success since we got the location
          return {
            success: true,
            data: {
              coordinates: coords,
              profile: null,
              isFallback: coords.isFallback,
              updateError: updateResult.error
            }
          };
        }
      } else {
        setError(locationResult.error || "Failed to get location");
        setPermissionStatus("denied");
        return { success: false, error: locationResult.error };
      }
    } catch (err) {
      const errorMessage = err.message || "An unexpected error occurred";
      setError(errorMessage);
      setPermissionStatus("denied");
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset location state
   */
  const resetLocation = () => {
    setLocationData(null);
    setError(null);
    setPermissionStatus(null);
  };

  /**
   * Get location info for current coordinates
   */
  const getLocationInfo = async () => {
    if (!locationData) {
      return { success: false, error: "No location data available" };
    }

    try {
      const result = await userService.getLocationInfo(
        locationData.latitude,
        locationData.longitude
      );
      return result;
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Auto-request location on mount if specified
  useEffect(() => {
    if (autoRequest) {
      requestLocation();
    }
  }, [autoRequest]);

  return {
    // State
    loading,
    error,
    locationData,
    permissionStatus,
    
    // Actions
    requestLocation,
    resetLocation,
    getLocationInfo,
    
    // Computed
    hasLocation: !!locationData,
    isUsingFallback: locationData?.isFallback || false,
    coordinates: locationData ? {
      latitude: locationData.latitude,
      longitude: locationData.longitude
    } : null
  };
};
