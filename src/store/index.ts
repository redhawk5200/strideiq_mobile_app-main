import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'
import authSlice from './slices/authSlice'
import profileSlice from './slices/profileSlice'
import deviceSlice from './slices/deviceSlice'
import onboardingSlice from './slices/onboardingSlice'
import recommendationsSlice from './slices/recommendationsSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    profile: profileSlice,
    device: deviceSlice,
    onboarding: onboardingSlice,
    recommendations: recommendationsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
