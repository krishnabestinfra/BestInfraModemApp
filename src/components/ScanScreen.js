import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,Alert,Linking } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";

export default function ScanScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState("off");

  const animatedLine = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }

    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedLine, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(animatedLine, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [permission]);

  if (!permission) return <View />;
  if (!permission.granted)
    return (
      <View style={{ marginTop: 50 }}>
        <Text>Please give camera permission</Text>
      </View>
    );

  const translateY = animatedLine.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 260],
  });

  const scanRules = [
    {
      // Any link (PDF, invoice, portal, etc.)
      test: (text) => /^https?:\/\/\S+/i.test(text),
      action: (text) => Linking.openURL(text),
    },
    {
      // UPI payments (if any)
      test: (text) => text.includes("upi://") || /^upi:\/\//i.test(text),
      action: (text) => Linking.openURL(text),
    },
    {
      // Base64 PDF data
      test: (text) => text.startsWith("data:application/pdf;base64,"),
      action: (text) => Linking.openURL(text),
    },
    {
      // JSON modem error/config logs
      test: (text) => {
        try { JSON.parse(text); return true; } 
        catch { return false; }
      },
      action: (text) => {
        const log = JSON.parse(text);
        Alert.alert("Modem Error Log", JSON.stringify(log, null, 2));
      },
    },
    {
      // Modem error text (non-JSON)
      test: (text) =>
        text.startsWith("ERROR") ||
        text.includes("Error") ||
        text.includes("Fault") ||
        text.includes("Warning"),
      action: (text) => Alert.alert("Modem Error", text),
    },
    {
      // Modem ID detection
      test: (text) => /^MDM[- ]?\d+/i.test(text),
      action: (text) => Alert.alert("Modem ID", text),
    },
  ];
  

  
  const onBarcodeScanned = ({ data }) => {
    if (!data) return;

    const rule = scanRules.find((r) => r.test(data));

    if (rule) {
      return rule.action(data); 
    }

    Alert.alert("Scanned Data", data);
  };

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        flash={flash === "torch" ? "torch" : "off"}
        enableTorch={flash === "torch"}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "ean13", "code128", "pdf417"],
        }}
        onBarcodeScanned={onBarcodeScanned}
      />

      <View style={styles.overlay}>
        <View style={styles.scanBox}>
          <Animated.View
            style={[styles.scanLine, { transform: [{ translateY }] }]}
          />
        </View>

        <TouchableOpacity
          style={styles.flashButton}
          onPress={() => setFlash(flash === "off" ? "torch" : "off")}
        >
          <Ionicons
            name={flash === "off" ? "flash" : "flash-off"}
            size={27}
            color="#fff"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={30} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  scanBox: {
    width: 260,
    height: 260,
    borderWidth: 3,
    borderColor: "#00E0FF",
    borderRadius: 18,
    overflow: "hidden",
  },
  scanLine: {
    width: "100%",
    height: 3,
    backgroundColor: "cyan",
    position: "absolute",
    top: 0,
  },
  flashButton: {
    position: "absolute",
    bottom: 120,
    padding: 14,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 50,
  },
  closeButton: {
    position: "absolute",
    top: 70,
    right: 20,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 50,
  },
});
