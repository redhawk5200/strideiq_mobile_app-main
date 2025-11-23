"use client"

import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import React, { useEffect, useState } from "react"
import {
    Modal,
    Pressable,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
    ScrollView
} from "react-native"
import DateTimePickerModal from "react-native-modal-datetime-picker"
import { Text } from "../../src/ui/Text"
import { useAppDispatch, useAppSelector } from "../../src/store"
import { createOrUpdateProfile, fetchProfile } from "../../src/store/thunks/profileThunks"
import { updateLocalProfile, clearProfileError } from "../../src/store/slices/profileSlice"

export default function AccountInformationScreen() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  
  // Redux state
  const { data: profileData, isLoading, error } = useAppSelector(state => state.profile)
  
  // Local state
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [dob, setDob] = useState<Date | null>(null)
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("")
  const [saving, setSaving] = useState(false)
  const [dobOpen, setDobOpen] = useState(false)
  const [genderOpen, setGenderOpen] = useState(false)

  // Load profile data on mount
  useEffect(() => {
    dispatch(fetchProfile())
  }, [dispatch])

  // Update form when profile data changes
  useEffect(() => {
    if (profileData) {
      setFirstName(profileData.firstName || "")
      setLastName(profileData.lastName || "")
      setGender(profileData.gender || "")
      
      // Parse birth date
      if (profileData.birthDate) {
        try {
          const [month, day, year] = profileData.birthDate.split('/')
          setDob(new Date(parseInt(year), parseInt(month) - 1, parseInt(day)))
        } catch (e) {
          console.warn('Invalid birth date format:', profileData.birthDate)
        }
      }
    }
  }, [profileData])

  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearProfileError())
    }
  }, [dispatch])

  const initials = React.useMemo(() => {
    const f = firstName.trim().charAt(0).toUpperCase()
    const l = lastName.trim().charAt(0).toUpperCase()
    return (f + l) || "SK"
  }, [firstName, lastName])

  const formatDate = (d?: Date | null) => {
    if (!d) return ""
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const dd = String(d.getDate()).padStart(2, "0")
    const yyyy = d.getFullYear()
    return `${mm}/${dd}/${yyyy}`
  }

  const onSave = async () => {
    try {
      setSaving(true)
      
      // Update local state immediately
      const updates = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender: gender as 'male' | 'female' | 'other',
        birthDate: dob ? formatDate(dob) : undefined,
      }
      
      dispatch(updateLocalProfile(updates))

      // Save to backend
      await dispatch(createOrUpdateProfile(updates)).unwrap()
      
      router.back()
    } catch (error) {
      console.error('Failed to save account information:', error)
    } finally {
      setSaving(false)
    }
  }

  const canSave = firstName.trim() && lastName.trim() && !isLoading && !saving

  return (
    <View style={styles.container} testID="account-information">
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/(tabs)/settings")}>
        <Ionicons name="chevron-back" size={24} color="#333" />
      </TouchableOpacity>

      {/* Title */}
      <Text intent="heading" style={styles.heading}>
        Account Information
      </Text>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Avatar */}
      <View style={styles.avatarWrap}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitials}>{initials}</Text>
        </View>
        <TouchableOpacity style={styles.avatarEdit}>
          <Ionicons name="create-outline" size={16} color="#2D4ED7" />
        </TouchableOpacity>
      </View>

      {/* Form Fields */}
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <Field label="First Name">
          <TextInput
            style={styles.textInput}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter first name"
            editable={!isLoading && !saving}
          />
        </Field>

        <Field label="Last Name">
          <TextInput
            style={styles.textInput}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter last name"
            editable={!isLoading && !saving}
          />
        </Field>

        <Field label="Gender">
          <TouchableOpacity 
            style={styles.pickerInput} 
            onPress={() => setGenderOpen(true)}
            disabled={isLoading || saving}
          >
            <Text style={[styles.pickerText, !gender && styles.placeholderText]}>
              {gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : "Select gender"}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#6B7280" />
          </TouchableOpacity>
        </Field>

        <Field label="Date of Birth">
          <TouchableOpacity 
            style={styles.pickerInput} 
            onPress={() => setDobOpen(true)}
            disabled={isLoading || saving}
          >
            <Text style={[styles.pickerText, !dob && styles.placeholderText]}>
              {dob ? formatDate(dob) : "Select date of birth"}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#6B7280" />
          </TouchableOpacity>
        </Field>
      </ScrollView>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
        disabled={!canSave}
        onPress={onSave}
      >
        <Text style={styles.saveBtnText}>
          {isLoading || saving ? "Saving..." : "Save Changes"}
        </Text>
      </TouchableOpacity>

      {/* DOB Modal Picker */}
      <DateTimePickerModal
        isVisible={dobOpen}
        mode="date"
        onConfirm={(d) => { setDob(d); setDobOpen(false) }}
        onCancel={() => setDobOpen(false)}
        maximumDate={new Date()}
        date={dob || new Date(2000, 0, 1)}
        isDarkModeEnabled={false}
        textColor="#000000"
        accentColor="#175CD3"
      />

      {/* Gender Modal */}
      <Modal
        visible={genderOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setGenderOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setGenderOpen(false)}>
          <Pressable style={styles.sheet}>
            {(["male", "female", "other"] as const).map((g) => (
              <Pressable
                key={g}
                style={styles.sheetItem}
                onPress={() => { setGender(g); setGenderOpen(false) }}
              >
                <Text style={styles.sheetItemText}>
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </Text>
                {gender === g && <Ionicons name="checkmark" size={18} color="#175CD3" />}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}

/** ----- Small Field wrapper for the floating label look ----- */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>{label}</Text>
        {children}
      </View>
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
    marginBottom: 16,
  },
  backArrow: { fontSize: 24, color: "#000" },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 32,
  },

  avatarWrap: { alignItems: "center", marginBottom: 20 },
  avatarCircle: {
    width: 172, height: 172, borderRadius: 86,
    backgroundColor: "#E6EEFF", // light blue like the mock
    alignItems: "center", justifyContent: "center",
  },
  avatarInitials: { fontSize: 48, fontWeight: "800", color: "#2D4ED7" },
  avatarEdit: {
    position: "absolute",
    right: (172 - 86), // visually bottom-right edge
    bottom: 8,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "#2D4ED7",
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
    top: -8,
    left: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 6,
    zIndex: 1,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "transparent",
  },
  disabledInput: {
    color: "#9CA3AF",
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
    marginTop: 8,
    marginBottom: 40,
  },
  saveBtnText: { color: "#FFFFFF", fontSize: 18, fontWeight: "600", textAlign: "center" },

  modalOverlay: {
    flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.25)",
  },
  sheet: {
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
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
  saveBtnDisabled: {
    opacity: 0.6,
  },
})
