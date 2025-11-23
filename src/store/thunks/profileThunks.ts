import { createAsyncThunk } from '@reduxjs/toolkit'
import { apiClient, API_BASE } from '../../lib/api'

interface ProfileUpdateData {
  // Basic info
  firstName?: string
  lastName?: string
  gender?: 'male' | 'female' | 'other'
  birthDate?: string // MM/DD/YYYY format
  
  // Physical attributes
  weight?: number
  height?: number // in inches for backend
  
  // Fitness data
  mainTarget?: 'Race time' | 'VO₂ Max'
  recentVo2?: number
  recentRaceTime?: number
  medicalCondition?: 'None' | 'High Blood Pressure' | 'Asthma' | 'Diabetes'
}

interface ProfileResponse {
  id: string
  user_id: string
  first_name?: string
  last_name?: string
  gender?: string
  birth_date?: string
  height_inches?: number
  unit_preference: string
  age?: number
  created_at: string
  updated_at: string
}

// Convert frontend data to backend format
const formatForBackend = (data: ProfileUpdateData) => {
  const payload: any = {}
  
  if (data.firstName) payload.first_name = data.firstName
  if (data.lastName) payload.last_name = data.lastName
  if (data.gender) payload.gender = data.gender
  if (data.birthDate) payload.birth_date = data.birthDate
  if (data.height) payload.height_inches = data.height / 2.54 // Convert cm to inches
  
  return payload
}

// Convert backend data to frontend format
const formatForFrontend = (data: ProfileResponse): ProfileUpdateData => {
  return {
    firstName: data.first_name,
    lastName: data.last_name,
    gender: data.gender as 'male' | 'female' | 'other',
    birthDate: data.birth_date,
    height: data.height_inches ? data.height_inches * 2.54 : undefined, // Convert inches to cm
  }
}

export const createOrUpdateProfile = createAsyncThunk(
  'profile/createOrUpdate',
  async (data: ProfileUpdateData, { rejectWithValue }) => {
    try {
      console.log('Attempting to save profile data:', data)
      
      // For development - if running in dev mode and no real backend
      if (__DEV__ && API_BASE.includes('localhost:8000')) {
        console.log('Development mode detected, checking if backend is available...')
        
        // Quick test to see if backend is reachable
        try {
          const testResponse = await fetch(`${API_BASE}/api/v1/onboarding/health`, { 
            method: 'GET',
            timeout: 3000 // 3 second timeout
          } as any)
          
          if (!testResponse.ok) {
            throw new Error('Backend not reachable')
          }
        } catch (healthCheckError) {
          console.log('Backend not available, simulating profile save for development')
          await new Promise(resolve => setTimeout(resolve, 1000))
          return data
        }
      }

      const payload = formatForBackend(data)
      console.log('Formatted payload for backend:', payload)
      
      // Try to update existing profile first
      const updateResponse = await apiClient.put('/api/v1/onboarding/profile', payload)
      
      if (updateResponse.success && updateResponse.data) {
        return formatForFrontend(updateResponse.data as ProfileResponse)
      }
      
      // If update fails, try to create new profile
      const createResponse = await apiClient.post('/api/v1/onboarding/profile', payload)
      
      if (createResponse.success && createResponse.data) {
        return formatForFrontend(createResponse.data as ProfileResponse)
      }
      
      return rejectWithValue(createResponse.error || 'Failed to save profile')
    } catch (error: any) {
      console.error('Profile operation error:', error)
      
      // In development, if there's a network error, simulate success
      if (__DEV__ && (error.message?.includes('Network') || error.message?.includes('fetch'))) {
        console.log('Network error in development, simulating success')
        await new Promise(resolve => setTimeout(resolve, 1000))
        return data
      }
      
      return rejectWithValue(error.message || 'Profile operation failed')
    }
  }
)

export const fetchProfile = createAsyncThunk(
  'profile/fetch',
  async (_, { rejectWithValue }) => {
    try {
      // For development - if backend not available, return empty profile
      if (__DEV__ && API_BASE.includes('localhost:8000')) {
        try {
          const testResponse = await fetch(`${API_BASE}/api/v1/onboarding/health`, { 
            method: 'GET',
            timeout: 3000
          } as any)
          
          if (!testResponse.ok) {
            throw new Error('Backend not reachable')
          }
        } catch (healthCheckError) {
          console.log('Backend not available, returning empty profile for development')
          return {}
        }
      }

      const response = await apiClient.get<ProfileResponse>('/api/v1/onboarding/profile')
      
      if (response.success && response.data) {
        return formatForFrontend(response.data)
      }
      
      // Return empty profile if not found (404 is expected for new users)
      if (response.error?.includes('404') || response.error?.includes('not found')) {
        return {}
      }
      
      return rejectWithValue(response.error || 'Failed to fetch profile')
    } catch (error: any) {
      console.error('Fetch profile error:', error)
      
      // In development, return empty profile on network errors
      if (__DEV__ && (error.message?.includes('Network') || error.message?.includes('fetch'))) {
        console.log('Network error in development, returning empty profile')
        return {}
      }
      
      return rejectWithValue(error.message || 'Failed to fetch profile')
    }
  }
)

// Legacy thunk for backwards compatibility
export const updateProfile = createOrUpdateProfile
