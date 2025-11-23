"use client"
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { ImageBackground, StatusBar, StyleSheet, TouchableOpacity, View } from "react-native";
import { spacing } from "../../src/lib/theme";
import { Button } from "../../src/ui/Button";
import { Text } from "../../src/ui/Text";
import { useOnboarding } from "../../src/hooks/useOnboarding";

export default function SetupProfileScreen() {
  const router = useRouter()
  const { saveCurrentStepNumber } = useOnboarding(12)
  const hasInitialized = useRef(false)

  // Save that user is at setup-profile (between step 3 and 4)
  // We'll save it as step 3.5 which will map to step 4 (weight screen) on restore
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true
      // Save step 4 so if app closes here, it resumes at weight screen
      saveCurrentStepNumber(4).catch((err) => console.warn('Failed to save setup-profile step:', err))
    }
  }, [])

  return (
    <ImageBackground source={require("../../assets/onboarding/setup-profile.png")} style={styles.container}>
      <LinearGradient
        colors={['rgb(0, 0, 0)', 'transparent']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
      />
      <StatusBar barStyle="dark-content" />

      {/* Back Button (same as LoginScreen) */}
      <TouchableOpacity style={styles.backButton}  onPress={() => router.replace("/(onboarding)/birthday-screen")}>
        <Ionicons name="chevron-back" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text intent="heading" style={styles.heading} testID="onboarding-heading">
          Now let’s set up {"\n"}your profile
          </Text>
          <Text intent="muted" style={styles.subheading} testID="onboarding-subheading">
          We’ll now personalize your profile {"\n"}with a few more quick details.
          </Text>
        </View>

        <View style={styles.buttonGroup}>
          <Button
            intent="primary"
            size="lg"
            onPress={() => router.push("/(onboarding)/weight-screen")}
            testID="continue-btn"
            accessibilityLabel="Continue to weight screen"
            style={styles.loginBtn}
          >
            Continue
          </Button>
        </View>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 24,
    zIndex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: spacing.xl,
    paddingHorizontal: 24,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  heading: {
    textAlign: "center",
    marginBottom: spacing.md,
    color: "#FFF",
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 40,
  },
  subheading: {
    textAlign: "center",
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
  },
  buttonGroup: {
    width: "100%",
    alignItems: "center",
  },
  loginBtn: {
    width: "100%",
    backgroundColor: "#175CD3",
    borderRadius: 12,
    paddingVertical: spacing.md,
  },
})
