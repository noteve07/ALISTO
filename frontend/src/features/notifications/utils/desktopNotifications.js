/**
 * Desktop Notification Utilities
 * Handles browser desktop notifications for real-time alerts
 */

// Check if browser supports notifications
export const isNotificationSupported = () => {
  return 'Notification' in window;
};

// Request permission for desktop notifications
export const requestNotificationPermission = async () => {
  if (!isNotificationSupported()) {
    console.warn('Desktop notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    console.warn('Desktop notifications are blocked');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Get notification icon based on type
const getNotificationIcon = (type) => {
  const icons = {
    earthquake: '🌍',
    volcanic_advisory: '🌋',
    weather: '🌤️',
    tsunami: '🌊',
    info: 'ℹ️',
    warning: '⚠️',
    emergency: '🚨'
  };
  return icons[type] || icons.info;
};

// Get notification urgency based on type and data
const getNotificationUrgency = (notification) => {
  const { event_type, magnitude, alert_level, risk_level } = notification;
  
  // High urgency for dangerous events
  if (event_type === 'earthquake' && magnitude >= 6.0) return 'high';
  if (event_type === 'volcanic_advisory' && alert_level >= 3) return 'high';
  if (risk_level === 'high') return 'high';
  
  // Medium urgency for moderate events
  if (event_type === 'earthquake' && magnitude >= 4.0) return 'normal';
  if (event_type === 'volcanic_advisory' && alert_level >= 2) return 'normal';
  if (risk_level === 'medium') return 'normal';
  
  // Low urgency for minor events
  return 'low';
};

// Show desktop notification
export const showDesktopNotification = async (notification) => {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return null;
  }

  try {
    const { title, message, event_type, province_name } = notification;
    const icon = getNotificationIcon(event_type);
    const urgency = getNotificationUrgency(notification);
    
    // Create notification title with icon
    const notificationTitle = `${icon} ${title}`;
    
    // Create notification body with location if available
    let notificationBody = message;
    if (province_name) {
      notificationBody += `\n📍 ${province_name}`;
    }

    // Notification options
    const options = {
      body: notificationBody,
      icon: '/favicon.ico', // Use your app's favicon
      badge: '/favicon.ico',
      tag: `alisto-${notification.notification_id}`, // Prevent duplicate notifications
      requireInteraction: urgency === 'high', // Keep high urgency notifications visible
      silent: urgency === 'low', // Silent for low urgency
      timestamp: new Date(notification.created_at).getTime(),
      data: {
        notificationId: notification.notification_id,
        eventType: notification.event_type,
        eventId: notification.event_id,
        url: window.location.origin // For click handling
      }
    };

    // Create the notification
    const desktopNotification = new Notification(notificationTitle, options);

    // Handle notification click - focus window and navigate
    desktopNotification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      
      // Close the notification
      desktopNotification.close();
      
      // Navigate to notifications page or specific event
      // You can customize this based on your routing needs
      if (window.location.pathname !== '/notifications') {
        window.location.href = '/notifications';
      }
    };

    // Auto-close notification after delay (except high urgency)
    if (urgency !== 'high') {
      setTimeout(() => {
        desktopNotification.close();
      }, urgency === 'normal' ? 8000 : 5000); // 8s for normal, 5s for low
    }

    console.log('Desktop notification shown:', notificationTitle);
    return desktopNotification;

  } catch (error) {
    console.error('Error showing desktop notification:', error);
    return null;
  }
};

// Initialize notification permissions on app start
export const initializeDesktopNotifications = async () => {
  if (!isNotificationSupported()) {
    console.warn('Desktop notifications not supported in this browser');
    return false;
  }

  if (Notification.permission === 'default') {
    console.log('Desktop notifications permission not set, will request when needed');
    return false;
  }

  if (Notification.permission === 'granted') {
    console.log('Desktop notifications are enabled');
    return true;
  }

  if (Notification.permission === 'denied') {
    console.warn('Desktop notifications are blocked by user');
    return false;
  }

  return false;
};

// Export permission status checker
export const getNotificationPermissionStatus = () => {
  if (!isNotificationSupported()) return 'not-supported';
  return Notification.permission;
};
