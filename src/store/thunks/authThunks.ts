import { createAsyncThunk } from '@reduxjs/toolkit'

interface LoginCredentials {
  email: string
  password: string
}

interface SignupCredentials {
  email: string
  password: string
  name: string
}

// Mock API calls - replace with your actual API
const authAPI = {
  login: async (credentials: LoginCredentials) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    return {
      user: {
        id: '1',
        email: credentials.email,
        name: 'John Doe',
        isVerified: true,
      },
      token: 'mock-jwt-token',
    }
  },
  signup: async (credentials: SignupCredentials) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    return {
      user: {
        id: '1',
        email: credentials.email,
        name: credentials.name,
        isVerified: false,
      },
      token: 'mock-jwt-token',
    }
  },
}

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed')
    }
  }
)

export const signupUser = createAsyncThunk(
  'auth/signup',
  async (credentials: SignupCredentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.signup(credentials)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Signup failed')
    }
  }
)
