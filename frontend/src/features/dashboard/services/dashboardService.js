const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000"
).replace(/\/$/, "");

export const dashboardService = {
  /**
   * Fetch dashboard data based on user location
   * @param {number} lat - User's latitude
   * @param {number} lon - User's longitude
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  getDashboardData: async (lat, lon) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/dashboard?lat=${lat}&lon=${lon}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.detail || `HTTP error! status: ${response.status}`,
        };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch dashboard data",
      };
    }
  },
};
