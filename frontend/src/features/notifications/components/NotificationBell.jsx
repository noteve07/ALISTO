import React from "react";

/**
 * Notification bell icon button with badge indicator
 * @param {boolean} isOpen - Whether the dropdown is open
 * @param {function} onClick - Click handler to toggle dropdown
 * @param {number} unreadCount - Number of unread notifications
 */
const NotificationBell = ({ isOpen, onClick, unreadCount = 0 }) => {
  return (
    <button
      onClick={onClick}
      className={`relative p-2 rounded-lg transition-all duration-200 border ${
        isOpen
          ? "bg-primary-v2 text-white shadow-lg border-primary-v2"
          : "text-gray-700 hover:bg-gray-50 border-gray-200"
      }`}
      aria-label="Notifications"
      aria-expanded={isOpen}
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
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>

      {/* Notification badge with pulse animation */}
      {unreadCount > 0 && (
        <span className="absolute top-2 right-2 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-v2 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-v2"></span>
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
