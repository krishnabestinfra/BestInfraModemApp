import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Image, Dimensions, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  runOnJS,
  withRepeat,
} from "react-native-reanimated";
import { Easing } from "react-native-reanimated";
import Logo from "../components/global/Logo";

const { width, height } = Dimensions.get("window");

const RING_COUNT = 100;
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

const SplashScreen = ({ onFinish }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(RING_DELAY * (RING_COUNT - 1) + ANIMATION_DURATION, {
        duration: RING_DELAY * (RING_COUNT - 1) + ANIMATION_DURATION,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  // Auto navigate after 7 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 7000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#163b7c", "#1f3d6d", "#2a6f65", "#55b56c"]}
        start={{ x: 0.6, y: 0.5 }}
        end={{ x: 0.2, y: 0.8 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.centerWrapper}>
        {Array.from({ length: RING_COUNT }).map((_, index) => (
          <Ring key={index} index={index} progress={progress} />
        ))}
        <Logo variant="white" size="large" />
      </View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1f255e",
  },
  centerWrapper: {
    flex: 1,
    justifyContent: "center", // Center vertically
    alignItems: "center", // Center horizontally
  },
  ring: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1,
    borderColor: "#BABECC66",
    opacity: 0.2
  },
}); 