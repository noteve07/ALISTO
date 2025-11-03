import React, { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";

const AppHeader = ({ onLogout }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [currentAlert, setCurrentAlert] = useState(null);
  const [alertHistory, setAlertHistory] = useState([]);
  const notificationsRef = useRef(null);
  const userMenuRef = useRef(null);

  // Add slideDown animation styles
  useEffect(() => {
    // Add CSS animation if not already added
    if (!document.getElementById("alert-animations")) {
      const style = document.createElement("style");
      style.id = "alert-animations";
      style.textContent = `
        @keyframes slideDown {
          0% {
            opacity: 0;
            transform: translateY(-100%);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.5s ease-out;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Sample alerts - these would come from your alert system
  const sampleAlerts = [
    {
      id: 1,
      type: "earthquake-minor",
      urgency: "low",
      title: "Minor Earthquake Detected",
      message: "Magnitude 4.1 earthquake occurred in Davao Region",
      location: "Davao Region",
      magnitude: 4.1,
      timestamp: new Date(),
      icon: "⚠️",
      backgroundColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-800",
      iconColor: "text-yellow-600",
    },
    {
      id: 2,
      type: "earthquake-major",
      urgency: "high",
      title: "Major Earthquake Alert",
      message: "Magnitude 6.7 earthquake detected - Monitor for aftershocks",
      location: "Luzon Region",
      magnitude: 6.7,
      timestamp: new Date(),
      icon: "🚨",
      backgroundColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-800",
      iconColor: "text-red-600",
    },
    {
      id: 3,
      type: "earthquake-critical",
      urgency: "critical",
      title: "CRITICAL: Major Earthquake Near You",
      message: "Magnitude 7.2 earthquake detected within 50km of your location",
      location: "Metro Manila",
      magnitude: 7.2,
      distance: "15km from your location",
      timestamp: new Date(),
      icon: "🔴",
      backgroundColor: "bg-red-100",
      borderColor: "border-red-400",
      textColor: "text-red-900",
      iconColor: "text-red-700",
    },
    {
      id: 4,
      type: "volcanic",
      urgency: "medium",
      title: "Volcanic Advisory Update",
      message: "Taal Volcano alert level raised to Level 2",
      location: "Taal Volcano, Batangas",
      alertLevel: "Level 2",
      timestamp: new Date(),
      icon: "🌋",
      backgroundColor: "bg-orange-50",
      borderColor: "border-orange-200",
      textColor: "text-orange-800",
      iconColor: "text-orange-600",
    },
    {
      id: 5,
      type: "risk-increase",
      urgency: "medium",
      title: "Risk Level Update",
      message: "Risk level for your province has increased to High",
      location: "Your Province",
      riskLevel: "High",
      timestamp: new Date(),
      icon: "📊",
      backgroundColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-800",
      iconColor: "text-blue-600",
    },
  ];

  // Function to play alert sound
  const playAlertSound = (urgency) => {
    // Create audio context for different alert sounds
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    const createTone = (frequency, duration, type = "sine") => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + duration
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    };

    // Different sounds based on urgency
    switch (urgency) {
      case "critical":
        // Urgent alarm sound
        createTone(800, 0.2);
        setTimeout(() => createTone(600, 0.2), 200);
        setTimeout(() => createTone(800, 0.2), 400);
        break;
      case "high":
        // Two-tone alert
        createTone(650, 0.3);
        setTimeout(() => createTone(500, 0.3), 300);
        break;
      case "medium":
        // Single notification tone
        createTone(550, 0.4);
        break;
      case "low":
        // Soft notification
        createTone(400, 0.3);
        break;
      default:
        createTone(500, 0.3);
    }
  };

  // Function to trigger sample alerts
  const triggerAlert = (alertIndex) => {
    const alert = sampleAlerts[alertIndex];
    setCurrentAlert(alert);
    setAlertHistory((prev) => [alert, ...prev.slice(0, 4)]); // Keep last 5 alerts

    // Play alert sound
    playAlertSound(alert.urgency);

    // Auto-dismiss non-critical alerts after 8 seconds
    if (alert.urgency !== "critical") {
      setTimeout(() => {
        setCurrentAlert(null);
      }, 8000);
    }
  };

  const dismissAlert = () => {
    setCurrentAlert(null);
  };

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

  return (
    <>
      {/* Alert Overlay */}
      {currentAlert && (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4">
          <div
            className={`w-3/4 max-w-4xl mx-auto ${currentAlert.backgroundColor} ${currentAlert.borderColor} border rounded-xl shadow-2xl backdrop-blur-sm bg-opacity-95 animate-slideDown`}
          >
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`text-lg ${currentAlert.iconColor}`}>
                    {currentAlert.icon}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`font-semibold text-sm ${currentAlert.textColor}`}
                      >
                        {currentAlert.title}
                      </h4>
                      {currentAlert.urgency === "critical" && (
                        <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded-full animate-pulse">
                          URGENT
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-sm ${currentAlert.textColor} opacity-90`}
                    >
                      {currentAlert.message}
                    </p>
                    <div className="flex items-center gap-4 mt-1 text-xs opacity-75">
                      <span>{currentAlert.location}</span>
                      {currentAlert.magnitude && (
                        <span>M{currentAlert.magnitude}</span>
                      )}
                      {currentAlert.distance && (
                        <span>{currentAlert.distance}</span>
                      )}
                      {currentAlert.alertLevel && (
                        <span>{currentAlert.alertLevel}</span>
                      )}
                      {currentAlert.riskLevel && (
                        <span>{currentAlert.riskLevel}</span>
                      )}
                      <span>{currentAlert.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={dismissAlert}
                  className={`p-1 hover:bg-black/10 rounded-full transition-colors ${currentAlert.textColor}`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-gray-100 px-8 py-1.5 shadow-sm">
        <div className="flex items-center justify-between">
          {/* Tagline */}
          <div className="flex items-center">
            <p className="text-sm text-gray-500 font-light">
              Automated Live Information for Seismic Tracking and Observation
            </p>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Alert Demo Buttons - Remove in production */}
            <div className="flex items-center gap-1 mr-4">
              <button
                onClick={() => triggerAlert(0)}
                className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                title="Minor Earthquake"
              >
                🟡
              </button>
              <button
                onClick={() => triggerAlert(1)}
                className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                title="Major Earthquake"
              >
                🔴
              </button>
              <button
                onClick={() => triggerAlert(2)}
                className="px-2 py-1 text-xs bg-red-200 text-red-900 rounded hover:bg-red-300"
                title="Critical Earthquake"
              >
                🚨
              </button>
              <button
                onClick={() => triggerAlert(3)}
                className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded hover:bg-orange-200"
                title="Volcanic Advisory"
              >
                🌋
              </button>
              <button
                onClick={() => triggerAlert(4)}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                title="Risk Increase"
              >
                📊
              </button>
            </div>
            {/* System Status - Live Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg border border-green-100">
              <div className="relative">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
              </div>
              <span className="text-xs font-semibold text-green-700">
                Online
              </span>
            </div>
            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-3 text-gray-600 hover:text-primary-v2 hover:bg-gray-50 rounded-xl transition-all duration-200"
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
                    {/* Recent Alerts Section */}
                    {alertHistory.length > 0 && (
                      <>
                        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            Recent Alerts
                          </h4>
                        </div>
                        {alertHistory.slice(0, 3).map((alert) => (
                          <div
                            key={`alert-${alert.id}`}
                            className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${alert.backgroundColor} border ${alert.borderColor}`}
                              >
                                <span className="text-sm">{alert.icon}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-semibold text-sm text-gray-900 truncate">
                                    {alert.title}
                                  </h4>
                                  <span className="text-xs text-gray-500 ml-2 shrink-0">
                                    {alert.timestamp.toLocaleTimeString()}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {alert.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {alert.location}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            Notifications
                          </h4>
                        </div>
                      </>
                    )}

                    {/* Regular Notifications */}
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
                className="flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl hover:bg-gray-50 transition-all duration-200 border border-gray-100"
              >
                <div className="w-10 h-10 bg-linear-to-br from-primary-v2 to-primary rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold">U</span>
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-semibold text-gray-900">
                    User Name
                  </p>
                  <p className="text-xs text-gray-500">user@alisto.com</p>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
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
                        <span className="text-white font-bold text-xl">U</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-bold text-gray-900">
                          User Name
                        </p>
                        <p className="text-sm text-gray-600">user@alisto.com</p>
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
    </>
  );
};

export default AppHeader;
