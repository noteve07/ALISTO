import { supabase } from "@/lib/supabaseClient";

// Get the base URL for the backend API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const userService = {
  /**
   * Update user profile with first name and last name
   * @param {string} firstName - User's first name
   * @param {string} lastName - User's last name  
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  updateProfile: async (firstName, lastName) => {
    try {
      // Get current session to get the JWT token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        return { success: false, error: "User not authenticated" };
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/users/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          firstName,
          lastName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.detail || `HTTP error! status: ${response.status}` 
        };
      }

      const data = await response.json();
      return { success: true, data };

    } catch (error) {
      console.error("Error updating user profile:", error);
      return { 
        success: false, 
        error: error.message || "Failed to update user profile" 
      };
    }
  },

  /**
   * Get user profile
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  getProfile: async () => {
    try {
      // Get current session to get the JWT token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        return { success: false, error: "User not authenticated" };
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/users/profile`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.detail || `HTTP error! status: ${response.status}` 
        };
      }

      const data = await response.json();
      return { success: true, data };

    } catch (error) {
      console.error("Error getting user profile:", error);
      return { 
        success: false, 
        error: error.message || "Failed to get user profile" 
      };
    }
  },

  /**
   * Update user location
   * @param {number} latitude - User's latitude
   * @param {number} longitude - User's longitude
   * @param {boolean} locationEnabled - Whether location services are enabled
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  updateLocation: async (latitude, longitude, locationEnabled = true) => {
    try {
      // Get current session to get the JWT token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        return { success: false, error: "User not authenticated" };
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/users/location`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          user_lat: latitude,
          user_lon: longitude,
          location_enabled: locationEnabled,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.detail || `HTTP error! status: ${response.status}` 
        };
      }

      const data = await response.json();
      return { success: true, data };

    } catch (error) {
      console.error("Error updating user location:", error);
      return { 
        success: false, 
        error: error.message || "Failed to update user location" 
      };
    }
  },

  /**
   * Get location information for coordinates
   * @param {number} latitude - Latitude coordinate
   * @param {number} longitude - Longitude coordinate
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  getLocationInfo: async (latitude, longitude) => {
    try {
      // Get current session to get the JWT token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        return { success: false, error: "User not authenticated" };
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/users/location/${latitude}/${longitude}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.detail || `HTTP error! status: ${response.status}` 
        };
      }

      const data = await response.json();
      return { success: true, data };

    } catch (error) {
      console.error("Error getting location info:", error);
      return { 
        success: false, 
        error: error.message || "Failed to get location info" 
      };
    }
  },
};
