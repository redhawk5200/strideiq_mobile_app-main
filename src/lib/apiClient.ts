import { API_BASE } from './api'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    console.log('API Client initialized with base URL:', baseUrl)
  }

  setToken(token: string | null) {
    this.token = token
    console.log('API Client token updated:', token ? 'Token set' : 'Token cleared')
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    // if (this.token) {
    //   headers.Authorization = `Bearer ${this.token}`
    // }

    console.log('Making API request:', {
      url,
      method: options.method || 'GET',
      hasAuth: !!this.token,
      body: options.body
    })

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      console.log('API response status:', response.status)

      let data
      try {
        data = await response.json()
      } catch (parseError) {
        console.warn('Failed to parse response as JSON:', parseError)
        data = null
      }

      if (!response.ok) {
        const errorMessage = data?.detail || data?.message || `HTTP ${response.status}: ${response.statusText}`
        console.error('API error response:', {
          status: response.status,
          statusText: response.statusText,
          data
        })
        
        return {
          success: false,
          error: errorMessage,
        }
      }

      console.log('API success response:', data)
      return {
        success: true,
        data,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error'
      console.error('API request failed:', {
        url,
        error: errorMessage,
        originalError: error
      })
      
      return {
        success: false,
        error: errorMessage,
      }
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    })
  }
}

// Create singleton instance
export const apiClient = new ApiClient(API_BASE || 'http://localhost:8000')
