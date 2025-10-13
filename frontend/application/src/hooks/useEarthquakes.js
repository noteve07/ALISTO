import { useState, useEffect, useCallback } from 'react';
import { apiService, transformEarthquakeData, getDashboardStats } from '../services/api';
import { wsService } from '../services/websocket';
import { notificationService } from '../services/notifications';

export const useEarthquakes = (limit = 10, autoRefresh = true) => {
  const [earthquakes, setEarthquakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [stats, setStats] = useState({
    totalToday: 0,
    strongestMagnitude: 0,
    averageMagnitude: 0,
    nearbyEvents: 0
  });

  const fetchEarthquakes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getLiveEarthquakes(limit);
      const transformedData = transformEarthquakeData(response);
      
      // Check for new earthquakes that need notifications
      if (earthquakes.length > 0) {
        const newEarthquakes = transformedData.filter(newEq => 
          !earthquakes.some(existingEq => existingEq.id === newEq.id)
        );
        
        // Send notifications for new significant earthquakes
        newEarthquakes.forEach(earthquake => {
          notificationService.sendEarthquakeAlert(earthquake);
        });
      }
      
      setEarthquakes(transformedData);
      setLastUpdated(new Date());
      
      // Calculate dashboard stats
      const dashboardStats = getDashboardStats(transformedData);
      setStats(dashboardStats);
      
    } catch (err) {
      console.error('Failed to fetch earthquakes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  // Initial fetch
  useEffect(() => {
    fetchEarthquakes();
  }, [fetchEarthquakes]);

  // Auto-refresh every 5 minutes (fallback if WebSocket fails)
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchEarthquakes();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchEarthquakes, autoRefresh]);

  // WebSocket real-time updates
  useEffect(() => {
    if (!autoRefresh) return;

    const handleWebSocketUpdate = (data) => {
      // Transform and add new earthquake data
      if (data && data.earthquakes) {
        const newEarthquakes = transformEarthquakeData({ data: data.earthquakes });
        setEarthquakes(prev => {
          // Merge with existing data, avoiding duplicates
          const existingIds = new Set(prev.map(eq => eq.id));
          const uniqueNew = newEarthquakes.filter(eq => !existingIds.has(eq.id));
          return [...uniqueNew, ...prev].slice(0, limit);
        });
        
        // Update stats
        const updatedStats = getDashboardStats([...newEarthquakes, ...earthquakes]);
        setStats(updatedStats);
        setLastUpdated(new Date());
      }
    };

    const handleWebSocketError = () => {
      // Fallback to polling if WebSocket fails
      console.log('WebSocket failed, falling back to polling');
    };

    wsService.on('earthquake_update', handleWebSocketUpdate);
    wsService.on('error', handleWebSocketError);
    wsService.connect();

    return () => {
      wsService.off('earthquake_update', handleWebSocketUpdate);
      wsService.off('error', handleWebSocketError);
    };
  }, [autoRefresh, limit, earthquakes]);

  const refresh = useCallback(() => {
    fetchEarthquakes();
  }, [fetchEarthquakes]);

  return {
    earthquakes,
    loading,
    error,
    lastUpdated,
    stats,
    refresh
  };
};

export const useEarthquakeStats = () => {
  const [stats, setStats] = useState({
    totalToday: 0,
    strongestMagnitude: 0,
    averageMagnitude: 0,
    nearbyEvents: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiService.getLiveEarthquakes(50);
        const transformedData = transformEarthquakeData(response);
        const dashboardStats = getDashboardStats(transformedData);
        setStats(dashboardStats);
      } catch (error) {
        console.error('Failed to fetch earthquake stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading };
};
