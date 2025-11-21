import React from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { COLORS } from "../constants/colors";
import MenuIcon from "../../assets/icons/barsWhite.svg";
import NotificationIcon from "../../assets/icons/notification.svg";
import Logo from "../components/global/Logo";

import DashboardScreen from "../screens/DashboardScreen";
import Troubleshoot from "../screens/TroubleshootScreen";
import Profile from "../screens/ProfileScreen";
import ServicesScreen from "../screens/ServicesScreen";
import { useSidebar } from "../context/SidebarContext";
import SideMenuNavigation from "../components/SideMenuNavigation";
import DashboardIcon from "../../assets/icons/dashboardMenu.svg";
import ActiveDashboard from "../../assets/icons/activeDashboard.svg";
import UsageIcon from "../../assets/icons/usageMenu.svg";
import ActiveUsage from "../../assets/icons/activeUsage.svg";
import TicketsIcon from "../../assets/icons/ticketsMenu.svg";
import ActiveTickets from "../../assets/icons/activeTickets.svg";
import SettingsIcon from "../../assets/icons/settingMenu.svg";
import ActiveSettings from "../../assets/icons/activeSettings.svg";
import MetersIcon from "../../assets/icons/meterWhite.svg";
import ModemsIcon from "../../assets/icons/modem.svg";


const SideMenu = ({ navigation }) => {
  const { activeItem, setActiveItem } = useSidebar();


  const renderContent = () => {
    switch (activeItem) {
      case "Accounts":
        return <DashboardScreen navigation={navigation} />;
  
      case "Modems":
        return <DashboardScreen navigation={navigation} />;
  
      case "Resolved":
        return <Troubleshoot navigation={navigation} />;
      
      case "Support":
        return <ServicesScreen navigation={navigation} />;
  
      default:
        return <DashboardScreen navigation={navigation} />;
    }
  };
  
  


  const handleMenuPress = (item) => {
    setActiveItem(item.key);
    if (item.route) navigation.navigate(item.route);
  };

  const handleLogout = () => {
    setActiveItem("Logout");
    navigation.replace("Login");
  };


  return (
    <View style={styles.Container}>
      <StatusBar style="light" />


      <View style={styles.TopMenu}>
        <Pressable style={styles.barsIcon} onPress={() => navigation.navigate("Dashboard")}>
          <MenuIcon width={18} height={18} fill="#fff" />
        </Pressable>

        <Logo variant="white" size="medium" />

        <Pressable style={styles.bellIcon} onPress={() => navigation.navigate("Profile")}>
          <NotificationIcon width={18} height={18} fill="#000" />
        </Pressable>
      </View>

      <View style={styles.MenuContainer}>

        <View style={styles.menubar}>
          <SideMenuNavigation
            items={[
              {
                key: "Accounts",
                label: "Accounts",
                route: "Dashboard",
                Icon: DashboardIcon,
                ActiveIcon: ActiveDashboard
              },
              {
                key: "Modems",
                label: "Modems",
                route: "Dashboard",
                Icon: ModemsIcon,
                ActiveIcon: ActiveUsage
              },
              {
                key: "Resolved",
                label: "Resolved",
                route: "Troubleshoot",
                Icon: MetersIcon,
                ActiveIcon: ActiveTickets
              },
              {
                key: "Support",
                label: "Support",
                route: "Services",
                Icon: TicketsIcon,
                ActiveIcon: ActiveSettings
              },
            ]}
            activeItem={activeItem}
            onSelect={handleMenuPress}
            onLogout={handleLogout}
          />
        </View>

        <View style={styles.componentsbar}>

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
    </View>
  );
};

export default SideMenu;


const styles = StyleSheet.create({
  Container: {
    backgroundColor: COLORS.brandBlueColor,
    height: "100%",

  },
  TopMenu: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
