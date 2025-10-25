import React from 'react'
import useEarthquakeData from '../hooks/useEarthquakeData'
import MapView from '../components/MapView'
import LoadingOverlay from '../components/LoadingOverlay'

const LiveMonitoringPage = () => {
  const { earthquakeData, loading } = useEarthquakeData()

  return (
    <div className="h-full relative">
      {loading && <LoadingOverlay />}
      <MapView earthquakeData={earthquakeData} />
    </div>
  )
}

export default LiveMonitoringPage
