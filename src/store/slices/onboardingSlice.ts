import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { restoreProgress } from '../thunks/onboardingThunks'

interface OnboardingData {
  // Personal Info
  firstName?: string
  lastName?: string
  gender?: 'male' | 'female' | 'other'
  birthDate?: string

  // Goals
  primaryGoal?: string
  fitnessLevel?: string
  
  // Fitness Data
  vo2Max?: string
  raceTime?: string
  
  // Medical
  medicalConditions?: string[]
  
  // Training Preferences
  workoutTypes?: string[]
  trainingDays?: number
  
  // Weight/Body (imperial units)
  currentWeight?: number  // lbs
  targetWeight?: number   // lbs
  height?: number         // inches

  // Device
  selectedDevice?: string
}

interface OnboardingState {
  currentStep: number
  totalSteps: number
  isCompleted: boolean
  skippedSteps: number[]

  // Local data storage
  formData: OnboardingData

  // Save status tracking
  savedSteps: number[]
  lastSavedAt?: string
  pendingSync: boolean

  // API state
  isLoading: boolean
  error: string | null
}

const initialState: OnboardingState = {
  currentStep: 1,
  totalSteps: 9,
  isCompleted: false,
  skippedSteps: [],
  formData: {},
  savedSteps: [],
  pendingSync: false,
  isLoading: false,
  error: null,
}

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload
    },
    nextStep: (state) => {
      if (state.currentStep < state.totalSteps) {
        state.currentStep += 1
      }
    },
    previousStep: (state) => {
      if (state.currentStep > 1) {
        state.currentStep -= 1
      }
    },
    skipStep: (state, action: PayloadAction<number>) => {
      const step = action.payload
      if (!state.skippedSteps.includes(step)) {
        state.skippedSteps.push(step)
      }
      if (state.currentStep < state.totalSteps) {
        state.currentStep += 1
      }
    },
    
    // New actions for form data management
    updateFormData: (state, action: PayloadAction<Partial<OnboardingData>>) => {
      state.formData = { ...state.formData, ...action.payload }
      state.pendingSync = true
    },
    
    markStepSaved: (state, action: PayloadAction<number>) => {
      const step = action.payload
      if (!state.savedSteps.includes(step)) {
        state.savedSteps.push(step)
      }
      state.lastSavedAt = new Date().toISOString()
      state.pendingSync = false
    },
    
    setSyncPending: (state, action: PayloadAction<boolean>) => {
      state.pendingSync = action.payload
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    
    completeOnboarding: (state) => {
      state.isCompleted = true
      state.currentStep = state.totalSteps
      state.pendingSync = false
    },
    resetOnboarding: (state) => {
      state.currentStep = 1
      state.isCompleted = false
      state.skippedSteps = []
      state.formData = {}
      state.savedSteps = []
      state.pendingSync = false
      state.error = null
    },
    setTotalSteps: (state, action: PayloadAction<number>) => {
      state.totalSteps = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(restoreProgress.fulfilled, (state, action) => {
      // Only restore the step number, not form data (to avoid lag)
      state.currentStep = action.payload.step
      state.isCompleted = action.payload.isCompleted
      console.log('Progress restored in slice - step:', action.payload.step, 'route:', action.payload.route)
    })
  },
})

export const {
  setCurrentStep,
  nextStep,
  previousStep,
  skipStep,
  updateFormData,
  markStepSaved,
  setSyncPending,
  setLoading,
  setError,
  completeOnboarding,
  resetOnboarding,
  setTotalSteps,
} = onboardingSlice.actions

export default onboardingSlice.reducer
