"use client"

import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useState, useEffect, useRef } from "react"
import { Modal, Pressable, StyleSheet, TextInput, TouchableOpacity, View, Alert } from "react-native"
import { Text } from "../../src/ui/Text"
import { useOnboarding } from "../../src/hooks/useOnboarding"
import TopStepBar from "../../src/ui/top-stepbar"

export default function NameScreen() {
  const router = useRouter()

  const TOTAL_STEPS = 11;

  // Use the enhanced onboarding hook
  const {
    formData,
    updateData,
    saveCriticalData,
    saveCurrentStepNumber,
    goNext,
    step,
    setStep,
    isCriticalStep,
    isLoading,
    error
  } = useOnboarding(TOTAL_STEPS)

  // Local state for form inputs
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [showModal, setShowModal] = useState(true)
  const hasInitialized = useRef(false)

  // Set the current step to 1 (Name screen - first step, 1-indexed for thunk)
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true
      setStep(1)  // Step 1 of 12;
      // Auto-save this step to backend so if app closes, we resume here
      saveCurrentStepNumber(1).catch((err) => console.warn('Failed to save step 1:', err))
    }
  }, []);

  // Load existing data from Redux store
  useEffect(() => {
    if (formData.firstName) setFirstName(formData.firstName)
    if (formData.lastName) setLastName(formData.lastName)
  }, [formData])

  const handleAccept = () => {
    setShowModal(false)
  }

  const handleReject = () => {
    setShowModal(false)
    // Handle data consent rejection
  }

  const handleContinue = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Missing Information', 'Please enter both first and last name.')
      return
    }

    // Update local store immediately
    const nameData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    }

    updateData(nameData)

    // For critical steps, wait for save to complete before navigation
    if (isCriticalStep) {
      const saveSuccess = await saveCriticalData()

      if (!saveSuccess) {
        Alert.alert(
          'Save Failed',
          'Failed to save your name. Please try again.',
          [
            { text: 'Retry', onPress: () => handleContinue() },
            { text: 'Skip', onPress: () => router.push('/gender-screen') }
          ]
        )
        return
      }
    }

    // Navigate after successful save
    router.push('/gender-screen')
  }

  const canContinue = firstName.trim() && lastName.trim() && !isLoading

  return (
    <View style={styles.container} testID="name-screen" accessibilityLabel="Name input screen">
      <TopStepBar current={step} total={TOTAL_STEPS} />

      {/* <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/login")}>
        <Ionicons name="chevron-back" size={24} color="#333" />
      </TouchableOpacity> */}

      <Text intent="heading" style={styles.heading} testID="name-heading">
        What's Your Name?
      </Text>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.dismissError}
            onPress={() => {/* Clear error action */}}
          >
            <Text style={styles.dismissErrorText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>First Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="eg: Atif"
              placeholderTextColor="#A0A0A0"
              value={firstName}
              onChangeText={(text) => {
                setFirstName(text)
                // Update store in real-time for better UX
                updateData({ firstName: text.trim() })
              }}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Last Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="eg: khan"
              placeholderTextColor="#A0A0A0"
              value={lastName}
              onChangeText={(text) => {
                setLastName(text)
                // Update store in real-time for better UX
                updateData({ lastName: text.trim() })
              }}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.continueButton, !canContinue && styles.continueButtonDisabled]}
        onPress={handleContinue}
        disabled={!canContinue}
      >
        <Text style={styles.continueButtonText}>
          {isLoading ? 'Saving...' : 'Continue'}
        </Text>
      </TouchableOpacity>

      {/* Data Consent Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlayRed}>
          <View style={styles.modalCenter}> 
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                Allow the use of data{"\n"}to personalize your strideiq
              </Text>
              <Text style={styles.modalDescription}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit Lorem ipsum dolor sit amet, consectetur
                adipiscing elit dolor sit amet
              </Text>
              <View style={styles.buttonContainer}>
                <Pressable style={styles.rejectButton} onPress={handleReject}>
                  <Text style={styles.rejectButtonText}>Reject</Text>
                </Pressable>
                <Pressable style={styles.acceptButton} onPress={handleAccept}>
                  <Text style={styles.acceptButtonText}>Accept</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
    marginTop: 30,
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
  continueButton: {
    backgroundColor: "#175CD3",
    borderRadius: 12,
    paddingVertical: 18,
    marginBottom: 40,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  blurView: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  androidBlur: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  modalOverlayRed: {
    flex: 1,
    backgroundColor: 'rgba(255, 59, 48, 0.12)', // light red overlay (iOS systemRed-ish)
  },
  
  // This wrapper creates consistent horizontal margins for the card
  modalCenter: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,   // <-- side margin
  },
  
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    // shadow/elevation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 30,
  },
  modalDescription: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
  },
  rejectButtonText: {
    color: "#175CD3",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  acceptButton: {
    flex: 1,
    backgroundColor: "#175CD3",
    borderRadius: 12,
    paddingVertical: 16,
  },
  acceptButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  dismissError: {
    marginTop: 8,
    alignSelf: 'center',
  },
  dismissErrorText: {
    color: '#DC2626',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
})
