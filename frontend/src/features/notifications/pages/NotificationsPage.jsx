import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../hooks/useNotifications";
import {
  formatNotification,
  getNavigationConfig,
} from "../utils/notificationUtils";

const NotificationsPage = () => {
  const navigate = useNavigate();
  const {
    notifications: rawNotifications,
    loading,
    error,
    markAsRead,
    refreshNotifications,
  } = useNotifications();

  const [filter, setFilter] = useState("all"); // all, unread, earthquake, volcanic_advisory

  // Format notifications
  const notifications = rawNotifications
    .map(formatNotification)
    .filter(Boolean);

  // Apply filters
  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "all") return true;
    if (filter === "unread") return notif.unread;
    if (filter === "earthquake") return notif.type === "earthquake";
    if (filter === "volcanic_advisory")
      return notif.type === "volcanic_advisory";
    return true;
  });

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (notification.unread && notification.id) {
      await markAsRead(notification.id);
    }

    // Navigate to location
    const navConfig = getNavigationConfig(notification);
    if (navConfig) {
      navigate(navConfig.pathname, { state: navConfig.state });
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    const unreadNotifs = notifications.filter((n) => n.unread);
    await Promise.all(unreadNotifs.map((n) => markAsRead(n.id)));
  };

  // Get icon for notification type
  const getNotificationIcon = (type) => {
    const iconConfig = {
      earthquake: {
        bgColor: "bg-orange-100",
        textColor: "text-orange-600",
        path: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.732-1.333-2.464 0L4.35 16c-.77 1.333.192 3 1.732 3z",
      },
      volcanic_advisory: {
        bgColor: "bg-red-100",
        textColor: "text-red-600",
        path: "M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z",
      },
      info: {
        bgColor: "bg-blue-100",
        textColor: "text-blue-600",
        path: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      },
      success: {
        bgColor: "bg-green-100",
        textColor: "text-green-600",
        path: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      },
    };

    return iconConfig[type] || iconConfig.info;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Notifications
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {unreadCount > 0
                  ? `${unreadCount} unread notification${
                      unreadCount > 1 ? "s" : ""
                    }`
                  : "All caught up!"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={refreshNotifications}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                <svg
                  className={`w-4 h-4 inline-block mr-2 ${
                    loading ? "animate-spin" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-v2 rounded-lg hover:bg-primary transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 mt-6">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === "all"
                  ? "bg-primary-v2 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === "unread"
                  ? "bg-primary-v2 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Unread
              {unreadCount > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-white/20 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilter("earthquake")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === "earthquake"
                  ? "bg-primary-v2 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              🌍 Earthquakes
            </button>
            <button
              onClick={() => setFilter("volcanic_advisory")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === "volcanic_advisory"
                  ? "bg-primary-v2 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              🌋 Volcanic Advisories
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            <p className="font-medium">Error loading notifications</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {loading && notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 border-4 border-primary-v2/30 border-t-primary-v2 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-10 h-10 text-gray-400"
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
            </div>
            <p className="text-gray-500 text-lg font-medium">
              No notifications found
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {filter !== "all"
                ? `Try adjusting your filters`
                : `You'll be notified about important updates`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => {
              const iconConfig = getNotificationIcon(notification.type);
              return (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all cursor-pointer ${
                    notification.unread ? "border-l-4 border-l-primary-v2" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconConfig.bgColor} ${iconConfig.textColor}`}
                    >
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
                          d={iconConfig.path}
                        />
                      </svg>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-gray-900">
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                        </div>
                        {notification.unread && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-v2 text-white">
                            New
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
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
                        </div>
                        {notification.provinceName && (
                          <div className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            {notification.provinceName}
                          </div>
                        )}
                        {notification.magnitude && (
                          <div className="flex items-center gap-1 font-medium">
                            <span>Magnitude {notification.magnitude}</span>
                          </div>
                        )}
                        {notification.alertLevel && (
                          <div className="flex items-center gap-1 font-medium">
                            <span>Alert Level {notification.alertLevel}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
