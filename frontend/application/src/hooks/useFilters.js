import { useState, useMemo, useCallback } from 'react';

export const useFilters = (earthquakes) => {
  const [filters, setFilters] = useState({
    search: '',
    magnitude: { min: 0, max: 10 },
    depth: { min: 0, max: 700 },
    dateRange: { start: null, end: null },
    location: '',
    sortBy: 'time',
    sortOrder: 'desc'
  });

  // Apply filters to earthquakes
  const filteredEarthquakes = useMemo(() => {
    if (!earthquakes || earthquakes.length === 0) return [];

    let filtered = [...earthquakes];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(eq => 
        eq.place.toLowerCase().includes(searchTerm) ||
        eq.mag.toString().includes(searchTerm) ||
        eq.depth.toString().includes(searchTerm)
      );
    }

    // Magnitude filter
    filtered = filtered.filter(eq => 
      eq.mag >= filters.magnitude.min && eq.mag <= filters.magnitude.max
    );

    // Depth filter
    filtered = filtered.filter(eq => 
      eq.depth >= filters.depth.min && eq.depth <= filters.depth.max
    );

    // Date range filter
    if (filters.dateRange.start) {
      filtered = filtered.filter(eq => 
        new Date(eq.time) >= new Date(filters.dateRange.start)
      );
    }
    if (filters.dateRange.end) {
      filtered = filtered.filter(eq => 
        new Date(eq.time) <= new Date(filters.dateRange.end)
      );
    }

    // Location filter
    if (filters.location) {
      const locationTerm = filters.location.toLowerCase();
      filtered = filtered.filter(eq => 
        eq.place.toLowerCase().includes(locationTerm)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'magnitude':
          aValue = a.mag;
          bValue = b.mag;
          break;
        case 'depth':
          aValue = a.depth;
          bValue = b.depth;
          break;
        case 'location':
          aValue = a.place;
          bValue = b.place;
          break;
        case 'time':
        default:
          aValue = new Date(a.time);
          bValue = new Date(b.time);
          break;
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [earthquakes, filters]);

  // Update filter
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      magnitude: { min: 0, max: 10 },
      depth: { min: 0, max: 700 },
      dateRange: { start: null, end: null },
      location: '',
      sortBy: 'time',
      sortOrder: 'desc'
    });
  }, []);

  // Get filter summary
  const getFilterSummary = useCallback(() => {
    const activeFilters = [];
    
    if (filters.search) activeFilters.push(`Search: "${filters.search}"`);
    if (filters.magnitude.min > 0 || filters.magnitude.max < 10) {
      activeFilters.push(`Magnitude: ${filters.magnitude.min}-${filters.magnitude.max}`);
    }
    if (filters.depth.min > 0 || filters.depth.max < 700) {
      activeFilters.push(`Depth: ${filters.depth.min}-${filters.depth.max}km`);
    }
    if (filters.dateRange.start || filters.dateRange.end) {
      const start = filters.dateRange.start ? new Date(filters.dateRange.start).toLocaleDateString() : 'Any';
      const end = filters.dateRange.end ? new Date(filters.dateRange.end).toLocaleDateString() : 'Any';
      activeFilters.push(`Date: ${start} - ${end}`);
    }
    if (filters.location) activeFilters.push(`Location: "${filters.location}"`);
    
    return activeFilters;
  }, [filters]);

  // Get statistics for filtered data
  const getFilterStats = useCallback(() => {
    if (filteredEarthquakes.length === 0) {
      return {
        total: 0,
        averageMagnitude: 0,
        strongestMagnitude: 0,
        averageDepth: 0,
        locations: []
      };
    }

    const magnitudes = filteredEarthquakes.map(eq => eq.mag);
    const depths = filteredEarthquakes.map(eq => eq.depth);
    const locations = [...new Set(filteredEarthquakes.map(eq => eq.place.split(',')[0]))];

    return {
      total: filteredEarthquakes.length,
      averageMagnitude: magnitudes.reduce((sum, mag) => sum + mag, 0) / magnitudes.length,
      strongestMagnitude: Math.max(...magnitudes),
      averageDepth: depths.reduce((sum, depth) => sum + depth, 0) / depths.length,
      locations: locations.slice(0, 10) // Top 10 locations
    };
  }, [filteredEarthquakes]);

  return {
    filters,
    filteredEarthquakes,
    updateFilter,
    resetFilters,
    getFilterSummary,
    getFilterStats
  };
};
