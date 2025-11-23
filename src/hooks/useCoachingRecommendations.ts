/**
 * useCoachingRecommendations Hook
 *
 * Fetches AI-powered coaching recommendations from the backend
 * Integrates with HealthKit data and user profile
 */

import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

interface Recommendation {
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  icon?: string;
}

interface QuickAction {
  action: string;
  reason: string;
  priority: number;
}

interface CoachingData {
  recommendations: Recommendation[];
  quickActions: QuickAction[];
  summary: {
    profile_complete: boolean;
    has_vo2_data: boolean;
    has_goals: boolean;
    has_workouts: boolean;
  };
}

export function useCoachingRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch comprehensive recommendations
      const response = await apiClient.get<any>('/api/v1/recommendations/generate');

      if (response.data) {
        const data = response.data;

        // Parse recommendations
        if (data.recommendations) {
          setRecommendations(data.recommendations);
        }

        // Parse quick actions
        if (data.quick_actions) {
          setQuickActions(data.quick_actions);
        }

        console.log('✅ Loaded coaching recommendations');
      }
    } catch (err: any) {
      console.error('Failed to fetch recommendations:', err);
      setError(err.message || 'Failed to load recommendations');

      // Set default recommendations as fallback
      setRecommendations([
        {
          title: 'Complete Your Profile',
          description: 'Add your fitness goals and health metrics to get personalized recommendations',
          category: 'profile',
          priority: 'high',
        },
        {
          title: 'Connect Your Apple Watch',
          description: 'Sync health data automatically for better insights',
          category: 'device',
          priority: 'medium',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    fetchRecommendations();
  };

  return {
    recommendations,
    quickActions,
    loading,
    error,
    refresh,
  };
}
