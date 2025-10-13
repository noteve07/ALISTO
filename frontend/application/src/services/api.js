// API service for connecting to ALISTO backend
const API_BASE_URL = 'http://localhost:8000/api/v1';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Earthquake endpoints
  async getLiveEarthquakes(limit = 10) {
    return this.request(`/earthquakes/live?last=${limit}`);
  }

  async testEarthquakeScraping() {
    return this.request('/earthquakes/test');
  }

  // Health check
  async getHealth() {
    return this.request('/health');
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();

// Helper functions for specific data transformations
export const transformEarthquakeData = (apiData) => {
  if (!apiData || !apiData.data) return [];
  
  return apiData.data.map((eq, index) => ({
    id: index + 1,
    lat: parseFloat(eq.latitude) || 0,
    lng: parseFloat(eq.longitude) || 0,
    mag: parseFloat(eq.magnitude) || 0,
    depth: parseFloat(eq.depth) || 0,
    place: eq.location || 'Unknown location',
    time: eq.date_time || new Date().toISOString(),
    source: 'DOST-PHIVOLCS'
  }));
};

export const getDashboardStats = (earthquakes) => {
  if (!earthquakes || earthquakes.length === 0) {
    return {
      totalToday: 0,
      strongestMagnitude: 0,
      averageMagnitude: 0,
      nearbyEvents: 0
    };
  }

  const today = new Date().toDateString();
  const todayEvents = earthquakes.filter(eq => 
    new Date(eq.time).toDateString() === today
  );

  const magnitudes = earthquakes.map(eq => eq.mag).filter(mag => mag > 0);
  const strongestMagnitude = Math.max(...magnitudes, 0);
  const averageMagnitude = magnitudes.length > 0 
    ? magnitudes.reduce((sum, mag) => sum + mag, 0) / magnitudes.length 
    : 0;

  // Mock nearby events (within 50km of Manila)
  const manilaLat = 14.5995;
  const manilaLng = 120.9842;
  const nearbyEvents = earthquakes.filter(eq => {
    const distance = calculateDistance(manilaLat, manilaLng, eq.lat, eq.lng);
    return distance <= 50;
  }).length;

  return {
    totalToday: todayEvents.length,
    strongestMagnitude: strongestMagnitude,
    averageMagnitude: parseFloat(averageMagnitude.toFixed(1)),
    nearbyEvents: nearbyEvents
  };
};

// Helper function to calculate distance between two points
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};
