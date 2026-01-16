import apiClient from './api'

export const matchingService = {
  getMatches: async (itemId) => {
    return await apiClient.get(`/match/items/${itemId}`)
  },

  getFoundMatches: async (lostItemId) => {
    return await apiClient.get(`/match/found/${lostItemId}`)
  },

  getLostMatches: async (foundItemId) => {
    return await apiClient.get(`/match/lost/${foundItemId}`)
  },

  createMatch: async (data) => {
    return await apiClient.post('/match', data)
  }
}
