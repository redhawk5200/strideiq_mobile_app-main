/**
 * useOlympicCoachRecommendation Hook
 *
 * Fetches the latest Olympic coach recommendation from the backend API
 * Includes detailed console logging for debugging
 */

import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '../lib/api'

export interface OlympicRecommendation {
  id: string
  recommendation_date: string
  workout_type: string
  duration_minutes: number
  intensity_zone: string
  heart_rate_range: string
  todays_training: string
  nutrition_fueling: string
  recovery_protocol: string
  reasoning: string
  status: 'pending' | 'completed' | 'skipped' | 'partial'
  compliance_notes: string | null
  created_at: string
}

interface UseOlympicCoachRecommendationReturn {
  recommendation: OlympicRecommendation | null
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useOlympicCoachRecommendation(): UseOlympicCoachRecommendationReturn {
  const [recommendation, setRecommendation] = useState<OlympicRecommendation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecommendation = useCallback(async () => {
    console.log('🏋️ [Olympic Coach] Starting to fetch latest recommendation...')

    try {
      setLoading(true)
      setError(null)

      console.log('🏋️ [Olympic Coach] Making API request to /api/v1/recommendations/latest')
      const response = await apiClient.get<any>('/api/v1/recommendations/latest')

      console.log('🏋️ [Olympic Coach] API Response:', JSON.stringify(response, null, 2))

      if (response.success && response.data?.recommendation) {
        const rec = response.data.recommendation

        console.log('✅ [Olympic Coach] Successfully received recommendation')
        console.log('📋 [Olympic Coach] Recommendation Details:', {
          id: rec.id,
          workout_type: rec.workout_type,
          duration: rec.duration_minutes,
          intensity: rec.intensity_zone,
          heart_rate: rec.heart_rate_range,
          status: rec.status,
          created_at: rec.created_at,
        })

        console.log('💬 [Olympic Coach] Today\'s Training:', rec.todays_training)
        console.log('🍎 [Olympic Coach] Nutrition:', rec.nutrition_fueling)
        console.log('😴 [Olympic Coach] Recovery:', rec.recovery_protocol)
        console.log('🧠 [Olympic Coach] Reasoning:', rec.reasoning)

        setRecommendation(rec)
      } else if (response.data?.message === 'No recommendations found') {
        console.log('⚠️ [Olympic Coach] No recommendations found in the database')
        setRecommendation(null)
      } else {
        console.log('❌ [Olympic Coach] Unexpected response format:', response)
        setError('Unexpected response format')
      }
    } catch (err: any) {
      console.error('❌ [Olympic Coach] Failed to fetch recommendation:', err)
      console.error('❌ [Olympic Coach] Error details:', {
        message: err.message,
        stack: err.stack,
      })

      setError(err.message || 'Failed to load recommendation')
      setRecommendation(null)
    } finally {
      setLoading(false)
      console.log('🏋️ [Olympic Coach] Fetch completed. Loading:', false)
    }
  }, [])

  useEffect(() => {
    console.log('🏋️ [Olympic Coach] Hook mounted, initiating first fetch')
    fetchRecommendation()
  }, [fetchRecommendation])

  const refresh = useCallback(() => {
    console.log('🔄 [Olympic Coach] Manual refresh triggered')
    fetchRecommendation()
  }, [fetchRecommendation])

  return {
    recommendation,
    loading,
    error,
    refresh,
  }
}
