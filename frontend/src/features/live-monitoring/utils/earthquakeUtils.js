/**
 * Utility functions for earthquake data processing
 */

/**
 * Format earthquake datetime for display
 * @param {string} datetime - ISO datetime string
 * @returns {string} Formatted datetime string
 */
export const formatEarthquakeDateTime = (datetime) => {
  return new Date(datetime).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

/**
 * Get magnitude color based on earthquake magnitude
 * @param {number} magnitude - Earthquake magnitude
 * @returns {string} Color hex code
 */
export const getMagnitudeColor = (magnitude) => {
  if (magnitude >= 7) return '#DC2626' // Deep red for major earthquakes
  if (magnitude >= 6) return '#EF4444' // Red for strong earthquakes
  if (magnitude >= 5) return '#F97316' // Orange for moderate earthquakes
  if (magnitude >= 4) return '#F59E0B' // Amber for light earthquakes
  if (magnitude >= 3) return '#EAB308' // Yellow for minor earthquakes
  if (magnitude >= 2.5) return '#84CC16' // Lime for micro earthquakes
  if (magnitude >= 2) return '#22C55E' // Green for very minor earthquakes
  if (magnitude >= 1.5) return '#16A34A' // Medium green
  if (magnitude >= 1) return '#22C55E' // Light-medium green
  return '#4ADE80' // Light green for very low magnitude
}


/**
 * Get magnitude-based opacity for earthquake markers
 * @param {number} magnitude - Earthquake magnitude
 * @returns {number} Opacity value between 0.2 and 0.8
 */
export const getMagnitudeOpacity = (magnitude) => {
  // Higher magnitude = higher opacity, lower magnitude = lower opacity
  const baseOpacity = Math.max(magnitude * 0.15, 0.2)
  return Math.min(baseOpacity, 0.8)
}

/**
 * Calculate earthquake radius for map display based on magnitude
 * @param {number} magnitude - Earthquake magnitude
 * @returns {number} Radius in meters
 */
export const calculateEarthquakeRadius = (magnitude) => {
  // Smaller base radius with minimum size for visibility
  const baseRadius = Math.max(magnitude * 6000, 4000)
  // Lower maximum radius cap to prevent overly large circles
  return Math.min(baseRadius, 50000)
}

/**
 * Check if earthquake is recent (within last hour)
 * @param {string} datetime - ISO datetime string
 * @returns {boolean} True if earthquake is recent
 */
export const isRecentEarthquake = (datetime) => {
  const oneHourAgo = Date.now() - (60 * 60 * 1000)
  return new Date(datetime).getTime() > oneHourAgo
}

/**
 * Sort earthquakes by datetime (newest first)
 * @param {Array} earthquakes - Array of earthquake objects
 * @returns {Array} Sorted array of earthquakes
 */
export const sortEarthquakesByTime = (earthquakes) => {
  return earthquakes.sort((a, b) => {
    const timeA = new Date(a.datetime || a.dateTime).getTime()
    const timeB = new Date(b.datetime || b.dateTime).getTime()
    return timeB - timeA
  })
}

/**
 * Filter earthquakes by magnitude threshold
 * @param {Array} earthquakes - Array of earthquake objects
 * @param {number} minMagnitude - Minimum magnitude threshold
 * @returns {Array} Filtered array of earthquakes
 */
export const filterEarthquakesByMagnitude = (earthquakes, minMagnitude = 0) => {
  return earthquakes.filter(eq => eq.magnitude >= minMagnitude)
}

/**
 * Get earthquake statistics
 * @param {Array} earthquakes - Array of earthquake objects
 * @returns {Object} Statistics object
 */
export const getEarthquakeStats = (earthquakes) => {
  if (!earthquakes.length) {
    return {
      total: 0,
      maxMagnitude: 0,
      avgMagnitude: 0,
      recentCount: 0
    }
  }

  const magnitudes = earthquakes.map(eq => eq.magnitude)
  const maxMagnitude = Math.max(...magnitudes)
  const avgMagnitude = magnitudes.reduce((sum, mag) => sum + mag, 0) / magnitudes.length
  const recentCount = earthquakes.filter(eq => 
    isRecentEarthquake(eq.datetime || eq.dateTime)
  ).length

  return {
    total: earthquakes.length,
    maxMagnitude: Math.round(maxMagnitude * 10) / 10,
    avgMagnitude: Math.round(avgMagnitude * 10) / 10,
    recentCount
  }
}
