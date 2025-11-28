import { View, Text, StyleSheet } from "react-native";
import React, { useState } from "react";
import { COLORS } from "../constants/colors";
import GlobeShield from "../../assets/icons/globe-shield.svg";
import Hand from "../../assets/icons/hand.svg";
import Plus from "../../assets/icons/plus.svg";
import Menu from "../../assets/icons/bars.svg";
import Notification from "../../assets/icons/notification.svg";
import RippleLogo from "./global/RippleLogo";
import AppHeader from "./global/AppHeader";

const DashboardHeaderSection = ({ navigation, onLogout }) => {
  const [userName, setUserName] = useState("Field Engineer");

  return (
    <>
      <View style={styles.bluecontainer}>
        <AppHeader
          containerStyle={styles.TopMenu}
          leftButtonStyle={styles.barsIcon}
          rightButtonStyle={styles.bellIcon}
          leftIcon={Menu}
          rightIcon={Notification}
          logo={<RippleLogo size={68} />}
          onPressLeft={() => navigation?.navigate?.('SideMenu')}
          onPressCenter={() => navigation?.navigate?.('Dashboard')}
          onPressRight={() => navigation?.navigate?.('Profile')}
        />
        <View style={styles.ProfileBox}>
          <View>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text style={styles.hiText}>Hi, {userName} </Text>
              <Hand width={30} height={30} fill="#55B56C" />
            </View>
            <Text style={styles.stayingText}>Monitoring modems today?</Text>
          </View>
        </View>
        {/* <View style={{ marginTop: 20 }}>
          <View style={styles.amountContainer}>
            <Text style={styles.dueText}>System Status: Operational</Text>
            <Text style={styles.dateText}>{new Date().toLocaleDateString()}</Text>
          </View>
          <View style={styles.greenBox}>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
              }}
            >
              <GlobeShield
                width={25}
                height={25}
                fill="#55b56c"
                style={{ marginHorizontal: 12, marginTop: 6 }}
              />
              <View>
                <Text style={styles.payText}>Monitor securely</Text>
                <Text style={styles.tostayText}>to stay connected.</Text>
                <Text style={styles.avoidText}>Prevent service disruption.</Text>
              </View>
            </View>
            <View style={styles.paynowbox}>
              <Text style={styles.paynowText}>View All</Text>
            </View>
          </View>
        </View>
        <View style={styles.iconsContainer}>
          <View style={styles.individualBox}>
            <View style={styles.iconBox}>
              <Text style={styles.iconSizes}>📊</Text>
            </View>
            <Text style={styles.iconText}>Analytics</Text>
          </View>
          <View style={styles.individualBox}>
            <View style={styles.iconBox}>
              <Text style={styles.iconSizes}>⚠️</Text>
            </View>
            <Text style={styles.iconText}>Alerts</Text>
          </View>
          <View style={styles.individualBox}>
            <View style={styles.iconBox}>
              <Text style={styles.iconSizes}>🔧</Text>
            </View>
            <Text style={styles.iconText}>Errors</Text>
          </View>
          <View style={styles.individualBox}>
            <View style={styles.iconBox}>
              <Text style={styles.iconSizes}>📱</Text>
            </View>
            <Text style={styles.iconText}>Modems</Text>
          </View>
        </View> */}
      </View>
    </>
  );
};

export default DashboardHeaderSection;

const styles = StyleSheet.create({
  bluecontainer: {
    backgroundColor: "#eef8f0",
    padding: 15,
    
  },
  TopMenu: {
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 15,
  },
  barsIcon: {
    backgroundColor: COLORS.secondaryFontColor,
    width: 54,
    height: 54,
    borderRadius: 60,
    alignItems: "center",
    verticalAlign: "middle",
    justifyContent: "center",
    elevation: 1,
    zIndex: 2,
  },
  logoImage: {},
  logo: {
    width: 80,
    height: 80,
    zIndex: 1,
  },
  bellIcon: {
    backgroundColor: COLORS.secondaryFontColor,
    width: 54,
    height: 54,
    borderRadius: 60,
    alignItems: "center",
    verticalAlign: "middle",
    justifyContent: "center",
    elevation: 1,
    zIndex: 2,
  },
  ProfileBox: {
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
    marginHorizontal: 4,
  },
  hiText: {
    color: COLORS.primaryFontColor,
    fontSize: 18,
    fontFamily: "Manrope-Bold",
  },
  stayingText: {
    color: COLORS.primaryFontColor,
    fontSize: 14,
    fontFamily: "Manrope-Regular",
  },
  balanceText: {
    color: COLORS.primaryFontColor,
    marginLeft: 20,
    fontSize: 14,
    fontFamily: "Manrope-Regular",
  },
  amountText: {
    color: COLORS.primaryColor,
    fontSize: 20,
    fontFamily: "Manrope-Bold",
  },

  plusBox: {
    marginLeft: 7,
  },
  amountContainer: {
    backgroundColor: COLORS.primaryColor,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderRadius: 8,
    alignItems: "center",
    paddingHorizontal: 15,
  },
  dueText: {
    color: COLORS.secondaryFontColor,
    fontSize: 14,
    fontFamily: "Manrope-Medium",
  },
  dateText: {
    color: COLORS.secondaryFontColor,
    fontSize: 10,
    fontFamily: "Manrope-Regular",
  },
  greenBox: {
    display: "flex",
    flexDirection: "row",
    backgroundColor: COLORS.secondaryColor,
    borderRadius: 8,
    justifyContent: "space-between",
    paddingHorizontal: 10,
    alignItems: "center",
    padding: 10,
    marginTop: 3,
  },
  payText: {
    color: COLORS.secondaryFontColor,
    fontSize: 16,
    fontFamily: "Manrope-Bold",
  },
  tostayText: {
    color: COLORS.secondaryFontColor,
    fontSize: 16,
    fontFamily: "Manrope-Bold",
  },
  avoidText: {
    color: COLORS.secondaryFontColor,
    fontSize: 10,
    fontFamily: "Manrope-Regular",
  },
  paynowbox: {
    backgroundColor: COLORS.secondaryFontColor,
    height: 35,
    width: 95,
    borderRadius: 5,
    display: "flex",
    justifyContent: "center",
  },
  paynowText: {
    color: COLORS.primaryFontColor,
    fontSize: 12,
    fontFamily: "Manrope-Medium",
    textAlign: "center",
    verticalAlign: "middle",
  },
  iconsContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 15,
  },
  individualBox: {
    alignItems: "center",
    width: 85,
  },
  iconBox: {
    backgroundColor: COLORS.secondaryFontColor,
    borderRadius: 35,
    elevation: 1,
    width: 54,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    color: COLORS.primaryFontColor,
    fontSize: 10,
    fontFamily: "Manrope-Regular",
    marginTop: 5,
  },
  iconSizes: {
    fontSize: 20,
  },
  logoWrapper: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  ring: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1,
    borderColor: "#BABECC66",
    opacity: 0.2,
  },
});
