import React from 'react'
import useEarthquakeData from '../hooks/useEarthquakeData'
import MapView from '../components/MapView'
import LoadingOverlay from '../components/LoadingOverlay'
import LiveChatWidget from '../components/LiveChatWidget'

const LiveMonitoringPage = () => {
  const { earthquakeData, loading } = useEarthquakeData()

  return (
    <div className="h-full relative">
      {loading && <LoadingOverlay />}
      <MapView earthquakeData={earthquakeData} />
      <LiveChatWidget />
    </div>
  )
}

export default LiveMonitoringPage
