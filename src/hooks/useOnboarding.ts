import React, { useCallback, useEffect, useRef, useState } from "react";
import { createSession, getProgress, updateProgress } from "../lib/api";
import { loadProgress, saveProgress } from "../lib/onboardingProgress";
import { useAppDispatch, useAppSelector } from '../store'
import {
  setCurrentStep,
  nextStep,
  previousStep,
  setTotalSteps,
  completeOnboarding,
  resetOnboarding,
  updateFormData,
  setSyncPending,
} from '../store/slices/onboardingSlice'
import { saveStepData, syncPendingData, restoreProgress, updateCurrentStep } from '../store/thunks/onboardingThunks'

const DEBOUNCE_MS = 500;
const CRITICAL_STEPS = [1, 2, 3, 5, 9]; // Name, Gender, Birthday, Medical, Final

export function useOnboarding(totalSteps: number) {
  const dispatch = useAppDispatch()
  const {
    currentStep,
    isCompleted,
    formData,
    savedSteps,
    pendingSync,
    isLoading,
    error
  } = useAppSelector(state => state.onboarding)

  const syncTimeoutRef = useRef<number | null>(null)

  const setStep = (step: number) => {
    dispatch(setCurrentStep(step))
  }

  // Don't restore progress in the hook - it should only be done at login
  // Screens should just save their step number when they mount

  const goNext = useCallback(async () => {
    // Auto-save critical steps before moving forward
    if (CRITICAL_STEPS.includes(currentStep) && !savedSteps.includes(currentStep)) {
      try {
        await dispatch(saveStepData(currentStep)).unwrap()
      } catch (error) {
        console.warn(`Failed to save critical step ${currentStep}, but allowing progress`)
      }
    }
    
    dispatch(nextStep())
  }, [currentStep, savedSteps, dispatch])

  const goBack = () => {
    dispatch(previousStep())
  }

  const complete = () => {
    dispatch(completeOnboarding())
  }

  const reset = () => {
    dispatch(resetOnboarding())
  }

  // Update form data with automatic sync scheduling
  const updateData = useCallback((data: Partial<any>) => {
    dispatch(updateFormData(data))
    
    // Schedule background sync (debounced)
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current)
    }
    
    syncTimeoutRef.current = setTimeout(() => {
      if (!CRITICAL_STEPS.includes(currentStep)) {
        // For non-critical steps, just mark as pending
        dispatch(setSyncPending(true))
      }
    }, DEBOUNCE_MS) as unknown as number
  }, [currentStep, dispatch])

  // Auto-save critical data immediately
  const saveCriticalData = useCallback(async (stepNumber?: number) => {
    const step = stepNumber || currentStep
    if (CRITICAL_STEPS.includes(step)) {
      try {
        await dispatch(saveStepData(step)).unwrap()
        return true
      } catch (error) {
        console.error(`Failed to save critical step ${step}:`, error)
        return false
      }
    }
    return true
  }, [currentStep, dispatch])

  // Lightweight function to just update the current step number in the database
  // This is used when a screen mounts to track where the user is
  const saveCurrentStepNumber = useCallback(async (stepNumber: number) => {
    try {
      await dispatch(updateCurrentStep(stepNumber))
      return true
    } catch (error) {
      console.warn(`Failed to update step number ${stepNumber}:`, error)
      return false
    }
  }, [dispatch])

  // Background sync when app goes to background
  useEffect(() => {
    const handleAppStateChange = () => {
      if (pendingSync) {
        dispatch(syncPendingData())
      }
    }

    // Add event listeners for app state changes
    // This would be more robust with react-native-app-state or similar
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
    }
  }, [pendingSync, dispatch])

  // Set total steps if different
  useEffect(() => {
    dispatch(setTotalSteps(totalSteps))
  }, [totalSteps, dispatch])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
    }
  }, [])

  return {
    // Navigation
    step: currentStep,
    isCompleted,
    setStep,
    goNext,
    goBack,
    complete,
    reset,
    
    // Data management
    formData,
    updateData,
    saveCriticalData,
    saveCurrentStepNumber,
    
    // Status
    savedSteps,
    pendingSync,
    isLoading,
    error,
    
    // Utilities
    isCriticalStep: CRITICAL_STEPS.includes(currentStep),
    isStepSaved: (step: number) => savedSteps.includes(step),
  }
}