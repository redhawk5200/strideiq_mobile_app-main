"use client"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from 'expo-router'
import { useState, useCallback } from "react"
import { Image, StyleSheet, TextInput, TouchableOpacity, View, ActivityIndicator, Alert } from "react-native"
import { Text } from "../../src/ui/Text"
import { useAppDispatch } from '../../src/store'
import { restoreProgress } from '../../src/store/thunks/onboardingThunks'
import { useSignIn, useSSO } from '@clerk/clerk-expo'
import { useWarmUpBrowser } from '../../src/hooks/useWarmUpBrowser'

export default function LoginScreen() {
  useWarmUpBrowser()

  const [emailAddress, setEmailAddress] = useState("")
  const [password, setPassword] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isOAuthLoading, setIsOAuthLoading] = useState(false)
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { signIn, setActive, isLoaded } = useSignIn()
  const { startSSOFlow } = useSSO()

  const onSignInPress = async () => {
    if (!isLoaded) return

    setIsLoggingIn(true)
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      })

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId })

        // Wait for token to be available (ClerkApiSync will set it)
        await new Promise(resolve => setTimeout(resolve, 200))

        // Check onboarding progress from backend
        try {
          const result = await dispatch(restoreProgress()).unwrap()

          if (result.isCompleted) {
            router.replace('/(tabs)')
          } else {
            router.replace(result.route as any)
          }
        } catch (err) {
          console.error('Error checking progress, starting fresh:', err)
          router.replace('/name-screen')
        }
      } else {
        console.error('Sign in not complete:', JSON.stringify(signInAttempt, null, 2))
      }
    } catch (err: any) {
      Alert.alert('Error', err.errors?.[0]?.message || 'Failed to sign in')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const onOAuthPress = useCallback(async (strategy: 'oauth_google' | 'oauth_facebook' | 'oauth_apple') => {
    if (isOAuthLoading) {
      Alert.alert('Please wait', 'Authentication is already in progress')
      return
    }

    setIsOAuthLoading(true)
    try {
      const { createdSessionId, setActive } = await startSSOFlow({ strategy })

      if (createdSessionId) {
        await setActive!({ session: createdSessionId })

        // Wait for token to be available (ClerkApiSync will set it)
        await new Promise(resolve => setTimeout(resolve, 200))

        // Check onboarding progress
        try {
          const result = await dispatch(restoreProgress()).unwrap()
          if (result.isCompleted) {
            router.replace('/(tabs)')
          } else {
            router.replace(result.route as any)
          }
        } catch (err) {
          console.error('Error checking progress, starting fresh:', err)
          router.replace('/name-screen')
        }
      }
    } catch (err: any) {
      console.error('OAuth error:', err)
      if (err.code !== 'ERR_WEB_BROWSER_ALREADY_OPEN') {
        Alert.alert('Error', err?.errors?.[0]?.message || err.message || 'Failed to sign in with OAuth')
      }
    } finally {
      setIsOAuthLoading(false)
    }
  }, [isOAuthLoading, startSSOFlow, dispatch, router])

  return (
    <View style={styles.container} testID="login-screen" accessibilityLabel="Login screen">
      <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(onboarding)')}>
         <Ionicons name="chevron-back" size={24} color="#333" />
      </TouchableOpacity>

      <Text intent="heading" style={styles.heading} testID="login-heading">
        Login
      </Text>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your email"
              placeholderTextColor="#A0A0A0"
              value={emailAddress}
              onChangeText={setEmailAddress}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your Password"
              placeholderTextColor="#A0A0A0"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>

        <View style={styles.optionsRow}>
          <View />
          <TouchableOpacity>
            <Text style={styles.forgotPassword}>Forget Password?</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.signInWithContainer}>
          <View style={styles.horizontalLine} />
          <Text style={styles.signInWithText}>Sign in with</Text>
          <View style={styles.horizontalLine} />
        </View>

        <View style={styles.socialButtonsContainer}>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => onOAuthPress('oauth_google')}
            disabled={isOAuthLoading}
          >
            <Image source={require("../../assets/socials/google.png")} style={styles.socialIcon} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => onOAuthPress('oauth_facebook')}
            disabled={isOAuthLoading}
          >
            <Image source={require("../../assets/socials/facebook.png")} style={styles.socialIcon} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => onOAuthPress('oauth_apple')}
            disabled={isOAuthLoading}
          >
            <Image source={require("../../assets/socials/apple.png")} style={styles.socialIcon} />
          </TouchableOpacity>
        </View>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(onboarding)/signup')}>
            <Text style={styles.createAccountText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.loginButton}
        accessibilityRole="button"
        testID="login-submit"
        onPress={onSignInPress}
        disabled={isLoggingIn}
      >
        {isLoggingIn ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.loginButtonText}>Login</Text>
        )}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 40,
  },
  backArrow: {
    fontSize: 24,
    color: "#000000",
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
    marginBottom: 40,
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    position: "relative",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  inputLabel: {
    fontSize: 14,
    color: "#666666",
    position: "absolute",
    top: -8,
    left: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 4,
    zIndex: 1,
  },
  textInput: {
    textAlign: "left",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: "#000000",
    backgroundColor: "transparent",
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderRadius: 4,
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: "#175CD3",
    borderColor: "#175CD3",
  },
  rememberMeText: {
    fontSize: 14,
    color: "#666666",
  },
  forgotPassword: {
    fontSize: 14,
    color: "#175CD3",
    fontWeight: "500",
  },
  signInWithContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  horizontalLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  signInWithText: {
    fontSize: 16,
    color: "#666666",
    paddingHorizontal: 16,
  },
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 40,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  socialIcon: {
    width: 28,
    height: 28,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 40,
  },
  signupText: {
    fontSize: 16,
    color: "#666666",
  },
  createAccountText: {
    fontSize: 16,
    color: "#175CD3",
    fontWeight: "500",
  },
  loginButton: {
    backgroundColor: "#175CD3",
    borderRadius: 12,
    paddingVertical: 18,
    marginBottom: 40,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
})
