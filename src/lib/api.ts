// Configuration
// For iOS Simulator, use localhost. For physical device, backend must bind to 0.0.0.0
//export const API_BASE = "http://localhost:8000";
//export const API_BASE = "http://192.168.1.100:8000";
export const API_BASE = "https://stride-api.edgefirm.io"; 

// Basic API functions for onboarding sessions
export async function createSession(): Promise<{ sessionId: string; step: number; total: number }> {
  const r = await fetch(`${API_BASE}/api/v1/onboarding/session`, { 
    method: "POST", 
    headers: { "Content-Type": "application/json" } 
  });
  if (!r.ok) throw new Error("Failed to create session");
  return r.json();
}

export async function getProgress(sessionId: string) {
  const r = await fetch(`${API_BASE}/api/v1/onboarding/progress/${sessionId}`);
  if (!r.ok) throw new Error("Failed to fetch progress");
  return r.json();
}

export async function updateProgress(sessionId: string, step: number, total: number) {
  const r = await fetch(`${API_BASE}/api/v1/onboarding/progress/${sessionId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ step, total }),
  });
  if (!r.ok) throw new Error("Failed to update progress");
  return r.json();
}

// API Response interface for typed responses
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Enhanced API Client Class
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
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

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
export const apiClient = new ApiClient(API_BASE)