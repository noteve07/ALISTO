import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

// Layouts
import PublicLayout from './shared/layouts/PublicLayout'
import AppLayout from './shared/layouts/AppLayout'

// Public Pages
import LandingPage from './features/landing/pages/LandingPage'
import LoginPage from './features/auth/pages/LoginPage'
import SignupPage from './features/auth/pages/SignupPage'

// App Pages
import DashboardPage from './features/dashboard/pages/DashboardPage'
import LiveMonitoringPage from './features/live-monitoring/pages/LiveMonitoringPage'
import RiskEvaluationPage from './features/risk-evaluation/pages/RiskEvaluationPage'
import AnalyticsPage from './features/analytics/pages/AnalyticsPage'
import ChatbotPage from './features/chatbot/pages/ChatbotPage'



const App = () => {
  const router = createBrowserRouter([
    // Public Routes
    {
      path: '/',
      element: <PublicLayout />,
      childre: [
        { index: true, element: <LandingPage /> },
        { path: "login", element: <LoginPage /> },
        { path: "signup", element: <SignupPage /> }
      ]

    }
  ]);
  return (
    <RouterProvider router={router} />
  )
}

export default App