import React, { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';

export const NotificationSettings = () => {
  const {
    settings,
    loading,
    updateSettings,
    requestPermission,
    sendTestNotification,
    enableNotifications,
    disableNotifications,
    updateAlertThreshold,
    updateLocationThreshold
  } = useNotifications();

  const [testResult, setTestResult] = useState(null);

  const handleToggleNotifications = async () => {
    if (settings.isEnabled) {
      await disableNotifications();
    } else {
      await enableNotifications();
    }
  };

  const handleTestNotification = async () => {
    setTestResult(null);
    const result = await sendTestNotification();
    setTestResult(result.success ? 'Test notification sent!' : 'Failed to send test notification');
  };

  const handleAlertThresholdChange = async (e) => {
    const threshold = parseFloat(e.target.value);
    await updateAlertThreshold(threshold);
  };

  const handleLocationThresholdChange = async (e) => {
    const threshold = parseInt(e.target.value);
    await updateLocationThreshold(threshold);
  };

  if (loading) {
    return (
      <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
        <div className="loading" style={{ height: '20px' }}></div>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: '20px' }}>
      <div className="card-header">
        <h3 className="card-title accent">Notification Settings</h3>
        <div className={`badge ${settings.isEnabled ? 'success' : 'danger'}`}>
          {settings.isEnabled ? 'Enabled' : 'Disabled'}
        </div>
      </div>

      {!settings.isSupported && (
        <div style={{ 
          background: '#FEF2F2', 
          border: '1px solid #FECACA', 
          color: '#DC2626', 
          padding: '12px', 
          borderRadius: '8px', 
          marginBottom: '16px',
          fontSize: '14px'
        }}>
          Notifications are not supported in this browser. Please use a modern browser like Chrome, Firefox, or Safari.
        </div>
      )}

      <div style={{ display: 'grid', gap: '20px' }}>
        {/* Enable/Disable Notifications */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.isEnabled}
              onChange={handleToggleNotifications}
              disabled={!settings.isSupported}
              style={{ width: '18px', height: '18px' }}
            />
            <span style={{ fontWeight: 600 }}>Enable Earthquake Alerts</span>
          </label>
          <p className="muted" style={{ marginTop: '4px', fontSize: '14px' }}>
            Receive push notifications for significant earthquakes near your location
          </p>
        </div>

        {/* Alert Threshold */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
            Alert Threshold (Magnitude)
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="range"
              min="3.0"
              max="7.0"
              step="0.1"
              value={settings.alertThreshold}
              onChange={handleAlertThresholdChange}
              disabled={!settings.isEnabled}
              style={{ flex: 1 }}
            />
            <span style={{ minWidth: '60px', textAlign: 'center', fontWeight: 600 }}>
              M {settings.alertThreshold.toFixed(1)}
            </span>
          </div>
          <p className="muted" style={{ marginTop: '4px', fontSize: '14px' }}>
            Only earthquakes above this magnitude will trigger notifications
          </p>
        </div>

        {/* Location Threshold */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
            Location Radius (km)
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="range"
              min="10"
              max="200"
              step="10"
              value={settings.locationThreshold}
              onChange={handleLocationThresholdChange}
              disabled={!settings.isEnabled}
              style={{ flex: 1 }}
            />
            <span style={{ minWidth: '60px', textAlign: 'center', fontWeight: 600 }}>
              {settings.locationThreshold} km
            </span>
          </div>
          <p className="muted" style={{ marginTop: '4px', fontSize: '14px' }}>
            Only earthquakes within this distance from your location will trigger notifications
          </p>
        </div>

        {/* Current Location */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
            Current Location
          </label>
          <div style={{ 
            padding: '12px', 
            background: '#F8FAFC', 
            border: '1px solid #E2E8F0', 
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            {settings.userLocation ? (
              <div>
                <div style={{ fontWeight: 600 }}>{settings.userLocation.name}</div>
                <div className="muted">
                  {settings.userLocation.lat.toFixed(4)}, {settings.userLocation.lng.toFixed(4)}
                </div>
              </div>
            ) : (
              <div className="muted">No location set</div>
            )}
          </div>
        </div>

        {/* Test Notification */}
        <div>
          <button
            onClick={handleTestNotification}
            disabled={!settings.isEnabled}
            className="btn primary"
            style={{ 
              opacity: !settings.isEnabled ? 0.6 : 1,
              marginBottom: '8px'
            }}
          >
            Send Test Notification
          </button>
          {testResult && (
            <div style={{ 
              fontSize: '14px',
              color: testResult.includes('sent') ? 'var(--success)' : 'var(--danger)'
            }}>
              {testResult}
            </div>
          )}
        </div>

        {/* Notification Status */}
        <div style={{ 
          padding: '12px', 
          background: settings.isEnabled ? '#ECFDF5' : '#FEF2F2', 
          border: `1px solid ${settings.isEnabled ? '#D1FAE5' : '#FECACA'}`, 
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>
            Notification Status
          </div>
          <div style={{ color: settings.isEnabled ? 'var(--success)' : 'var(--danger)' }}>
            {settings.isEnabled ? '✅ Notifications are enabled' : '❌ Notifications are disabled'}
          </div>
          {settings.isEnabled && (
            <div className="muted" style={{ marginTop: '4px' }}>
              You'll receive alerts for earthquakes M{settings.alertThreshold.toFixed(1)}+ within {settings.locationThreshold}km
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
