"use client"

import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import React, { useEffect, useState } from "react"
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { Text } from "../../src/ui/Text"
import { useAppDispatch, useAppSelector } from "../../src/store"
import { updateProfile, fetchProfile } from "../../src/store/thunks/profileThunks"
import { setProfileData, clearProfileError } from "../../src/store/slices/profileSlice"

type Option = string

export default function ProfileInformation() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  
  // Redux state
  const { data: profileData, isLoading, error } = useAppSelector(state => state.profile)

  // Local state for form
  const [weight, setWeight] = useState<string>("")
  const [height, setHeight] = useState<string>("")
  const [mainTarget, setMainTarget] = useState<Option>("Race time")
  const [recentVo2, setRecentVo2] = useState<Option>("40")
  const [recentRaceTime, setRecentRaceTime] = useState<string>("")
  const [medical, setMedical] = useState<Option>("High Blood Pressure")
  const [openPicker, setOpenPicker] = useState<
    null | "target" | "medical"
  >(null)

  // Load profile data on mount
  useEffect(() => {
    dispatch(fetchProfile())
  }, [dispatch])

  // Update form when profile data changes
  useEffect(() => {
    if (profileData) {
      setWeight(profileData.weight?.toString() || "")
      setHeight(profileData.height?.toString() || "")
      setMainTarget(profileData.mainTarget || "Race time")
      setRecentVo2(profileData.recentVo2?.toString() || "40")
      setRecentRaceTime(profileData.recentRaceTime?.toString() || "")
      setMedical(profileData.medicalCondition || "High Blood Pressure")
    }
  }, [profileData])

  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearProfileError())
    }
  }, [dispatch])

  // ----- Options -----
  const targetOptions: Option[] = ["Race time", "VO₂ Max"]
  const medicalOptions: Option[] = [
    "None",
    "High Blood Pressure",
    "Asthma",
    "Diabetes",
  ]

  const canSave = weight && height && mainTarget && recentVo2 && recentRaceTime && medical

  const onSave = async () => {
    if (!canSave) return

    const payload = {
      weight: Number(weight),
      height: Number(height),
      mainTarget: mainTarget as 'Race time' | 'VO₂ Max',
      recentVo2: Number(recentVo2),
      recentRaceTime: Number(recentRaceTime),
      medicalCondition: medical as 'None' | 'High Blood Pressure' | 'Asthma' | 'Diabetes',
    }

    try {
      await dispatch(updateProfile(payload)).unwrap()
      router.back()
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  return (
    <View style={styles.container} testID="profile-information">
      {/* Back */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/settings")}>
        <Ionicons name="chevron-back" size={24} color="#333" />
      </TouchableOpacity>

      {/* Title */}
      <Text intent="heading" style={styles.heading}>
        Profile Information
      </Text>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <Field label="Weight (lbs)" style={styles.firstField}>
          <NumericInput
            value={weight}
            onChangeText={setWeight}
            placeholder="Enter weight in lbs"
            keyboardType="numeric"
          />
        </Field>
        <Field label="Height (cm)">
          <NumericInput
            value={height}
            onChangeText={setHeight}
            placeholder="Enter height in cm"
            keyboardType="numeric"
          />
        </Field>
        <Field label="Main Target">
          <PickerBox value={mainTarget} onPress={() => setOpenPicker("target")} />
        </Field>
        <Field label="Recent VO₂ Max">
          <NumericInput
            value={recentVo2}
            onChangeText={setRecentVo2}
            placeholder="Enter VO₂ Max"
            keyboardType="numeric"
          />
        </Field>
        <Field label="Recent Race Time (min)">
          <NumericInput
            value={recentRaceTime}
            onChangeText={setRecentRaceTime}
            placeholder="Enter race time in minutes"
            keyboardType="numeric"
          />
        </Field>
        <Field label="Medical Condition">
          <PickerBox value={medical} onPress={() => setOpenPicker("medical")} />
        </Field>
      </ScrollView>

      <TouchableOpacity
        style={[styles.saveBtn, (!canSave || isLoading) && styles.saveBtnDisabled]}
        disabled={!canSave || isLoading}
        onPress={onSave}
      >
        <Text style={styles.saveBtnText}>{isLoading ? "Saving..." : "Save Changes"}</Text>
      </TouchableOpacity>

      {/* Pickers */}
      <SelectSheet
        visible={openPicker === "target"}
        title="Main Target"
        options={targetOptions}
        selected={mainTarget}
        onClose={() => setOpenPicker(null)}
        onSelect={(o) => {
          setMainTarget(o)
          setOpenPicker(null)
        }}
      />
      <SelectSheet
        visible={openPicker === "medical"}
        title="Medical Condition"
        options={medicalOptions}
        selected={medical}
        onClose={() => setOpenPicker(null)}
        onSelect={(o) => {
          setMedical(o)
          setOpenPicker(null)
        }}
      />
    </View>
  )
}

/* ----------------- Small building blocks ----------------- */

function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: any }) {
  return (
    <View style={[styles.field, style]}>
      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>{label}</Text>
        {children}
      </View>
    </View>
  )
}

function PickerBox({ value, onPress }: { value?: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.pickerInput} onPress={onPress} accessibilityRole="button">
      <Text style={[styles.pickerText, !value && styles.placeholderText]}>{value || "Select"}</Text>
      <Ionicons name="chevron-down" size={16} color="#6B7280" />
    </TouchableOpacity>
  )
}

function SelectSheet({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean
  title: string
  options: Option[]
  selected?: Option
  onSelect: (o: Option) => void
  onClose: () => void
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.sheet}>
          <Text style={styles.sheetTitle}>{title}</Text>
          {options.map((o) => (
            <Pressable key={o} style={styles.sheetItem} onPress={() => onSelect(o)}>
              <Text style={styles.sheetItemText}>{o}</Text>
              {selected === o && <Ionicons name="checkmark" size={18} color="#175CD3" />}
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  )
}

// Add NumericInput component
function NumericInput({ value, onChangeText, placeholder, keyboardType }: { value: string; onChangeText: (t: string) => void; placeholder?: string; keyboardType?: any }) {
  return (
    <View style={styles.numericInputWrapper}>
      <TextInput
        style={styles.numericInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        placeholderTextColor="#A0A0A0"
      />
    </View>
  );
}

/* ----------------- Styles ----------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingTop: 60,
  },

  backButton: {
    alignSelf: "flex-start",
    marginBottom: 16,
  },

  heading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: 18,
    lineHeight: 32,
  },

  field: { marginBottom: 16 },
  inputWrapper: {
    position: "relative",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  inputLabel: {
    fontSize: 14,
    color: "#000",
    position: "absolute",
    top: -10,
    left: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 6,
    zIndex: 1,
  },

  pickerInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 18,
    backgroundColor: "#FFFFFF",
  },
  pickerText: { fontSize: 16, color: "#111827" },
  placeholderText: { color: "#A0A0A0" },

  saveBtn: {
    backgroundColor: "#2D4ED7",
    borderRadius: 12,
    paddingVertical: 18,
    marginBottom: 40,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: "#FFFFFF", fontSize: 18, fontWeight: "600", textAlign: "center" },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  sheet: {
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "70%",
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "600",
    paddingVertical: 12,
    textAlign: "center",
    color: "#111827",
  },
  sheetItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#EEE",
  },
  sheetItemText: { fontSize: 16, color: "#111827" },

  numericInputWrapper: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  numericInput: {
    fontSize: 16,
    color: "#111827",
    padding: 0,
    margin: 0,
    height: 24,
  },

  firstField: {
    marginTop: 18,
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
})
