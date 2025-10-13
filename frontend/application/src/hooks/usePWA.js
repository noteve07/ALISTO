import { useState, useEffect } from 'react';
import { pwaService } from '../services/pwa';

export const usePWA = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');

  useEffect(() => {
    // Initialize PWA
    pwaService.init();

    // Check initial state
    setIsInstalled(pwaService.isAppInstalled());

    // Listen for install prompt
    const handleInstallPrompt = () => setIsInstallable(true);
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
    };
    const handleUpdateAvailable = () => setUpdateAvailable(true);

    pwaService.on('install_prompt_available', handleInstallPrompt);
    pwaService.on('app_installed', handleAppInstalled);
    pwaService.on('update_available', handleUpdateAvailable);

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    return () => {
      pwaService.off('install_prompt_available', handleInstallPrompt);
      pwaService.off('app_installed', handleAppInstalled);
      pwaService.off('update_available', handleUpdateAvailable);
    };
  }, []);

  const installApp = async () => {
    try {
      await pwaService.showInstallPrompt();
    } catch (error) {
      console.error('Failed to install app:', error);
    }
  };

  const requestNotificationPermission = async () => {
    const granted = await pwaService.requestNotificationPermission();
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
    return granted;
  };

  const sendNotification = async (title, options) => {
    return await pwaService.sendNotification(title, options);
  };

  const checkForUpdates = async () => {
    await pwaService.checkForUpdates();
  };

  const dismissUpdate = () => {
    setUpdateAvailable(false);
  };

  return {
    isInstallable,
    isInstalled,
    updateAvailable,
    notificationPermission,
    installApp,
    requestNotificationPermission,
    sendNotification,
    checkForUpdates,
    dismissUpdate
  };
};
