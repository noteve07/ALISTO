import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/navigation/Sidebar'

const AppLayout = () => {
  return (
    <div className="app-layout">
      <Sidebar />
      
      <div className="app-content">
        <Outlet />
      </div>
    </div>
  )
}

export default AppLayout