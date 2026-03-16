import React, { useState, useRef, useEffect, useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { userService } from "@/features/auth/services/userService";
import {
  NotificationBell,
  NotificationDropdown,
} from "@/features/notifications/components";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import {
  formatNotification,
  getNavigationConfig,
} from "@/features/notifications/utils/notificationUtils";
// TEMPORARY: Sound imports - COMMENTED OUT
// import {
//   playEarthquakeSound,
//   getEarthquakeUrgency,
// } from "@/shared/utils/earthquakeSounds";

const AppHeader = ({ onLogout }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const notificationsRef = useRef(null);
  const userMenuRef = useRef(null);
  const hasFetchedProfile = useRef(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch notifications with real-time subscription
  const {
    notifications: rawNotifications,
    loading: notificationsLoading,
    markAsRead,
  } = useNotifications();

  // Fetch user profile on mount with minimum 2 second loading
  useEffect(() => {
    const fetchProfile = async () => {
      // Only fetch once
      if (hasFetchedProfile.current || !user) {
        return;
      }

      hasFetchedProfile.current = true;
      setIsLoadingProfile(true);
      const startTime = Date.now();

      const result = await userService.getProfile();
      if (result.success) {
        setUserProfile(result.data);
      }

      // Ensure minimum 2 seconds loading
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 2000 - elapsedTime);

      setTimeout(() => {
        setIsLoadingProfile(false);
      }, remainingTime);
    };

    fetchProfile();
  }, [user]);

  // Format notifications for UI
  const notifications = useMemo(() => {
    return rawNotifications.map(formatNotification).filter(Boolean);
  }, [rawNotifications]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Notification handlers
  const handleNotificationClick = async (notification) => {
    console.log("Notification clicked:", notification);

    // Mark as read
    if (notification.unread && notification.id) {
      await markAsRead(notification.id);
    }

    // Get navigation config and navigate
    const navConfig = getNavigationConfig(notification);
    if (navConfig) {
      navigate(navConfig.pathname, { state: navConfig.state });
    }

    setIsNotificationsOpen(false);
  };

  const handleViewAllNotifications = () => {
    navigate("/app/notifications");
    setIsNotificationsOpen(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get user display info
  const firstName = userProfile?.firstName || "User";
  const lastName = userProfile?.lastName || "";
  const displayName = `${firstName} ${lastName}`.trim();
  const userEmail = user?.email || "user@epicentra.com";
  const userInitial = firstName.charAt(0).toUpperCase();

  // TEMPORARY: Test earthquake sound function - COMMENTED OUT
  // const testEarthquakeSound = async (magnitude) => {
  //   console.log(`🧪 TESTING earthquake sound with magnitude ${magnitude}`);
  //   const urgency = getEarthquakeUrgency(magnitude);

  //   try {
  //     await playEarthquakeSound(magnitude, {
  //       urgency,
  //       source: "header-test",
  //     });
  //   } catch (error) {
  //     console.error("Test sound failed:", error);
  //   }
  // };

  return (
    <header className="bg-white px-6 py-2 shadow-md border-b border-gray-100">
      <div className="flex items-center justify-between">
        {/* Logo and Tagline */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity duration-200"
            onClick={() => window.open("/", "_blank")}
            title="Visit EPICENTRA Landing Page"
          >
            <div className="relative">
              <img
                src="/logo/alisto_logo.png"
                alt="EPICENTRA Logo"
                className="w-8 h-8 object-contain select-none"
                style={{
                  filter: "brightness(1.0) contrast(1.0) saturate(1.0)",
                }}
                draggable={false}
              />
            </div>
            <h1 className="text-xl font-black tracking-wide text-primary-v2">
              EPICENTRA
            </h1>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2">
          {/* System Status - Live Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg border border-green-200">
            <div className="relative">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
            </div>
            <span className="text-xs font-semibold text-green-700">Online</span>
          </div>

          {/* TEMPORARY: Test Sound Buttons - COMMENTED OUT */}
          {/* <div className="flex items-center gap-1">
            <button
              onClick={() => testEarthquakeSound(7.2)}
              className="px-2 py-1 text-xs bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 transition-colors"
              title="Test Major Earthquake Sound (7.2)"
            >
              🔊 7.2
            </button>
            <button
              onClick={() => testEarthquakeSound(4.5)}
              className="px-2 py-1 text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 rounded hover:bg-yellow-100 transition-colors"
              title="Test Moderate Earthquake Sound (4.5)"
            >
              🔊 4.5
            </button>
            <button
              onClick={() => testEarthquakeSound(2.8)}
              className="px-2 py-1 text-xs bg-gray-50 text-gray-700 border border-gray-200 rounded hover:bg-gray-100 transition-colors"
              title="Test Minor Earthquake Sound (2.8)"
            >
              🔊 2.8
            </button>
          </div> */}
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <NotificationBell
              isOpen={isNotificationsOpen}
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              unreadCount={unreadCount}
            />

            {/* Notifications Dropdown */}
            {isNotificationsOpen && (
              <NotificationDropdown
                notifications={notifications}
                onNotificationClick={handleNotificationClick}
                onViewAll={handleViewAllNotifications}
                loading={notificationsLoading}
              />
            )}
          </div>

          {/* User Profile */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg hover:bg-gray-50 transition-all duration-200 border border-gray-200"
            >
              <div className="w-8 h-8 bg-primary-v2 rounded-full flex items-center justify-center">
                {isLoadingProfile ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="text-white font-bold text-sm">
                    {userInitial}
                  </span>
                )}
              </div>
              <div className="hidden lg:block text-left">
                {isLoadingProfile ? (
                  <>
                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse mb-1"></div>
                    <div className="h-2 w-32 bg-gray-100 rounded animate-pulse"></div>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-semibold text-gray-900">
                      {displayName}
                    </p>
                    <p className="text-[10px] text-gray-600">{userEmail}</p>
                  </>
                )}
              </div>
              <svg
                className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${
                  isUserMenuOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* User Menu Dropdown */}
            {isUserMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                style={{ zIndex: 9999 }}
              >
                <div className="p-5 bg-linear-to-r from-primary-v2/5 to-primary/5 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-linear-to-br from-primary-v2 to-primary rounded-xl flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-xl">
                        {userInitial}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-bold text-gray-900">
                        {displayName}
                      </p>
                      <p className="text-sm text-gray-600">{userEmail}</p>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <NavLink
                    to="/app/account"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-v2 transition-all duration-200 group"
                  >
                    <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-primary-v2/10 transition-colors">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <span>Account Settings</span>
                  </NavLink>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      if (onLogout) onLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200 group mt-1"
                  >
                    <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition-colors">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                    </div>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
