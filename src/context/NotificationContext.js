import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [trackingModemId, setTrackingModemId] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Load saved data
  useEffect(() => {
    (async () => {
      const savedModem = await AsyncStorage.getItem("trackingModemId");
      const savedNoti = await AsyncStorage.getItem("notifications");
      if (savedModem) setTrackingModemId(savedModem);
      if (savedNoti) setNotifications(JSON.parse(savedNoti));
    })();
  }, []);

  // Save selected modem when user taps "Get Direction"
  const startTracking = async (modemId) => {
    setTrackingModemId(modemId);
    await AsyncStorage.setItem("trackingModemId", modemId);
  };

  // Stop tracking when resolved
  const stopTracking = async () => {
    setTrackingModemId(null);
    await AsyncStorage.removeItem("trackingModemId");
  };

  // Add notification
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
  };

  // 5 min checker
  useEffect(() => {
    if (!trackingModemId) return;

    const interval = setInterval(() => checkStatus(), 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [trackingModemId]);

  // API CALL
  async function checkStatus() {
    try {
      const url = `https://api.bestinfra.app/v2tgnpdcl/api/modems/modem/${trackingModemId}/status`;
      const res = await fetch(url);
      const json = await res.json();

      if (json.success && json.data.status === "resolved") {
        await pushNotification(
          "Modem Resolved",
          `Modem ${trackingModemId} issue has been resolved`
        );
        await stopTracking();
      }
    } catch (e) {
      console.log("Error in checking modem status:", e);
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
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
