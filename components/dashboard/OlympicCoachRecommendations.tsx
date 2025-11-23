/**
 * OlympicCoachRecommendations Component
 *
 * Displays the latest Olympic coach recommendations from the backend API
 * Replaces the hardcoded dummy data with dynamic content
 */

import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native'
import Markdown from 'react-native-markdown-display'
import { useOlympicCoachRecommendation } from '../../src/hooks/useOlympicCoachRecommendation'

interface RecommendationCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

function RecommendationCard({ icon, title, description }: RecommendationCardProps) {
  return (
    <View style={styles.recommendationCard}>
      <View style={styles.recommendationIcon}>{icon}</View>
      <View style={styles.recommendationContent}>
        <Text style={styles.recommendationTitle}>{title}</Text>
        <Markdown style={markdownStyles}>{description}</Markdown>
      </View>
    </View>
  )
}

interface OlympicCoachRecommendationsProps {
  refreshTrigger?: number
}

export default function OlympicCoachRecommendations({ refreshTrigger }: OlympicCoachRecommendationsProps) {
  const { recommendation, loading, error, refresh } = useOlympicCoachRecommendation()

  // Refresh when refreshTrigger changes
  React.useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      console.log('🔄 [UI] Refresh triggered by parent component')
      refresh()
    }
  }, [refreshTrigger, refresh])

  console.log('🎨 [UI] OlympicCoachRecommendations rendering:', {
    hasRecommendation: !!recommendation,
    loading,
    error,
  })

  if (loading) {
    console.log('⏳ [UI] Showing loading state')
    return (
      <View style={styles.recommendationsContainer}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#175CD3" />
          <Text style={styles.loadingText}>Loading coach recommendations...</Text>
        </View>
      </View>
    )
  }

  if (error) {
    console.log('⚠️ [UI] Showing error state:', error)
    return (
      <View style={styles.recommendationsContainer}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#DC2626" />
          <Text style={styles.errorTitle}>Unable to Load Recommendations</Text>
          <Text style={styles.errorDescription}>{error}</Text>
        </View>
      </View>
    )
  }

  if (!recommendation) {
    console.log('📭 [UI] No recommendations available')
    return (
      <View style={styles.recommendationsContainer}>
        <View style={styles.emptyContainer}>
          <Ionicons name="fitness-outline" size={48} color="#175CD3" />
          <Text style={styles.emptyTitle}>No AI Coach Recommendations Available</Text>
          <Text style={styles.emptyDescription}>
            Your Olympic AI Coach hasn't generated recommendations yet. Complete your daily check-in and sync your health data to receive personalized training insights.
          </Text>
        </View>
      </View>
    )
  }

  console.log('✅ [UI] Rendering recommendation cards with data:', {
    workoutType: recommendation.workout_type,
    duration: recommendation.duration_minutes,
    intensity: recommendation.intensity_zone,
  })

  // Parse the recommendation data into display format
  const workoutIcon = <Image source={require('../../assets/dashboard/V02maxicon2.png')} style={{ width: 32, height: 32 }} />
  const nutritionIcon = <Image source={require('../../assets/dashboard/RaceTime2.png')} style={{ width: 32, height: 32 }} />
  const recoveryIcon = <Ionicons name="bed-outline" size={32} color="#757575" />

  // Format the recommendation date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  return (
    <View style={styles.recommendationsContainer}>
      {/* Recommendation Date Badge */}
      <View style={styles.dateBadge}>
        <Ionicons name="calendar-outline" size={16} color="#175CD3" />
        <Text style={styles.dateText}>
          {formatDate(recommendation.recommendation_date)}
        </Text>
      </View>

      {/* Today's Training Card */}
      <RecommendationCard
        icon={workoutIcon}
        title={`Today's Training: ${recommendation.workout_type.toUpperCase()}`}
        description={recommendation.todays_training}
      />

      {/* Workout Details Card */}
      <View style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={20} color="#333" />
          <Text style={styles.detailLabel}>Duration:</Text>
          <Text style={styles.detailValue}>{recommendation.duration_minutes} minutes</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="speedometer-outline" size={20} color="#333" />
          <Text style={styles.detailLabel}>Intensity:</Text>
          <Text style={styles.detailValue}>{recommendation.intensity_zone.replace('_', ' ').toUpperCase()}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="heart-outline" size={20} color="#333" />
          <Text style={styles.detailLabel}>Heart Rate:</Text>
          <Text style={styles.detailValue}>{recommendation.heart_rate_range} BPM</Text>
        </View>
      </View>

      {/* Nutrition & Fueling Card */}
      <RecommendationCard
        icon={nutritionIcon}
        title="Nutrition & Fueling"
        description={recommendation.nutrition_fueling}
      />

      {/* Recovery Protocol Card */}
      <RecommendationCard
        icon={recoveryIcon}
        title="Recovery Protocol"
        description={recommendation.recovery_protocol}
      />

      {/* Reasoning Badge */}
      {recommendation.reasoning && (
        <View style={styles.reasoningContainer}>
          <Ionicons name="bulb-outline" size={20} color="#175CD3" style={{ marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <Markdown style={reasoningMarkdownStyles}>{recommendation.reasoning}</Markdown>
          </View>
        </View>
      )}

      {/* Status Badge */}
      {/* <View style={[
        styles.statusBadge,
        recommendation.status === 'completed' && styles.statusCompleted,
        recommendation.status === 'pending' && styles.statusPending,
        recommendation.status === 'skipped' && styles.statusSkipped,
        recommendation.status === 'partial' && styles.statusPartial,
      ]}>
        <Ionicons
          name={
            recommendation.status === 'completed' ? 'checkmark-circle' :
            recommendation.status === 'pending' ? 'time-outline' :
            recommendation.status === 'skipped' ? 'close-circle-outline' :
            'alert-circle-outline'
          }
          size={16}
          color={
            recommendation.status === 'completed' ? '#16A34A' :
            recommendation.status === 'pending' ? '#F59E0B' :
            recommendation.status === 'skipped' ? '#DC2626' :
            '#3B82F6'
          }
        />
        <Text style={styles.statusText}>
          {recommendation.status.charAt(0).toUpperCase() + recommendation.status.slice(1)}
        </Text>
      </View> */}

      {/* Compliance Notes if available */}
      {recommendation.compliance_notes && (
        <View style={styles.complianceContainer}>
          <Text style={styles.complianceTitle}>Compliance Notes:</Text>
          <Text style={styles.complianceText}>{recommendation.compliance_notes}</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  recommendationsContainer: {
    paddingHorizontal: 20,
    marginTop: 18,
    gap: 12,
  },
  recommendationCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderColor: '#EAECF0',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  recommendationIcon: {
    width: 32,
    height: 32,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  recommendationContent: {
    flex: 1
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
    lineHeight: 22,
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#757575',
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#DC2626',
    marginTop: 16,
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 20,
  },
  reasoningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  reasoningText: {
    fontSize: 13,
    color: '#1E40AF',
    flex: 1,
    lineHeight: 18,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#175CD3',
  },
  detailsCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    minWidth: 90,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    gap: 6,
  },
  statusCompleted: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  statusSkipped: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  statusPartial: {
    backgroundColor: '#DBEAFE',
    borderColor: '#BFDBFE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16A34A',
  },
  complianceContainer: {
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  complianceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },
  complianceText: {
    fontSize: 13,
    color: '#78350F',
    lineHeight: 18,
  },
})

// Markdown styles for rendering AI-generated content
const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 20,
  },
  heading1: {
    fontSize: 18,
    fontWeight: '700',
    color: '#9CA3AF',
    marginTop: 8,
    marginBottom: 4,
    marginLeft: 0,
  },
  heading2: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 6,
    marginBottom: 3,
    marginLeft: 0,
  },
  heading3: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 4,
    marginBottom: 2,
    marginLeft: 0,
  },
  strong: {
    fontWeight: '700',
    color: '#374151',
  },
  em: {
    fontStyle: 'italic',
    color: '#555',
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 8,
    marginLeft: 0,
    fontSize: 14,
    color: '#757575',
    lineHeight: 20,
  },
  text: {
    marginLeft: 0,
  },
  bullet_list: {
    marginTop: 4,
    marginBottom: 4,
    marginLeft: 0,
  },
  ordered_list: {
    marginTop: 4,
    marginBottom: 4,
    marginLeft: 0,
  },
  list_item: {
    marginTop: 2,
    marginBottom: 2,
    marginLeft: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet_list_icon: {
    width: 0,
    height: 0,
    marginLeft: 0,
    marginRight: 0,
  },
  code_inline: {
    backgroundColor: '#F3F4F6',
    color: '#1F2937',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: 'Courier',
    fontSize: 13,
  },
  code_block: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
    fontFamily: 'Courier',
    fontSize: 13,
  },
  link: {
    color: '#175CD3',
    textDecorationLine: 'underline',
  },
})

// Markdown styles specifically for the reasoning section (lighter text)
const reasoningMarkdownStyles = StyleSheet.create({
  body: {
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },
  heading1: {
    fontSize: 16,
    fontWeight: '700',
    color: '#93C5FD',
    marginTop: 6,
    marginBottom: 3,
    marginLeft: 0,
  },
  heading2: {
    fontSize: 15,
    fontWeight: '600',
    color: '#93C5FD',
    marginTop: 4,
    marginBottom: 2,
    marginLeft: 0,
  },
  heading3: {
    fontSize: 14,
    fontWeight: '600',
    color: '#93C5FD',
    marginTop: 3,
    marginBottom: 2,
    marginLeft: 0,
  },
  strong: {
    fontWeight: '700',
    color: '#3B82F6',
  },
  em: {
    fontStyle: 'italic',
    color: '#1E40AF',
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 6,
    marginLeft: 0,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },
  text: {
    marginLeft: 0,
  },
  bullet_list: {
    marginTop: 3,
    marginBottom: 3,
    marginLeft: 0,
  },
  list_item: {
    marginTop: 1,
    marginBottom: 1,
    marginLeft: 0,
  },
  bullet_list_icon: {
    width: 0,
    height: 0,
    marginLeft: 0,
    marginRight: 0,
  },
})
