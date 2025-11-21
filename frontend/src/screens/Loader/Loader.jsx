import React, { useRef, useEffect } from "react";
import { View, Animated, Easing } from "react-native";


const DOT_COUNT = 10;
const RADIUS = 22;
const DOT_SIZE = 8;
const COLOR = "#2563eb"; 

const Loader = () => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
        easing: Easing.linear,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [rotateAnim]);

  // Arrange dots in a ring
  const dots = Array.from({ length: DOT_COUNT }).map((_, i) => {
    // For a blur/trailing effect: fade some trailing dots
    const opacity = (i + 1) / DOT_COUNT;
    const angle = (i * 2 * Math.PI) / DOT_COUNT;
    const x = Math.sin(angle) * RADIUS;
    const y = -Math.cos(angle) * RADIUS;

    return (
      <View
        key={i}
        style={{
          position: "absolute",
          // Center each dot by subtracting half its size
          left: RADIUS + x - DOT_SIZE / 2,
          top: RADIUS + y - DOT_SIZE / 2,
          width: DOT_SIZE,
          height: DOT_SIZE,
          borderRadius: DOT_SIZE / 2,
          backgroundColor: COLOR,
          opacity,
        }}
      />
    );
  });

  // Animation for spinning the entire ring
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
      }}
    >
      <Animated.View
        style={{
          width: RADIUS * 2,
          height: RADIUS * 2,
          position: "relative",
          transform: [{ rotate }],
        }}
      >
        {dots}
      </Animated.View>
    </View>
  );
};

export default Loader;
