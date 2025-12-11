import React, { createContext, useEffect, useState, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_KEY, API_ENDPOINTS, getProtectedHeaders } from "../config/apiConfig";

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
  const startAlertPolling = async (modemIds, userPhone) => {
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
  };

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
  const checkForNewAlerts = async (modemIds, userPhone) => {
    try {
      if (!modemIds || modemIds.length === 0 || !userPhone) {
        console.log("NotificationContext - Skipping alert check: missing modemIds or userPhone");
        return;
      }

      const modemQuery = modemIds.join(",");
      let allAlerts = [];
      let offset = 0;
      let hasMore = true;
      const limit = 50; // API default limit

      // Fetch all pages using offset-based pagination
      while (hasMore) {
        // Try offset-based pagination (more common than page-based)
        const url = `${API_ENDPOINTS.GET_MODEM_ALERTS}?modems=${encodeURIComponent(modemQuery)}&limit=${limit}&offset=${offset}`;
        
        console.log("NotificationContext - Checking for new alerts, modems:", modemIds, `offset=${offset}, limit=${limit}`);
        
        const response = await fetch(url, {
          method: "GET",
          headers: getProtectedHeaders(API_KEY, userPhone),
        });
        
        const json = await response.json();

        console.log("NotificationContext - API Response Status:", response.status);

        // Check if API returned an error
        if (!response.ok || (json.success === false) || json.error) {
          // If first page fails, try without offset parameter (fallback)
          if (offset === 0) {
            const fallbackUrl = `${API_ENDPOINTS.GET_MODEM_ALERTS}?modems=${encodeURIComponent(modemQuery)}&limit=9999`;
            console.log("NotificationContext - Trying fallback URL without offset");
            const fallbackResponse = await fetch(fallbackUrl, {
              method: "GET",
              headers: getProtectedHeaders(API_KEY, userPhone),
            });
            const fallbackJson = await fallbackResponse.json();
            
            if (fallbackResponse.ok && !fallbackJson.error) {
              // Handle different response structures
              if (Array.isArray(fallbackJson)) {
                allAlerts = fallbackJson;
              } else if (Array.isArray(fallbackJson.alerts)) {
                allAlerts = fallbackJson.alerts;
              } else if (Array.isArray(fallbackJson.data?.alerts)) {
                allAlerts = fallbackJson.data.alerts;
              } else if (Array.isArray(fallbackJson.data)) {
                allAlerts = fallbackJson.data;
              }
              console.log("NotificationContext - Fallback successful, got", allAlerts.length, "alerts");
              break;
            }
          }
          
          // If not first page, stop pagination
          if (offset > 0) {
            console.log("NotificationContext - Error on offset > 0, stopping pagination");
            break;
          }
          
          console.warn("NotificationContext - API returned error:", json.error || "Unknown error");
          return;
        }

        // Handle different response structures
        let alertsArray = [];
        if (Array.isArray(json)) {
          alertsArray = json;
        } else if (Array.isArray(json.alerts)) {
          alertsArray = json.alerts;
        } else if (Array.isArray(json.data?.alerts)) {
          alertsArray = json.data.alerts;
        } else if (Array.isArray(json.data)) {
          alertsArray = json.data;
        }

        console.log(`NotificationContext - Page ${Math.floor(offset / limit) + 1}: Got ${alertsArray.length} alerts (total so far: ${allAlerts.length + alertsArray.length})`);

        // Check if we got less than the limit (last page)
        if (alertsArray.length === 0) {
          hasMore = false;
          console.log("NotificationContext - No more alerts, stopping pagination");
        } else if (alertsArray.length < limit) {
          hasMore = false;
          console.log("NotificationContext - Got less than limit, this is the last page");
        } else {
          // Check if API provides pagination metadata
          if (json.hasMore === false || json.nextPage === null || json.total !== undefined) {
            const total = json.total || (allAlerts.length + alertsArray.length);
            if (allAlerts.length + alertsArray.length >= total) {
              hasMore = false;
              console.log("NotificationContext - Reached total count from API metadata");
            }
          }
        }

        allAlerts = [...allAlerts, ...alertsArray];
        
        // Safety check: stop after fetching 500 items (10 pages of 50) for polling
        if (allAlerts.length >= 500) {
          console.warn("NotificationContext - Reached safety limit (500 items) for polling");
          break;
        }
        
        // If we got exactly the limit, there might be more
        if (alertsArray.length < limit) {
          hasMore = false;
        } else {
          offset += limit;
        }
      }
      
      console.log("NotificationContext - Total alerts fetched:", allAlerts.length);

      // Use allAlerts as alertsArray for filtering
      const alertsArray = allAlerts;

      // FILTER ALERTS FOR THIS FIELD OFFICER ONLY
      const filteredAlerts = alertsArray.filter(item => {
        const keysToCheck = [
          item.modemSlNo,
          item.modemno,
          item.sno?.toString(),
          item.modemId
        ];
      
        return keysToCheck.some(key => key && modemIds.includes(key));
      });
      
      console.log("NotificationContext - Total alerts from API:", alertsArray.length);
      console.log("NotificationContext - Modem IDs for filtering:", modemIds);
      console.log("NotificationContext - Filtered alerts count:", filteredAlerts.length);
      
      // Detect new alerts and show notifications
      if (!isInitialLoadRef.current && filteredAlerts.length > 0) {
        // Create a unique ID for each alert (using multiple fields for better matching)
        const getAlertId = (alert) => {
          return alert.id?.toString() || 
                 alert.modemSlNo?.toString() || 
                 alert.modemno?.toString() || 
                 alert.sno?.toString() || 
                 `${alert.modemSlNo || alert.modemno || alert.sno || 'unknown'}-${alert.code || alert.errorCode || 'no-code'}-${alert.logTimestamp || alert.date || 'no-date'}`;
        };
        
        const currentAlertIds = new Set(
          filteredAlerts.map(alert => getAlertId(alert))
        );
        
        // Find new alerts (alerts that weren't in previous set)
        const newAlerts = filteredAlerts.filter(alert => {
          const alertId = getAlertId(alert);
          return !previousAlertIdsRef.current.has(alertId);
        });
        
        console.log("NotificationContext - New alerts detected:", newAlerts.length);
        
        // Show notification for EACH new alert (not just the first one)
        if (newAlerts.length > 0) {
          for (const newAlert of newAlerts) {
            const modemId = newAlert.modemSlNo || newAlert.modemno || newAlert.sno || 'Unknown';
            const errorType = newAlert.codeDesc || newAlert.error || 'Alert';
            const errorCode = newAlert.code || newAlert.errorCode || '';
            
            await pushNotification(
              "New Alert",
              `Modem ${modemId}: ${errorType}${errorCode ? ` (Code: ${errorCode})` : ''}`
            );
            
            // Add small delay between notifications to avoid overwhelming the user
            await new Promise(resolve => setTimeout(resolve, 800));
          }
        }
        
        // Update previous alert IDs
        previousAlertIdsRef.current = currentAlertIds;
      } else if (isInitialLoadRef.current) {
        // On first load, just store the alert IDs without showing notifications
        const getAlertId = (alert) => {
          return alert.id?.toString() || 
                 alert.modemSlNo?.toString() || 
                 alert.modemno?.toString() || 
                 alert.sno?.toString() || 
                 `${alert.modemSlNo || alert.modemno || alert.sno || 'unknown'}-${alert.code || alert.errorCode || 'no-code'}-${alert.logTimestamp || alert.date || 'no-date'}`;
        };
        
        const currentAlertIds = new Set(
          filteredAlerts.map(alert => getAlertId(alert))
        );
        previousAlertIdsRef.current = currentAlertIds;
        isInitialLoadRef.current = false;
        console.log("NotificationContext - Initial load complete. Stored", currentAlertIds.size, "alert IDs");
      }
    } catch (error) {
      console.error("NotificationContext - checkForNewAlerts ERROR:", error);
      console.error("NotificationContext - Error details:", error.message);
    }
  };

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

  return (
    <NotificationContext.Provider
      value={{
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
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
