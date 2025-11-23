"use client"
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router"
import React, { useEffect, useMemo, useState, useRef } from "react"
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from "react-native"
import { useOnboarding } from "../../src/hooks/useOnboarding"
import { Text } from "../../src/ui/Text"
import TopStepBar from "../../src/ui/top-stepbar"
export default function HeightScreen() {
  const router = useRouter()
  const [currentHeight, setCurrentHeight] = useState<string>("")
  const TOTAL_STEPS = 11;
  const {
    step,
    setStep,
    goNext,
    goBack,
    saveCurrentStepNumber,
    updateData,
    formData
  } = useOnboarding(TOTAL_STEPS);
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true
      setStep(5)
      saveCurrentStepNumber(5).catch((err) => console.warn("Failed to save step 5:", err))
    }
  }, []);

  // Load existing data from Redux if available
  useEffect(() => {
    if (formData.height) setCurrentHeight(formData.height.toString())
  }, [formData])

  // only digits + single decimal
  const sanitize = (v: string) => v.replace(/[^0-9.]/g, "").replace(/(\..*)\./, "$1")
  const onChangeCurrent = (v: string) => setCurrentHeight(sanitize(v))

  const isValidNumber = (v: string) => {
    if (!v) return false
    const n = Number(v)
    // Height validation: 20-96 inches (roughly 1'8" to 8 feet)
    return Number.isFinite(n) && n >= 20 && n <= 96
  }

  const canSubmit = useMemo(
    () => isValidNumber(currentHeight),
    [currentHeight]
  )

  const handleSubmit = () => {
    if (!canSubmit) return

    // Update Redux state
    updateData({
      height: Number(currentHeight),
    })

    // Save to backend in background - don't block navigation
    import('../../src/lib/api').then(({ apiClient }) => {
      apiClient.put('/api/v1/onboarding/profile', {
        height_inches: Number(currentHeight),
      })
      .then(response => console.log('✅ Height saved:', response))
      .catch(error => console.warn('❌ Failed to save height:', error))
    })

    goNext()
    router.push("/(onboarding)/goals-screen")
  }
  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={styles.container}
      testID="height-screen"
      accessibilityLabel="Height input screen"
    >
      <TopStepBar current={step} total={TOTAL_STEPS} />
      <TouchableOpacity style={styles.backButton}  onPress={() => {
          router.replace("/(onboarding)/weight-screen")
        }}>
        <Ionicons name="chevron-back" size={24} color="#333" />
      </TouchableOpacity>
      <Text intent="heading" style={styles.heading} testID="height-heading">
        What’s Your Height?
      </Text>
      {/* Current height field */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Enter your height</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., 70"
              placeholderTextColor="#999999"
              keyboardType="decimal-pad"
              inputMode="decimal"
              value={currentHeight}
              onChangeText={onChangeCurrent}
              accessibilityLabel="Current height in inches"
              returnKeyType="done"
              testID="current-height-input"
            />
            <Text style={styles.unitRight}>inches</Text>
          </View>
        </View>
      </View>

      <Text style={styles.helperText}>
        💡 Tip: 5 feet = 60 inches, 6 feet = 72 inches
      </Text>

      <View style={{ flex: 1 }} />
      <TouchableOpacity
        style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={!canSubmit}
        testID="height-submit"
      >
        <Text style={[styles.submitButtonText, !canSubmit && styles.submitButtonTextDisabled]}>
          Continue
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
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
    marginBottom: 18,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 32,
  },
  helperText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  // —— "Label touching the input" like your birthday field — tight spacing
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
    color: "#000",
    position: "absolute",
    top: -8,
    left: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 4,
    zIndex: 1,
  },
  // matches your birthday field's box style
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#000000",
    paddingVertical: 0,
    marginRight: 10,
  },
  unitRight: {
    fontSize: 12,
    color: "#666666", // same tone as dropdown arrow on birthday screen
  },
  submitButton: {
    backgroundColor: "#175CD3",
    borderRadius: 12,
    paddingVertical: 18,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    backgroundColor: "#E0E0E0",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  submitButtonTextDisabled: {
    color: "#A0A0A0",
  },
})