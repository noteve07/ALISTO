import React from "react";

/**
 * Get icon component based on notification type
 */
const NotificationIcon = ({ type }) => {
  const iconConfig = {
    alert: {
      bgColor: "bg-red-100",
      textColor: "text-red-600",
      path: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.732-1.333-2.464 0L4.35 16c-.77 1.333.192 3 1.732 3z",
    },
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

  const config = iconConfig[type] || iconConfig.info;

  return (
    <div
      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config.bgColor} ${config.textColor}`}
    >
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
          d={config.path}
        />
      </svg>
    </div>
  );
};

/**
 * Individual notification item card
 * @param {object} notification - Notification data
 * @param {function} onClick - Click handler
 */
const NotificationItem = ({ notification, onClick }) => {
  const { id, title, message, time, type, unread } = notification;

  return (
    <div
      key={id}
      onClick={() => onClick(notification)}
      className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${
        unread ? "bg-primary-v2/5" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <NotificationIcon type={type} />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{message}</p>
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
            {time}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
