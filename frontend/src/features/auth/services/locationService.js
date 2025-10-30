// Fallback location: Balanga City, Bataan coordinates
const FALLBACK_LOCATION = {
  latitude: 14.6760,
  longitude: 120.5361,
  city: "Balanga City",
  province: "Bataan"
};

export const locationService = {
  /**
   * Request user's current location
   * @returns {Promise<{success: boolean, data?: {latitude: number, longitude: number}, error?: string}>}
   */
  getCurrentLocation: () => {
    return new Promise((resolve) => {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        console.warn("Geolocation is not supported by this browser. Using fallback location.");
        resolve({
          success: true,
          data: {
            latitude: FALLBACK_LOCATION.latitude,
            longitude: FALLBACK_LOCATION.longitude,
            isFallback: true,
            fallbackReason: "Geolocation not supported"
          }
        });
        return;
      }

      const options = {
        enableHighAccuracy: true, // Use GPS if available
        timeout: 10000, // 10 seconds timeout
        maximumAge: 300000 // Cache location for 5 minutes
      };

      navigator.geolocation.getCurrentPosition(
        // Success callback
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Location obtained:", { latitude, longitude });
          
          resolve({
            success: true,
            data: {
              latitude,
              longitude,
              accuracy: position.coords.accuracy,
              isFallback: false
            }
          });
        },
        // Error callback
        (error) => {
          console.warn("Geolocation error:", error.message);
          
          let fallbackReason = "Unknown error";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              fallbackReason = "Location permission denied";
              break;
            case error.POSITION_UNAVAILABLE:
              fallbackReason = "Location information unavailable";
              break;
            case error.TIMEOUT:
              fallbackReason = "Location request timed out";
              break;
          }

          // Always return fallback location on error
          resolve({
            success: true,
            data: {
              latitude: FALLBACK_LOCATION.latitude,
              longitude: FALLBACK_LOCATION.longitude,
              isFallback: true,
              fallbackReason
            }
          });
        },
        options
      );
    });
  },

  /**
   * Request location permission (calls getCurrentLocation internally)
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  requestLocationPermission: async () => {
    try {
      const result = await locationService.getCurrentLocation();
      return result;
    } catch (error) {
      console.error("Error requesting location:", error);
      return {
        success: true, // Still success because we provide fallback
        data: {
          latitude: FALLBACK_LOCATION.latitude,
          longitude: FALLBACK_LOCATION.longitude,
          isFallback: true,
          fallbackReason: error.message || "Unknown error"
        }
      };
    }
  },

  /**
   * Get fallback location data
   * @returns {{latitude: number, longitude: number, city: string, province: string}}
   */
  getFallbackLocation: () => {
    return { ...FALLBACK_LOCATION };
  }
};
