"use client"
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router"
import { useEffect, useMemo, useState, useRef } from "react"
import { KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View } from "react-native"
import { useOnboarding } from "../../src/hooks/useOnboarding"
import { Text } from "../../src/ui/Text"
import TopStepBar from "../../src/ui/top-stepbar"

export default function TrainScreen() {
  const router = useRouter()
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const TOTAL_STEPS = 11
  const { step, setStep, goNext, goBack, saveCurrentStepNumber } = useOnboarding(TOTAL_STEPS)
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true
      setStep(11)
      saveCurrentStepNumber(11).catch((err) => console.warn("Failed to save step 11:", err))
    }
  }, [])

  const canSubmit = useMemo(() => selectedStatus !== null, [selectedStatus])

  const handleSubmit = () => {
    if (!canSubmit) return

    // Save to backend in background - don't block navigation
    import('../../src/lib/api').then(({ apiClient }) => {
      apiClient.post('/api/v1/onboarding/input/training-intention', {
        intention: selectedStatus,
      })
      .then(response => console.log('✅ Training intention saved:', response))
      .catch(error => console.warn('❌ Failed to save training intention:', error))
    })

    goNext()
    router.push("/(onboarding)/final-onboarding")
  }

  const handleStatusSelect = (status: string) => {
    setSelectedStatus(status === selectedStatus ? null : status)
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={styles.container}
      testID="fitness-status-screen"
      accessibilityLabel="Fitness status selection screen"
    >
      <TopStepBar current={step} total={TOTAL_STEPS} />
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace("/(onboarding)/moods-screen")}
      >
        <Ionicons name="chevron-back" size={24} color="#333" />
      </TouchableOpacity>

      <Text intent="heading" style={styles.heading} testID="fitness-status-heading">
        Do You Want To Train Today?
      </Text>

      <TouchableOpacity style={styles.statusCard} onPress={() => handleStatusSelect("yes")}>
        <View style={styles.statusContent}>
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusLabel}>Yes</Text>
          </View>
        </View>
        <View style={[styles.radioButton, selectedStatus === "yes" && styles.radioButtonSelected]}>
          {selectedStatus === "yes" && <View style={styles.radioButtonInner} />}
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.statusCard} onPress={() => handleStatusSelect("no")}>
        <View style={styles.statusContent}>
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusLabel}>No</Text>
          </View>
        </View>
        <View style={[styles.radioButton, selectedStatus === "no" && styles.radioButtonSelected]}>
          {selectedStatus === "no" && <View style={styles.radioButtonInner} />}
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.statusCard} onPress={() => handleStatusSelect("maybe")}>
        <View style={styles.statusContent}>
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusLabel}>Maybe</Text>
          </View>
        </View>
        <View style={[styles.radioButton, selectedStatus === "maybe" && styles.radioButtonSelected]}>
          {selectedStatus === "maybe" && <View style={styles.radioButtonInner} />}
        </View>
      </TouchableOpacity>

      <View style={{ flex: 1 }} />

      <TouchableOpacity
        style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={!canSubmit}
        testID="fitness-status-submit"
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
  statusCard: {
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
  statusContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  statusTextContainer: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: "400",
    color: "#000000",
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
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
