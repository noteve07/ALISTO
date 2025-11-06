/**
 * Format notification data from database to UI format
 * @param {Object} notification - Raw notification from database
 * @returns {Object} Formatted notification
 */
export const formatNotification = (notification) => {
  if (!notification) return null;

  return {
    id: notification.notification_id,
    title: notification.title,
    message: notification.message,
    time: formatTimeAgo(notification.created_at),
    type: notification.event_type || "info",
    unread: !notification.is_read,
    // Additional data for navigation
    eventId: notification.event_id,
    eventType: notification.event_type,
    eventSubtype: notification.event_subtype,
    lat: notification.lat,
    lon: notification.lon,
    magnitude: notification.magnitude,
    alertLevel: notification.alert_level,
    provinceName: notification.province_name,
    riskLevel: notification.risk_level,
  };
};

/**
 * Format timestamp to relative time ago
 * @param {string} timestamp - ISO timestamp
 * @returns {string} Formatted time string
 */
export const formatTimeAgo = (timestamp) => {
  if (!timestamp) return "Unknown time";

  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  
  return date.toLocaleDateString();
};

/**
 * Get navigation configuration for a notification
 * @param {Object} notification - Formatted notification object
 * @returns {Object|null} Navigation config or null
 */
export const getNavigationConfig = (notification) => {
  if (!notification) return null;

  const { eventType, lat, lon, magnitude, alertLevel } = notification;

  // Validate coordinates
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  if (!isFinite(latitude) || !isFinite(longitude)) {
    console.warn("Invalid coordinates for notification:", notification);
    return {
      pathname: "/app/live-monitoring",
      state: null,
    };
  }

  // Navigate to live monitoring with location
  if (eventType === "earthquake") {
    return {
      pathname: "/app/live-monitoring",
      state: {
        center: [latitude, longitude],
        zoom: magnitude >= 5.0 ? 10 : 11,
        highlightId: notification.eventId,
      },
    };
  }

  if (eventType === "volcanic_advisory") {
    return {
      pathname: "/app/live-monitoring",
      state: {
        center: [latitude, longitude],
        zoom: alertLevel >= 3 ? 10 : 11,
        highlightId: notification.eventId,
        tab: "volcanic", // Switch to volcanic advisory tab if applicable
      },
    };
  }

  // Default: just navigate to live monitoring
  return {
    pathname: "/app/live-monitoring",
    state: null,
  };
};
