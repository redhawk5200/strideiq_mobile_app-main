"use client"
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router"
import { useEffect, useMemo, useState, useRef } from "react"
import { KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View } from "react-native"
import { useOnboarding } from "../../src/hooks/useOnboarding"
import { Text } from "../../src/ui/Text"
import TopStepBar from "../../src/ui/top-stepbar"

export default function GoalsScreen() {
  const router = useRouter()
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null)
  const TOTAL_STEPS = 11
  const {
    step,
    setStep,
    goNext,
    goBack,
    saveCurrentStepNumber,
    updateData,
    formData
  } = useOnboarding(TOTAL_STEPS)
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true
      setStep(6)
      saveCurrentStepNumber(6).catch((err) => console.warn("Failed to save step 6:", err))
    }
  }, [])

  // Load existing data from Redux if available
  useEffect(() => {
    if (formData.primaryGoal) setSelectedGoal(formData.primaryGoal)
  }, [formData])

  const canSubmit = useMemo(() => selectedGoal !== null, [selectedGoal])

  const handleSubmit = () => {
    if (!canSubmit) return

    // Update Redux state
    updateData({
      primaryGoal: selectedGoal,
    })

    // Save to backend in background - don't block navigation
    import('../../src/lib/api').then(({ apiClient }) => {
      apiClient.post('/api/v1/onboarding/input/main-target', {
        main_target: selectedGoal,
      })
      .then(response => console.log('✅ Main target saved:', response))
      .catch(error => console.warn('❌ Failed to save main target:', error))
    })

    goNext()
    router.push("/(onboarding)/fitness-screen")
  }

  const handleGoalSelect = (goal: string) => {
    setSelectedGoal(goal === selectedGoal ? null : goal)
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={styles.container}
      testID="goals-screen"
      accessibilityLabel="Goals selection screen"
    >
      <TopStepBar current={step} total={TOTAL_STEPS} />
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          router.replace("/(onboarding)/height-screen")
        }}
      >
        <Ionicons name="chevron-back" size={24} color="#333" />
      </TouchableOpacity>

      <Text intent="heading" style={styles.heading} testID="goals-heading">
        What's Your Main Target?
      </Text>

      <TouchableOpacity style={styles.goalCard} onPress={() => handleGoalSelect("vo2_max")}>
        <View style={styles.goalContent}>
          <Text style={styles.goalIcon}>🫁</Text>
          <Text style={styles.goalLabel}>VO₂ Max</Text>
        </View>
        <View style={[styles.radioButton, selectedGoal === "vo2_max" && styles.radioButtonSelected]}>
          {selectedGoal === "vo2_max" && <View style={styles.radioButtonInner} />}
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.goalCard} onPress={() => handleGoalSelect("race_time")}>
        <View style={styles.goalContent}>
          <Text style={styles.goalIcon}>🏃</Text>
          <Text style={styles.goalLabel}>Race Time</Text>
        </View>
        <View style={[styles.radioButton, selectedGoal === "race_time" && styles.radioButtonSelected]}>
          {selectedGoal === "race_time" && <View style={styles.radioButtonInner} />}
        </View>
      </TouchableOpacity>

      <View style={{ flex: 1 }} />

      <TouchableOpacity
        style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={!canSubmit}
        testID="goals-submit"
      >
        <Text style={[styles.submitButtonText, !canSubmit && styles.submitButtonTextDisabled]}>Continue</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF", // Updated to light gray background to match screenshot
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
    fontSize: 28, // Increased font size to match screenshot
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
    marginBottom: 40, // Increased margin for better spacing
    lineHeight: 36,
  },
  goalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  goalIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  goalLabel: {
    fontSize: 18,
    fontWeight: "500",
    color: "#000000",
  },
  radioButton: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    borderColor: "#175CD3",
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#175CD3",
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
