import axios from 'axios'
import { auth } from './firebase'

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1` : '/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser
      if (user) {
        const token = await user.getIdToken()
        config.headers.Authorization = `Bearer ${token}`
      }
      
      // Add portal header from localStorage
      if (typeof window !== 'undefined') {
        const portal = localStorage.getItem('portal')
        if (portal) {
          config.headers['X-Portal'] = portal
        }
      }
    } catch (error) {
      console.error('Error getting auth token:', error)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Return response.data directly so callers get { success, data, message, meta }
    return response.data
  },
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('portal')
        localStorage.removeItem('userProfile')
        window.location.href = '/login'
      }
    }
    
    // Extract error message
    const message = error.response?.data?.error || error.message || 'An error occurred'
    const customError = new Error(message)
    customError.code = error.response?.data?.code || 'UNKNOWN_ERROR'
    customError.status = error.response?.status
    
    return Promise.reject(customError)
  }
)

export default api
