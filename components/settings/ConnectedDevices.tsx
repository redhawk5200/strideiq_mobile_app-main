"use client"

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Dimensions, Image, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated"; // ⬅️ use LinearTransition
import Carousel from "react-native-reanimated-carousel";
import { useOnboarding } from "../../src/hooks/useOnboarding";
import { Text } from "../../src/ui/Text";

const { width } = Dimensions.get("window")

export default function ConnectDevice() {
  const router = useRouter()
  const [selectedDeviceIndex, setSelectedDeviceIndex] = useState<number>(1)
  const TOTAL_STEPS = 9
  const { step, setStep, goNext, goBack } = useOnboarding(TOTAL_STEPS)

  useEffect(() => {
    setStep(9)
  }, [setStep])

  const devices = [
    { id: "apple-watch", name: "Apple Watch", image: require("../../assets/devices/apple-watch.png") },
    { id: "garmin", name: "Garmin", image: require("../../assets/devices/apple-watch.png") },
    { id: "fitbit", name: "Fitbit", image: require("../../assets/devices/apple-watch.png") },
  ]

  const handleContinue = () => {
    const selectedDevice = devices[selectedDeviceIndex]
    console.log("Selected device:", selectedDevice.name)
    goNext()
    // router.replace("/(onboarding)/final-onboarding")
  }

  const renderDeviceCard = ({ item, index }: { item: (typeof devices)[number]; index: number }) => {
    const isSelected = index === selectedDeviceIndex

    return (
      <TouchableOpacity onPress={() => setSelectedDeviceIndex(index)} activeOpacity={0.8}>
        <Animated.View
          // ⬇️ Smoothly animates layout changes without using deprecated Layout
          layout={LinearTransition.springify()}
          style={[styles.deviceCard, isSelected ? styles.deviceCardSelected : styles.deviceCardUnselected]}
        >
          <View
            style={[
              styles.deviceImageContainer,
              isSelected ? styles.deviceImageContainerSelected : styles.deviceImageContainerUnselected,
            ]}
          >
            <Image
              source={item.image}
              style={[styles.deviceImage, isSelected ? styles.deviceImageSelected : styles.deviceImageUnselected]}
              resizeMode="contain"
            />
          </View>

          <Text style={[styles.deviceName, isSelected ? styles.deviceNameSelected : styles.deviceNameUnselected]}>
            {item.name}
          </Text>

          {isSelected && (
            <View style={styles.selectedIndicator}>
              <Text style={styles.selectedText}>✓</Text>
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    )
  }

  const renderPaginationDots = () => (
    <View style={styles.paginationContainer}>
      {devices.map((_, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.paginationDot, index === selectedDeviceIndex && styles.paginationDotActive]}
          onPress={() => setSelectedDeviceIndex(index)}
        />
      ))}
    </View>
  )

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={styles.container}
      testID="connect-device-screen"
      accessibilityLabel="Connect device screen"
    >
      

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          router.replace("/settings")
        }}
      >
        <Ionicons name="chevron-back" size={24} color="#333" />
      </TouchableOpacity>

      <Text intent="heading" style={styles.heading}>
        Connect Your Device
      </Text>

      <View style={styles.carouselContainer}>
        <Carousel
          width={width * 0.8}
          height={420}
          data={devices}
          renderItem={({ item, index }) => renderDeviceCard({ item, index })}
          onSnapToItem={setSelectedDeviceIndex}
          mode="parallax"
          modeConfig={{
            parallaxScrollingScale: 0.65,
            parallaxScrollingOffset: 100,
            parallaxAdjacentItemScale: 0.75,
          }}
          loop={false}
          pagingEnabled
          snapEnabled
          defaultIndex={1}
        />
      </View>

      {renderPaginationDots()}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  backButton: {
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  backArrow: {
    fontSize: 24,
    color: "#000",
    fontWeight: "600",
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 34,
  },
  carouselContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  deviceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    position: "relative",
  },
  deviceCardSelected: {
    transform: [{ scale: 1.15 }],
    borderWidth: 3,
    borderColor: "#175CD3",
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
    shadowColor: "#175CD3",
  },
  deviceCardUnselected: {
    opacity: 0.5,
    transform: [{ scale: 0.8 }],
  },
  deviceImageContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  deviceImageContainerSelected: {
    width: 160,
    height: 160,
  },
  deviceImageContainerUnselected: {
    width: 90,
    height: 90,
  },
  deviceImage: {},
  deviceImageSelected: {
    width: 140,
    height: 140,
  },
  deviceImageUnselected: {
    width: 70,
    height: 70,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  deviceNameSelected: {
    color: "#175CD3",
    fontSize: 22,
    fontWeight: "800",
  },
  deviceNameUnselected: {
    color: "#8E8E93",
    fontSize: 14,
    fontWeight: "500",
  },
  selectedIndicator: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#175CD3",
    borderRadius: 12,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#175CD3",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 60,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#C7C7CC",
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: "#175CD3",
    width: 28,
    height: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
    gap: 16,
  },
  skipButton: {
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#C7C7CC",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
  },
  skipButtonText: {
    color: "#8E8E93",
    fontSize: 18,
    fontWeight: "600",
  },
  continueButton: {
    flex: 1,
    backgroundColor: "#175CD3",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
})
