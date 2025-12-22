import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { notifications as dummyNotifications } from "../data/dummyData";

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
          // Check if we have the new alert-related notifications by checking IDs or content
          const expectedIds = ['NTF001', 'NTF002', 'NTF003', 'NTF004', 'NTF005', 'NTF006'];
          const hasNewNotifications = parsed.some(n => expectedIds.includes(n.id));
          
          // Also check for old payment/balance keywords
          const hasOldNotifications = parsed.some(n => 
            n.title?.includes('Payment') || 
            n.title?.includes('Balance') || 
            n.message?.includes('₹')
          );
          
          // Replace if we have old notifications OR if we don't have the new ones
          if (hasOldNotifications || !hasNewNotifications || parsed.length === 0) {
            // Replace with new alert-related notifications
            setNotifications(dummyNotifications);
            await AsyncStorage.setItem("notifications", JSON.stringify(dummyNotifications));
          } else {
            setNotifications(parsed);
          }
        } else {
          // Initialize with dummy notifications if no saved data
          setNotifications(dummyNotifications);
          await AsyncStorage.setItem("notifications", JSON.stringify(dummyNotifications));
        }
      } catch (e) {
        // Initialize with dummy data on error
        setNotifications(dummyNotifications);
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
