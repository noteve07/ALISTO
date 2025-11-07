import { useEffect, useRef, useState } from 'react';
import { useVolcanicAdvisories } from './useVolcanicAdvisories';
import volcanoes from '../../../assets/gis/volcanoes.json';

/**
 * Hook for monitoring volcanic advisories and triggering alerts for new high-level advisories
 * Similar to earthquake alerts but for volcanic activities
 */
export const useVolcanicAdvisoryAlerts = (onAlert) => {
  const { advisories } = useVolcanicAdvisories();
  const [lastAlertId, setLastAlertId] = useState(null);
  const previousAdvisoriesRef = useRef(new Set());
  const alertTimeoutRef = useRef(null);
  const isInitialLoadRef = useRef(true); // Track if this is the initial data load

  // Get volcano coordinates by ID
  const getVolcanoCoordinates = (volcanoId) => {
    const volcano = volcanoes.find(v => v.id === volcanoId);
    return volcano ? [volcano.latitude, volcano.longitude] : null;
  };

  // Check if an advisory should trigger an alert
  const shouldTriggerAlert = (advisory) => {
    if (!advisory || !advisory.alertLevel) {
      return false;
    }

    // Only trigger alerts for specific volcanoes for demo purposes:
    // Pinatubo (ID 21) or Isarog (ID 13)
    const targetVolcanoes = [21, 13]; // Pinatubo, Isarog
    if (!targetVolcanoes.includes(advisory.id)) {
      console.log(`🌋 Skipping alert for volcano ID ${advisory.id} - not a target volcano`);
      return false;
    }

    // Trigger alert for alert levels 2 and above (moderate unrest and higher)
    return advisory.alertLevel >= 2;
  };

  // Monitor advisories for new high-level alerts
  useEffect(() => {
    if (!advisories.length) {
      return;
    }

    console.log('🌋 Checking volcanic advisories for alerts:', advisories);

    // Create current advisory IDs set
    const currentAdvisoryIds = new Set(
      advisories.map(advisory => `${advisory.id}-${advisory.alertLevel}`)
    );

    // On initial load, just populate the previous advisories without triggering alerts
    if (isInitialLoadRef.current) {
      console.log('🌋 Initial load - setting baseline advisories without alerts');
      previousAdvisoriesRef.current = currentAdvisoryIds;
      isInitialLoadRef.current = false;
      return;
    }

    // Find new advisories that weren't in the previous state
    const newAdvisories = advisories.filter(advisory => {
      const advisoryKey = `${advisory.id}-${advisory.alertLevel}`;
      return !previousAdvisoriesRef.current.has(advisoryKey) && 
             shouldTriggerAlert(advisory);
    });

    // If there are new high-level advisories, trigger alert for the highest level one
    if (newAdvisories.length > 0) {
      // Sort by alert level (highest first) and get the most critical one
      const mostCriticalAdvisory = newAdvisories.sort((a, b) => b.alertLevel - a.alertLevel)[0];
      
      console.log('🚨 New critical volcanic advisory detected (real-time update):', mostCriticalAdvisory);
      
      // Prevent duplicate alerts for the same advisory
      const alertKey = `${mostCriticalAdvisory.id}-${mostCriticalAdvisory.alertLevel}`;
      if (lastAlertId !== alertKey) {
        setLastAlertId(alertKey);

        // Get volcano coordinates for map panning
        const coordinates = getVolcanoCoordinates(mostCriticalAdvisory.id);

        // Clear any existing timeout
        if (alertTimeoutRef.current) {
          clearTimeout(alertTimeoutRef.current);
        }

        // Trigger the alert callback with a slight delay to ensure UI is ready
        alertTimeoutRef.current = setTimeout(() => {
          if (onAlert) {
            onAlert({
              ...mostCriticalAdvisory,
              coordinates,
              type: 'volcanic_advisory'
            });
          }
        }, 500);
      }
    }

    // Update the previous advisories reference
    previousAdvisoriesRef.current = currentAdvisoryIds;
  }, [advisories, onAlert, lastAlertId]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }
    };
  }, []);

  return {
    advisories,
    getVolcanoCoordinates
  };
};