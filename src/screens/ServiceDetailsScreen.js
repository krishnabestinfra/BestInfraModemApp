import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { COLORS } from "../constants/colors";
import React, { useEffect, useRef, useState } from "react";
import GlobeShield from "../../assets/icons/globe-shield.svg";
import Arrow from "../../assets/icons/arrow.svg";
import Menu from "../../assets/icons/bars.svg";
import Notification from "../../assets/icons/notification.svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import { Easing } from "react-native-reanimated";
import Logo from "../components/global/Logo";
import ServiceChatBox from "../components/ServiceChatBox";
import DropdownIcon from "../../assets/icons/dropDown.svg";

const { width, height } = Dimensions.get("window");
const RING_COUNT = 20;
const RING_DELAY = 800;
const ANIMATION_DURATION = 5000;

const Ring = ({ index, progress }) => {
  const ringStyle = useAnimatedStyle(() => {
    const delay = index * RING_DELAY;
    const localProgress =
      Math.max(0, progress.value - delay) / ANIMATION_DURATION;
    const clamped = Math.min(localProgress, 1);
    return {
      opacity: interpolate(clamped, [0, 0.1, 1], [0, 0.6, 0]),
      transform: [
        {
          scale: interpolate(clamped, [0, 1], [0.4, 4]),
        },
      ],
    };
  });

  return <Animated.View style={[styles.ring, ringStyle]} />;
};

const ServiceDetails = ({ navigation, route }) => {
  const progress = useSharedValue(0);
  const [userName, setUserName] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  // Get service data from navigation params
  const { serviceId, serviceData, category, status } = route?.params || {};

  const loopAnimation = () => {
    progress.value = 0;
    progress.value = withTiming(
      RING_DELAY * (RING_COUNT - 1) + ANIMATION_DURATION,
      {
        duration: RING_DELAY * (RING_COUNT - 1) + ANIMATION_DURATION,
        easing: Easing.inOut(Easing.ease),
      },
      () => runOnJS(loopAnimation)()
    );
  };

  useEffect(() => {
    loopAnimation();
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      setUserName("Field Engineer");
    };
    loadUser();
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <View style={[styles.bluecontainer, { flex: 1 }]}>
        <View style={styles.TopMenu}>
          <Pressable
            style={styles.barsIcon}
            onPress={() => navigation.goBack()}
          >
            <Arrow width={18} height={18} fill="#202d59" style={{ transform: [{ rotate: '180deg' }] }} />
          </Pressable>
          <View style={styles.logoWrapper}>
            {Array.from({ length: RING_COUNT }).map((_, index) => (
              <Ring key={index} index={index} progress={progress} />
            ))}
            <Logo variant="blue" size="medium" />
          </View>
          <Pressable
            style={styles.bellIcon}
            onPress={() => navigation?.navigate?.('Profile')}
          >
            <Notification width={18} height={18} fill="#202d59" />
          </Pressable>
        </View>

        <View style={styles.ServiceDetailsContainer}>
          <TouchableOpacity
            style={styles.ServiceDetailsHeader}
            onPress={() => setIsExpanded(!isExpanded)}
            activeOpacity={0.7}
          >
            <Text style={styles.ServiceDetailsText}>Service Details</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={[
                styles.HighTextBox,
                serviceData?.priority?.toLowerCase() === 'low' && styles.LowTextBox,
                serviceData?.priority?.toLowerCase() === 'medium' && styles.MediumTextBox,
              ]}>
                <Text style={styles.HighText}>
                  {serviceData?.priority || category || "High"}
                </Text>
              </View>
              <DropdownIcon
                width={14}
                height={14}
                style={{
                  marginLeft: 8,
                  transform: [{ rotate: isExpanded ? "180deg" : "0deg" }],
                }}
              />
            </View>
          </TouchableOpacity>

          {isExpanded && (
            <View style={styles.ServiceDetailsMainContainer}>
              <View style={styles.ServiceDetailsMainItem}>
                <Text style={styles.ServiceDetailsMainText}>Service ID</Text>
                <Text style={styles.ServiceDetailsMainTextValue}>
                  {serviceData?.serviceNumber || serviceId || "#SRV001"}
                </Text>
              </View>
              <View style={styles.ServiceDetailsMainItem}>
                <Text style={styles.ServiceDetailsMainText}>Category</Text>
                <Text style={styles.ServiceDetailsMainTextValue}>
                  {serviceData?.category || category || "Connection Issue"}
                </Text>
              </View>
              <View style={styles.ServiceDetailsMainItem}>
                <Text style={styles.ServiceDetailsMainText}>Status</Text>
                <Text style={styles.ServiceDetailsMainTextValue}>
                  {serviceData?.status || status || "Open"}
                </Text>
              </View>
              <View style={styles.ServiceDetailsMainItem}>
                <Text style={styles.ServiceDetailsMainText}>Created On</Text>
                <Text style={styles.ServiceDetailsMainTextValue}>
                  {serviceData?.createdOn || "17/08/2025, 04:04 PM"}
                </Text>
              </View>
              <View style={styles.ServiceDetailsMainItem}>
                <Text style={styles.ServiceDetailsMainText}>Last Updated</Text>
                <Text style={styles.ServiceDetailsMainTextValue}>
                  {serviceData?.lastUpdated || serviceData?.updatedOn || "17/08/2025, 04:04 PM"}
                </Text>
              </View>
              <View style={styles.ServiceDetailsMainItem}>
                <Text style={styles.ServiceDetailsMainText}>Assigned To</Text>
                <Text style={styles.ServiceDetailsMainTextValue}>
                  {serviceData?.assignedTo || "BI - Tech Team"}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.ServiceChatContainer}>
          <ServiceChatBox />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ServiceDetails;

const styles = StyleSheet.create({
  bluecontainer: {
    backgroundColor: "#eef8f0",
    padding: 15,
    flex: 1,
    flexDirection: "column",
  },
  TopMenu: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 15,
  },
  barsIcon: {
    backgroundColor: COLORS.secondaryFontColor,
    width: 54,
    height: 54,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    zIndex: 2,
  },
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
    justifyContent: "center",
    elevation: 5,
    zIndex: 2,
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
  ServiceDetailsContainer: {
    backgroundColor: COLORS.secondaryFontColor,
    borderRadius: 5,
    marginBottom: 5,
  },
  ServiceDetailsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F8F8F8",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  ServiceDetailsText: {
    color: COLORS.primaryFontColor,
    fontFamily: "Manrope-Bold",
    fontSize: 14,
  },
  HighTextBox: {
    backgroundColor: "#FF9C9C",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  MediumTextBox: {
    backgroundColor: "#FF8C00",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  LowTextBox: {
    backgroundColor: "#28A745",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  HighText: {
    fontFamily: "Manrope-SemiBold",
    fontSize: 8,
    color: "#fff",
  },
  ServiceDetailsMainText: {
    fontFamily: "Manrope-Bold",
    fontSize: 12,
    color: "#000",
  },
  ServiceDetailsMainTextValue: {
    fontFamily: "Manrope-Regular",
    fontSize: 10,
    color: "#000",
  },
  ServiceDetailsMainContainer: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
  },
  ServiceDetailsMainItem: {
    width: "45%",
  },
  ServiceChatContainer: {
    marginTop: 10,
    flex: 1,
  },
});

