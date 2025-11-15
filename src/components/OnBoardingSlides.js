import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Animated,
  Platform,
} from "react-native";
import { COLORS } from "../constants/colors";

const { width } = Dimensions.get("window");

const OnBoardingSlides = ({ scrollRef, onIndexChange }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = [0, 1, 2];
  const animatedValues = useRef(slides.map(() => new Animated.Value(10))).current;

  useEffect(() => {
    animatedValues.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: index === activeIndex ? 25 : 10,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  }, [activeIndex, animatedValues]);

  return (
    <View
      style={{
        height: "20%",
        marginTop: -60,
      }}
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled
        onScroll={(event) => {
          const contentOffsetX = event.nativeEvent.contentOffset.x;
          const index = Math.round(contentOffsetX / width);
          setActiveIndex(index);
          onIndexChange?.(index);
        }}
        scrollEventThrottle={16}
      >
        <View style={styles.slide}>
          <Text style={styles.title}>No More</Text>
          <Text style={styles.title}>Billing Disputes</Text>
          <Text style={styles.description}>
            Transparent and highly precise digital smart meter readings ensure truly accurate, error-free bills every
            month.
          </Text>
        </View>

        <View style={styles.slide}>
          <Text style={styles.title}>Track Your</Text>
          <Text style={styles.title}>Energy Smarter</Text>
          <Text style={styles.description}>
            Clear daily and detailed monthly insights helpyou easily control energy usage and consistantly save valuable
            energy costs.
          </Text>
        </View>

        <View style={styles.slide}>
          <Text style={styles.title}>Your Power.</Text>
          <Text style={styles.title}>Your Control.</Text>
          <Text style={styles.description}>
            Recharge instantly, securely check payments, and easily manage your account anytime, anywhere with ease.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.dotsContainer}>
        {slides.map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                width: animatedValues[index],
                backgroundColor: index === activeIndex ? "#fff" : "grey",
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  slide: {
    width,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    ...Platform.select({
      ios: {
        paddingTop: 50,
      },
      android: {
        paddingTop: 30,
      },
    }),
  },
  title: {
    fontSize: 24,
    fontFamily: "Manrope-Bold",
    color: COLORS.secondaryFontColor,
    ...Platform.select({
      ios: {
        fontSize: 25,
      },
      android: {
        fontSize: 24,
      },
    }),
  },
  description: {
    fontSize: 14,
    color: COLORS.secondaryFontColor,
    marginTop: 10,
    fontFamily: "Manrope-Regular",
    textAlign: "center",
    ...Platform.select({
      ios: {
        fontSize: 18,
      },
      android: {
        fontSize: 15,
      },
    }),
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    top: 5,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    margin: 5,
  },
});

export default OnBoardingSlides;

