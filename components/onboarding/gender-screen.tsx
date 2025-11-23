"use client"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useState, useEffect, useRef } from "react"
import { Image, StyleSheet, TouchableOpacity, View, Alert } from "react-native"
import { Text } from "../../src/ui/Text"
import { useOnboarding } from "../../src/hooks/useOnboarding"
import TopStepBar from "../../src/ui/top-stepbar"

type GenderOption = "female" | "male" | "other" | null

export default function GenderScreen() {
  const router = useRouter()

  const TOTAL_STEPS = 11;

  // Use the enhanced onboarding hook
  const {
    formData,
    updateData,
    saveCriticalData,
    saveCurrentStepNumber,
    step,
    setStep,
    isCriticalStep,
    isLoading,
    error
  } = useOnboarding(TOTAL_STEPS)

  const [selectedGender, setSelectedGender] = useState<GenderOption>(null)
  const hasInitialized = useRef(false)

  // Set the current step to 2 (Gender screen - second step, 1-indexed for thunk)
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true
      setStep(2)
      saveCurrentStepNumber(2).catch((err) => console.warn("Failed to save step 2:", err))
    }
  }, [])

  // Load existing data from Redux store
  useEffect(() => {
    if (formData.gender) setSelectedGender(formData.gender as GenderOption)
  }, [formData])

  const genderOptions = [
    {
      id: "female" as const,
      label: "Female",
      image: require("../../assets/genders/gender-male.png"), // You'll replace this
      color: "#FF69B4",
    },
    {
      id: "male" as const,
      label: "Male",
      image: require("../../assets/genders/gender-female.png"),
      color: "#175CD3",
    },
    {
      id: "other" as const,
      label: "Other",
      image: require("../../assets/genders/gender-nonbinary.png"), // You'll replace this
      color: "#8E8E93",
    },
  ]

  const handleGenderSelect = (gender: GenderOption) => {
    setSelectedGender(gender)
  }

  const handleContinue = async () => {
    if (!selectedGender) {
      Alert.alert('Missing Information', 'Please select your gender.')
      return
    }

    // Update local store immediately
    const genderData = {
      gender: selectedGender,
    }

    updateData(genderData)

    // For critical steps, wait for save to complete before navigation
    if (isCriticalStep) {
      const saveSuccess = await saveCriticalData()

      if (!saveSuccess) {
        Alert.alert(
          'Save Failed',
          'Failed to save your gender. Please try again.',
          [
            { text: 'Retry', onPress: () => handleContinue() },
            { text: 'Skip', onPress: () => router.push('/birthday-screen') }
          ]
        )
        return
      }
    }

    // Navigate after successful save
    router.push('/birthday-screen')
  }

  return (
    <View style={styles.container} testID="gender-screen" accessibilityLabel="Gender selection screen">
      <TopStepBar current={step} total={TOTAL_STEPS} />

      <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/(onboarding)/name-screen")}>
         <Ionicons name="chevron-back" size={24} color="#333" />
      </TouchableOpacity>

      <Text intent="heading" style={styles.heading} testID="gender-heading">
        What's Your Gender?
      </Text>

      <View style={styles.optionsContainer}>
        {genderOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[styles.genderOption, selectedGender === option.id && styles.selectedOption]}
            onPress={() => handleGenderSelect(option.id)}
            accessibilityLabel={`Select ${option.label}`}
            accessibilityRole="button"
          >
            <View
              style={[
                styles.iconContainer,
                { borderColor: option.color, backgroundColor: selectedGender === option.id ? option.color : '#FFFFFF' },
              ]}
            >
              <Image
                source={option.image}
                style={[styles.genderIcon, { tintColor: selectedGender === option.id ? '#FFFFFF' : option.color }]}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.genderLabel}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.continueButton, (!selectedGender || isLoading) && styles.continueButtonDisabled]}
        onPress={handleContinue}
        disabled={!selectedGender || isLoading}
      >
        <Text style={[styles.continueButtonText, (!selectedGender || isLoading) && styles.continueButtonTextDisabled]}>
          {isLoading ? 'Saving...' : 'Continue'}
        </Text>
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
    marginBottom: 60,
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: "auto",
    paddingHorizontal: 20,
  },
  genderOption: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: 8,
  },
  selectedOption: {
    // Add selected state styling if needed
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderWidth: 0.2,
    borderColor: "#E0E0E0",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
  },
  genderIcon: {
    width: 40,
    height: 40,
  },
  genderLabel: {
    fontSize: 16,
    color: "#666666",
    fontWeight: "500",
  },
  continueButton: {
    backgroundColor: "#175CD3",
    borderRadius: 12,
    paddingVertical: 18,
    marginBottom: 40,
  },
  continueButtonDisabled: {
    backgroundColor: "#E0E0E0",
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  continueButtonTextDisabled: {
    color: "#A0A0A0",
  },
})
