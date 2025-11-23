"use client"

import { Ionicons } from "@expo/vector-icons"
import type React from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
    Animated,
    Easing,
    type LayoutChangeEvent,
    type StyleProp,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    type ViewStyle,
} from "react-native"

type Props = {
  headerContent?: React.ReactNode
  title?: string
  subtitle?: string
  leftIcon?: keyof typeof Ionicons.glyphMap
  defaultOpen?: boolean
  containerStyle?: StyleProp<ViewStyle>
  headerStyle?: StyleProp<ViewStyle>
  backgroundColor?: string
  borderColor?: string
  children: React.ReactNode
}

export default function AccordionSection({
  headerContent,
  title,
  subtitle,
  leftIcon = "stats-chart-outline",
  defaultOpen = false,
  containerStyle,
  headerStyle,
  backgroundColor,
  borderColor,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const [contentHeight, setContentHeight] = useState(0)

  // animation drivers
  const progress = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current
  const heightAnim = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current

  const toggle = useCallback(() => {
    const toValue = open ? 0 : 1
    setOpen(!open)
    Animated.parallel([
      Animated.timing(progress, {
        toValue,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(heightAnim, {
        toValue,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false, // height can't use native driver
      }),
    ]).start()
  }, [open, progress, heightAnim])

  // if defaultOpen changes in future or height measured after mount, sync height driver
  useEffect(() => {
    heightAnim.setValue(open ? 1 : 0)
    progress.setValue(open ? 1 : 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentHeight])

  const onContentLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height
    if (h !== contentHeight) setContentHeight(h)
  }

  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  })

  const animatedContainerStyle = useMemo(
    () => [
      {
        height: heightAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, contentHeight || 0],
        }),
        opacity: heightAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        }),
        overflow: "hidden" as const,
      },
    ],
    [contentHeight, heightAnim],
  )

  return (
    <View style={[styles.container, { backgroundColor: backgroundColor || "#fff" },{ borderColor: borderColor || "#E5E7EB" }, containerStyle]}>
      {/* Header */}
      <TouchableOpacity onPress={toggle} style={[styles.header, headerStyle]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {headerContent ? (
            headerContent
          ) : (
            <>
              <Ionicons name={leftIcon} size={18} color="#111827" />
              <Text style={styles.title}>{title}</Text>
            </>
          )}
        </View>

        <Animated.View style={{ transform: [{ rotate }]}}>
          <Ionicons name="chevron-down" size={20} color="#111827" />
        </Animated.View>
      </TouchableOpacity>

      {/* Measured content (invisible) */}
      <View style={styles.measureBox} onLayout={onContentLayout}>
        {/* This hidden box measures real height once; it's visually collapsed by absolute positioning */}
        <View style={styles.measureInner}>{children}</View>
      </View>

      {/* Animated visible content */}
      <Animated.View style={animatedContainerStyle}>
        <View style={{ paddingHorizontal: 2, paddingBottom: 2 }}>{children}</View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  header: {
    paddingHorizontal: 14,
    paddingVertical: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    flexShrink: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    marginLeft: 6,
    fontSize: 12,
    color: "#6B7280",
  },

  // hidden measurer: pulls children out of flow
  measureBox: {
    position: "absolute",
    left: 0,
    right: 0,
    opacity: 0,
    pointerEvents: "none",
  },
  measureInner: {
    paddingHorizontal: 2,
    paddingBottom: 2,
  },
})
