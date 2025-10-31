import React from 'react'
import useEarthquakeData from '../hooks/useEarthquakeData'
import MapView from '../components/MapView'
import LoadingOverlay from '../components/LoadingOverlay'
import LiveChatWidget from '../components/LiveChatWidget'
import FilterPanel from '../components/FilterPanel'
import RecentEarthquakesList from '../components/RecentEarthquakesList'
import VolcanicAdvisories from '../components/VolcanicAdvisories'

const LiveMonitoringPage = () => {
  const { earthquakeData, loading } = useEarthquakeData()

  return (
    <div className="h-full relative">
      {loading && <LoadingOverlay />}
      <MapView earthquakeData={earthquakeData} />
      
      {/* Overlays */}
      <FilterPanel />
      <VolcanicAdvisories />
      <RecentEarthquakesList />
      <LiveChatWidget />
    </div>
  )
}

export default LiveMonitoringPage
