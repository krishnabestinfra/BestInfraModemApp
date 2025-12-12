import React, { useEffect, useState } from "react";
import { View, StyleSheet, Image, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import RippleLogo from "../components/global/RippleLogo";
import ForceUpdateModal from "../components/ForceUpdateModal";
import { checkAppVersion } from "../utils/versionCheck";

const { width, height } = Dimensions.get("window");

const SplashScreen = ({ onFinish }) => {
  const [updateInfo, setUpdateInfo] = useState(null);
  const [versionChecked, setVersionChecked] = useState(false);

  useEffect(() => {
    const performVersionCheck = async () => {
      try {
        const info = await checkAppVersion();
        if (info?.needsUpdate) {
          setUpdateInfo(info);
        }
        setVersionChecked(true);
      } catch (error) {
        console.error('Version check error:', error);
        setVersionChecked(true);
      }
    };

    performVersionCheck();
  }, []);

  useEffect(() => {
    if (versionChecked && !updateInfo) {
      const timer = setTimeout(() => {
        onFinish?.();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [versionChecked, updateInfo, onFinish]);

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <StatusBar style="light" />
      
      <Image 
        source={require("../../assets/images/onboardingbg.png")} 
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      
      <View style={styles.overlay} />
      
      <View style={styles.centerWrapper}>
        <RippleLogo size={120} logoVariant="white" logoSize="large" />
      </View>

      {updateInfo && (
        <ForceUpdateModal
          visible={true}
          message={updateInfo.message}
          storeUrl={updateInfo.storeUrl}
        />
      )}
    </SafeAreaView>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1f255e",
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: width,
    height: "100%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)", 
  },
  centerWrapper: {
    flex: 1,
    justifyContent: "center", 
    alignItems: "center", 
    zIndex: 1, 
  },
});