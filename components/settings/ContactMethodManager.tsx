"use client"

import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import React, { useState } from "react"
import {
  KeyboardAvoidingView,
  KeyboardTypeOptions,
  Modal,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Text } from "../../src/ui/Text"

export type ContactMethodManagerProps = {
  /** Header title, e.g., "Via SMS" / "Via Email" / "Via Phone Call" */
  title: string
  /** One-line helper under the title */
  helper?: string
  /** Label for the “Add …” pill button */
  addLabel: string
  /** Leading icon for list rows */
  leadingIcon: keyof typeof Ionicons.glyphMap
  /** Placeholder inside the add/edit modal input */
  inputPlaceholder: string
  /** Keyboard type for the input */
  keyboardType?: KeyboardTypeOptions
  /** Items to display (e.g., phone numbers or emails) */
  items: string[]
  /** Called when user adds a new item */
  onAdd: (value: string) => void
  /** Called when user edits an existing item */
  onEdit: (index: number, value: string) => void
  /** (Optional) mask/format value for display only */
  displayFormat?: (value: string) => string
};

export default function ContactMethodManager({
  title,
  helper = "Decide which contact details should we use to reset your password.",
  addLabel,
  leadingIcon,
  inputPlaceholder,
  keyboardType = "default",
  items,
  onAdd,
  onEdit,
  displayFormat,
}: ContactMethodManagerProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [draft, setDraft] = useState("")

  const openAdd = () => {
    setEditingIndex(-1)
    setDraft("")
  }
  const openEdit = (i: number) => {
    setEditingIndex(i)
    setDraft(items[i])
  }
  const closeModal = () => {
    setEditingIndex(null)
    setDraft("")
  }
  const saveDraft = () => {
    const v = draft.trim()
    if (!v) return
    if (editingIndex === -1) onAdd(v)
    else if (editingIndex !== null) onEdit(editingIndex, v)
    closeModal()
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 32 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={styles.container}
      >
        {!!helper && <Text style={styles.helper}>{helper}</Text>}

        {/* Add pill */}
        <TouchableOpacity style={styles.addPill} onPress={openAdd}>
          <Text style={styles.addPillText}>{addLabel}</Text>
        </TouchableOpacity>

        {/* Items */}
        {items.map((val, i) => {
          const shown = displayFormat ? displayFormat(val) : val
          return (
            <View key={`${val}-${i}`} style={styles.card}>
              <View style={styles.rowLeft}>
                <Ionicons name={leadingIcon} size={18} color="#111827" style={{ marginRight: 10 }} />
                <Text style={styles.valueText}>{shown}</Text>
              </View>
              <TouchableOpacity onPress={() => openEdit(i)} accessibilityLabel="Edit">
                <Ionicons name="pencil" size={18} color="#111827" />
              </TouchableOpacity>
            </View>
          )
        })}
      </KeyboardAvoidingView>

      {/* Add/Edit modal */}
      <Modal transparent animationType="fade" visible={editingIndex !== null} onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>
              {editingIndex === -1 ? `Add ${title.replace("Via ", "")}` : `Edit ${title.replace("Via ", "")}`}
            </Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>{title.replace("Via ", "")}</Text>
              <TextInput
                style={styles.textInput}
                placeholder={inputPlaceholder}
                placeholderTextColor="#A0A0A0"
                value={draft}
                onChangeText={setDraft}
                keyboardType={keyboardType}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.sheetActions}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={closeModal}>
                <Text style={styles.secondaryBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryBtn} onPress={saveDraft}>
                <Text style={styles.primaryBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

/* -------------------- Styles -------------------- */

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFF",
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },

  container: {
    flex: 1,
    backgroundColor: "#FAFAFC",
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  helper: { color: "#6B7280", fontSize: 14, marginBottom: 12 },

  addPill: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  addPillText: { fontSize: 16, color: "#111827", fontWeight: "500" },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "#E6E9F0",
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  rowLeft: { flexDirection: "row", alignItems: "center" },
  valueText: { fontSize: 15, color: "#111827", fontWeight: "600" },

  /* Floating-label input */
  inputWrapper: {
    position: "relative",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    marginTop: 8,
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
    paddingVertical: 14,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "transparent",
  },

  /* Modal sheet */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  sheetTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 8 },
  sheetActions: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 14 },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#FFF",
  },
  secondaryBtnText: { color: "#111827", fontWeight: "600" },
  primaryBtn: { backgroundColor: "#175CD3", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  primaryBtnText: { color: "#FFF", fontWeight: "700" },
})
