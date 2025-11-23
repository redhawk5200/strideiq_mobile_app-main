"use client"

import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import React, { useMemo, useState } from "react"
import { KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View } from "react-native"
import { Text } from "../../src/ui/Text"

type Method = "sms" | "email" | null

export default function ForgotPassword() {
  const router = useRouter()
  const [selected, setSelected] = useState<Method>(null)

  const canContinue = useMemo(() => selected !== null, [selected])

  const onContinue = () => {
    if (!selected) return
    
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={styles.container}
      testID="forgot-password-screen"
    >
      {/* Back */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/settings/ChangePassword")}>
        <Ionicons name="chevron-back" size={24} color="#333" />
      </TouchableOpacity>

      {/* Heading */}
      <Text intent="heading" style={styles.heading}>Forgot Password</Text>
      <Text style={styles.subheading}>
        Decide which contact details should we use to reset your password
      </Text>

      {/* Option: SMS */}
      <TouchableOpacity style={styles.card} onPress={() => router.push({ pathname: "/settings/ManageContactMethod", params: { method: "sms" } })}>
        <View style={styles.cardLeft}>
          <View style={styles.iconBadge}>
            <Ionicons name="chatbubble-ellipses-outline" size={18} color="#175CD3" />
          </View>
          <View>
            <Text style={styles.cardTitle}>Via SMS</Text>
            <Text style={styles.cardDetail}>********110</Text>
          </View>
        </View>
        <View style={[styles.radio, selected === "sms" && styles.radioSelected]}>
          {selected === "sms" && <View style={styles.radioInner} />}
        </View>
      </TouchableOpacity>

      {/* Option: Email */}
      <TouchableOpacity style={styles.card} onPress={() => router.push({ pathname: "/settings/ManageContactMethod", params: { method: "email" } })}>
        <View style={styles.cardLeft}>
          <View style={styles.iconBadge}>
            <Ionicons name="mail-outline" size={18} color="#175CD3" />
          </View>
          <View>
            <Text style={styles.cardTitle}>Via Email</Text>
            <Text style={styles.cardDetail}>********an@gmail.com</Text>
          </View>
        </View>
        <View style={[styles.radio, selected === "email" && styles.radioSelected]}>
          {selected === "email" && <View style={styles.radioInner} />}
        </View>
      </TouchableOpacity>

      {/* Add more method (outline pill) */}
      <TouchableOpacity style={styles.outlineBtn} onPress={() => {router.push("/settings/ContactMethodManager") }}>
        <Text style={styles.outlineBtnText}>Add more recovery method</Text>
      </TouchableOpacity>

      <View style={{ flex: 1 }} />

      {/* Continue */}
      <TouchableOpacity
        style={[styles.primaryBtn, !canContinue && styles.primaryBtnDisabled]}
        disabled={!canContinue}
        onPress={onContinue}
      >
        <Text style={styles.primaryBtnText}>Continue</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFC",
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  backButton: { alignSelf: "flex-start", marginBottom: 8 },

  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 8,
  },
  subheading: {
    color: "#6B7280",
    fontSize: 14,
    marginBottom: 16,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    paddingVertical: 24,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 0.5,
    borderColor: "#E6E9F0",
  },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#EAF1FF",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#111827", marginBottom: 2 },
  cardDetail: { fontSize: 14, color: "#6B7280" },

  // Same radio style as your Medical screen
  radio: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: { backgroundColor: "#FFFFFF", borderColor: "#175CD3" },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#175CD3" },

  outlineBtn: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    backgroundColor: "#FFF",
    marginTop: 4,
  },
  outlineBtnText: { color: "#111827", fontSize: 16, fontWeight: "500" },

  primaryBtn: {
    backgroundColor: "#175CD3",
    borderRadius: 12,
    paddingVertical: 18,
    marginBottom: 40,
  },
  primaryBtnDisabled: { backgroundColor: "#E0E0E0" },
  primaryBtnText: { color: "#FFFFFF", fontSize: 18, fontWeight: "600", textAlign: "center" },
})
