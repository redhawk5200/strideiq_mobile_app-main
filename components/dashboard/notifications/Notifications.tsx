"use client"

import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import type React from "react"
import { useMemo, useState } from "react"
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

/* ---------- Sample notifications (replace with API data) ---------- */
type Notice = {
  id: string
  createdAt: string // ISO
  text: string
}

const SAMPLE: Notice[] = [
  // Today
  { id: "1", createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), text: "20 min brisk walk today. Keep it light." },
  { id: "2", createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), text: "Log how you feel to get accurate coach tips" },
  // Yesterday
  { id: "3", createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 - 60 * 60 * 1000).toISOString(), text: "VO₂ Max improved +0.5, Great job! You’re steadily improving." },
  { id: "4", createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 - 6 * 60 * 60 * 1000).toISOString(), text: "Garmin sync successful." },
  // Sept 23, 2025 (example)
  { id: "5", createdAt: "2025-09-23T00:57:00.000Z", text: "Coach suggests 2 more glasses of water today." },
  { id: "6", createdAt: "2025-09-23T10:23:00.000Z", text: "Your 10K: 54:00. Tap to view analysis." },
  { id: "7", createdAt: "2025-09-23T16:40:00.000Z", text: "Try Premium! 7-day free trial for advanced coach plans." },
]

/* ----------------------- Helpers ----------------------- */
const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

function dayLabel(date: Date) {
  const now = new Date()
  const yest = new Date(now)
  yest.setDate(now.getDate() - 1)

  if (isSameDay(date, now)) return "Today"
  if (isSameDay(date, yest)) return "Yesterday"

  const opts: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "2-digit" }
  // e.g., "Sep 23, 2025"
  return new Intl.DateTimeFormat("en-US", opts).format(date)
}

function timeLabel(date: Date) {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const mins = Math.round(diffMs / (60 * 1000))
  const hours = Math.round(mins / 60)
  const days = Math.round(hours / 24)

  if (days >= 2) {
    // Show clock time like "03:23 pm"
    const opts: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" }
    return new Intl.DateTimeFormat("en-US", opts).format(date).toLowerCase()
  }
  if (hours >= 1) return `${hours}hr ago`
  if (mins >= 1) return `${mins}m ago`
  return "Just now"
}

/* ----------------------- Screen ----------------------- */
export default function Notifications() {
  const [query, setQuery] = useState("")

  const grouped = useMemo(() => {
    // Filter/search
    const filtered = SAMPLE.filter(n => n.text.toLowerCase().includes(query.trim().toLowerCase()))
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))

    // Group by section label
    const map = new Map<string, Notice[]>()
    for (const n of filtered) {
      const label = dayLabel(new Date(n.createdAt))
      if (!map.has(label)) map.set(label, [])
      map.get(label)!.push(n)
    }
    return Array.from(map.entries()) // [label, notices][]
  }, [query])

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/(tabs)")}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#9AA0A6" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search here"
            placeholderTextColor="#9AA0A6"
            style={styles.searchInput}
          />
        </View>

        {/* Sections */}
        {grouped.map(([label, items]) => (
          <View key={label} style={styles.section}>
            <Text style={styles.sectionTitle}>{label}</Text>
            {items.map((n) => (
              <View key={n.id} style={styles.card}>
                <Text style={styles.timeText}>{timeLabel(new Date(n.createdAt))}</Text>
                <Text style={styles.bodyText}>{n.text}</Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

/* ----------------------- Styles ----------------------- */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FAFAFC",
  },
  container: {
    flex: 1,
    backgroundColor: "#FAFAFC",
  },

  header: {
    flexDirection: "row",
    backgroundColor: "#FAFAFC",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: { padding: 4 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  headerSpacer: { width: 32 },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderColor: "#E0E0E0",
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 0.5,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 2,
  },

  section: {
    paddingHorizontal: 20,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "#E6E9F0",
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  timeText: {
    color: "#6B7280",
    fontSize: 12,
    marginBottom: 6,
  },
  bodyText: {
    color: "#1F2937",
    fontSize: 14,
    lineHeight: 20,
  },
})
