import { useState, useEffect, useCallback } from 'react';

// Volcano ID to name mapping based on volcanoes_id.json
const VOLCANO_NAMES = {
  1: "Babuyan Claro",
  2: "Banahaw", 
  3: "Biliran (Anas)",
  4: "Bud Dajo",
  5: "Bulusan",
  6: "Cabalian",
  7: "Cagua",
  8: "Camiguin de Babuyanes",
  9: "Didicas",
  10: "Hibok-hibok",
  11: "Iraya",
  12: "Iriga",
  13: "Isarog",
  14: "Kanlaon",
  15: "Leonard Kniaseff",
  16: "Makaturing",
  17: "Matutum",
  18: "Mayon",
  19: "Musuan (Calayo)",
  20: "Parker",
  21: "Pinatubo",
  22: "Ragang",
  23: "Smith",
  24: "Taal"
};

// Volcano locations (you can expand this mapping)
const VOLCANO_LOCATIONS = {
  14: "Negros Island",
  5: "Sorsogon",
  18: "Albay", 
  24: "Batangas",
  21: "Zambales",
  22: "Lanao del Sur"
};

const useVolcanicAdvisories = () => {
  const [advisories, setAdvisories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatLastUpdate = (dateString) => {
    try {
      const updateDate = new Date(dateString);
      const now = new Date();
      const diffMs = now - updateDate;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffHours < 1) {
        return "Just updated";
      } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      } else {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      }
    } catch {
      return "Unknown";
    }
  };

  const fetchAdvisories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/v1/volcanoes/advisories?include_zero_alerts=false');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Transform the data to match our component structure
        const transformedData = result.data.map(item => ({
          id: item.volcano_id,
          volcano: VOLCANO_NAMES[item.volcano_id] || `Volcano ${item.volcano_id}`,
          location: VOLCANO_LOCATIONS[item.volcano_id] || "Unknown location",
          alertLevel: item.alert_level,
          status: item.alert_status,
          lastUpdate: formatLastUpdate(item.updated_at),
          issuanceDate: item.issuance_date,
          bulletinLink: item.bulletin_link
        }));
        
        setAdvisories(transformedData);
        setError(null);
      } else {
        throw new Error('Failed to fetch volcanic advisories');
      }
    } catch (err) {
      console.error('Error fetching volcanic advisories:', err);
      setError(err.message);
      // Fallback to empty array on error
      setAdvisories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdvisories();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchAdvisories, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchAdvisories]);

  return {
    advisories,
    loading,
    error,
    refetch: fetchAdvisories
  };
};

export default useVolcanicAdvisories;