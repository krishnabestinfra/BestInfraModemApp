import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { BlurView } from "expo-blur";
import { COLORS } from "../constants/colors";
import MenuIcon from "../../assets/icons/barsWhite.svg";
import NotificationIcon from "../../assets/icons/notification.svg";
import Logo from "../components/global/Logo";
import AppHeader from "../components/global/AppHeader";

import DashboardScreen from "../screens/DashboardScreen";
import Troubleshoot from "../screens/TroubleshootScreen";
import CompletedActivities from "../screens/CompletedActivities";
import { useSidebar } from "../context/SidebarContext";
import SideMenuNavigation from "../components/SideMenuNavigation";
import DashboardIcon from "../../assets/icons/dashboardMenu.svg";
import ActiveDashboard from "../../assets/icons/activeDashboard.svg";
import ActiveTickets from "../../assets/icons/activeTickets.svg";
import MetersIcon from "../../assets/icons/meterWhite.svg";
import QRScannerIcon from "../../assets/icons/QRscanner.svg";


const SideMenu = ({ navigation, onLogout, modems = [], modemIds = [], userPhone }) => {
  const insets = useSafeAreaInsets();
  const { activeItem, setActiveItem } = useSidebar();


  const renderContent = () => {
    switch (activeItem) {
      case "Dashboard":
        return <DashboardScreen navigation={navigation} modems={modems} modemIds={modemIds} userPhone={userPhone} />;
  
      case "Resolved":
        return <CompletedActivities navigation={navigation} modems={modems} modemIds={modemIds} userPhone={userPhone} />;
      
      default:
        return <DashboardScreen navigation={navigation} modems={modems} modemIds={modemIds} userPhone={userPhone} />;
    }
  };
  
  


  const handleMenuPress = (item) => {
    setActiveItem(item.key);
    if (item.route) navigation.navigate(item.route);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      navigation?.replace?.("Login");
    }
  };


  return (
    <SafeAreaView style={styles.Container} edges={[]}>
      <StatusBar style="light" />


      <AppHeader
        containerStyle={styles.TopMenu}
        leftButtonStyle={styles.barsIcon}
        rightButtonStyle={styles.bellIcon}
        leftIcon={MenuIcon}
        rightIcon={NotificationIcon}
        leftIconProps={{ width: 18, height: 18, fill: "#fff" }}
        rightIconProps={{ width: 18, height: 18, fill: "#000" }}
        logo={<Logo variant="white" size="medium" />}
        onPressLeft={() => navigation.navigate("Dashboard")}
        onPressCenter={() => navigation.navigate("Dashboard")}
        onPressRight={() => navigation.navigate("Profile")}
      />

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
                key: "QRScanner",
                label: "QR Scanner",
                route: "ScanScreen",
                Icon: QRScannerIcon,
                ActiveIcon: QRScannerIcon
              },
              {
                key: "Resolved",
                label: "Resolved",
                route: "CompletedActivities",
                Icon: MetersIcon,
                ActiveIcon: ActiveTickets
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
    paddingTop: 75,
    paddingBottom: 35,
    paddingHorizontal: 30,
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
