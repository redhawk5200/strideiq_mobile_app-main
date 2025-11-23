import AccordionSection from "@/components/dashboard/AccordianSection"
import OlympicCoachRecommendations from "@/components/dashboard/OlympicCoachRecommendations"
import { useAuth, useUser } from '@clerk/clerk-expo'
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from 'expo-linear-gradient'
import { router } from "expo-router"
import { useState } from "react"
import { Alert, Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import RaceTimeCard from "../../components/graphs/RaceTimeCard"
import Vo2MaxCard from "../../components/graphs/Vo2MaxCard"
import { DailyCheckInModal } from "../../src/components/DailyCheckInModal"

const SCREEN_PADDING = 20
const { width } = Dimensions.get("window")
const CARD_WIDTH = width - SCREEN_PADDING * 2

export default function HomeScreen() {
  const [showDailyCheckIn, setShowDailyCheckIn] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const { signOut } = useAuth()
  const { user } = useUser()

  const handleDailyCheckInClose = () => {
    console.log('🔄 [Home] Daily check-in closed, triggering recommendations refresh')
    setShowDailyCheckIn(false)
    // Trigger refresh by incrementing the trigger value
    setRefreshTrigger(prev => prev + 1)
  }

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut()
              router.replace('/(onboarding)')
            } catch (error) {
              console.error('Error signing out:', error)
              Alert.alert('Error', 'Failed to sign out. Please try again.')
            }
          },
        },
      ],
    )
  }

  // Get user initials
  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    } else if (user?.firstName) {
      return user.firstName[0].toUpperCase()
    } else if (user?.emailAddresses?.[0]?.emailAddress) {
      return user.emailAddresses[0].emailAddress[0].toUpperCase()
    }
    return 'SK'
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Welcome</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notificationButton} onPress={() => router.replace("/dashboard/Notifications")}>
              <Ionicons name="notifications-outline" size={24} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.avatar}
              onPress={() => setShowProfileMenu(true)}
            >
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Menu Modal */}
        <Modal
          visible={showProfileMenu}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowProfileMenu(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowProfileMenu(false)}
          >
            <View style={styles.profileMenu}>
              <View style={styles.profileHeader}>
                <View style={styles.profileAvatar}>
                  <Text style={styles.profileAvatarText}>{getInitials()}</Text>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user?.firstName || 'User'}
                  </Text>
                  <Text style={styles.profileEmail}>
                    {user?.emailAddresses?.[0]?.emailAddress || ''}
                  </Text>
                </View>
              </View>

              <View style={styles.menuDivider} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setShowProfileMenu(false)
                  // Navigate to profile/settings
                }}
              >
                <Ionicons name="person-outline" size={20} color="#333" />
                <Text style={styles.menuItemText}>Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setShowProfileMenu(false)
                  // Navigate to settings
                }}
              >
                <Ionicons name="settings-outline" size={20} color="#333" />
                <Text style={styles.menuItemText}>Settings</Text>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity
                style={styles.menuItemDanger}
                onPress={() => {
                  setShowProfileMenu(false)
                  handleSignOut()
                }}
              >
                <Ionicons name="log-out-outline" size={20} color="#DC2626" />
                <Text style={styles.menuItemTextDanger}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Greeting */}
        <Text style={styles.greeting}>
          Good Morning, {user?.firstName || 'there'}!
        </Text>

        {/* Daily Check-In Button */}
        <TouchableOpacity
          style={styles.dailyCheckInButton}
          onPress={() => setShowDailyCheckIn(true)}
        >
          <LinearGradient
            colors={['#023FB7', '#B550B2']}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >

            <Text style={styles.dailyCheckInText}>Ask My Coach</Text>

          </LinearGradient>
        </TouchableOpacity>

        {/* Daily Check-In Modal */}
        <DailyCheckInModal
          visible={showDailyCheckIn}
          onClose={handleDailyCheckInClose}
        />

        {/* Performance Metrics (vertical stack) */}
        <Text style={styles.sectionTitle}>Your Performance Metrics</Text>

        <View style={styles.metricsStack}>
        <AccordionSection
          backgroundColor="#ECFDF3"
          borderColor="#D1FADF"
          headerContent={
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Image source={require("../../assets/dashboard/V02maxicon2.png")} style={{ width: 28, height: 28 }} />
              <View>
                <Text style={{ fontSize: 16, color: "#6b7280", fontWeight: "700" }}>VO₂ Max</Text>
                <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6, marginTop: 2 }}>
                  <Text style={{ fontSize: 16, fontWeight: "600", color: "#222" }}>42</Text>
                  <Text style={{ fontSize: 12, color: "#6b7280" }}>(↑1.1 from Yesterday)</Text>
                </View>
              </View>
            </View>
          }
        >
          <Vo2MaxCard width={CARD_WIDTH - 8} />
        </AccordionSection>

        <AccordionSection
          backgroundColor="#FFF6ED"
          borderColor="#FFEAD5"
          headerContent={
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Image source={require("../../assets/dashboard/RaceTime2.png")} style={{ width: 28, height: 28 }} />
              <View>
                <Text style={{ fontSize: 16, color: "#6b7280", fontWeight: "700" }}>Race Time</Text>
                <Text style={{ fontSize: 16, fontWeight: "600", color: "#222", marginTop: 2 }}>30k</Text>
              </View>
            </View>
          }
        >
          <RaceTimeCard width={CARD_WIDTH - 8} />
        </AccordionSection>
        </View>

        {/* Coach Recommendations */}
        <Text style={styles.sectionTitle}>Your Olympic Coach Recommends</Text>
        <OlympicCoachRecommendations refreshTrigger={refreshTrigger} />
        {/* <View style={styles.recommendationsContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#175CD3" />
              <Text style={styles.loadingText}>Loading AI coaching insights...</Text>
            </View>
          ) : recommendations.length > 0 ? (
            <>
              {recommendations.slice(0, 3).map((rec, index) => (
                <View key={index} style={styles.recommendationCard}>
                  <View style={styles.recommendationIcon}>
                    {rec.category === 'vo2' && (
                      <Image source={require("../../assets/dashboard/V02maxicon2.png")} style={{ width: 32, height: 32 }} />
                    )}
                    {rec.category === 'race' && (
                      <Image source={require("../../assets/dashboard/RaceTime2.png")} style={{ width: 32, height: 32 }} />
                    )}
                    {rec.category === 'recovery' && (
                      <Ionicons name="bed-outline" size={32} color="#175CD3" />
                    )}
                    {rec.category === 'training' && (
                      <Ionicons name="fitness-outline" size={32} color="#175CD3" />
                    )}
                    {!['vo2', 'race', 'recovery', 'training'].includes(rec.category) && (
                      <Ionicons name="bulb-outline" size={32} color="#175CD3" />
                    )}
                  </View>
                  <View style={styles.recommendationContent}>
                    <Text style={styles.recommendationTitle}>{rec.title}</Text>
                    <Text style={styles.recommendationDescription}>{rec.description}</Text>
                  </View>
                </View>
              ))}

              <TouchableOpacity
                style={styles.aiRecommendationsCTA}
                onPress={() => router.push("/dashboard/recommendations")}
              >
                <View style={styles.ctaContent}>
                  <Ionicons name="sparkles" size={28} color="#175CD3" />
                  <View style={styles.ctaTextContainer}>
                    <Text style={styles.ctaTitle}>View All AI Insights</Text>
                    <Text style={styles.ctaDescription}>
                      {recommendations.length} personalized recommendations available
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#175CD3" />
                </View>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.emptyRecommendations}>
              <Ionicons name="information-circle-outline" size={48} color="#757575" />
              <Text style={styles.emptyTitle}>No Recommendations Yet</Text>
              <Text style={styles.emptyDescription}>
                Complete your profile and sync your Apple Watch to get personalized coaching insights
              </Text>
            </View>
          )}
        </View> */}
        {/* <ExampleWatchUsage /> */}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FAFAFC",
    paddingTop: 8,
  },
  container: {
    flex: 1,
    backgroundColor: "#FAFAFC",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 4,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  notificationButton: { padding: 4 },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#E3F2FD", justifyContent: "center", alignItems: "center",
  },
  avatarText: { fontSize: 16, fontWeight: "600", color: "#1976D2" },
  greeting: { fontSize: 18, color: "#757575", paddingHorizontal: 20, marginBottom: 20 },

  dailyCheckInButton: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#023FB7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  dailyCheckInText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    flex: 1,
    textAlign: "center",
  },

  checkInCard: {
    marginHorizontal: 20, marginBottom: 24, borderRadius: 16, overflow: "hidden",
    elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8,
  },
  checkInBackground: { height: 185, justifyContent: "flex-end" },
  checkInBackgroundImage: { borderRadius: 16 },
  checkInOverlay: { padding: 20, borderRadius: 16 },
  checkInTitle: { fontSize: 24, fontWeight: "bold", color: "#fff", marginBottom: 8 },
  checkInSubtitle: { fontSize: 16, color: "#fff", marginBottom: 20, lineHeight: 22 },
  checkInButton: { backgroundColor: "#175CD3", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, alignSelf: "flex-start" },
  checkInButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  sectionTitle: { fontSize: 20, fontWeight: "bold", color: "#333", paddingHorizontal: 20, marginVertical: 12 },

  recommendationsTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginVertical: 12,
  },
  viewAllButton: {
    fontSize: 16,
    fontWeight: "600",
    color: "#175CD3",
  },

  // NEW: vertical stack for full-width charts
  metricsStack: {
    paddingHorizontal: SCREEN_PADDING,
    gap: 16,
  },
  // Profile Menu Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 80,
    paddingRight: 20,
  },
  profileMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  profileHeader: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  profileAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileAvatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1976D2',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 13,
    color: '#757575',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#EAECF0',
    marginHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuItemText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  menuItemDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuItemTextDanger: {
    fontSize: 15,
    color: '#DC2626',
    fontWeight: '500',
  },
})
