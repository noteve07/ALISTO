import React, { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { userService } from "@/features/auth/services/userService";

const AppHeader = ({ onLogout }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const notificationsRef = useRef(null);
  const userMenuRef = useRef(null);
  const hasFetchedProfile = useRef(false);
  const { user } = useAuth();

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

  // Hardcoded notifications for now
  const notifications = [
    {
      id: 1,
      title: "Earthquake Alert",
      message: "Magnitude 5.2 detected near Manila",
      time: "5 minutes ago",
      type: "alert",
      unread: true,
    },
    {
      id: 2,
      title: "System Update",
      message: "New features available in ISA Chatbot",
      time: "2 hours ago",
      type: "info",
      unread: true,
    },
    {
      id: 3,
      title: "Risk Assessment Complete",
      message: "Your province risk evaluation is ready",
      time: "1 day ago",
      type: "success",
      unread: false,
    },
  ];

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
  const userEmail = user?.email || "user@alisto.com";
  const userInitial = firstName.charAt(0).toUpperCase();

  return (
    <header className="bg-[#213d53] px-6 py-2 shadow-md">
      <div className="flex items-center justify-between">
        {/* Logo and Tagline */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-v2 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" fill="white" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">ALISTO</h1>
          </div>
          <div className="h-6 w-px bg-white/20"></div>
          <p className="text-[11px] text-white/80 font-light">
            Automated Live Information for Seismic Tracking and Observation
          </p>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2">
          {/* System Status - Live Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-lg border border-green-400/30">
            <div className="relative">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-2 h-2 bg-green-300 rounded-full animate-ping"></div>
            </div>
            <span className="text-xs font-semibold text-green-300">Online</span>
          </div>
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 text-white/90 hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              <span className="sr-only">View notifications</span>
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {/* Notification badge */}
              {notifications.filter((n) => n.unread).length > 0 && (
                <span className="absolute top-2 right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-v2 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-v2"></span>
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {isNotificationsOpen && (
              <div
                className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                style={{ zIndex: 9999 }}
              >
                <div className="p-5 bg-linear-to-r from-primary-v2/5 to-primary/5 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900">
                    Notifications
                  </h3>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {notifications.filter((n) => n.unread).length > 0
                      ? `You have ${
                          notifications.filter((n) => n.unread).length
                        } unread notification${
                          notifications.filter((n) => n.unread).length > 1
                            ? "s"
                            : ""
                        }`
                      : "All caught up!"}
                  </p>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${
                        notification.unread ? "bg-primary-v2/5" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            notification.type === "alert"
                              ? "bg-red-100 text-red-600"
                              : notification.type === "info"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {notification.type === "alert" ? (
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
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.732-1.333-2.464 0L4.35 16c-.77 1.333.192 3 1.732 3z"
                              />
                            </svg>
                          ) : notification.type === "info" ? (
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
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          ) : (
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
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 text-center border-t border-gray-100 bg-gray-50">
                  <button className="text-sm font-semibold text-primary-v2 hover:text-primary transition-colors">
                    View all notifications →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg hover:bg-white/10 transition-all duration-200 border border-white/20"
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
                    <div className="h-3 w-20 bg-white/30 rounded animate-pulse mb-1"></div>
                    <div className="h-2 w-32 bg-white/20 rounded animate-pulse"></div>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-semibold text-white">
                      {displayName}
                    </p>
                    <p className="text-[10px] text-white/70">{userEmail}</p>
                  </>
                )}
              </div>
              <svg
                className={`w-3 h-3 text-white/70 transition-transform duration-200 ${
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
