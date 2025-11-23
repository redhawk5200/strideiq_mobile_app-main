"use client"
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router"
import React, { useEffect, useMemo, useState, useRef } from "react"
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from "react-native"
import { useOnboarding } from "../../src/hooks/useOnboarding"
import { Text } from "../../src/ui/Text"
import TopStepBar from "../../src/ui/top-stepbar"
export default function FitnessScreen() {
  const router = useRouter()
  const [vo2Max, setVo2Max] = useState<string>("")
  const [raceTime, setRaceTime] = useState<string>("")
  const TOTAL_STEPS = 11;
  const { step, setStep, goNext, goBack, saveCurrentStepNumber, updateData, formData } = useOnboarding(TOTAL_STEPS);
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true
      setStep(7)
      saveCurrentStepNumber(7).catch((err) => console.warn("Failed to save step 7:", err))
    }
  }, []);

  // Load existing data from Redux if available
  useEffect(() => {
    if (formData.vo2Max) setVo2Max(formData.vo2Max.toString())
    if (formData.raceTime) setRaceTime(formData.raceTime.toString())
  }, [formData])
  // only digits + single decimal
  const sanitize = (v: string) => v.replace(/[^0-9.]/g, "").replace(/(\..*)\./, "$1")
  const onChangeVo2Max = (v: string) => setVo2Max(sanitize(v))
  const onChangeRaceTime = (v: string) => setRaceTime(sanitize(v))
  const isValidNumber = (v: string) => {
    if (!v) return false
    const n = Number(v)
    return Number.isFinite(n) && n > 0
  }
  const canSubmit = useMemo(
    () => isValidNumber(vo2Max) && isValidNumber(raceTime),
    [vo2Max, raceTime]
  )
  const handleSubmit = () => {
    if (!canSubmit) return

    // Update Redux state
    updateData({
      vo2Max: vo2Max,
      raceTime: raceTime,
    })

    // Save to backend in background - don't block navigation
    import('../../src/lib/api').then(({ apiClient }) => {
      apiClient.post('/api/v1/onboarding/input/fitness-data', {
        vo2_max: Number(vo2Max),
        race_time: Number(raceTime),
      })
      .then(response => console.log('✅ Fitness data saved:', response))
      .catch(error => console.warn('❌ Failed to save fitness data:', error))
    })

    goNext();
    router.push("/(onboarding)/medical-screen")
  }
  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={styles.container}
      testID="fitness-screen"
      accessibilityLabel="Fitness input screen"
    >
      <TopStepBar current={step} total={TOTAL_STEPS} />
      <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/(onboarding)/goals-screen")}>
        <Ionicons name="chevron-back" size={24} color="#333" />
      </TouchableOpacity>
      <Text intent="heading" style={styles.heading} testID="fitness-heading">
        What's Your Current Baseline?
      </Text>
      {/* VO2 Max field */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Last VO2 Max</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., 45"
              placeholderTextColor="#999999"
              keyboardType="decimal-pad"
              inputMode="decimal"
              value={vo2Max}
              onChangeText={onChangeVo2Max}
              accessibilityLabel="Last VO2 Max in ml/kg/min"
              returnKeyType="next"
              testID="vo2-max-input"
            />
            <Text style={styles.unitRight}>ml/kg/min</Text>
          </View>
        </View>
      </View>
      {/* Race Time field */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Most recent race time</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., 25"
              placeholderTextColor="#999999"
              keyboardType="decimal-pad"
              inputMode="decimal"
              value={raceTime}
              onChangeText={onChangeRaceTime}
              accessibilityLabel="Most recent race time in min"
              returnKeyType="done"
              testID="race-time-input"
            />
            <Text style={styles.unitRight}>min</Text>
          </View>
        </View>
      </View>
      <View style={{ flex: 1 }} />
      <TouchableOpacity
        style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={!canSubmit}
        testID="fitness-submit"
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