import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { apiClient } from '../lib/api';
import { healthKitManager } from '../features/health/healthKit';
import Markdown from 'react-native-markdown-display';

const { width } = Dimensions.get('window');

interface DailyCheckInModalProps {
  visible: boolean;
  onClose: () => void;
}

interface LoadingStage {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  complete: boolean;
}

interface Recommendation {
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
}

interface RecommendationsResponse {
  recommendations: Recommendation[];
}

export function DailyCheckInModal({ visible, onClose }: DailyCheckInModalProps) {
  const [stage, setStage] = useState<'loading' | 'recommendations' | 'error'>('loading');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [healthMetrics, setHealthMetrics] = useState({
    heartRate: 0,
    steps: 0,
    vo2Max: 0,
    workouts: 0,
  });
  const [error, setError] = useState<string>('');
  const [streamingText, setStreamingText] = useState<string>('');

  const [loadingStages, setLoadingStages] = useState<LoadingStage[]>([
    { id: 'heart', title: 'Fetching Heart Rate Data', icon: 'heart', color: '#EF4444', complete: false },
    { id: 'steps', title: 'Gathering Step Count', icon: 'footsteps', color: '#3B82F6', complete: false },
    { id: 'vo2', title: 'Analyzing VO₂ Max', icon: 'fitness', color: '#10B981', complete: false },
    { id: 'workouts', title: 'Reviewing Workouts', icon: 'bicycle', color: '#F59E0B', complete: false },
    { id: 'ai', title: 'Generating AI Insights', icon: 'sparkles', color: '#8B5CF6', complete: false },
  ]);

  const progressAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.8))[0];

  useEffect(() => {
    if (visible) {
      resetState();
      startCheckIn();
    }
  }, [visible]);

  const resetState = () => {
    setStage('loading');
    setRecommendations([]);
    setError('');
    setStreamingText('');
    setLoadingStages(prev => prev.map(s => ({ ...s, complete: false })));
    progressAnim.setValue(0);
  };

  const startCheckIn = async () => {
    try {
      // Animate entrance
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();

      // Start AI generation IMMEDIATELY in background
      console.log('🤖 Starting AI generation...');
      const aiPromise = apiClient.get<RecommendationsResponse>('/api/v1/recommendations/generate');

      // Flag to check if AI is done
      let aiDone = false;

      // Monitor AI completion in background
      aiPromise.then((response) => {
        console.log('✅ AI recommendations received!');
        aiDone = true;

        // If AI finishes before loading stages, show recommendations immediately
        if (response.success && response.data?.recommendations) {
          setRecommendations(response.data.recommendations);
          completeStage(4);
          setStage('recommendations');
        }
      }).catch((err) => {
        console.error('❌ AI generation failed:', err);
        aiDone = true;
        setError(err.message || 'Failed to generate recommendations');
        setStage('error');
      });

      // Fetch ALL health data in parallel (much faster!)
      const [heartRate, steps, vo2Max, workouts] = await Promise.all([
        healthKitManager.getLatestHeartRate(),
        healthKitManager.getDailySteps(),
        healthKitManager.getLatestVO2Max(),
        healthKitManager.getWorkouts(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      ]);

      // Update metrics
      setHealthMetrics({
        heartRate: heartRate || 0,
        steps: steps || 0,
        vo2Max: vo2Max || 0,
        workouts: workouts.length
      });

      // Show loading stages for UX (visual only, non-blocking)
      // These run quickly one after another just for the animation
      for (let i = 0; i < 4; i++) {
        await simulateStage(i);
        completeStage(i);
      }

      // Stage 5: Wait for AI if not done yet
      if (!aiDone) {
        console.log('⏳ Health data loaded, waiting for AI...');
        await simulateStage(4); // Show AI loading animation
        const response = await aiPromise;

        if (response.success && response.data?.recommendations) {
          setRecommendations(response.data.recommendations);
          completeStage(4);
          setStage('recommendations');
        } else {
          throw new Error(response.error || 'Failed to generate recommendations');
        }
      }
      // If AI is already done, the promise handler above already showed recommendations

    } catch (err: any) {
      console.error('Check-in error:', err);
      setError(err.message || 'Failed to complete daily check-in');
      setStage('error');
    }
  };

  const simulateStage = (index: number) => {
    return new Promise(resolve => {
      setTimeout(() => {
        Animated.timing(progressAnim, {
          toValue: ((index + 1) / loadingStages.length) * 100,
          duration: 200,
          useNativeDriver: false,
        }).start();
        resolve(null);
      }, 400); // Reduced from 800ms to 400ms
    });
  };

  const completeStage = (index: number) => {
    setLoadingStages(prev =>
      prev.map((stage, i) => (i === index ? { ...stage, complete: true } : stage))
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      default:
        return '#10B981';
    }
  };

  const renderLoadingScreen = () => (
    <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.loadingHeader}>
        <LinearGradient
          colors={['#023FB7', '#B550B2']}
          style={styles.loadingIconGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="fitness" size={40} color="#FFFFFF" />
        </LinearGradient>
        <Text style={styles.loadingTitle}>Daily Check-In</Text>
        <Text style={styles.loadingSubtitle}>Analyzing your health data</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      </View>

      {/* Loading Stages */}
      <View style={styles.stagesContainer}>
        {loadingStages.map((stage, index) => (
          <View key={stage.id} style={styles.stageRow}>
            <View
              style={[
                styles.stageIcon,
                { backgroundColor: stage.complete ? stage.color : '#F3F4F6' },
              ]}
            >
              <Ionicons
                name={stage.complete ? 'checkmark' : stage.icon}
                size={20}
                color={stage.complete ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>
            <Text
              style={[
                styles.stageText,
                stage.complete && styles.stageTextComplete,
              ]}
            >
              {stage.title}
            </Text>
            {stage.complete && (
              <Ionicons name="checkmark-circle" size={24} color={stage.color} />
            )}
          </View>
        ))}
      </View>
    </Animated.View>
  );

  const renderRecommendations = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.recommendationsHeader}>
        <View style={styles.successIconContainer}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.successIcon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="checkmark-circle" size={48} color="#FFFFFF" />
          </LinearGradient>
        </View>
        <Text style={styles.recommendationsTitle}>Check-In Complete!</Text>
        <Text style={styles.recommendationsSubtitle}>Here's your daily insights</Text>
      </View>

      {/* Health Metrics Summary */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Ionicons name="heart" size={24} color="#EF4444" />
          <Text style={styles.metricValue}>{healthMetrics.heartRate || '--'}</Text>
          <Text style={styles.metricLabel}>BPM</Text>
        </View>
        <View style={styles.metricCard}>
          <Ionicons name="footsteps" size={24} color="#3B82F6" />
          <Text style={styles.metricValue}>{healthMetrics.steps.toLocaleString()}</Text>
          <Text style={styles.metricLabel}>Steps</Text>
        </View>
        <View style={styles.metricCard}>
          <Ionicons name="fitness" size={24} color="#10B981" />
          <Text style={styles.metricValue}>{healthMetrics.vo2Max ? healthMetrics.vo2Max.toFixed(1) : '--'}</Text>
          <Text style={styles.metricLabel}>VO₂ Max</Text>
        </View>
        <View style={styles.metricCard}>
          <Ionicons name="bicycle" size={24} color="#F59E0B" />
          <Text style={styles.metricValue}>{healthMetrics.workouts}</Text>
          <Text style={styles.metricLabel}>Workouts</Text>
        </View>
      </View>

      {/* AI Recommendations */}
      <View style={styles.recommendationsSection}>
        <View style={styles.sectionHeader}>
          <Ionicons name="sparkles" size={24} color="#8B5CF6" />
          <Text style={styles.sectionTitle}>AI-Powered Insights</Text>
        </View>

        {recommendations.length > 0 ? (
          recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendationCard}>
              <View
                style={[
                  styles.priorityIndicator,
                  { backgroundColor: getPriorityColor(rec.priority) },
                ]}
              />
              <View style={styles.recommendationContent}>
                <Text style={styles.recommendationTitle}>{rec.title}</Text>
                <Markdown style={markdownStyles}>{rec.description}</Markdown>
                <View style={styles.recommendationFooter}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{rec.category}</Text>
                  </View>
                  <Text
                    style={[
                      styles.priorityText,
                      { color: getPriorityColor(rec.priority) },
                    ]}
                  >
                    {rec.priority.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.noRecommendations}>
            <Text style={styles.noRecommendationsText}>
              Great job! No urgent recommendations at this time.
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Done</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderError = () => (
    <View style={styles.content}>
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#EF4444" />
        <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={startCheckIn}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <View style={{ width: 40 }} />
          <Text style={styles.headerTitle}>Daily Check-In</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
            <Ionicons name="close" size={28} color="#111827" />
          </TouchableOpacity>
        </View>

        {stage === 'loading' && renderLoadingScreen()}
        {stage === 'recommendations' && renderRecommendations()}
        {stage === 'error' && renderError()}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingHeader: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
  },
  loadingIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  progressBarContainer: {
    marginBottom: 32,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#023FB7',
    borderRadius: 4,
  },
  stagesContainer: {
    gap: 16,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stageIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stageText: {
    flex: 1,
    fontSize: 16,
    color: '#6B7280',
  },
  stageTextComplete: {
    color: '#111827',
    fontWeight: '600',
  },
  recommendationsHeader: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  successIconContainer: {
    marginBottom: 16,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendationsTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  recommendationsSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    minWidth: (width - 52) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  recommendationsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  recommendationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  priorityIndicator: {
    width: 4,
  },
  recommendationContent: {
    flex: 1,
    padding: 16,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  recommendationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  noRecommendations: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  noRecommendationsText: {
    fontSize: 14,
    color: '#059669',
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#023FB7',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 24,
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: '#023FB7',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    minWidth: 200,
    alignItems: 'center',
    marginBottom: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButton: {
    paddingVertical: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6B7280',
  },
});

const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 8,
    marginLeft: 0,
  },
  strong: {
    fontWeight: '600',
    color: '#111827',
  },
  em: {
    fontStyle: 'italic',
  },
  bullet_list: {
    marginBottom: 8,
    marginLeft: 0,
  },
  ordered_list: {
    marginBottom: 8,
    marginLeft: 0,
  },
  list_item: {
    marginBottom: 4,
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
  text: {
    marginLeft: 0,
  },
  code_inline: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: 'monospace',
    fontSize: 13,
  },
  link: {
    color: '#023FB7',
  },
});
