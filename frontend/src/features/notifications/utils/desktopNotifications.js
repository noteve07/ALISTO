/**
 * Desktop Notification Utilities
 * Handles browser desktop notifications for real-time alerts
 */

import { playEarthquakeSound } from '@/shared/utils/earthquakeSounds';

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
    major_earthquake: '🌍',
    minor_earthquake: '🌍',
    volcanic_advisory_update: '🌋',
    volcano_alert_increased: '🌋',
    risk_level_update: '⚠️',
    risk_level_increased: '🚨',
    earthquake: '🌍', // Fallback
    volcanic_advisory: '🌋', // Fallback
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
  const { event_type, metadata } = notification;
  
  // Extract data from notification or metadata
  const magnitude = notification.magnitude || metadata?.magnitude;
  const alert_level = notification.alert_level || metadata?.alert_level;
  const risk_level = notification.risk_level || metadata?.risk_level;
  
  // High urgency for dangerous events
  if ((event_type === 'major_earthquake' || event_type === 'minor_earthquake') && magnitude >= 6.0) return 'high';
  if ((event_type === 'volcanic_advisory_update' || event_type === 'volcano_alert_increased') && alert_level >= 3) return 'high';
  if (risk_level === 'high') return 'high';
  
  // Medium urgency for moderate events
  if ((event_type === 'major_earthquake' || event_type === 'minor_earthquake') && magnitude >= 4.0) return 'normal';
  if ((event_type === 'volcanic_advisory_update' || event_type === 'volcano_alert_increased') && alert_level >= 2) return 'normal';
  if (risk_level === 'medium') return 'normal';
  
  // Low urgency for minor events
  return 'low';
};

// Play custom sound for notification
const playNotificationSound = async (notification, urgency) => {
  const { event_type, metadata } = notification;
  
  try {
    // Handle earthquake sounds with shared utility
    if (event_type === 'major_earthquake' || event_type === 'minor_earthquake') {
      // Extract magnitude from notification or metadata
      const magnitude = notification.magnitude || metadata?.magnitude || 0;
      
      console.log(`🔔 Playing earthquake notification sound (magnitude: ${magnitude})`);
      
      // Use shared earthquake sound utility
      await playEarthquakeSound(magnitude, {
        urgency,
        source: 'notification'
      });
      return;
    }
    
    // Handle other notification types (volcanic, etc.)
    if (event_type === 'volcanic_advisory_update' || event_type === 'volcano_alert_increased') {
      // Check if audio context is supported
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        console.warn('AudioContext not supported');
        return;
      }

      const audioContext = new AudioContext();
      playVolcanicSound(audioContext, urgency);
      return;
    }
    
    // Generic notification sound for other types
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      const audioContext = new AudioContext();
      playGenericSound(audioContext, urgency);
    }
    
  } catch (error) {
    console.warn('Error playing notification sound:', error);
  }
};

// (Earthquake sounds now handled by shared utility @/shared/utils/earthquakeSounds)

// Volcanic advisory sound - rising tone pattern
const playVolcanicSound = (audioContext, urgency) => {
  const volume = urgency === 'high' ? 0.4 : urgency === 'normal' ? 0.25 : 0.15;
  const rounds = urgency === 'high' ? 2 : 1;
  
  for (let round = 0; round < rounds; round++) {
    setTimeout(() => {
      // Rising tone pattern for volcanic alert
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Rising tone from 300Hz to 500Hz
      oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
      oscillator.frequency.linearRampToValueAtTime(
        500,
        audioContext.currentTime + 0.5
      );
      
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.5
      );
      
      oscillator.type = 'sine';
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }, round * 1000);
  }
};

// Generic notification sound - simple chime
const playGenericSound = (audioContext, urgency) => {
  const volume = urgency === 'high' ? 0.3 : 0.2;
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  // Pleasant chime sound
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    600,
    audioContext.currentTime + 0.2
  );
  
  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + 0.2
  );
  
  oscillator.type = 'sine';
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.2);
};

// (Audio file handling now done by shared utility @/shared/utils/earthquakeSounds)

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
      silent: true, // Always silent - we'll play custom sound instead
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

    // Play custom sound for notification (only if not low urgency or user wants sounds)
    if (urgency !== 'low') {
      await playNotificationSound(notification, urgency);
    }

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
