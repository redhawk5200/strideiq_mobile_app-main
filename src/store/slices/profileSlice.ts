import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { createOrUpdateProfile, fetchProfile } from '../thunks/profileThunks'

interface ProfileData {
  // Personal Information
  firstName?: string
  lastName?: string
  gender?: 'male' | 'female' | 'other'
  birthDate?: string // MM/DD/YYYY format
  
  // Physical attributes
  weight?: number // in lbs
  height?: number // in cm
  
  // Fitness data
  mainTarget?: 'Race time' | 'VO₂ Max'
  recentVo2?: number
  recentRaceTime?: number // in minutes
  medicalCondition?: 'None' | 'High Blood Pressure' | 'Asthma' | 'Diabetes'
}

interface ProfileState {
  data: ProfileData
  isLoading: boolean
  error: string | null
  hasCompletedProfile: boolean
  lastUpdated?: string
}

const initialState: ProfileState = {
  data: {},
  isLoading: false,
  error: null,
  hasCompletedProfile: false,
}

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfileData: (state, action: PayloadAction<Partial<ProfileData>>) => {
      state.data = { ...state.data, ...action.payload }
    },
    clearProfileError: (state) => {
      state.error = null
    },
    resetProfile: (state) => {
      state.data = {}
      state.hasCompletedProfile = false
      state.error = null
      state.lastUpdated = undefined
    },
    updateLocalProfile: (state, action: PayloadAction<Partial<ProfileData>>) => {
      // For immediate UI updates before API call
      state.data = { ...state.data, ...action.payload }
    },
  },
  extraReducers: (builder) => {
    // Create or Update Profile
    builder
      .addCase(createOrUpdateProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createOrUpdateProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.data = { ...state.data, ...action.payload }
        state.error = null
        state.hasCompletedProfile = true
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(createOrUpdateProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
    
    // Fetch Profile
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.data = action.payload
        state.hasCompletedProfile = true
        state.error = null
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const {
  setProfileData,
  clearProfileError,
  resetProfile,
  updateLocalProfile,
} = profileSlice.actions

export default profileSlice.reducer
