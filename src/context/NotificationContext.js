import React, { createContext, useEffect, useState, useRef, useMemo, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_KEY, API_ENDPOINTS, getProtectedHeaders } from "../config/apiConfig";
import { cachedFetch } from "../utils/apiCache";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [trackingModemId, setTrackingModemId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupNotification, setPopupNotification] = useState(null);
  
  // Alert polling state
  const [alertPollingActive, setAlertPollingActive] = useState(false);
  const previousAlertIdsRef = useRef(new Set());
  const isInitialLoadRef = useRef(true);
  const alertPollingIntervalRef = useRef(null);

  // Load saved data
  useEffect(() => {
    (async () => {
      try {
        const savedModem = await AsyncStorage.getItem("trackingModemId");
        const savedNoti = await AsyncStorage.getItem("notifications");
        if (savedModem) {
          setTrackingModemId(savedModem);
        }
        if (savedNoti) {
          const parsed = JSON.parse(savedNoti);
          setNotifications(parsed);
        }
      } catch (e) {
        // Silent error handling
      }
    })();
  }, []);

  const startTracking = async (modemId) => {
    setTrackingModemId(modemId);
    await AsyncStorage.setItem("trackingModemId", modemId);
  };

  // Stop tracking when resolved
  const stopTracking = async () => {
    setTrackingModemId(null);
    await AsyncStorage.removeItem("trackingModemId");
  };

  // Add notification (with popup)
  const pushNotification = async (title, message) => {
    const newItem = {
      id: Date.now().toString(),
      title,
      message,
      type: "success",
      created_at: new Date().toISOString(),
      is_read: false,
    };

    const updated = [newItem, ...notifications];
    setNotifications(updated);
    await AsyncStorage.setItem("notifications", JSON.stringify(updated));
    
    // Show popup notification
    setPopupNotification(newItem);
    setShowPopup(true);
    
    // Auto-hide popup after 5 seconds
    setTimeout(() => {
      setShowPopup(false);
      setPopupNotification(null);
    }, 5000);
  };

  // Start alert polling for new alerts
  const startAlertPolling = useCallback(async (modemIds, userPhone) => {
    if (!modemIds || modemIds.length === 0 || !userPhone) {
      return;
    }

    // Stop any existing polling
    if (alertPollingIntervalRef.current) {
      clearInterval(alertPollingIntervalRef.current);
    }

    setAlertPollingActive(true);
    isInitialLoadRef.current = true;
    
    // Initial fetch
    await checkForNewAlerts(modemIds, userPhone);
    
    // Poll every 5 minutes
    alertPollingIntervalRef.current = setInterval(async () => {
      await checkForNewAlerts(modemIds, userPhone);
    }, 5 * 60 * 1000);
  }, [checkForNewAlerts]);

  // Stop alert polling
  const stopAlertPolling = () => {
    if (alertPollingIntervalRef.current) {
      clearInterval(alertPollingIntervalRef.current);
      alertPollingIntervalRef.current = null;
    }
    setAlertPollingActive(false);
    isInitialLoadRef.current = true;
    previousAlertIdsRef.current.clear();
  };

  // Check for new alerts
  const checkForNewAlerts = useCallback(async (modemIds, userPhone) => {
    try { 
      if (!modemIds || modemIds.length === 0 || !userPhone) return;

      const modemQuery = modemIds.join(",");
      const url = `${API_ENDPOINTS.GET_MODEM_ALERTS}?modems=${encodeURIComponent(modemQuery)}`;
      const headers = getProtectedHeaders(API_KEY, userPhone);
      
      // Use cached fetch - cache for 4 minutes (less than polling interval)
      const response = await cachedFetch(url, {
        method: "GET",
        headers,
      }, 4 * 60 * 1000);
      
      const json = await response.json();

      // Check if API returned an error
      if (!response.ok || (json.success === false) || json.error) {
        return;
      }

      // FILTER ALERTS FOR THIS FIELD OFFICER ONLY
      const filteredAlerts = Array.isArray(json.alerts)
        ? json.alerts.filter(item => {
            const keysToCheck = [
              item.modemSlNo,
              item.modemno,
              item.sno?.toString(),
              item.modemId
            ];
      
            return keysToCheck.some(key => key && modemIds.includes(key));
          })
        : [];
      
      // Detect new alerts and show notifications
      if (!isInitialLoadRef.current && filteredAlerts.length > 0) {
        const currentAlertIds = new Set(
          filteredAlerts.map(alert => 
            alert.id?.toString() || 
            alert.modemSlNo || 
            alert.modemno || 
            alert.sno?.toString() || 
            `alert-${Date.now()}`
          )
        );
        
        // Find new alerts (alerts that weren't in previous set)
        const newAlerts = filteredAlerts.filter(alert => {
          const alertId = alert.id?.toString() || 
                         alert.modemSlNo || 
                         alert.modemno || 
                         alert.sno?.toString() || 
                         `alert-${Date.now()}`;
          return !previousAlertIdsRef.current.has(alertId);
        });
        
        // Show notification for the first new alert
        if (newAlerts.length > 0) {
          const firstNewAlert = newAlerts[0];
          const modemId = firstNewAlert.modemSlNo || firstNewAlert.modemno || firstNewAlert.sno || 'Unknown';
          const errorType = firstNewAlert.codeDesc || firstNewAlert.error || 'Alert';
          
          await pushNotification(
            "New Alert",
            `Modem ${modemId}: ${errorType}`
          );
        }
        
        // Update previous alert IDs
        previousAlertIdsRef.current = currentAlertIds;
      } else if (isInitialLoadRef.current) {
        // On first load, just store the alert IDs without showing notifications
        const currentAlertIds = new Set(
          filteredAlerts.map(alert => 
            alert.id?.toString() || 
            alert.modemSlNo || 
            alert.modemno || 
            alert.sno?.toString() || 
            `alert-${Date.now()}`
          )
        );
        previousAlertIdsRef.current = currentAlertIds;
        isInitialLoadRef.current = false;
      }
    } catch (error) {
      // Silent error handling
    }
  }, []);

  // 5 min checker for modem status
  useEffect(() => {
    if (!trackingModemId) return;

    const interval = setInterval(() => checkStatus(), 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [trackingModemId]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (alertPollingIntervalRef.current) {
        clearInterval(alertPollingIntervalRef.current);
      }
    };
  }, []);

  // API CALL - Check modem status via /modems/modem/{modemId}/status
  async function checkStatus() {
    try {
      if (!trackingModemId) return;

      // Use the status API endpoint
      const url = `https://api.bestinfra.app/v2tgnpdcl/api/modems/modem/${trackingModemId}/status`;
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();

      // Check if modem status is "resolved"
      if (json.success && json.data && json.data.status === "resolved") {
        await pushNotification(
          "Modem Resolved",
          `Modem ${trackingModemId} issue has been automatically resolved`
        );
        await stopTracking();
      }
    } catch (e) {
      // Silent error handling
    }
  }

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    trackingModemId,
    notifications,
    startTracking,
    stopTracking,
    setNotifications,
    showPopup,
    popupNotification,
    setShowPopup,
    pushNotification,
    startAlertPolling,
    stopAlertPolling,
    alertPollingActive,
  }), [
    trackingModemId,
    notifications,
    showPopup,
    popupNotification,
    alertPollingActive,
    startAlertPolling,
  ]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};
