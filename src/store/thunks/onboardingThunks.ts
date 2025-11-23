import { createAsyncThunk } from '@reduxjs/toolkit'
import { apiClient } from '../../lib/api'
import { RootState } from '../index'
import { 
  markStepSaved, 
  setSyncPending, 
  setLoading, 
  setError,
  completeOnboarding 
} from '../slices/onboardingSlice'

// Define critical steps that should be saved immediately
const CRITICAL_STEPS = [1, 2, 3, 5, 9] // Name, Gender, Birthday, Medical, Final

// Map frontend steps to backend OnboardingStep enum values
// NEW NUMBERING (setup-profile has no step number, just transitions):
// 1=Name, 2=Gender, 3=Birthday, 4=Weight, 5=Height, 6=Goals, 7=Fitness, 8=Medical, 9=Status, 10=Moods, 11=Train (REMOVED: 12=Device)
const STEP_TO_BACKEND_STEP: Record<number, string> = {
  1: 'basic_info',           // Name
  2: 'basic_info',           // Gender
  3: 'basic_info',           // Birthday
  4: 'weight',               // Weight
  5: 'health_metrics',       // Height
  6: 'goals',                // Main target/goals
  7: 'goals',                // Fitness level
  8: 'training_preferences', // Medical conditions
  9: 'training_preferences', // Fitness status
  10: 'workout_preferences', // Moods/workout types
  11: 'completed',           // Train screen (final)
}

// Map frontend step numbers to screen routes (for precise navigation)
const STEP_TO_SCREEN: Record<number, string> = {
  1: '/(onboarding)/name-screen',
  2: '/(onboarding)/gender-screen',
  3: '/(onboarding)/birthday-screen',
  4: '/(onboarding)/weight-screen',
  5: '/(onboarding)/height-screen',
  6: '/(onboarding)/goals-screen',
  7: '/(onboarding)/fitness-screen',
  8: '/(onboarding)/medical-screen',
  9: '/(onboarding)/fitness-status',
  10: '/(onboarding)/moods-screen',
  11: '/(onboarding)/train-screen',
}

// Lightweight thunk to ONLY update the step number in the database
// This is called when a screen mounts to track where the user is
export const updateCurrentStep = createAsyncThunk(
  'onboarding/updateCurrentStep',
  async (stepNumber: number) => {
    try {
      const backendStep = STEP_TO_BACKEND_STEP[stepNumber]
      if (!backendStep) {
        console.warn(`No backend step mapping for step ${stepNumber}`)
        return { stepNumber }
      }

      // Silent update - no loading states to avoid re-render loops
      await apiClient.put('/api/v1/onboarding/progress', {
        current_step: backendStep,
        current_frontend_step: `${stepNumber}`
      })

      console.log(`✅ Updated current step to ${stepNumber} (${backendStep})`)
      return { stepNumber }
    } catch (error: any) {
      console.warn(`Failed to update step ${stepNumber}:`, error)
      // Don't reject - we don't want to block the UI
      return { stepNumber }
    }
  }
)

// Save specific step data to backend
export const saveStepData = createAsyncThunk(
  'onboarding/saveStep',
  async (stepNumber: number, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as RootState
      const { formData } = state.onboarding

      dispatch(setLoading(true))
      dispatch(setError(null))

      let response
      
      switch (stepNumber) {
        case 1: // Name screen
          if (formData.firstName && formData.lastName) {
            response = await apiClient.put('/api/v1/onboarding/profile', {
              first_name: formData.firstName,
              last_name: formData.lastName,
            })
          }
          break

        case 2: // Gender screen
          if (formData.gender) {
            response = await apiClient.put('/api/v1/onboarding/profile', {
              gender: formData.gender,
            })
          }
          break

        case 3: // Birthday screen
          if (formData.birthDate) {
            response = await apiClient.put('/api/v1/onboarding/profile', {
              birth_date: formData.birthDate,
            })
          }
          break

        case 4: // Goals
          if (formData.primaryGoal) {
            response = await apiClient.post('/api/v1/onboarding/input/goals', [{
              goal_type: formData.primaryGoal,
              priority: 'high',
            }])
          }
          break
          
        case 5: // Medical conditions
          if (formData.medicalConditions) {
            // Save as training preferences for now
            response = await apiClient.post('/api/v1/onboarding/input/training-preferences', {
              medical_conditions: formData.medicalConditions,
            })
          }
          break
          
        case 7: // Weight
          if (formData.currentWeight) {
            response = await apiClient.post('/api/v1/onboarding/input/weight/current', {
              weight_lbs: formData.currentWeight,
            })
          }
          break
      }

      if (response?.success) {
        dispatch(markStepSaved(stepNumber))
        console.log(`Step ${stepNumber} saved successfully`)

        // Also update the onboarding progress in the backend
        const backendStep = STEP_TO_BACKEND_STEP[stepNumber]
        const frontendScreen = STEP_TO_SCREEN[stepNumber]
        console.log(`Updating progress for step ${stepNumber} to backend step: ${backendStep}, screen: ${frontendScreen}`)
        if (backendStep) {
          try {
            const progressResponse = await apiClient.put('/api/v1/onboarding/progress', {
              current_step: backendStep,
              current_frontend_step: `${stepNumber}`  // Send step number as string
            })
            console.log(`✅ Progress updated to step ${stepNumber} (${backendStep})`, progressResponse)
          } catch (progressError: any) {
            console.error('❌ Failed to update progress:', progressError)
            console.error('Progress error details:', progressError?.message, progressError?.response?.data)
          }
        }
      }

      return { stepNumber, success: true }
    } catch (error: any) {
      console.error(`Failed to save step ${stepNumber}:`, error)
      
      // Don't block user progress for non-critical steps
      if (!CRITICAL_STEPS.includes(stepNumber)) {
        console.log(`Non-critical step ${stepNumber} failed, allowing progress`)
        return { stepNumber, success: false, allowProgress: true }
      }
      
      return rejectWithValue(error.message || `Failed to save step ${stepNumber}`)
    } finally {
      dispatch(setLoading(false))
    }
  }
)

// Save all pending data (called periodically or on app background)
export const syncPendingData = createAsyncThunk(
  'onboarding/syncPending',
  async (_, { getState, dispatch }) => {
    try {
      const state = getState() as RootState
      const { formData, savedSteps, currentStep } = state.onboarding

      if (!state.onboarding.pendingSync) {
        return { message: 'No pending data to sync' }
      }

      dispatch(setSyncPending(true))

      // Save any unsaved critical data
      const unsavedCriticalSteps = CRITICAL_STEPS.filter(step => 
        step <= currentStep && !savedSteps.includes(step)
      )

      for (const step of unsavedCriticalSteps) {
        await dispatch(saveStepData(step))
      }

      dispatch(setSyncPending(false))
      return { message: 'Sync completed' }
    } catch (error: any) {
      dispatch(setSyncPending(false))
      throw error
    }
  }
)

// Complete entire onboarding process
export const submitOnboarding = createAsyncThunk(
  'onboarding/submit',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as RootState
      const { formData } = state.onboarding

      dispatch(setLoading(true))
      dispatch(setError(null))

      // Final comprehensive save with all data
      const finalPayload = {
        // Profile data
        profile: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          gender: formData.gender,
          birth_date: formData.birthDate,
        },
        // Goals
        goals: formData.primaryGoal ? [{
          goal_type: formData.primaryGoal,
          priority: 'high',
        }] : [],
        // Training preferences
        training_preferences: {
          fitness_level: formData.fitnessLevel,
          medical_conditions: formData.medicalConditions || [],
          workout_types: formData.workoutTypes || [],
        },
        // Weight data
        weight: {
          current: formData.currentWeight,
          target: formData.targetWeight,
        },
        // Device selection
        device: formData.selectedDevice,
      }

      console.log('Submitting final onboarding data:', finalPayload)

      // Save each section
      if (finalPayload.profile.first_name) {
        await apiClient.put('/api/v1/onboarding/profile', finalPayload.profile)
      }

      if (finalPayload.goals.length > 0) {
        await apiClient.post('/api/v1/onboarding/input/goals', finalPayload.goals)
      }

      if (finalPayload.weight.current) {
        await apiClient.post('/api/v1/onboarding/input/weight/current', {
          weight_lbs: finalPayload.weight.current,
        })
      }

      // Mark onboarding as complete
      await apiClient.post('/api/v1/onboarding/complete', {})

      dispatch(completeOnboarding())
      console.log('Onboarding completed successfully')

      return { message: 'Onboarding completed successfully' }
    } catch (error: any) {
      console.error('Failed to complete onboarding:', error)
      return rejectWithValue(error.message || 'Failed to complete onboarding')
    } finally {
      dispatch(setLoading(false))
    }
  }
)

// Restore onboarding progress from backend
export const restoreProgress = createAsyncThunk(
  'onboarding/restore',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true))
      dispatch(setError(null))

      // Fetch onboarding status from backend
      const response = await apiClient.get('/api/v1/onboarding/status')

      if (!response.success || !response.data) {
        return rejectWithValue('Failed to fetch onboarding status')
      }

      const { onboarding_progress } = response.data as any

      console.log('🔍 Raw onboarding_progress from backend:', onboarding_progress)

      // Use the saved frontend step number for precise resume
      const savedFrontendStep = onboarding_progress?.current_frontend_step
      let resumeStep = 1
      let resumeRoute = '/(onboarding)/name-screen'

      console.log('🔍 Saved frontend step from DB:', savedFrontendStep)

      if (savedFrontendStep) {
        // We have the exact step number saved!
        const stepNum = parseInt(savedFrontendStep, 10)
        console.log('🔍 Parsed step number:', stepNum)
        if (stepNum && STEP_TO_SCREEN[stepNum]) {
          resumeStep = stepNum
          resumeRoute = STEP_TO_SCREEN[stepNum]
          console.log('✅ Resuming at step', stepNum, 'route:', resumeRoute)
        }
      } else {
        console.warn('⚠️ No saved frontend step found, starting from beginning')
      }

      console.log('📍 Final restored onboarding progress:', {
        savedFrontendStep,
        resumeStep,
        resumeRoute,
        isCompleted: onboarding_progress?.is_completed
      })

      return {
        step: resumeStep,
        route: resumeRoute,
        isCompleted: onboarding_progress?.is_completed || false
      }
    } catch (error: any) {
      console.error('Failed to restore progress:', error)
      // Don't block app if restore fails, just start fresh
      return { step: 1, route: '/(onboarding)/name-screen', isCompleted: false }
    } finally {
      dispatch(setLoading(false))
    }
  }
)