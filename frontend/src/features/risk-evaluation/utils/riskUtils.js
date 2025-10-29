export const RISK_LEVELS = {
  low: {
    label: 'Low',
    color: '#4ade80'
  },
  medium: {
    label: 'Medium',
    color: '#fbbf24'
  },
  high: {
    label: 'High',
    color: '#f87171'
  },
  unknown: {
    label: 'Unknown',
    color: '#94a3b8'
  }
}

export const getRiskLevelKey = (level) => {
  if (!level) return 'unknown'
  const normalized = level.toLowerCase()

  if (normalized.includes('high')) return 'high'
  if (normalized.includes('medium')) return 'medium'
  if (normalized.includes('low')) return 'low'

  return 'unknown'
}

export const getRiskColor = (level) => {
  const key = getRiskLevelKey(level)

  if (key === 'unknown') {
    return RISK_LEVELS.unknown.color
  }

  return RISK_LEVELS[key].color
}

export const formatRiskScore = (score) => {
  if (score === null || score === undefined || Number.isNaN(score)) {
    return 'N/A'
  }

  return `${(Number(score) * 100).toFixed(1)}%`
}

export const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A'

  try {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  } catch (error) {
    console.error('Failed to format risk timestamp', error)
    return 'N/A'
  }
}


