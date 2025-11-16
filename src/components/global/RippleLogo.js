import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import { Easing } from "react-native-reanimated";
import Logo from "./Logo";

const RING_COUNT = 20;
const RING_DELAY = 800;
const ANIMATION_DURATION = 5000;

const Ring = ({ index, progress, maxScale }) => {
  const ringStyle = useAnimatedStyle(() => {
    const delay = index * RING_DELAY;
    const localProgress =
      Math.max(0, progress.value - delay) / ANIMATION_DURATION;
    const clamped = Math.min(localProgress, 1);

    return {
      opacity: interpolate(clamped, [0, 0.1, 1], [0, 0.6, 0]),
      transform: [
        {
          scale: interpolate(clamped, [0, 1], [0.4, maxScale]),
        },
      ],
    };
  });

  return <Animated.View style={[styles.ring, ringStyle]} />;
};

const RippleLogo = ({ size = 60 }) => {
  const progress = useSharedValue(0);

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

  return (
    <View style={[styles.logoContainer, { width: size + 50, height: size + 50 }]}>
      {Array.from({ length: RING_COUNT }).map((_, index) => (
        <Ring key={index} index={index} progress={progress} maxScale={size / 12} />
      ))}
      <Logo variant="blue" size="medium" />
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
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

export default RippleLogo;

