import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { loginUser, signupUser } from '../thunks/authThunks'
import { apiClient } from '../../lib/api'

interface User {
  id: string
  email: string
  name: string
  isVerified: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
      // Clear API client token
      apiClient.setToken(null)
    },
    clearError: (state) => {
      state.error = null
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload
      // Update API client token
      apiClient.setToken(action.payload)
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
        // Set token in API client
        apiClient.setToken(action.payload.token)
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.isAuthenticated = false
        apiClient.setToken(null)
      })
    
    // Signup
    builder
      .addCase(signupUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
        // Set token in API client
        apiClient.setToken(action.payload.token)
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.isAuthenticated = false
        apiClient.setToken(null)
      })
  },
})

export const { logout, clearError, updateUser, setToken } = authSlice.actions

export default authSlice.reducer
