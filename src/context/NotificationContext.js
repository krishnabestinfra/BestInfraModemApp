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
  
  const [alertPollingActive, setAlertPollingActive] = useState(false);
  const previousAlertIdsRef = useRef(new Set());
  const isInitialLoadRef = useRef(true);
  const alertPollingIntervalRef = useRef(null);

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
      }
    })();
  }, []);

  const startTracking = async (modemId) => {
    setTrackingModemId(modemId);
    await AsyncStorage.setItem("trackingModemId", modemId);
  };

  const stopTracking = async () => {
    setTrackingModemId(null);
    await AsyncStorage.removeItem("trackingModemId");
  };

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
    
    setPopupNotification(newItem);
    setShowPopup(true);
    
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

    if (alertPollingIntervalRef.current) {
      clearInterval(alertPollingIntervalRef.current);
    }

    setAlertPollingActive(true);
    isInitialLoadRef.current = true;
    
    await checkForNewAlerts(modemIds, userPhone);
    
    alertPollingIntervalRef.current = setInterval(async () => {
      await checkForNewAlerts(modemIds, userPhone);
    }, 5 * 60 * 1000);
  }, [checkForNewAlerts]);

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
      let allAlerts = [];
      let offset = 0;
      let hasMore = true;
      const limit = 50; // API default limit

      while (hasMore) {
        const url = `${API_ENDPOINTS.GET_MODEM_ALERTS}?modems=${encodeURIComponent(modemQuery)}&limit=${limit}&offset=${offset}`;
        
        console.log("NotificationContext - Checking for new alerts, modems:", modemIds, `offset=${offset}, limit=${limit}`);
        
        const response = await fetch(url, {
          method: "GET",
          headers: getProtectedHeaders(API_KEY, userPhone),
        });
        
        const json = await response.json();

        console.log("NotificationContext - API Response Status:", response.status);

        if (!response.ok || (json.success === false) || json.error) {
          if (offset === 0) {
            const fallbackUrl = `${API_ENDPOINTS.GET_MODEM_ALERTS}?modems=${encodeURIComponent(modemQuery)}&limit=9999`;
            console.log("NotificationContext - Trying fallback URL without offset");
            const fallbackResponse = await fetch(fallbackUrl, {
              method: "GET",
              headers: getProtectedHeaders(API_KEY, userPhone),
            });
            const fallbackJson = await fallbackResponse.json();
            
            if (fallbackResponse.ok && !fallbackJson.error) {
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
          
          if (offset > 0) {
            console.log("NotificationContext - Error on offset > 0, stopping pagination");
            break;
          }
          
          console.warn("NotificationContext - API returned error:", json.error || "Unknown error");
          return;
        }

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

        if (alertsArray.length === 0) {
          hasMore = false;
          console.log("NotificationContext - No more alerts, stopping pagination");
        } else if (alertsArray.length < limit) {
          hasMore = false;
          console.log("NotificationContext - Got less than limit, this is the last page");
        } else {
          if (json.hasMore === false || json.nextPage === null || json.total !== undefined) {
            const total = json.total || (allAlerts.length + alertsArray.length);
            if (allAlerts.length + alertsArray.length >= total) {
              hasMore = false;
              console.log("NotificationContext - Reached total count from API metadata");
            }
          }
        }

        allAlerts = [...allAlerts, ...alertsArray];
        
        if (allAlerts.length >= 500) {
          console.warn("NotificationContext - Reached safety limit (500 items) for polling");
          break;
        }
        
        if (alertsArray.length < limit) {
          hasMore = false;
        } else {
          offset += limit;
        }
      }
      
      console.log("NotificationContext - Total alerts fetched:", allAlerts.length);

      const alertsArray = allAlerts;
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
      
      if (!isInitialLoadRef.current && filteredAlerts.length > 0) {
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
        
        const newAlerts = filteredAlerts.filter(alert => {
          const alertId = getAlertId(alert);
          return !previousAlertIdsRef.current.has(alertId);
        });
        
        console.log("NotificationContext - New alerts detected:", newAlerts.length);
        
        if (newAlerts.length > 0) {
          for (const newAlert of newAlerts) {
            const modemId = newAlert.modemSlNo || newAlert.modemno || newAlert.sno || 'Unknown';
            const errorType = newAlert.codeDesc || newAlert.error || 'Alert';
            const errorCode = newAlert.code || newAlert.errorCode || '';
            
            await pushNotification(
              "New Alert",
              `Modem ${modemId}: ${errorType}${errorCode ? ` (Code: ${errorCode})` : ''}`
            );
            
            await new Promise(resolve => setTimeout(resolve, 800));
          }
        }
        
        previousAlertIdsRef.current = currentAlertIds;
      } else if (isInitialLoadRef.current) {
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
  }, []);

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
