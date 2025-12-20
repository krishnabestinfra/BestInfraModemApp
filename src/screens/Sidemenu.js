import React, { useState } from "react";
import { ScrollView, StyleSheet, View, Pressable } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { BlurView } from "expo-blur";
import { COLORS } from "../constants/colors";
import MenuIcon from "../../assets/icons/barsWhite.svg";
import NotificationIcon from "../../assets/icons/notification.svg";
import Logo from "../components/global/Logo";
import ConfirmationModal from "../components/global/ConfirmationModal";

import DashboardScreen from "../screens/DashboardScreen";
import OfflineModemsScreen from "../screens/OfflineModemsScreen";
import VisitedScreen from "../screens/VisitedScreen";
import { useSidebar } from "../context/SidebarContext";
import SideMenuNavigation from "../components/SideMenuNavigation";
import DashboardIcon from "../../assets/icons/dashboardMenu.svg";
import ActiveDashboard from "../../assets/icons/activeDashboard.svg";
import QRScannerIcon from "../../assets/icons/QRscanner.svg";
import CompletedTasksIcon from "../../assets/icons/completedtasks.svg";
import NonCommunicatingModemsIcon from "../../assets/icons/noncommicating.svg";


const SideMenu = ({ navigation, onLogout, modems = [], modemIds = [], userPhone }) => {
  const insets = useSafeAreaInsets();
  const { activeItem, setActiveItem } = useSidebar();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);


  const renderContent = () => {
    switch (activeItem) {
      case "Dashboard":
        return <DashboardScreen navigation={navigation} modems={modems} modemIds={modemIds} userPhone={userPhone} />;
      
      case "OfflineModems":
        return <OfflineModemsScreen navigation={navigation} modems={modems} modemIds={modemIds} userPhone={userPhone} />;
  
      case "Visited":
        return <VisitedScreen navigation={navigation} modems={modems} modemIds={modemIds} userPhone={userPhone} />;
      
      default:
        return <DashboardScreen navigation={navigation} modems={modems} modemIds={modemIds} userPhone={userPhone} />;
    }
  };

  const handleMenuPress = (item) => {
    setActiveItem(item.key);
    // Navigate to the route if it exists
    if (item.route) {
      // Always navigate to ensure the screen is shown
      // The inline content (via activeItem) will also update for visual feedback
      navigation.navigate(item.route, {
        modems: modems,
        modemIds: modemIds,
        userPhone: userPhone,
      });
    }
  };

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const handleConfirmLogout = () => {
    setLogoutModalVisible(false);
    if (onLogout) {
      onLogout();
    } else {
      navigation?.replace?.("Login");
    }
  };

  const handleCancelLogout = () => {
    setLogoutModalVisible(false);
  };


  return (
    <SafeAreaView style={styles.Container} edges={[]}>
      <StatusBar style="light" />

      <View style={styles.TopMenu}>
        <Pressable
          style={styles.barsIcon}
          onPress={() => navigation.navigate("Dashboard")}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MenuIcon width={18} height={18} fill="#fff" />
        </Pressable>

        <Pressable
          style={styles.logoContainer}
          onPress={() => navigation.navigate("Dashboard")}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Logo variant="white" size="medium" />
        </Pressable>

        <Pressable
          style={styles.bellIcon}
          onPress={() => navigation.navigate("Profile")}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <NotificationIcon width={18} height={18} fill="#000" />
        </Pressable>
      </View>

      <View style={styles.MenuContainer}>

        <View style={styles.menubar}>
          <SideMenuNavigation
            items={[
              {
                key: "Dashboard",
                label: "Dashboard",
                route: "Dashboard",
                Icon: DashboardIcon,
                ActiveIcon: ActiveDashboard
              },
              {
                key: "OfflineModems",
                label: "Offline Modems",
                route: "OfflineModems",
                Icon: NonCommunicatingModemsIcon,
                ActiveIcon: NonCommunicatingModemsIcon
              },
              {
                key: "Visited",
                label: "Visited",
                route: "Visited",
                Icon: CompletedTasksIcon,
                ActiveIcon: CompletedTasksIcon
              },
              {
                key: "QRScanner",
                label: "QR Scanner",
                route: "ScanScreen",
                Icon: QRScannerIcon,
                ActiveIcon: QRScannerIcon
              },
            ]}
            activeItem={activeItem}
            onSelect={handleMenuPress}
            onLogout={handleLogout}
          />
        </View>

        <View style={[styles.componentsbar, { paddingBottom: insets.bottom }]}>

          <ScrollView scrollEnabled={false} style={styles.DashComponentsbar}>
            {renderContent()}
          </ScrollView>

          <ScrollView scrollEnabled={false} style={styles.LoginComponentsbar}>
            <BlurView tint="dark" style={styles.blurContainer}>
              {renderContent()}
            </BlurView>
          </ScrollView>

        </View>
      </View>

      <ConfirmationModal
        visible={logoutModalVisible}
        title="Logout"
        message="Are you sure you want to logout?"
        onCancel={handleCancelLogout}
        onConfirm={handleConfirmLogout}
        cancelText="Cancel"
        confirmText="Logout"
        confirmButtonColor="#F44336"
      />
    </SafeAreaView>
  );
};

export default SideMenu;


const styles = StyleSheet.create({
  Container: {
    backgroundColor: COLORS.brandBlueColor,
    flex: 1

  },
  TopMenu: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 75,
    paddingBottom: 35,
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  barsIcon: {
    backgroundColor: COLORS.secondaryColor,
    width: 54,
    height: 54,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  bellIcon: {
    backgroundColor: COLORS.secondaryFontColor,
    width: 54,
    height: 54,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  MenuContainer: {
    flexDirection: "row",
    flex: 1,
  },
  menubar: {
    paddingLeft: 30,
    paddingTop: 30,
    width: 260,
  },
  componentsbar: {
    position: "relative",
    height: "85%",
  },
  DashComponentsbar: {
    top:40,
    height: "100%",
    backgroundColor: "#eef8f0",
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    zIndex: 999,
    marginLeft: 30,
    elevation: 10,
  },
  LoginComponentsbar: {
    position: "absolute",
    height: "85%",
    top: 80,
    backgroundColor: "#eef8f0",
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    elevation: 10,
    opacity: 0.3,
  },
  blurContainer: {
    flex: 1,

  },
});
