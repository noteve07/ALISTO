import React from "react";
import NotificationItem from "./NotificationItem";

/**
 * Dropdown container for notifications with header, list, and footer
 * @param {Array} notifications - List of notification objects
 * @param {function} onNotificationClick - Click handler for individual notifications
 * @param {function} onViewAll - Click handler for "View all" button
 * @param {boolean} loading - Loading state
 */
const NotificationDropdown = ({
  notifications = [],
  onNotificationClick,
  onViewAll,
  loading = false,
}) => {
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div
      className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
      style={{ zIndex: 9999 }}
    >
      {/* Header */}
      <div className="p-5 bg-linear-to-r from-primary-v2/5 to-primary/5 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
        <p className="text-sm text-gray-600 mt-0.5">
          {unreadCount > 0
            ? `You have ${
                unreadCount > 99 ? "99+" : unreadCount
              } unread notification${unreadCount > 1 ? "s" : ""}`
            : "All caught up!"}
        </p>
      </div>

      {/* Notification List */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-primary-v2/30 border-t-primary-v2 rounded-full animate-spin"></div>
            <p className="text-sm text-gray-500">Loading notifications...</p>
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClick={onNotificationClick}
            />
          ))
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
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
            <p className="text-sm text-gray-500">No notifications yet</p>
            <p className="text-xs text-gray-400 mt-1">
              You'll be notified about important updates
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 text-center border-t border-gray-100 bg-gray-50">
          <button
            onClick={onViewAll}
            className="text-sm font-semibold text-primary-v2 hover:text-primary transition-colors"
          >
            View all notifications →
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
