import { useEffect, useState } from 'react'

const useEarthquakeData = () => {
  const [earthquakeData, setEarthquakeData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEarthquakes = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/v1/earthquakes/latest?hours=24')
        if (!res.ok) throw new Error(`status ${res.status}`)

        const data = await res.json()
        if (data.success && data.data) {
          const getTimestamp = (d) => {
            const t = Date.parse(d)
            return Number.isNaN(t) ? 0 : t
          }

          const formatted = data.data
            .map((eq, i) => ({
              id: i,
              latitude: eq.latitude,
              longitude: eq.longitude,
              magnitude: eq.magnitude,
              depth: eq.depth,
              location: eq.location,
              dateTime: eq.date_time,
              timestamp: getTimestamp(eq.date_time),
            }))
            .sort((a, b) => b.timestamp - a.timestamp)
            .map(({ timestamp, ...rest }) => rest)

          setEarthquakeData(formatted)
        } else throw new Error('invalid data format')
      } catch (err) {
        console.error('error fetching data:', err)
        const fallback = [
          { id: 1, latitude: 11.05, longitude: 124.08, magnitude: 2.0, depth: 29, location: '010km N 88° E of City Of Bogo (Cebu)', dateTime: '13 October 2025 - 07:39 AM', rawDateTime: '2025-10-13T07:39:00+08:00' },
          { id: 2, latitude: 10.98, longitude: 123.93, magnitude: 2.7, depth: 7, location: '009km S 35° W of City Of Bogo (Cebu)', dateTime: '13 October 2025 - 07:29 AM', rawDateTime: '2025-10-13T07:29:00+08:00' },
        ]
          .map(e => ({ ...e, timestamp: Date.parse(e.rawDateTime) }))
          .sort((a, b) => b.timestamp - a.timestamp)
          .map(({ timestamp, rawDateTime, ...rest }) => rest)
        setEarthquakeData(fallback)
      } finally {
        setLoading(false)
      }
    }

    fetchEarthquakes()
    const interval = setInterval(fetchEarthquakes, 30000)
    return () => clearInterval(interval)
  }, [])

  return { earthquakeData, loading }
}


export default useEarthquakeData