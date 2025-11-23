"use client"
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router"
import { useEffect, useState, useRef } from "react"
import {
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native"
import { useOnboarding } from "../../src/hooks/useOnboarding"
import { Text } from "../../src/ui/Text"
import TopStepBar from "../../src/ui/top-stepbar"

const { width } = Dimensions.get("window")

export default function MoodScreen() {
  const router = useRouter()
  const [selectedStatus,  setSelectedStatus] = useState<string>("")
  const TOTAL_STEPS = 11
  const { step, setStep, goNext, goBack, saveCurrentStepNumber } = useOnboarding(TOTAL_STEPS)
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true
      setStep(10)
      saveCurrentStepNumber(10).catch((err) => console.warn("Failed to save step 10:", err))
    }
  }, [])

  // 👇 Use static require() per React Native rules.
  const fitnessStatuses = [
    { id: "normal",       label: "Normal",      color: "#FF9500", src: require("../../assets/moods/Normal.png") },
    { id: "happy",        label: "Happy",       color: "#34C759", src: require("../../assets/moods/Happy.png") },
    { id: "energetic",    label: "Energetic",   color: "#FF9500", src: require("../../assets/moods/Energetic.png") },
    { id: "nervous",      label: "Nervous",     color: "#FFCC02", src: require("../../assets/moods/Nervous.png") },
    { id: "sad",          label: "Sad",         color: "#175CD3", src: require("../../assets/moods/Sad.png") },
    { id: "tired",        label: "Tired",       color: "#8E8E93", src: require("../../assets/moods/Tired.png") },
    { id: "angry",        label: "Angry",       color: "#FF3B30", src: require("../../assets/moods/Angry.png") },
  ]

  const handleContinue = () => {
    if (!selectedStatus) return

    // Save to backend in background - don't block navigation
    import('../../src/lib/api').then(({ apiClient }) => {
      apiClient.post('/api/v1/onboarding/input/mood', {
        mood: selectedStatus.toLowerCase(),
      })
      .then(response => console.log('✅ Mood saved:', response))
      .catch(error => console.warn('❌ Failed to save mood:', error))
    })

    goNext()
    router.replace("/(onboarding)/train-screen")
  }

  const renderStatusOption = (status: (typeof fitnessStatuses)[number]) => {
    const isSelected = selectedStatus === status.id

    return (
      <TouchableOpacity
        key={status.id}
        style={[styles.option, isSelected && styles.selectedOption]}
        onPress={() => setSelectedStatus(status.id)}
      >
        <View style={[styles.emojiContainer, { backgroundColor: status.color + "20" }]}>
          <Image source={status.src} style={styles.emojiImage} resizeMode="contain" />
        </View>
        <Text style={styles.optionLabel}>{status.label}</Text>
      </TouchableOpacity>
    )
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
        onPress={() => router.replace("/(onboarding)/fitness-status")}
      >
        <Ionicons name="chevron-back" size={24} color="#333" />
      </TouchableOpacity>

      <Text intent="heading" style={styles.heading}>
        How Are You Feeling Today?
      </Text>

      <View style={styles.grid}>
        {fitnessStatuses.map(renderStatusOption)}
      </View>

      <TouchableOpacity
        style={[styles.continueButton, !selectedStatus && styles.continueButtonDisabled]}
        onPress={handleContinue}
        disabled={!selectedStatus}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 0,
  },
  option: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    width: (width - 80) / 2, // two per row
    minHeight: 120,
    borderWidth: 2,
    borderColor: "transparent",
    marginBottom: 16,
  },
  selectedOption: {
    borderColor: "#175CD3",
    backgroundColor: "#F0F8FF",
  },
  emojiContainer: {
    width: 25,
    height: 25,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emojiImage: {
    width: 20,
    height: 20,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
  },
  continueButton: {
    backgroundColor: "#175CD3",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 40,
  },
  continueButtonDisabled: {
    backgroundColor: "#C7C7CC",
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
})
