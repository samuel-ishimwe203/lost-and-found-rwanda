import apiClient from './api'

export const authService = {
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials)
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
    }
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData)
    // Don't auto-login - user should login manually after registration
    return response.data
  },

  registerPolice: async (policeData) => {
    const response = await apiClient.post('/auth/register-police', policeData)
    // Police registration is pending approval, don't auto-login
    return response.data
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me')
    return response.data
  }
}
