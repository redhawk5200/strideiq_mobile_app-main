import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAppDispatch, useAppSelector } from "../../src/store"
import { fetchRecommendations } from "../../src/store/thunks/recommendationsThunks"

const SCREEN_PADDING = 20
const { width } = Dimensions.get("window")
const CARD_WIDTH = width - SCREEN_PADDING * 2

export default function RecommendationsScreen() {
  const dispatch = useAppDispatch()
  const { recommendations, loading, error } = useAppSelector((state) => state.recommendations)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    // Fetch recommendations on mount
    dispatch(fetchRecommendations())
  }, [dispatch])

  const onRefresh = async () => {
    setRefreshing(true)
    await dispatch(fetchRecommendations())
    setRefreshing(false)
  }

  const renderSection = (title: string, content: string, icon: string) => {
    if (!content) return null

    return (
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name={icon as any} size={24} color="#175CD3" />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <Text style={styles.sectionContent}>{content}</Text>
      </View>
    )
  }

  const renderQuickAction = (action: any, index: number) => {
    const getPriorityColor = (priority: string) => {
      switch (priority) {
        case "high":
          return "#DC2626"
        case "medium":
          return "#F59E0B"
        case "low":
          return "#10B981"
        default:
          return "#6B7280"
      }
    }

    return (
      <TouchableOpacity key={index} style={styles.actionCard}>
        <View style={styles.actionHeader}>
          <View style={styles.actionTitleContainer}>
            <Text style={styles.actionTitle}>{action.title}</Text>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(action.priority) + "20" }]}>
              <Text style={[styles.priorityText, { color: getPriorityColor(action.priority) }]}>
                {action.priority.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
        <Text style={styles.actionDescription}>{action.description}</Text>
        <View style={styles.actionFooter}>
          <Ionicons name="arrow-forward" size={20} color="#175CD3" />
        </View>
      </TouchableOpacity>
    )
  }

  const renderDataAvailability = () => {
    if (!recommendations?.context_summary?.data_availability) return null

    const data = recommendations.context_summary.data_availability
    const availableMetrics = Object.entries(data).filter(([_, available]) => available)
    const totalMetrics = Object.keys(data).length

    return (
      <View style={styles.dataCard}>
        <Text style={styles.dataTitle}>Data Available</Text>
        <View style={styles.dataMetrics}>
          <View style={styles.dataCircle}>
            <Text style={styles.dataNumber}>
              {availableMetrics.length}/{totalMetrics}
            </Text>
          </View>
          <View style={styles.dataList}>
            {Object.entries(data).map(([key, available]) => (
              <View key={key} style={styles.dataItem}>
                <Ionicons
                  name={available ? "checkmark-circle" : "close-circle"}
                  size={18}
                  color={available ? "#10B981" : "#EF4444"}
                />
                <Text style={styles.dataItemText}>{key.replace(/_/g, " ")}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    )
  }

  if (loading && !recommendations) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#175CD3" />
          <Text style={styles.loadingText}>Generating your personalized recommendations...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (error && !recommendations) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Unable to Load Recommendations</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => dispatch(fetchRecommendations())}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#175CD3"]} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Coach</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Hero Card */}
        <View style={styles.heroCard}>
          <Ionicons name="fitness" size={48} color="#175CD3" />
          <Text style={styles.heroTitle}>Your Personalized Training Plan</Text>
          <Text style={styles.heroSubtitle}>
            AI-powered recommendations based on your goals, fitness data, and health metrics
          </Text>
          {recommendations?.generated_at && (
            <Text style={styles.timestamp}>
              Updated: {new Date(recommendations.generated_at).toLocaleDateString()}
            </Text>
          )}
        </View>

        {/* Data Availability */}
        {renderDataAvailability()}

        {/* Quick Actions */}
        {recommendations?.quick_actions && recommendations.quick_actions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.mainSectionTitle}>Quick Actions</Text>
            {recommendations.quick_actions.map((action, index) => renderQuickAction(action, index))}
          </View>
        )}

        {/* AI Insights */}
        {recommendations?.ai_recommendations?.success && recommendations.ai_recommendations.insights && (
          <>
            <Text style={styles.mainSectionTitle}>Your Coach's Assessment</Text>

            {renderSection(
              "Today's Training",
              recommendations.ai_recommendations.insights.todays_training,
              "barbell"
            )}

            {renderSection(
              "Nutrition & Fueling",
              recommendations.ai_recommendations.insights.nutrition_fueling,
              "restaurant"
            )}

            {renderSection(
              "Recovery Protocol",
              recommendations.ai_recommendations.insights.recovery_protocol,
              "bed"
            )}

            {renderSection(
              "Coach's Analysis",
              recommendations.ai_recommendations.insights.reasoning,
              "analytics"
            )}
          </>
        )}

        {/* Fallback message if no AI insights */}
        {(!recommendations?.ai_recommendations?.success || !recommendations?.ai_recommendations?.insights) && (
          <View style={styles.fallbackCard}>
            <Ionicons name="information-circle" size={48} color="#6B7280" />
            <Text style={styles.fallbackTitle}>Complete Your Profile</Text>
            <Text style={styles.fallbackText}>
              Add more data to receive personalized AI recommendations. Connect your fitness device and complete your
              profile for the best experience.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FAFAFC",
  },
  container: {
    flex: 1,
    backgroundColor: "#FAFAFC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
  },
  errorMessage: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#175CD3",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  heroCard: {
    marginHorizontal: SCREEN_PADDING,
    marginBottom: 24,
    padding: 24,
    backgroundColor: "#fff",
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 12,
  },
  dataCard: {
    marginHorizontal: SCREEN_PADDING,
    marginBottom: 24,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dataTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  dataMetrics: {
    flexDirection: "row",
    alignItems: "center",
  },
  dataCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  dataNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#175CD3",
  },
  dataList: {
    flex: 1,
  },
  dataItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dataItemText: {
    fontSize: 14,
    color: "#4B5563",
    marginLeft: 8,
    textTransform: "capitalize",
  },
  section: {
    marginBottom: 16,
  },
  mainSectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    paddingHorizontal: SCREEN_PADDING,
    marginBottom: 12,
    marginTop: 8,
  },
  sectionCard: {
    marginHorizontal: SCREEN_PADDING,
    marginBottom: 16,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 12,
  },
  sectionContent: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 24,
  },
  actionCard: {
    marginHorizontal: SCREEN_PADDING,
    marginBottom: 12,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#175CD3",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  actionTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "700",
  },
  actionDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 8,
  },
  actionFooter: {
    alignItems: "flex-end",
  },
  fallbackCard: {
    marginHorizontal: SCREEN_PADDING,
    marginTop: 24,
    padding: 32,
    backgroundColor: "#fff",
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  fallbackTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    textAlign: "center",
  },
  fallbackText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 12,
    textAlign: "center",
    lineHeight: 20,
  },
})
