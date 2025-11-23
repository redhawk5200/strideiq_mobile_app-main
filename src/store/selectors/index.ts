import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../index'

// Auth selectors
export const selectAuth = (state: RootState) => state.auth
export const selectUser = (state: RootState) => state.auth.user
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated
export const selectAuthLoading = (state: RootState) => state.auth.isLoading

// Profile selectors
export const selectProfile = (state: RootState) => state.profile
export const selectProfileData = (state: RootState) => state.profile.data
export const selectProfileLoading = (state: RootState) => state.profile.isLoading
export const selectHasCompletedProfile = (state: RootState) => state.profile.hasCompletedProfile

// Device selectors
export const selectDevice = (state: RootState) => state.device
export const selectConnectedDevices = (state: RootState) => state.device.connectedDevices
export const selectSelectedDevice = createSelector(
  [selectConnectedDevices, (state: RootState) => state.device.selectedDeviceId],
  (devices, selectedId) => devices.find(device => device.id === selectedId)
)

// Onboarding selectors
export const selectOnboarding = (state: RootState) => state.onboarding
export const selectCurrentStep = (state: RootState) => state.onboarding.currentStep
export const selectOnboardingComplete = (state: RootState) => state.onboarding.isCompleted
export const selectOnboardingProgress = createSelector(
  [selectCurrentStep, (state: RootState) => state.onboarding.totalSteps],
  (current, total) => (current / total) * 100
)
