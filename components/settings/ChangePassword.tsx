"use client"

import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import React, { useState } from "react"
import { Pressable, StyleSheet, TextInput, TouchableOpacity, View } from "react-native"
import { Text } from "../../src/ui/Text"

export default function ChangePassword() {
  const router = useRouter()

  const [current, setCurrent] = useState("")
  const [nextPw, setNextPw] = useState("")
  const [confirm, setConfirm] = useState("")

  const [showCur, setShowCur] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const [showConf, setShowConf] = useState(false)

  const [errCur, setErrCur] = useState<string | null>(null)
  const [errNext, setErrNext] = useState<string | null>(null)
  const [errConf, setErrConf] = useState<string | null>(null)

  const saving = false

  const validate = () => {
    let ok = true
    setErrCur(null); setErrNext(null); setErrConf(null)

    if (!current) {
      setErrCur("Enter your current password.")
      ok = false
    }
    if (!nextPw) {
      setErrNext("Enter a new password.")
      ok = false
    } else {
      const strong =
        /[a-z]/.test(nextPw) &&
        /[A-Z]/.test(nextPw) &&
        /\d/.test(nextPw) &&
        /[^A-Za-z0-9]/.test(nextPw) &&
        nextPw.length >= 8
      if (!strong) {
        setErrNext("Use 8+ chars with upper/lowercase, number, and symbol.")
        ok = false
      }
      if (current && nextPw === current) {
        setErrNext("New password must be different from current.")
        ok = false
      }
    }
    if (!confirm) {
      setErrConf("Retype your new password.")
      ok = false
    } else if (nextPw && confirm !== nextPw) {
      setErrConf("Passwords do not match.")
      ok = false
    }
    return ok
  }

  const onSave = async () => {
    if (!validate()) return
    // TODO: replace with your FastAPI call
    // await api.account.changePassword({ current, newPassword: nextPw })
    router.back()
  }

  return (
    <View style={styles.container} testID="change-password-screen">
      {/* Back */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/settings")}>
        <Ionicons name="chevron-back" size={24} color="#333" />
      </TouchableOpacity>

      {/* Title */}
      <Text intent="heading" style={styles.heading}>Change Password</Text>

      {/* Helper text */}
      <Text style={styles.helper}>
        New password must be different from the old one and include upper/lowercase letters,
        numbers, and a symbol.
      </Text>

      {/* Current Password */}
      <Field label="Current Password">
        <PasswordInput
          value={current}
          onChangeText={setCurrent}
          placeholder="Enter your current password"
          visible={showCur}
          onToggle={() => setShowCur((s) => !s)}
          error={!!errCur}
        />
      </Field>
      {errCur ? <Text style={styles.errorText}>{errCur}</Text> : null}

      {/* New Password */}
      <Field label="New Password">
        <PasswordInput
          value={nextPw}
          onChangeText={setNextPw}
          placeholder="Enter your new password"
          visible={showNext}
          onToggle={() => setShowNext((s) => !s)}
          error={!!errNext}
        />
      </Field>
      {errNext ? <Text style={styles.errorText}>{errNext}</Text> : null}

      {/* Retype New Password */}
      <Field label="Retype New Password">
        <PasswordInput
          value={confirm}
          onChangeText={setConfirm}
          placeholder="Retype your new password"
          visible={showConf}
          onToggle={() => setShowConf((s) => !s)}
          error={!!errConf}
        />
      </Field>
      {errConf ? <Text style={styles.errorText}>{errConf}</Text> : null}

      {/* Forgot link */}
      <Pressable
        onPress={() => {
          router.replace("/settings/ForgotPassword")
        }}
        style={{ marginTop: 6, marginBottom: 18 }}
      >
        <Text style={styles.link}>Forget Current Password?</Text>
      </Pressable>

      {/* Save button */}
      <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.7 }]} onPress={onSave} disabled={saving}>
        <Text style={styles.saveBtnText}>{saving ? "Saving..." : "Save Changes"}</Text>
      </TouchableOpacity>
    </View>
  )
}

/* ---------- Small building blocks (reuse of your style) ---------- */

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

function PasswordInput({
  value,
  onChangeText,
  placeholder,
  visible,
  onToggle,
  error,
}: {
  value: string
  onChangeText: (t: string) => void
  placeholder: string
  visible: boolean
  onToggle: () => void
  error?: boolean
}) {
  return (
    <View>
      <TextInput
        style={[styles.textInput, error && styles.textInputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A0A0A0"
        secureTextEntry={!visible}
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="password"
      />
      <TouchableOpacity
        onPress={onToggle}
        style={styles.eyeToggle}
        accessibilityRole="button"
        accessibilityLabel={visible ? "Hide password" : "Show password"}
      >
        <Ionicons name={visible ? "eye-off" : "eye"} size={18} color="#6B7280" />
      </TouchableOpacity>
    </View>
  )
}

/* ----------------------------- Styles ----------------------------- */

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
    marginBottom: 8,
    lineHeight: 32,
  },
  helper: {
    color: "#4B5563",
    fontSize: 14,
    marginBottom: 16,
  },

  field: { marginBottom: 18, marginTop: 6 },
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
  textInputError: {
    borderColor: "#EF4444",
  },
  eyeToggle: {
    position: "absolute",
    right: 12,
    top: 14,
    height: 36,
    width: 36,
    alignItems: "center",
    justifyContent: "center",
  },

  link: { color: "#2D4ED7", fontWeight: "600" },

  saveBtn: {
    backgroundColor: "#2D4ED7",
    borderRadius: 12,
    paddingVertical: 18,
    marginTop: "auto",
    marginBottom: 40,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },

  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 6,
    marginBottom: 4,
  },
})
