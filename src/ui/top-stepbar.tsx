// components/TopStepBar.tsx
import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

type Props = { current: number; total: number };

export default function TopStepBar({ current, total }: Props) {
  const progress = useRef(new Animated.Value(0)).current;

  const pct = Math.max(0, Math.min(1, current / total));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: pct,
      duration: 250,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [pct]);

  const widthInterpolate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.wrapper}>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width: widthInterpolate }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: 8,
    marginTop: 16,
    marginBottom: 24,
  },
  track: {
    height: 4,
    width: "100%",
    backgroundColor: "#E8EDF5",
    borderRadius: 999,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: "#1457E6", // your primary blue
    borderRadius: 999,
  },
});
