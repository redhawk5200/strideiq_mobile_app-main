"use client";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function SettingItem({ icon, title, onPress }: { icon: keyof typeof Ionicons.glyphMap; title: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingItemLeft}>
        <Ionicons name={icon} size={20} color="#333" style={styles.settingIcon} />
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#999" />
    </TouchableOpacity>
  );
}

export default function ContactMethodManagerScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contact Methods</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* Helper */}
        <Text style={styles.helper}>Decide which contact details should we use to reset your password.</Text>

        {/* Methods */}
        <View style={styles.sectionContent}>
          <SettingItem
            icon="chatbubble-ellipses-outline"
            title="Via SMS"
            onPress={() => router.push({ pathname: "/settings/ManageContactMethod", params: { method: "sms" } })}
          />
          <SettingItem
            icon="mail-outline"
            title="Via Email"
            onPress={() => router.push({ pathname: "/settings/ManageContactMethod", params: { method: "email" } })}
          />
          <SettingItem
            icon="call-outline"
            title="Via Phone Call"
            onPress={() => router.push({ pathname: "/settings/ManageContactMethod", params: { method: "call" } })}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF" },
  container: { flex: 1, backgroundColor: "#FAFAFC" },
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
  helper: { color: "#6B7280", fontSize: 14, paddingHorizontal: 20, marginBottom: 12 },
  sectionContent: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 12,
    paddingVertical: 4,
    borderWidth: 0.5,
    borderColor: "#E0E0E0",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  settingItemLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  settingIcon: { marginRight: 16, width: 20 },
  settingTitle: { fontSize: 16, color: "#333", flex: 1 },
});