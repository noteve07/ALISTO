// PWA Service for ALISTO
class PWAService {
  constructor() {
    this.deferredPrompt = null;
    this.isInstalled = false;
    this.listeners = new Map();
  }

  // Register service worker
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully:', registration);
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.emit('update_available');
            }
          });
        });

        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        throw error;
      }
    } else {
      console.log('Service Worker not supported');
      return null;
    }
  }

  // Handle install prompt
  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.emit('install_prompt_available');
    });

    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.deferredPrompt = null;
      this.emit('app_installed');
    });
  }

  // Show install prompt
  async showInstallPrompt() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        this.emit('install_accepted');
      } else {
        this.emit('install_dismissed');
      }
      
      this.deferredPrompt = null;
    }
  }

  // Check if app is installed
  isAppInstalled() {
    return this.isInstalled || window.matchMedia('(display-mode: standalone)').matches;
  }

  // Request notification permission
  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // Send notification
  async sendNotification(title, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    }
  }

  // Check for updates
  async checkForUpdates() {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
      }
    }
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
          console.error('Error in PWA event callback:', error);
        }
      });
    }
  }

  // Initialize PWA features
  async init() {
    try {
      await this.registerServiceWorker();
      this.setupInstallPrompt();
      await this.requestNotificationPermission();
      console.log('PWA initialized successfully');
    } catch (error) {
      console.error('PWA initialization failed:', error);
    }
  }
}

// Create and export a singleton instance
export const pwaService = new PWAService();
