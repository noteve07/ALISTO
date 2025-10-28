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
  if (magnitude >= 5) return '#B91C1C' // Deep red for high magnitude
  if (magnitude >= 4) return '#EA580C' // Vibrant orange for medium-high magnitude
  if (magnitude >= 3) return '#FACC15' // Warm yellow for medium magnitude
  if (magnitude >= 2) return '#10B981' // Green for low-medium magnitude
  return '#6B7280' // Gray for very low magnitude
}

/**
 * Get magnitude description based on earthquake magnitude
 * @param {number} magnitude - Earthquake magnitude
 * @returns {string} Magnitude description
 */
export const getMagnitudeDescription = (magnitude) => {
  if (magnitude >= 7) return 'Major'
  if (magnitude >= 6) return 'Strong'
  if (magnitude >= 5) return 'Moderate'
  if (magnitude >= 4) return 'Light'
  if (magnitude >= 3) return 'Minor'
  if (magnitude >= 2) return 'Micro'
  return 'Very Minor'
}

/**
 * Calculate earthquake radius for map display based on magnitude
 * @param {number} magnitude - Earthquake magnitude
 * @returns {number} Radius in meters
 */
export const calculateEarthquakeRadius = (magnitude) => {
  return magnitude * 2500
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
