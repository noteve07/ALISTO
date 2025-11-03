import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/navigation/Sidebar";
import AppHeader from "../components/navigation/AppHeader";
import LogoutLoadingScreen from "../../features/auth/components/LogoutLoadingScreen";
import { authService } from "../../features/auth/services/authService";

const AppLayout = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    console.log("Logging out...");
    try {
      setIsLoggingOut(true);

      // Sign out from auth service
      await authService.signOut();

      // Show loading screen for 1.5 seconds before redirecting
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error(error);
      setIsLoggingOut(false);
    }
  };

  // Show logout loading screen
  if (isLoggingOut) {
    return <LogoutLoadingScreen />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <AppHeader onLogout={handleLogout} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-auto">
          <div className="h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
