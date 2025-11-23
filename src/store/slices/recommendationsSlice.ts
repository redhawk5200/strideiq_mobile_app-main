import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface AIInsights {
  overall_assessment: string
  key_recommendations: string
  training_focus: string
  nutrition_recovery: string
  progress_targets: string
  important_reminders: string
}

export interface QuickAction {
  type: string
  priority: string
  title: string
  description: string
  action: string
}

export interface ContextSummary {
  has_profile: boolean
  demographics: {
    age?: number
    gender?: string
    height_inches?: number
  }
  goals_count: number
  has_training_preferences: boolean
  data_availability: {
    weight: boolean
    vo2_max: boolean
    heart_rate: boolean
    sleep: boolean
  }
}

export interface Recommendations {
  success: boolean
  user_id: string
  context_summary: ContextSummary
  ai_recommendations: {
    success: boolean
    insights: AIInsights
    raw_response?: string
  }
  quick_actions: QuickAction[]
  generated_at: string
}

interface RecommendationsState {
  recommendations: Recommendations | null
  loading: boolean
  error: string | null
  lastFetched: string | null
}

const initialState: RecommendationsState = {
  recommendations: null,
  loading: false,
  error: null,
  lastFetched: null,
}

const recommendationsSlice = createSlice({
  name: 'recommendations',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setRecommendations: (state, action: PayloadAction<Recommendations>) => {
      state.recommendations = action.payload
      state.loading = false
      state.error = null
      state.lastFetched = new Date().toISOString()
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.loading = false
    },
    clearRecommendations: (state) => {
      state.recommendations = null
      state.error = null
      state.lastFetched = null
    },
  },
})

export const {
  setLoading,
  setRecommendations,
  setError,
  clearRecommendations,
} = recommendationsSlice.actions

export default recommendationsSlice.reducer
