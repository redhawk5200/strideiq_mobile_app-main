"use client"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { Image, StatusBar, StyleSheet, View } from "react-native"
import { spacing } from "../../src/lib/theme"
import { Button } from "../../src/ui/Button"
import { Text } from "../../src/ui/Text"

export default function OnboardingScreen() {
  const router = useRouter()

  return (
    <LinearGradient
      colors={["#023FB7", "#B550B2"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/splashlogo.png")}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Running app logo"
          />
        </View>
        <View style={styles.textContainer}>
          <Text intent="heading" style={styles.heading} testID="onboarding-heading">
            Your Fitness Journey{"\n"}Starts Here
          </Text>
          <Text intent="muted" style={styles.subheading} testID="onboarding-subheading">
            Personalized plans to help you achieve{"\n"}your fitness goals
          </Text>
        </View>
        <View style={styles.buttonGroup}>
          <Button
            intent="secondary"
            size="lg"
            onPress={() => router.push("/signup")}
            testID="get-started-btn"
            accessibilityLabel="Get Started"
            style={styles.getStartedBtn}
          >
            Get Started
          </Button>
          <Button  
            intent="primary"
            size="lg"
            onPress={() => router.push("/login")}
            testID="login-btn"
            accessibilityLabel="Login"
            style={styles.loginBtn}
          >
            Login
          </Button>
        </View>
      </View>
    </LinearGradient>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl * 2,
    paddingBottom: spacing.xl,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: spacing.xl,
  },
  logo: {
    width: 100,
    height: 100,
    tintColor: "white",
  },
  textContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
    marginTop: -spacing.xl,
  },
  heading: {
    textAlign: "center",
    marginBottom: spacing.md,
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 40,
  },
  subheading: {
    textAlign: "center",
    color: "rgb(255, 255, 255)",
    fontSize: 16,
    lineHeight: 24,
  },
  buttonGroup: {
    width: "100%",
    alignItems: "center",
    gap: spacing.md,
  },
  getStartedBtn: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 12,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
  },
  loginBtn: {
    width: "100%",
    backgroundColor: "#175CD3",
    borderRadius: 12,
    paddingVertical: spacing.md,
  },
})
