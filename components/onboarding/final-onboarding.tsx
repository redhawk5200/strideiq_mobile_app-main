"use client"
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { ImageBackground, StatusBar, StyleSheet, TouchableOpacity, View } from "react-native";
import { spacing } from "../../src/lib/theme";
import { Button } from "../../src/ui/Button";
import { Text } from "../../src/ui/Text";
import { useOnboarding } from "../../src/hooks/useOnboarding"
import { useState } from "react"

export default function FinalOnboarding() {
  const router = useRouter()
  const { formData } = useOnboarding(9)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    try {
      setIsLoading(true)

      // Mark onboarding as complete in the backend
      const { apiClient } = await import('../../src/lib/api')
      await apiClient.post('/api/v1/onboarding/complete', {})

      console.log('✅ Onboarding marked as complete')
      router.replace("/(tabs)")
    } catch (error) {
      console.error('Failed to complete onboarding:', error)
      // Could show error alert here
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ImageBackground source={require("../../assets/onboarding/final-onboarding.png")} style={styles.container}>
      <LinearGradient
        colors={['rgb(0, 0, 0)', 'transparent']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
      />
      <StatusBar barStyle="dark-content" />

      {/* Back Button (same as LoginScreen) */}
      <TouchableOpacity style={styles.backButton}  onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color="#333" />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text intent="heading" style={styles.heading} testID="onboarding-heading">
            You're all set!
          </Text>
          <Text intent="muted" style={styles.subheading} testID="onboarding-subheading">
            Your journey begins here!{"\n"}optimized, personalized & ready to go
          </Text>
        </View>

        <View style={styles.buttonGroup}>
          <Button  
            intent="primary"
            size="lg"
            onPress={handleSubmit}
            testID="submit-btn"
            accessibilityLabel="Complete Onboarding"
            style={styles.loginBtn}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Submit"}
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
  backArrow: {
    fontSize: 24,
    color: "#000000",
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
