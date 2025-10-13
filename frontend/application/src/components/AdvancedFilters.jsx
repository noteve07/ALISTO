import React, { useState } from 'react';
import { useFilters } from '../hooks/useFilters';

export const AdvancedFilters = ({ earthquakes, onFilteredData }) => {
  const {
    filters,
    filteredEarthquakes,
    updateFilter,
    resetFilters,
    getFilterSummary,
    getFilterStats
  } = useFilters(earthquakes);

  const [isExpanded, setIsExpanded] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // Notify parent component of filtered data
  React.useEffect(() => {
    if (onFilteredData) {
      onFilteredData(filteredEarthquakes);
    }
  }, [filteredEarthquakes, onFilteredData]);

  const filterSummary = getFilterSummary();
  const filterStats = getFilterStats();

  return (
    <div className="card" style={{ padding: '16px' }}>
      <div className="card-header">
        <h3 className="card-title accent">Advanced Filters</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowStats(!showStats)}
            className="btn"
            style={{ fontSize: '12px' }}
          >
            {showStats ? 'Hide Stats' : 'Show Stats'}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn"
            style={{ fontSize: '12px' }}
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      {/* Quick Search */}
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Search earthquakes, locations, magnitudes..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="input"
          style={{ width: '100%' }}
        />
      </div>

      {/* Filter Summary */}
      {filterSummary.length > 0 && (
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '8px', 
          marginBottom: '16px',
          padding: '8px',
          background: '#F8FAFC',
          borderRadius: '8px'
        }}>
          {filterSummary.map((filter, index) => (
            <span key={index} className="badge primary" style={{ fontSize: '12px' }}>
              {filter}
            </span>
          ))}
          <button
            onClick={resetFilters}
            className="btn"
            style={{ fontSize: '12px', padding: '4px 8px' }}
          >
            Clear All
          </button>
        </div>
      )}

      {/* Expanded Filters */}
      {isExpanded && (
        <div style={{ display: 'grid', gap: '16px', marginBottom: '16px' }}>
          {/* Magnitude Range */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
              Magnitude Range: {filters.magnitude.min} - {filters.magnitude.max}
            </label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={filters.magnitude.min}
                onChange={(e) => updateFilter('magnitude', { 
                  ...filters.magnitude, 
                  min: parseFloat(e.target.value) 
                })}
                style={{ flex: 1 }}
              />
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={filters.magnitude.max}
                onChange={(e) => updateFilter('magnitude', { 
                  ...filters.magnitude, 
                  max: parseFloat(e.target.value) 
                })}
                style={{ flex: 1 }}
              />
            </div>
          </div>

          {/* Depth Range */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
              Depth Range: {filters.depth.min} - {filters.depth.max} km
            </label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input
                type="range"
                min="0"
                max="700"
                step="10"
                value={filters.depth.min}
                onChange={(e) => updateFilter('depth', { 
                  ...filters.depth, 
                  min: parseInt(e.target.value) 
                })}
                style={{ flex: 1 }}
              />
              <input
                type="range"
                min="0"
                max="700"
                step="10"
                value={filters.depth.max}
                onChange={(e) => updateFilter('depth', { 
                  ...filters.depth, 
                  max: parseInt(e.target.value) 
                })}
                style={{ flex: 1 }}
              />
            </div>
          </div>

          {/* Date Range */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                Start Date
              </label>
              <input
                type="date"
                value={filters.dateRange.start || ''}
                onChange={(e) => updateFilter('dateRange', { 
                  ...filters.dateRange, 
                  start: e.target.value 
                })}
                className="input"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                End Date
              </label>
              <input
                type="date"
                value={filters.dateRange.end || ''}
                onChange={(e) => updateFilter('dateRange', { 
                  ...filters.dateRange, 
                  end: e.target.value 
                })}
                className="input"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Location Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
              Location
            </label>
            <input
              type="text"
              placeholder="Filter by specific location..."
              value={filters.location}
              onChange={(e) => updateFilter('location', e.target.value)}
              className="input"
              style={{ width: '100%' }}
            />
          </div>

          {/* Sort Options */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
                className="input"
                style={{ width: '100%' }}
              >
                <option value="time">Time</option>
                <option value="magnitude">Magnitude</option>
                <option value="depth">Depth</option>
                <option value="location">Location</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                Order
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) => updateFilter('sortOrder', e.target.value)}
                className="input"
                style={{ width: '100%' }}
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Filter Statistics */}
      {showStats && (
        <div style={{ 
          padding: '16px', 
          background: '#F8FAFC', 
          borderRadius: '8px',
          border: '1px solid #E2E8F0'
        }}>
          <h4 style={{ marginBottom: '12px', fontWeight: 600 }}>Filter Results</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary)' }}>
                {filterStats.total}
              </div>
              <div className="muted" style={{ fontSize: '12px' }}>Total Events</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--danger)' }}>
                {filterStats.strongestMagnitude.toFixed(1)}
              </div>
              <div className="muted" style={{ fontSize: '12px' }}>Strongest</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent)' }}>
                {filterStats.averageMagnitude.toFixed(1)}
              </div>
              <div className="muted" style={{ fontSize: '12px' }}>Avg Magnitude</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--info)' }}>
                {filterStats.averageDepth.toFixed(0)}
              </div>
              <div className="muted" style={{ fontSize: '12px' }}>Avg Depth (km)</div>
            </div>
          </div>
          {filterStats.locations.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>
                Top Locations:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {filterStats.locations.map((location, index) => (
                  <span key={index} className="badge" style={{ fontSize: '11px' }}>
                    {location}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results Count */}
      <div style={{ 
        marginTop: '16px', 
        padding: '8px 12px', 
        background: 'var(--primary)', 
        color: 'white', 
        borderRadius: '6px',
        textAlign: 'center',
        fontSize: '14px',
        fontWeight: 600
      }}>
        Showing {filteredEarthquakes.length} of {earthquakes?.length || 0} earthquakes
      </div>
    </div>
  );
};
