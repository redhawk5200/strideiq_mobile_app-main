"use client"
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { useOnboarding } from "../../src/hooks/useOnboarding";
import { Text } from "../../src/ui/Text";
import TopStepBar from "../../src/ui/top-stepbar";

export default function WeightScreen() {
  const router = useRouter()
  const [currentWeight, setCurrentWeight] = useState<string>("")
  const [targetWeight, setTargetWeight] = useState<string>("")

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
      setStep(4)
      saveCurrentStepNumber(4).catch((err) => console.warn("Failed to save step 4:", err))
    }
  }, []);

  // Load existing data from Redux if available
  useEffect(() => {
    if (formData.currentWeight) setCurrentWeight(formData.currentWeight.toString())
    if (formData.targetWeight) setTargetWeight(formData.targetWeight.toString())
  }, [formData])

  // only digits + single decimal
  const sanitize = (v: string) => v.replace(/[^0-9.]/g, "").replace(/(\..*)\./, "$1")
  const onChangeCurrent = (v: string) => setCurrentWeight(sanitize(v))
  const onChangeTarget = (v: string) => setTargetWeight(sanitize(v))

  const isValidNumber = (v: string) => {
    if (!v) return false
    const n = Number(v)
    return Number.isFinite(n) && n > 0
  }

  const canSubmit = useMemo(
    () => isValidNumber(currentWeight) && isValidNumber(targetWeight),
    [currentWeight, targetWeight]
  )

  const handleSubmit = () => {
    if (!canSubmit) return

    // Update Redux state
    updateData({
      currentWeight: Number(currentWeight),
      targetWeight: Number(targetWeight),
    })

    // Save to backend in background - don't block navigation
    import('../../src/lib/api').then(({ apiClient }) => {
      apiClient.post('/api/v1/onboarding/input/weight', {
        current_weight_lbs: currentWeight,
        target_weight_lbs: targetWeight,
        // goal_type will be auto-determined by the backend based on current vs target
      })
      .then(response => console.log('✅ Weight data saved:', response))
      .catch(error => console.warn('❌ Failed to save weight data:', error))
    })

    goNext()
    router.push("/(onboarding)/height-screen")
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={styles.container}
      testID="weight-screen"
      accessibilityLabel="Weight input screen" 
    >
      <TopStepBar current={step} total={TOTAL_STEPS} />

      <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/(onboarding)/setup-profile")}>
        <Ionicons name="chevron-back" size={24} color="#333" />
      </TouchableOpacity>

      <Text intent="heading" style={styles.heading} testID="weight-heading">
        What’s Your Weight?
      </Text>

      {/* Current weight field */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Current weight</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., 185"
              placeholderTextColor="#999999"
              keyboardType="decimal-pad"
              inputMode="decimal"
              value={currentWeight}
              onChangeText={onChangeCurrent}
              accessibilityLabel="Current weight in pounds"
              returnKeyType="next"
              testID="current-weight-input"
            />
            <Text style={styles.unitRight}>lbs</Text>
          </View>
        </View>
      </View>

      {/* Targeted weight field */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Targeted weight</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., 165"
              placeholderTextColor="#999999"
              keyboardType="decimal-pad"
              inputMode="decimal"
              value={targetWeight}
              onChangeText={onChangeTarget}
              accessibilityLabel="Targeted weight in pounds"
              returnKeyType="done"
              testID="target-weight-input"
            />
            <Text style={styles.unitRight}>lbs</Text>
          </View>
        </View>
      </View>

      <View style={{ flex: 1 }} />

      <TouchableOpacity
        style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={!canSubmit}
        testID="weight-submit"
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

  // —— “Label touching the input” like your birthday field — tight spacing
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
