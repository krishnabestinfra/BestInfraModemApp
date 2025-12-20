import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [trackingModemId, setTrackingModemId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupNotification, setPopupNotification] = useState(null);

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
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
