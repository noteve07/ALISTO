import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import useRealtimeEarthquakes from './useRealtimeEarthquakes'

const useEarthquakeData = (timeFilter = '24h') => {
  const [earthquakeData, setEarthquakeData] = useState([])
  const [loading, setLoading] = useState(true)

  // Format earthquake data to match the existing component structure
  const formatEarthquake = useCallback((eq) => ({
    id: eq.eq_id,
    latitude: eq.latitude,
    longitude: eq.longitude,
    magnitude: eq.magnitude,
    depth: eq.depth,
    location: eq.location,
    dateTime: new Date(eq.datetime).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }),
    timestamp: new Date(eq.datetime).getTime()
  }), [])

  // Initial data fetch
  useEffect(() => {
    let active = true

    const fetchInitialData = async () => {
      try {
        setLoading(true)
        
        // Calculate time range based on filter (default: fetch 30 days)
        const timeRanges = {
          '24h': 1 * 24 * 60 * 60 * 1000,
          '7d': 7 * 24 * 60 * 60 * 1000,
          '30d': 30 * 24 * 60 * 60 * 1000
        }
        
        // Always fetch 30 days of data from database
        const fetchRange = timeRanges['30d']
        
        // Fetch latest earthquakes from last 30 days, ordered by datetime desc
        const { data, error } = await supabase
          .from('latest_earthquakes')
          .select('*')
          .gte('datetime', new Date(Date.now() - fetchRange).toISOString())
          .order('datetime', { ascending: false })

        if (error) {
          throw error
        }

        if (active && data) {
          const formatted = data.map(formatEarthquake)
          setEarthquakeData(formatted)
        }
      } catch (err) {
        console.error('Error fetching earthquake data:', err)
        
        // Fallback data in case of error
        if (active) {
          const fallback = [
            { 
              eq_id: 'fallback-1', 
              latitude: 11.05, 
              longitude: 124.08, 
              magnitude: 2.0, 
              depth: 29, 
              location: '010km N 88° E of City Of Bogo (Cebu)', 
              datetime: new Date(Date.now() - 60000).toISOString()
            },
            { 
              eq_id: 'fallback-2', 
              latitude: 10.98, 
              longitude: 123.93, 
              magnitude: 2.7, 
              depth: 7, 
              location: '009km S 35° W of City Of Bogo (Cebu)', 
              datetime: new Date(Date.now() - 120000).toISOString()
            },
          ]
          const formatted = fallback.map(formatEarthquake)
          setEarthquakeData(formatted)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    fetchInitialData()
    return () => { active = false }
  }, [formatEarthquake, timeFilter])

  // Real-time subscription handlers
  const handleInsert = useCallback((newEarthquake) => {
    const formatted = formatEarthquake(newEarthquake)
    setEarthquakeData(prev => {
      // Add new earthquake and keep sorted by timestamp (newest first)
      const updated = [formatted, ...prev]
        .sort((a, b) => b.timestamp - a.timestamp)
      return updated
    })
  }, [formatEarthquake])

  const handleUpdate = useCallback((updatedEarthquake) => {
    const formatted = formatEarthquake(updatedEarthquake)
    setEarthquakeData(prev => 
      prev.map(eq => eq.id === formatted.id ? formatted : eq)
        .sort((a, b) => b.timestamp - a.timestamp)
    )
  }, [formatEarthquake])

  const handleDelete = useCallback((deletedEarthquake) => {
    setEarthquakeData(prev => 
      prev.filter(eq => eq.id !== deletedEarthquake.eq_id)
    )
  }, [])

  // Set up real-time subscription
  useRealtimeEarthquakes({
    onInsert: handleInsert,
    onUpdate: handleUpdate,
    onDelete: handleDelete,
    // Optional: filter for earthquakes with magnitude >= 1.0
    // filter: 'magnitude=gte.1.0'
  })

  return { earthquakeData, loading }
}


export default useEarthquakeData