import apiClient from './api'

export const authService = {
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials)
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
    }
    return response.data
  },

  logout: () => {
    localStorage.removeItem('token')
  },

  register: async (userData) => {
    return await apiClient.post('/auth/register', userData)
  },

  getCurrentUser: async () => {
    return await apiClient.get('/auth/me')
  }
}
