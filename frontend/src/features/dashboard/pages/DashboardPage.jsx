import React from 'react'

// Card Components
import TodaysEarthquakes from '../components/cards/TodaysEarthquakes'
import StrongestMagnitude from '../components/cards/StrongestMagnitude'
import NearbyEarthquakes from '../components/cards/NearbyEarthquakes'
import RiskLevel from '../components/cards/RiskLevel'

// Details Components
import UserLocation from '../components/details/UserLocation'
import LastEarthquake from '../components/details/LastEarthquake'
import EmergencyHotlines from '../components/details/EmergencyHotlines'
import EvacuationSites from '../components/details/EvacuationSites'

// Graph Components
import EarthquakeFrequencyChart from '../components/graphs/EarthquakeFrequencyChart'
import MagnitudeTimeChart from '../components/graphs/MagnitudeTimeChart'
import ProvincesPieChart from '../components/graphs/ProvincesPieChart'

// List Components
import RecentEarthquakesPH from '../components/lists/RecentEarthquakesPH'
import RecentEarthquakesNearMe from '../components/lists/RecentEarthquakesNearMe'
import HighRiskProvinces from '../components/lists/HighRiskProvinces'
import VolcanicAdvisories from '../components/lists/VolcanicAdvisories'

const DashboardPage = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <TodaysEarthquakes />
          <StrongestMagnitude />
          <NearbyEarthquakes />
          <RiskLevel />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <EarthquakeFrequencyChart />
          </div>
          <ProvincesPieChart />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <MagnitudeTimeChart />
        </div>

        {/* Top Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UserLocation />
          <LastEarthquake />
        </div>

        {/* Lists Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentEarthquakesPH />
          <RecentEarthquakesNearMe />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HighRiskProvinces />
          <VolcanicAdvisories />
        </div>

        {/* Bottom Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EmergencyHotlines />
          <EvacuationSites />
        </div>

      </div>
    </div>
  )
}

export default DashboardPage