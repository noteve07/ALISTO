// Notification service for earthquake alerts
import { authService } from './auth';
import { pwaService } from './pwa';

class NotificationService {
  constructor() {
    this.isEnabled = false;
    this.alertThreshold = 4.0;
    this.locationThreshold = 50; // km
    this.userLocation = null;
    this.lastNotificationTime = null;
    this.cooldownPeriod = 300000; // 5 minutes
    this.listeners = new Map();
  }

  // Initialize notification service
  async init() {
    try {
      // Get user preferences
      const preferences = authService.getPreferences();
      this.alertThreshold = preferences.alertThreshold || 4.0;
      this.userLocation = preferences.location;
      this.isEnabled = preferences.notifications;

      // Request notification permission
      if (this.isEnabled) {
        await this.requestPermission();
      }

      console.log('Notification service initialized');
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
    }
  }

  // Request notification permission
  async requestPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      this.isEnabled = permission === 'granted';
      return this.isEnabled;
    }
    return false;
  }

  // Check if notifications are supported
  isSupported() {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  // Update user preferences
  updatePreferences(preferences) {
    this.alertThreshold = preferences.alertThreshold || 4.0;
    this.userLocation = preferences.location;
    this.isEnabled = preferences.notifications;
  }

  // Check if earthquake should trigger notification
  shouldNotify(earthquake) {
    if (!this.isEnabled || !this.isSupported()) {
      return false;
    }

    // Check magnitude threshold
    if (earthquake.mag < this.alertThreshold) {
      return false;
    }

    // Check cooldown period
    const now = Date.now();
    if (this.lastNotificationTime && (now - this.lastNotificationTime) < this.cooldownPeriod) {
      return false;
    }

    // Check location proximity
    if (this.userLocation) {
      const distance = this.calculateDistance(
        this.userLocation.lat,
        this.userLocation.lng,
        earthquake.lat,
        earthquake.lng
      );
      
      if (distance > this.locationThreshold) {
        return false;
      }
    }

    return true;
  }

  // Send earthquake alert notification
  async sendEarthquakeAlert(earthquake) {
    if (!this.shouldNotify(earthquake)) {
      return;
    }

    const magnitude = earthquake.mag;
    const location = earthquake.place;
    const depth = earthquake.depth;
    const time = new Date(earthquake.time).toLocaleTimeString();

    // Determine alert level
    let alertLevel = 'Low';
    let alertColor = '#16A34A';
    if (magnitude >= 6) {
      alertLevel = 'High';
      alertColor = '#DC2626';
    } else if (magnitude >= 5) {
      alertLevel = 'Medium';
      alertColor = '#F59E0B';
    }

    const title = `🚨 ${alertLevel} Alert: M${magnitude.toFixed(1)} Earthquake`;
    const body = `${location}\nDepth: ${depth}km • ${time}`;

    const options = {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: `earthquake-${earthquake.id}`,
      requireInteraction: magnitude >= 6,
      vibrate: magnitude >= 5 ? [200, 100, 200] : [100, 50, 100],
      data: {
        type: 'earthquake_alert',
        earthquake,
        timestamp: Date.now()
      },
      actions: [
        {
          action: 'view_details',
          title: 'View Details',
          icon: '/icon-192.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/icon-192.png'
        }
      ]
    };

    try {
      // Try PWA notification first
      await pwaService.sendNotification(title, options);
      
      // Fallback to regular notification
      if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(title, options);
        
        notification.onclick = () => {
          window.focus();
          notification.close();
          this.emit('notification_clicked', earthquake);
        };

        this.lastNotificationTime = Date.now();
        this.emit('notification_sent', { earthquake, notification });
        
        return notification;
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  // Send test notification
  async sendTestNotification() {
    const testEarthquake = {
      id: 'test',
      mag: 5.2,
      place: 'Test Location, Philippines',
      depth: 15,
      time: new Date().toISOString(),
      lat: 14.5995,
      lng: 120.9842
    };

    return await this.sendEarthquakeAlert(testEarthquake);
  }

  // Calculate distance between two points
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Get notification settings
  getSettings() {
    return {
      isEnabled: this.isEnabled,
      alertThreshold: this.alertThreshold,
      locationThreshold: this.locationThreshold,
      userLocation: this.userLocation,
      isSupported: this.isSupported()
    };
  }

  // Event system
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in notification event callback:', error);
        }
      });
    }
  }
}

// Create and export a singleton instance
export const notificationService = new NotificationService();
