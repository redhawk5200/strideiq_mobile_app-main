"use client"
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router"
import { useEffect, useMemo, useState, useRef } from "react"
import { KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View, ActivityIndicator, ScrollView } from "react-native"
import { useOnboarding } from "../../src/hooks/useOnboarding"
import { Text } from "../../src/ui/Text"
import TopStepBar from "../../src/ui/top-stepbar"
import { apiClient } from "../../src/lib/api"

interface MedicalCondition {
  id: string
  name: string
  description: string | null
  category: string | null
  display_order: number
  is_active: boolean
}

export default function MedicalScreen() {
  const router = useRouter()
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [conditions, setConditions] = useState<MedicalCondition[]>([])
  const [loading, setLoading] = useState(true)
  const TOTAL_STEPS = 11
  const { step, setStep, goNext, goBack, saveCurrentStepNumber } = useOnboarding(TOTAL_STEPS)
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true
      setStep(8)
      saveCurrentStepNumber(8).catch((err) => console.warn("Failed to save step 8:", err))

      // Fetch medical conditions from API
      apiClient.get<MedicalCondition[]>('/api/v1/onboarding/medical-conditions')
        .then(response => {
          if (response.data) {
            setConditions(response.data)
          }
          setLoading(false)
        })
        .catch(error => {
          console.error('❌ Failed to fetch medical conditions:', error)
          setLoading(false)
        })
    }
  }, [])

  const canSubmit = useMemo(() => selectedConditions.length > 0, [selectedConditions])

  const handleSubmit = () => {
    if (!canSubmit) return

    // Save to backend in background - don't block navigation
    apiClient.post('/api/v1/onboarding/input/medical-conditions', {
      condition_ids: selectedConditions,
    })
      .then(response => console.log('✅ Medical conditions saved:', response.data))
      .catch(error => console.warn('❌ Failed to save medical conditions:', error))

    goNext()
    router.push("/(onboarding)/fitness-status")
  }

  const handleConditionSelect = (condition: string) => {
    setSelectedConditions(prev =>
      prev.includes(condition)
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={styles.container}
      testID="medical-screen"
      accessibilityLabel="Medical conditions selection screen"
    >
      <TopStepBar current={step} total={TOTAL_STEPS} />
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace("/(onboarding)/fitness-screen")}
      >
        <Ionicons name="chevron-back" size={24} color="#333" />
      </TouchableOpacity>

      <Text intent="heading" style={styles.heading} testID="medical-heading">
        Do you have any medical conditions?
      </Text>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#175CD3" />
          </View>
        ) : (
          <>
            {conditions.map((condition) => (
              <TouchableOpacity
                key={condition.id}
                style={styles.conditionCard}
                onPress={() => handleConditionSelect(condition.id)}
              >
                <Text style={styles.conditionLabel}>{condition.name}</Text>
                <View style={[styles.radioButton, selectedConditions.includes(condition.id) && styles.radioButtonSelected]}>
                  {selectedConditions.includes(condition.id) && <View style={styles.radioButtonInner} />}
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={!canSubmit}
        testID="medical-submit"
      >
        <Text style={[styles.submitButtonText, !canSubmit && styles.submitButtonTextDisabled]}>Continue</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    minHeight: 200,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
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
    fontSize: 28,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 36,
  },
  conditionCard: {
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
  conditionLabel: {
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
    backgroundColor: "#FFFFFF",
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