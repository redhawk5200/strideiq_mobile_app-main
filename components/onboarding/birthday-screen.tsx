"use client"

import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useState, useEffect, useRef } from "react"
import { StyleSheet, TouchableOpacity, View, Alert } from "react-native"
import DateTimePickerModal from "react-native-modal-datetime-picker"
import { Text } from "../../src/ui/Text"
import { useOnboarding } from "../../src/hooks/useOnboarding"
import TopStepBar from "../../src/ui/top-stepbar"

export default function BirthdayScreen() {
  const router = useRouter()

  const TOTAL_STEPS = 11;

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

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false)
  const hasInitialized = useRef(false)

  // Set the current step to 3 (Birthday screen - third step, 1-indexed for thunk)
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true
      setStep(3)
      saveCurrentStepNumber(3).catch((err) => console.warn("Failed to save step 3:", err))
    }
  }, [])

  // Load existing birth date from Redux store
  useEffect(() => {
    if (formData.birthDate) {
      // Parse MM/DD/YYYY format
      const parts = formData.birthDate.split('/')
      if (parts.length === 3) {
        const month = parseInt(parts[0], 10) - 1 // JavaScript months are 0-indexed
        const day = parseInt(parts[1], 10)
        const year = parseInt(parts[2], 10)
        setSelectedDate(new Date(year, month, day))
      }
    }
  }, [formData])

  const showDatePicker = () => {
    setDatePickerVisibility(true)
  }

  const hideDatePicker = () => {
    setDatePickerVisibility(false)
  }

  const handleConfirm = (date: Date) => {
    setSelectedDate(date)
    hideDatePicker()
  }

  const formatDate = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const year = date.getFullYear()
    return `${month}/${day}/${year}`
  }

  const handleSubmit = async () => {
    if (!selectedDate) {
      Alert.alert('Missing Information', 'Please select your birth date.')
      return
    }

    console.log('🎂 Birthday screen - Starting submit for step:', step)

    // Format date as MM/DD/YYYY (American format)
    const birthDateFormatted = formatDate(selectedDate)

    // Update local store immediately
    const birthdayData = {
      birthDate: birthDateFormatted,
    }

    updateData(birthdayData)
    console.log('🎂 Birthday data updated in Redux:', birthdayData)

    // For critical steps, wait for save to complete before navigation
    if (isCriticalStep) {
      console.log('🎂 Birthday is a critical step, saving to backend...')
      const saveSuccess = await saveCriticalData()

      console.log('🎂 Save result:', saveSuccess ? 'SUCCESS' : 'FAILED')

      if (!saveSuccess) {
        Alert.alert(
          'Save Failed',
          'Failed to save your birth date. Please try again.',
          [
            { text: 'Retry', onPress: () => handleSubmit() },
            { text: 'Skip', onPress: () => router.push('/setup-profile') }
          ]
        )
        return
      }
    }

    // Navigate after successful save
    console.log('🎂 Navigating to /setup-profile')
    router.push('/setup-profile')
  }

  return (
    <View style={styles.container} testID="birthday-screen" accessibilityLabel="Birthday selection screen">
      <TopStepBar current={step} total={TOTAL_STEPS} />

      <View style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/(onboarding)/gender-screen")}>
           <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>

        <Text intent="heading" style={styles.heading} testID="birthday-heading">
          What's Your Date Of Birth?
        </Text>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Select your Birthday</Text>
            <TouchableOpacity
              style={styles.dateInputTouchable}
              onPress={showDatePicker}
              accessibilityLabel="Select birthday date"
              accessibilityRole="button"
            >
              <Text style={[styles.dateText, !selectedDate && styles.placeholderText]}>
                {selectedDate ? formatDate(selectedDate) : "eg: 05/13/2002"}
              </Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, (!selectedDate || isLoading) && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={!selectedDate || isLoading}
      >
        <Text style={[styles.submitButtonText, (!selectedDate || isLoading) && styles.submitButtonTextDisabled]}>
          {isLoading ? 'Saving...' : 'Submit'}
        </Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        maximumDate={new Date()}
        date={selectedDate || new Date(2002, 4, 13)} // Default to example date
        isDarkModeEnabled={false}
        textColor="#000000"
        accentColor="#175CD3"
      />
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
  content: {
    flex: 1,
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
    marginBottom: 20,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 40,
  },
  dateInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginBottom: "auto",
    backgroundColor: "#FFFFFF",
  },
  dateText: {
    fontSize: 16,
    color: "#000000",
  },
  placeholderText: {
    color: "#999999",
  },
  dropdownArrow: {
    fontSize: 12,
    color: "#666666",
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
  dateInputTouchable: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 18,
    backgroundColor: "#FFFFFF",
  },
})
