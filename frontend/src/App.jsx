import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Layouts
import PublicLayout from "./shared/layouts/PublicLayout";
import AppLayout from "./shared/layouts/AppLayout";
import { DashboardProvider } from "./features/dashboard/context/DashboardContext";

// Public Pages
import LandingPage from "./features/landing/pages/LandingPage";
import LoginPage from "./features/auth/pages/LoginPage";
import SignupPage from "./features/auth/pages/SignupPage";

// App Pages
import DashboardPage from "./features/dashboard/pages/DashboardPage";
import LiveMonitoringPage from "./features/live-monitoring/pages/LiveMonitoringPage";
import HazardMapsPage from "./features/hazard-maps/pages/HazardMapsPage";
import RiskEvaluationPage from "./features/risk-evaluation/pages/RiskEvaluationPage";
import HotlinePage from "./features/hotlines/pages/HotlinePage";
import ChatbotPage from "./features/chatbot/pages/ChatbotPage";
import AccountPage from "./features/account/pages/AccountPage";
import NotificationsPage from "./features/notifications/pages/NotificationsPage";

// Shared Pages
import ErrorPage from "./shared/pages/ErrorPage";
import TermsOfService from "./shared/pages/TermsOfService";
import PrivacyPolicy from "./shared/pages/PrivacyPolicy";

const App = () => {
  const router = createBrowserRouter([
    // Public Routes
    {
      path: "/",
      element: <PublicLayout />,
      children: [
        { index: true, element: <LandingPage /> },
        { path: "login", element: <LoginPage /> },
        { path: "signup", element: <SignupPage /> },
        { path: "*", element: <ErrorPage /> },
      ],
    },

    // Legal Pages (standalone)
    {
      path: "/terms",
      element: <TermsOfService />,
    },
    {
      path: "/privacy",
      element: <PrivacyPolicy />,
    },

    // App Routes
    {
      path: "/app",
      element: (
        <DashboardProvider>
          <AppLayout />
        </DashboardProvider>
      ),
      children: [
        { index: true, element: <DashboardPage /> },
        { path: "dashboard", element: <DashboardPage /> },
        { path: "live-monitoring", element: <LiveMonitoringPage /> },
        { path: "hazard-maps", element: <HazardMapsPage /> },
        { path: "risk-evaluation", element: <RiskEvaluationPage /> },
        { path: "emergency-hotlines", element: <HotlinePage /> },
        { path: "chatbot", element: <ChatbotPage /> },
        { path: "notifications", element: <NotificationsPage /> },
        { path: "account", element: <AccountPage /> },
        { path: "*", element: <ErrorPage /> },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default App;
