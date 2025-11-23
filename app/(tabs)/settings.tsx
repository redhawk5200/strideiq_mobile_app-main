"use client"

import type React from "react"

import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useState } from "react"
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useUser } from '@clerk/clerk-expo'

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  onPress?: () => void
  showChevron?: boolean
  rightElement?: React.ReactNode
}

function SettingItem({ icon, title, onPress, showChevron = true, rightElement }: SettingItemProps) {
  return (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} disabled={!onPress}>
      <View style={styles.settingItemLeft}>
        <Ionicons name={icon} size={20} color="#333" style={styles.settingIcon} />
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      {rightElement || (showChevron && <Ionicons name="chevron-forward" size={16} color="#999" />)}
    </TouchableOpacity>
  )
}

interface SectionProps {
  title: string
  children: React.ReactNode
  style?: React.CSSProperties
}

function Section({ title, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  )
}

export default function SettingsScreen() {
  const [dailyCheckIn, setDailyCheckIn] = useState(false)
  const [activityReminders, setActivityReminders] = useState(false)
  const [aiCoachAlerts, setAiCoachAlerts] = useState(false)
  const { user } = useUser()

  // Get user initials
  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    } else if (user?.firstName) {
      return user.firstName[0].toUpperCase()
    } else if (user?.emailAddresses?.[0]?.emailAddress) {
      return user.emailAddresses[0].emailAddress[0].toUpperCase()
    }
    return 'U'
  }

  // Get user full name
  const getUserName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`
    } else if (user?.firstName) {
      return user.firstName
    }
    return 'User'
  }

  // Get user email
  const getUserEmail = () => {
    return user?.emailAddresses?.[0]?.emailAddress || ''
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/(tabs)")}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileInfo}>
            <View style={styles.profileText}>
              <Text style={styles.profileName}>{getUserName()}</Text>
              <Text style={styles.profileEmail}>{getUserEmail()}</Text>
            </View>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <Text style={styles.searchPlaceholder}>Search here</Text>
        </View>

        {/* General Section */}
        <Section title="General">
          <View style={styles.tabs}>  
            <SettingItem icon="person-outline" title="Profile Information" onPress={() => router.push("/settings/ProfileInformation")} />
            <SettingItem icon="card-outline" title="Account Information" onPress={() => router.push("/settings/AccountInformation")}/>
            <SettingItem icon="phone-portrait-outline" title="Connected Devices" onPress={() => router.push("/settings/ConnectedDevices")} />
          </View>
        </Section>

        {/* Subscription & Billing Section */}
        <Section title="Subscription & Billing">
          <View style={styles.tabs}>  
            <SettingItem icon="checkmark-circle-outline" title="Current Plan" />
            <SettingItem icon="card" title="Manage Subscription" />
            <SettingItem icon="wallet-outline" title="Payment Methods" />
            <SettingItem icon="receipt-outline" title="Billing History" />
            </View>
        </Section>

        {/* Notifications Section */}
        <Section title="Notifications">
          <View style={styles.tabs}>  
          <SettingItem
            icon="alarm-outline"
            title="Daily Check-in Reminder"
            showChevron={false}
            rightElement={
              <Switch
                value={dailyCheckIn}
                onValueChange={setDailyCheckIn}
                trackColor={{ false: "#E5E5E5", true: "#175CD3" }}
                thumbColor="#fff"
              />
            }
          />
          <SettingItem
            icon="notifications-outline"
            title="Activity Reminders"
            showChevron={false}
            rightElement={
              <Switch
                value={activityReminders}
                onValueChange={setActivityReminders}
                trackColor={{ false: "#E5E5E5", true: "#175CD3" }}
                thumbColor="#fff"
              />
            }
          />
          <SettingItem
            icon="bulb-outline"
            title="AI Coach Recommendation Alerts"
            showChevron={false}
            rightElement={
              <Switch
                value={aiCoachAlerts}
                onValueChange={setAiCoachAlerts}
                trackColor={{ false: "#E5E5E5", true: "#175CD3" }}
                thumbColor="#fff"
              />
            }
          />
          </View>
        </Section>

        {/* Privacy & Security Section */}
        <Section title="Privacy & Security">
          <View style={styles.tabs}>  
            <SettingItem icon="lock-closed-outline" title="Change Password" onPress={()=>router.push("/settings/ChangePassword")}/>
            <SettingItem icon="chatbubble-ellipses-outline" title="Contact Methods" onPress={() => router.push("/settings/ContactMethodManager")} />
            <SettingItem icon="close-circle-outline" title="Deactivate Account" />
          </View>
        </Section>

        {/* Help & Support Section */}
        <Section title="Help & Support">
          <View style={styles.tabs}>  
            <SettingItem icon="help-circle-outline" title="Contact Support" />
            <SettingItem icon="document-text-outline" title="Terms & Privacy Policy" />
            <SettingItem icon="help-outline" title="FAQ" />
            </View>
        </Section>

        {/* Logout Section */}
        <Section title="Logout">
          <View style={styles.tabs}>  
            <SettingItem icon="log-out-outline" title="Logout" />
          </View>
        </Section>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FAFAFC",
  },
  header: {
    flexDirection: "row",
    backgroundColor: "#fff",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  headerSpacer: {
    width: 32, // Same width as back button to center title
  },
  profileSection: {
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#EAECF0",
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 16,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1976D2",
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: "#757575",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderColor: "#E0E0E0",
    marginHorizontal: 20,
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 0.5,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchPlaceholder: {
    fontSize: 16,
    color: "#999",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 12,
    paddingVertical: 4,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  settingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    marginRight: 16,
    width: 20,
  },
  settingTitle: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  tabs: {
    borderColor: "#E0E0E0",
    borderWidth: 0.5,
    borderRadius: 12,
    marginVertical: -3,
  }
})
