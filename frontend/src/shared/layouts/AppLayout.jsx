import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/navigation/Sidebar'
import AppHeader from '../components/navigation/AppHeader'

const AppLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader />
        
        <main className="flex-1 overflow-auto">
          <div className="h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AppLayout