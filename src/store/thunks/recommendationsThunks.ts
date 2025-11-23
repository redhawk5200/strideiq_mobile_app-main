import { createAsyncThunk } from '@reduxjs/toolkit'
import { apiClient } from '../../lib/api'
import { setLoading, setRecommendations, setError } from '../slices/recommendationsSlice'

// Fetch AI coaching recommendations
export const fetchRecommendations = createAsyncThunk(
  'recommendations/fetch',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true))
      dispatch(setError(null))

      console.log('Fetching AI recommendations...')

      const response = await apiClient.get('/api/v1/recommendations/generate')

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch recommendations')
      }

      console.log('Recommendations fetched successfully:', response.data)

      dispatch(setRecommendations(response.data))
      return response.data
    } catch (error: any) {
      console.error('Failed to fetch recommendations:', error)
      const errorMessage = error.message || 'Failed to load recommendations'
      dispatch(setError(errorMessage))
      return rejectWithValue(errorMessage)
    }
  }
)

// Fetch quick actions
export const fetchQuickActions = createAsyncThunk(
  'recommendations/fetchQuickActions',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching quick actions...')

      const response = await apiClient.get('/api/v1/recommendations/quick-actions')

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch quick actions')
      }

      console.log('Quick actions fetched successfully:', response.data)
      return response.data
    } catch (error: any) {
      console.error('Failed to fetch quick actions:', error)
      const errorMessage = error.message || 'Failed to load quick actions'
      return rejectWithValue(errorMessage)
    }
  }
)

// Fetch data summary (useful for checking data completeness)
export const fetchDataSummary = createAsyncThunk(
  'recommendations/fetchSummary',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching data summary...')

      const response = await apiClient.get('/api/v1/recommendations/summary')

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch data summary')
      }

      console.log('Data summary fetched successfully:', response.data)
      return response.data
    } catch (error: any) {
      console.error('Failed to fetch data summary:', error)
      const errorMessage = error.message || 'Failed to load data summary'
      return rejectWithValue(errorMessage)
    }
  }
)
