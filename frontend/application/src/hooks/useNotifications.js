import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notifications';
import { useAuth } from './useAuth';

export const useNotifications = () => {
  const [settings, setSettings] = useState({
    isEnabled: false,
    alertThreshold: 4.0,
    locationThreshold: 50,
    userLocation: null,
    isSupported: false
  });
  const [loading, setLoading] = useState(true);
  const { user, updatePreferences } = useAuth();

  // Initialize notifications
  useEffect(() => {
    const initNotifications = async () => {
      try {
        await notificationService.init();
        setSettings(notificationService.getSettings());
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    initNotifications();
  }, []);

  // Update settings when user changes
  useEffect(() => {
    if (user) {
      const preferences = user.preferences;
      notificationService.updatePreferences(preferences);
      setSettings(notificationService.getSettings());
    }
  }, [user]);

  // Update notification settings
  const updateSettings = useCallback(async (newSettings) => {
    try {
      setLoading(true);
      
      // Update local settings
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      
      // Update notification service
      notificationService.updatePreferences(updatedSettings);
      
      // Update user preferences in auth service
      if (user) {
        await updatePreferences({
          notifications: updatedSettings.isEnabled,
          alertThreshold: updatedSettings.alertThreshold,
          location: updatedSettings.userLocation
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [settings, user, updatePreferences]);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    try {
      const granted = await notificationService.requestPermission();
      if (granted) {
        setSettings(prev => ({ ...prev, isEnabled: true }));
      }
      return granted;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }, []);

  // Send test notification
  const sendTestNotification = useCallback(async () => {
    try {
      await notificationService.sendTestNotification();
      return { success: true };
    } catch (error) {
      console.error('Failed to send test notification:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Enable notifications
  const enableNotifications = useCallback(async () => {
    const granted = await requestPermission();
    if (granted) {
      await updateSettings({ isEnabled: true });
    }
    return granted;
  }, [requestPermission, updateSettings]);

  // Disable notifications
  const disableNotifications = useCallback(async () => {
    await updateSettings({ isEnabled: false });
  }, [updateSettings]);

  // Update alert threshold
  const updateAlertThreshold = useCallback(async (threshold) => {
    await updateSettings({ alertThreshold: threshold });
  }, [updateSettings]);

  // Update location threshold
  const updateLocationThreshold = useCallback(async (threshold) => {
    await updateSettings({ locationThreshold: threshold });
  }, [updateSettings]);

  // Update user location
  const updateUserLocation = useCallback(async (location) => {
    await updateSettings({ userLocation: location });
  }, [updateSettings]);

  return {
    settings,
    loading,
    updateSettings,
    requestPermission,
    sendTestNotification,
    enableNotifications,
    disableNotifications,
    updateAlertThreshold,
    updateLocationThreshold,
    updateUserLocation
  };
};
